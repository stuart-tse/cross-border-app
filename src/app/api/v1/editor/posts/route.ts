import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { PostStatus } from '@prisma/client';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  featuredImage: z.string().url().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).default([]),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  publishedAt: z.string().datetime().transform(str => new Date(str)).optional(),
  scheduledAt: z.string().datetime().transform(str => new Date(str)).optional(),
  categoryIds: z.array(z.string().cuid()).default([]),
  tagIds: z.array(z.string().cuid()).default([])
});

const querySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  status: z.nativeEnum(PostStatus).optional(),
  search: z.string().optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'publishedAt', 'viewCount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// GET BLOG POSTS (Editor)
export async function GET(req: NextRequest) {
  try {
    const services = getServices();

    // Get token and validate authentication
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required'
        }
      }, { status: 401 });
    }

    const authResult = await services.authService.validateToken(token);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      }, { status: 401 });
    }

    const user = authResult.data!;

    // Check if user has BLOG_EDITOR or ADMIN role
    if (!user.roles.includes('BLOG_EDITOR') && !user.roles.includes('ADMIN')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Blog editor or admin role required'
        }
      }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryData = Object.fromEntries(searchParams);
    const validatedQuery = querySchema.parse(queryData);

    // Build where clause
    const whereClause: any = {};

    // Non-admin editors can only see their own posts
    if (!user.roles.includes('ADMIN')) {
      whereClause.authorId = user.id;
    } else if (validatedQuery.authorId) {
      whereClause.authorId = validatedQuery.authorId;
    }

    if (validatedQuery.status) {
      whereClause.status = validatedQuery.status;
    }

    if (validatedQuery.categoryId) {
      whereClause.categories = {
        some: { id: validatedQuery.categoryId }
      };
    }

    if (validatedQuery.search) {
      whereClause.OR = [
        { title: { contains: validatedQuery.search, mode: 'insensitive' } },
        { excerpt: { contains: validatedQuery.search, mode: 'insensitive' } },
        { content: { contains: validatedQuery.search, mode: 'insensitive' } }
      ];
    }

    // Build sort order
    const orderBy = {
      [validatedQuery.sortBy]: validatedQuery.sortOrder
    };

    // Get posts with pagination
    const [posts, totalCount] = await Promise.all([
      services.db.blogPost.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          _count: {
            select: {
              comments: {
                where: { isApproved: true }
              }
            }
          }
        },
        orderBy,
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit
      }),
      services.db.blogPost.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / validatedQuery.limit);

    // Transform posts data
    const transformedPosts = posts.map(post => ({
      ...post,
      commentsCount: post._count.comments,
      seoScore: calculateSeoScore(post),
      readingTime: calculateReadingTime(post.content)
    }));

    // Get stats for dashboard
    const stats = await services.db.blogPost.groupBy({
      by: ['status'],
      where: user.roles.includes('ADMIN') ? {} : { authorId: user.id },
      _count: { status: true }
    });

    const postStats = {
      total: totalCount,
      published: stats.find(s => s.status === 'PUBLISHED')?._count.status || 0,
      draft: stats.find(s => s.status === 'DRAFT')?._count.status || 0,
      scheduled: stats.find(s => s.status === 'SCHEDULED')?._count.status || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        posts: transformedPosts,
        stats: postStats
      },
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: totalCount,
        totalPages,
        hasNext: validatedQuery.page < totalPages,
        hasPrev: validatedQuery.page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });

  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// CREATE BLOG POST (Editor)
export async function POST(req: NextRequest) {
  try {
    const services = getServices();

    // Get token and validate authentication
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required'
        }
      }, { status: 401 });
    }

    const authResult = await services.authService.validateToken(token);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      }, { status: 401 });
    }

    const user = authResult.data!;

    // Check if user has BLOG_EDITOR or ADMIN role
    if (!user.roles.includes('BLOG_EDITOR') && !user.roles.includes('ADMIN')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Blog editor or admin role required'
        }
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createPostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

    const postData = validationResult.data;

    // Generate slug if not provided
    if (!postData.slug) {
      postData.slug = generateSlug(postData.title);
    }

    // Check if slug already exists
    const existingPost = await services.db.blogPost.findUnique({
      where: { slug: postData.slug }
    });

    if (existingPost) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'SLUG_EXISTS',
          message: 'A post with this slug already exists'
        }
      }, { status: 409 });
    }

    // Create post with categories and tags
    const newPost = await services.db.$transaction(async (tx) => {
      const post = await tx.blogPost.create({
        data: {
          title: postData.title,
          slug: postData.slug!,
          excerpt: postData.excerpt,
          content: postData.content,
          featuredImage: postData.featuredImage,
          metaTitle: postData.metaTitle,
          metaDescription: postData.metaDescription,
          keywords: postData.keywords,
          status: postData.status,
          publishedAt: postData.status === PostStatus.PUBLISHED ? (postData.publishedAt || new Date()) : postData.publishedAt,
          scheduledAt: postData.scheduledAt,
          authorId: user.id,
          viewCount: 0,
          shareCount: 0
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      // Connect categories if provided
      if (postData.categoryIds.length > 0) {
        await tx.blogPost.update({
          where: { id: post.id },
          data: {
            categories: {
              connect: postData.categoryIds.map(id => ({ id }))
            }
          }
        });
      }

      // Connect tags if provided
      if (postData.tagIds.length > 0) {
        await tx.blogPost.update({
          where: { id: post.id },
          data: {
            tags: {
              connect: postData.tagIds.map(id => ({ id }))
            }
          }
        });
      }

      return post;
    });

    return NextResponse.json({
      success: true,
      data: {
        post: newPost,
        message: 'Blog post created successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calculateSeoScore(post: any): number {
  let score = 0;
  const maxScore = 100;

  // Title length (optimal: 30-60 characters)
  if (post.title.length >= 30 && post.title.length <= 60) score += 20;
  else if (post.title.length >= 20 && post.title.length <= 70) score += 10;

  // Meta description (optimal: 120-160 characters)
  if (post.metaDescription && post.metaDescription.length >= 120 && post.metaDescription.length <= 160) score += 20;
  else if (post.metaDescription && post.metaDescription.length >= 100 && post.metaDescription.length <= 170) score += 10;

  // Keywords (optimal: 3-5 keywords)
  if (post.keywords.length >= 3 && post.keywords.length <= 5) score += 15;
  else if (post.keywords.length >= 1 && post.keywords.length <= 7) score += 8;

  // Content length (optimal: 1000+ words)
  const wordCount = post.content.split(' ').length;
  if (wordCount >= 1000) score += 25;
  else if (wordCount >= 500) score += 15;
  else if (wordCount >= 300) score += 5;

  // Featured image
  if (post.featuredImage) score += 10;

  // Excerpt
  if (post.excerpt) score += 10;

  return Math.min(score, maxScore);
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
}