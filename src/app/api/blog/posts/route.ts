import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { auth } from '@/lib/auth/config';
import { findUserByEmail, sanitizeUserData, hasRole } from '@/lib/auth/utils';
import { UserType } from '@prisma/client';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  scheduledAt: z.string().datetime().optional(),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
});

// Get blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const authorId = searchParams.get('authorId');
    const search = searchParams.get('search');

    const where: any = {};

    // Public posts only unless user is authenticated
    const session = await auth();
    let user = null;
    
    if (session?.user) {
      const dbUser = await findUserByEmail(session.user.email!);
      if (dbUser) {
        user = sanitizeUserData(dbUser);
      }
    }
    
    if (!user || (!hasRole(user, UserType.BLOG_EDITOR) && !hasRole(user, UserType.ADMIN))) {
      where.status = 'PUBLISHED';
      where.publishedAt = { lte: new Date() };
    } else if (status) {
      where.status = status;
    }

    if (category) {
      where.categories = {
        some: { slug: category }
      };
    }

    if (tag) {
      where.tags = {
        some: { slug: tag }
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: true,
        tags: true,
        _count: {
          select: {
            comments: {
              where: { isApproved: true }
            }
          }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.blogPost.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create blog post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email!;
    const dbUser = await findUserByEmail(userEmail);
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = sanitizeUserData(dbUser);

    if (!hasRole(user, UserType.BLOG_EDITOR) && !hasRole(user, UserType.ADMIN)) {
      return NextResponse.json(
        { error: 'Only blog editors can create posts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const postData: any = {
      ...validatedData,
      authorId: user.id,
      publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : 
                   validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
    };

    // Handle categories and tags
    if (validatedData.categoryIds.length > 0) {
      postData.categories = {
        connect: validatedData.categoryIds.map(id => ({ id }))
      };
    }

    if (validatedData.tagIds.length > 0) {
      postData.tags = {
        connect: validatedData.tagIds.map(id => ({ id }))
      };
    }

    // Remove IDs from the main data
    delete postData.categoryIds;
    delete postData.tagIds;

    const post = await prisma.blogPost.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}