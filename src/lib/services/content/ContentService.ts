import { BaseService } from '../base/BaseService';
import { BlogPost, BlogCategory, BlogTag, PostStatus } from '@prisma/client';
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

const updatePostSchema = createPostSchema.partial();

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code').optional(),
  parentId: z.string().cuid().optional()
});

const createTagSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code').optional()
});

const bulkActionSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'delete', 'archive']),
  postIds: z.array(z.string().cuid())
});

interface SEOAnalysis {
  score: number;
  recommendations: string[];
  analysis: {
    titleLength: { score: number; message: string };
    metaDescription: { score: number; message: string };
    keywords: { score: number; message: string };
    content: { score: number; message: string };
    readability: { score: number; message: string };
  };
}

export class ContentService extends BaseService {
  constructor() {
    super('ContentService');
  }

  // BLOG POST METHODS
  async createPost(authorId: string, data: z.infer<typeof createPostSchema>) {
    const validatedData = this.validateInput(createPostSchema, data);

    try {
      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = this.generateSlug(validatedData.title);
      }

      // Ensure unique slug
      validatedData.slug = await this.ensureUniqueSlug(validatedData.slug);

      // Auto-publish if status is PUBLISHED and no publishedAt is set
      if (validatedData.status === PostStatus.PUBLISHED && !validatedData.publishedAt) {
        validatedData.publishedAt = new Date();
      }

      const post = await this.db.$transaction(async (tx) => {
        // Create the post
        const newPost = await tx.blogPost.create({
          data: {
            title: validatedData.title,
            slug: validatedData.slug!,
            excerpt: validatedData.excerpt,
            content: validatedData.content,
            featuredImage: validatedData.featuredImage,
            metaTitle: validatedData.metaTitle,
            metaDescription: validatedData.metaDescription,
            keywords: validatedData.keywords,
            status: validatedData.status,
            publishedAt: validatedData.publishedAt,
            scheduledAt: validatedData.scheduledAt,
            authorId,
            viewCount: 0,
            shareCount: 0
          }
        });

        // Connect categories
        if (validatedData.categoryIds.length > 0) {
          await tx.blogPost.update({
            where: { id: newPost.id },
            data: {
              categories: {
                connect: validatedData.categoryIds.map(id => ({ id }))
              }
            }
          });
        }

        // Connect tags
        if (validatedData.tagIds.length > 0) {
          await tx.blogPost.update({
            where: { id: newPost.id },
            data: {
              tags: {
                connect: validatedData.tagIds.map(id => ({ id }))
              }
            }
          });
        }

        return newPost;
      });

      // Generate SEO analysis
      const seoAnalysis = this.analyzeSEO(post);

      this.logger.info('Blog post created', {
        postId: post.id,
        authorId,
        status: post.status,
        seoScore: seoAnalysis.score
      });

      return { ...post, seoAnalysis };

    } catch (error) {
      return this.handleError(error, 'createPost', { authorId });
    }
  }

  async updatePost(postId: string, authorId: string, data: z.infer<typeof updatePostSchema>) {
    const validatedData = this.validateInput(updatePostSchema, data);

    try {
      // Check if post exists and user has permission
      const existingPost = await this.db.blogPost.findUnique({
        where: { id: postId },
        include: { author: { include: { userRoles: true } } }
      });

      if (!existingPost) {
        throw new Error('Post not found');
      }

      // Check permissions
      const userRoles = existingPost.author.userRoles.filter(ur => ur.isActive).map(ur => ur.role);
      if (existingPost.authorId !== authorId && !userRoles.includes('ADMIN')) {
        throw new Error('Insufficient permissions to edit this post');
      }

      // Handle slug update
      if (validatedData.slug && validatedData.slug !== existingPost.slug) {
        validatedData.slug = await this.ensureUniqueSlug(validatedData.slug, postId);
      }

      // Handle publish status change
      if (validatedData.status === PostStatus.PUBLISHED && existingPost.status !== PostStatus.PUBLISHED) {
        validatedData.publishedAt = validatedData.publishedAt || new Date();
      }

      const updatedPost = await this.db.$transaction(async (tx) => {
        // Update main post data
        const post = await tx.blogPost.update({
          where: { id: postId },
          data: {
            ...validatedData,
            updatedAt: new Date()
          }
        });

        // Update categories if provided
        if (validatedData.categoryIds !== undefined) {
          await tx.blogPost.update({
            where: { id: postId },
            data: {
              categories: {
                set: validatedData.categoryIds.map(id => ({ id }))
              }
            }
          });
        }

        // Update tags if provided
        if (validatedData.tagIds !== undefined) {
          await tx.blogPost.update({
            where: { id: postId },
            data: {
              tags: {
                set: validatedData.tagIds.map(id => ({ id }))
              }
            }
          });
        }

        return post;
      });

      // Invalidate cache
      await this.cache.delete(`post:${postId}`);
      await this.cache.deletePattern(`posts:*`);

      this.logger.info('Blog post updated', {
        postId,
        authorId,
        updatedFields: Object.keys(validatedData)
      });

      return updatedPost;

    } catch (error) {
      return this.handleError(error, 'updatePost', { postId, authorId });
    }
  }

  async getPostById(id: string, includePrivate = false) {
    return this.withCache(
      `post:${id}:${includePrivate}`,
      async () => {
        const post = await this.db.blogPost.findUnique({
          where: { id },
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
          }
        });

        if (!post) {
          throw new Error('Post not found');
        }

        // Check visibility
        if (!includePrivate && post.status !== PostStatus.PUBLISHED) {
          throw new Error('Post not available');
        }

        // Calculate reading time and SEO score
        const readingTime = this.calculateReadingTime(post.content);
        const seoAnalysis = this.analyzeSEO(post);

        return {
          ...post,
          readingTime,
          seoAnalysis,
          commentsCount: post._count.comments
        };
      },
      300 // 5 minutes for published posts, shorter for drafts
    );
  }

  async getPostBySlug(slug: string) {
    return this.withCache(
      `post_by_slug:${slug}`,
      async () => {
        const post = await this.db.blogPost.findUnique({
          where: { 
            slug,
            status: PostStatus.PUBLISHED
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            categories: true,
            tags: true
          }
        });

        if (!post) {
          throw new Error('Post not found');
        }

        // Increment view count asynchronously
        this.incrementViewCount(post.id);

        return {
          ...post,
          readingTime: this.calculateReadingTime(post.content)
        };
      },
      600 // 10 minutes
    );
  }

  async getPosts(filters: {
    authorId?: string;
    categoryId?: string;
    tagId?: string;
    status?: PostStatus;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...otherFilters
    } = filters;

    const cacheKey = `posts:${JSON.stringify({ ...otherFilters, page, limit, sortBy, sortOrder })}`;

    return this.withCache(
      cacheKey,
      async () => {
        const whereClause: any = {};

        if (otherFilters.authorId) {
          whereClause.authorId = otherFilters.authorId;
        }

        if (otherFilters.status) {
          whereClause.status = otherFilters.status;
        }

        if (otherFilters.categoryId) {
          whereClause.categories = {
            some: { id: otherFilters.categoryId }
          };
        }

        if (otherFilters.tagId) {
          whereClause.tags = {
            some: { id: otherFilters.tagId }
          };
        }

        if (otherFilters.search) {
          whereClause.OR = [
            { title: { contains: otherFilters.search, mode: 'insensitive' } },
            { excerpt: { contains: otherFilters.search, mode: 'insensitive' } },
            { content: { contains: otherFilters.search, mode: 'insensitive' } }
          ];
        }

        const [posts, totalCount] = await Promise.all([
          this.db.blogPost.findMany({
            where: whereClause,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
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
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit
          }),
          this.db.blogPost.count({ where: whereClause })
        ]);

        const postsWithMetadata = posts.map(post => ({
          ...post,
          readingTime: this.calculateReadingTime(post.content),
          seoScore: this.calculateSeoScore(post),
          commentsCount: post._count.comments
        }));

        return {
          posts: postsWithMetadata,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1
          }
        };
      },
      180 // 3 minutes
    );
  }

  async bulkUpdatePosts(data: z.infer<typeof bulkActionSchema>, authorId: string) {
    const validatedData = this.validateInput(bulkActionSchema, data);

    try {
      const results = await Promise.allSettled(
        validatedData.postIds.map(async (postId) => {
          switch (validatedData.action) {
            case 'publish':
              return this.updatePost(postId, authorId, {
                status: PostStatus.PUBLISHED,
                publishedAt: new Date()
              });
            case 'unpublish':
              return this.updatePost(postId, authorId, {
                status: PostStatus.DRAFT
              });
            case 'delete':
              return this.deletePost(postId, authorId);
            case 'archive':
              return this.updatePost(postId, authorId, {
                status: PostStatus.DRAFT // or create an ARCHIVED status
              });
            default:
              throw new Error('Invalid bulk action');
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.info('Bulk post action completed', {
        action: validatedData.action,
        authorId,
        totalPosts: validatedData.postIds.length,
        successful,
        failed
      });

      return {
        success: true,
        message: `${validatedData.action} completed for ${successful} posts, ${failed} failed`,
        results: { successful, failed }
      };

    } catch (error) {
      return this.handleError(error, 'bulkUpdatePosts', { action: validatedData.action, authorId });
    }
  }

  // CATEGORY METHODS
  async createCategory(data: z.infer<typeof createCategorySchema>) {
    const validatedData = this.validateInput(createCategorySchema, data);

    try {
      if (!validatedData.slug) {
        validatedData.slug = this.generateSlug(validatedData.name);
      }

      validatedData.slug = await this.ensureUniqueCategorySlug(validatedData.slug);

      const category = await this.db.blogCategory.create({
        data: validatedData
      });

      // Invalidate categories cache
      await this.cache.deletePattern('categories:*');

      return category;

    } catch (error) {
      return this.handleError(error, 'createCategory', {});
    }
  }

  async getCategories() {
    return this.withCache(
      'categories:all',
      async () => {
        return await this.db.blogCategory.findMany({
          include: {
            _count: {
              select: {
                posts: {
                  where: { status: PostStatus.PUBLISHED }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        });
      },
      3600 // 1 hour
    );
  }

  // TAG METHODS
  async createTag(data: z.infer<typeof createTagSchema>) {
    const validatedData = this.validateInput(createTagSchema, data);

    try {
      if (!validatedData.slug) {
        validatedData.slug = this.generateSlug(validatedData.name);
      }

      validatedData.slug = await this.ensureUniqueTagSlug(validatedData.slug);

      const tag = await this.db.blogTag.create({
        data: validatedData
      });

      // Invalidate tags cache
      await this.cache.deletePattern('tags:*');

      return tag;

    } catch (error) {
      return this.handleError(error, 'createTag', {});
    }
  }

  async getTags() {
    return this.withCache(
      'tags:all',
      async () => {
        return await this.db.blogTag.findMany({
          include: {
            _count: {
              select: {
                posts: {
                  where: { status: PostStatus.PUBLISHED }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        });
      },
      3600 // 1 hour
    );
  }

  // ANALYTICS METHODS
  async getContentAnalytics(authorId?: string, days = 30) {
    return this.withCache(
      `content_analytics:${authorId || 'all'}:${days}`,
      async () => {
        const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const whereClause: any = {
          createdAt: { gte: fromDate }
        };

        if (authorId) {
          whereClause.authorId = authorId;
        }

        const [postStats, viewStats, categoryStats] = await Promise.all([
          this.db.blogPost.groupBy({
            by: ['status'],
            where: whereClause,
            _count: { status: true }
          }),

          this.db.blogPost.aggregate({
            where: { ...whereClause, status: PostStatus.PUBLISHED },
            _sum: { viewCount: true, shareCount: true },
            _avg: { viewCount: true },
            _count: { id: true }
          }),

          this.db.blogPost.groupBy({
            by: ['authorId'],
            where: whereClause,
            _count: { authorId: true },
            _sum: { viewCount: true }
          })
        ]);

        return {
          posts: {
            total: postStats.reduce((acc, stat) => acc + stat._count.status, 0),
            published: postStats.find(s => s.status === 'PUBLISHED')?._count.status || 0,
            draft: postStats.find(s => s.status === 'DRAFT')?._count.status || 0,
            scheduled: postStats.find(s => s.status === 'SCHEDULED')?._count.status || 0
          },
          engagement: {
            totalViews: viewStats._sum.viewCount || 0,
            totalShares: viewStats._sum.shareCount || 0,
            averageViews: viewStats._avg.viewCount || 0,
            publishedPosts: viewStats._count
          },
          topAuthors: categoryStats
            .sort((a, b) => (b._sum.viewCount || 0) - (a._sum.viewCount || 0))
            .slice(0, 10),
          timeframe: `${days} days`
        };
      },
      1800 // 30 minutes
    );
  }

  // HELPER METHODS
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const whereClause: any = { slug: uniqueSlug };
      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existing = await this.db.blogPost.findUnique({
        where: whereClause
      });

      if (!existing) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  private async ensureUniqueCategorySlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.db.blogCategory.findUnique({
        where: { slug: uniqueSlug }
      });

      if (!existing) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  private async ensureUniqueTagSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.db.blogTag.findUnique({
        where: { slug: uniqueSlug }
      });

      if (!existing) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private calculateSeoScore(post: any): number {
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

  private analyzeSEO(post: any): SEOAnalysis {
    const analysis: SEOAnalysis = {
      score: 0,
      recommendations: [],
      analysis: {
        titleLength: { score: 0, message: '' },
        metaDescription: { score: 0, message: '' },
        keywords: { score: 0, message: '' },
        content: { score: 0, message: '' },
        readability: { score: 0, message: '' }
      }
    };

    // Analyze title
    const titleLength = post.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      analysis.analysis.titleLength = { score: 100, message: 'Title length is optimal' };
    } else if (titleLength < 30) {
      analysis.analysis.titleLength = { score: 50, message: 'Title is too short. Aim for 30-60 characters.' };
      analysis.recommendations.push('Consider making your title longer and more descriptive');
    } else {
      analysis.analysis.titleLength = { score: 50, message: 'Title is too long. Aim for 30-60 characters.' };
      analysis.recommendations.push('Consider shortening your title');
    }

    // Analyze meta description
    if (post.metaDescription) {
      const metaLength = post.metaDescription.length;
      if (metaLength >= 120 && metaLength <= 160) {
        analysis.analysis.metaDescription = { score: 100, message: 'Meta description length is optimal' };
      } else {
        analysis.analysis.metaDescription = { score: 50, message: 'Meta description should be 120-160 characters' };
        analysis.recommendations.push('Optimize your meta description length');
      }
    } else {
      analysis.analysis.metaDescription = { score: 0, message: 'Meta description is missing' };
      analysis.recommendations.push('Add a meta description');
    }

    // Analyze keywords
    const keywordCount = post.keywords.length;
    if (keywordCount >= 3 && keywordCount <= 5) {
      analysis.analysis.keywords = { score: 100, message: 'Keyword count is optimal' };
    } else if (keywordCount === 0) {
      analysis.analysis.keywords = { score: 0, message: 'No keywords specified' };
      analysis.recommendations.push('Add 3-5 relevant keywords');
    } else {
      analysis.analysis.keywords = { score: 50, message: 'Keyword count should be 3-5' };
      analysis.recommendations.push('Optimize keyword count to 3-5 keywords');
    }

    // Analyze content
    const wordCount = post.content.split(' ').length;
    if (wordCount >= 1000) {
      analysis.analysis.content = { score: 100, message: 'Content length is excellent' };
    } else if (wordCount >= 500) {
      analysis.analysis.content = { score: 75, message: 'Content length is good' };
    } else {
      analysis.analysis.content = { score: 25, message: 'Content is too short. Aim for at least 500 words.' };
      analysis.recommendations.push('Expand your content to provide more value');
    }

    // Simple readability check (could be enhanced with proper algorithms)
    const sentences = post.content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    if (avgWordsPerSentence <= 20) {
      analysis.analysis.readability = { score: 100, message: 'Content readability is good' };
    } else {
      analysis.analysis.readability = { score: 50, message: 'Consider shorter sentences for better readability' };
      analysis.recommendations.push('Break up long sentences for better readability');
    }

    // Calculate overall score
    const scores = Object.values(analysis.analysis).map(a => a.score);
    analysis.score = Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);

    return analysis;
  }

  private async incrementViewCount(postId: string) {
    // Use a background job or queue in production
    try {
      await this.db.blogPost.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } }
      });

      // Invalidate cache
      await this.cache.delete(`post:${postId}:false`);
    } catch (error) {
      // Log but don't throw - view count increment shouldn't break the request
      this.logger.error('Failed to increment view count', { postId, error });
    }
  }

  private async deletePost(postId: string, authorId: string) {
    try {
      // Check permissions (similar to updatePost)
      const post = await this.db.blogPost.findUnique({
        where: { id: postId },
        include: { author: { include: { userRoles: true } } }
      });

      if (!post) {
        throw new Error('Post not found');
      }

      const userRoles = post.author.userRoles.filter(ur => ur.isActive).map(ur => ur.role);
      if (post.authorId !== authorId && !userRoles.includes('ADMIN')) {
        throw new Error('Insufficient permissions to delete this post');
      }

      // Soft delete (mark as deleted instead of actually deleting)
      await this.db.blogPost.update({
        where: { id: postId },
        data: { 
          status: PostStatus.DRAFT,
          deletedAt: new Date()
        }
      });

      // Invalidate cache
      await this.cache.delete(`post:${postId}`);
      await this.cache.deletePattern(`posts:*`);

      return { success: true, message: 'Post deleted successfully' };

    } catch (error) {
      return this.handleError(error, 'deletePost', { postId, authorId });
    }
  }
}