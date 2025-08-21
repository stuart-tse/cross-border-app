'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { CreatePostFormData, SeoAnalysis } from '@/types/blog';

// Validation schema for blog post creation
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(300, 'Excerpt too long'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Too many tags'),
  featured: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  thumbnailAlt: z.string().optional(),
  scheduledAt: z.string().optional(),
  
  // SEO Fields
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  metaKeywords: z.array(z.string()).max(10, 'Too many keywords').optional(),
  openGraphTitle: z.string().max(60, 'OG title too long').optional(),
  openGraphDescription: z.string().max(160, 'OG description too long').optional(),
  openGraphImage: z.string().url().optional().or(z.literal('')),
  twitterTitle: z.string().max(60, 'Twitter title too long').optional(),
  twitterDescription: z.string().max(160, 'Twitter description too long').optional(),
  twitterImage: z.string().url().optional().or(z.literal('')),
});

type CreatePostFormState = {
  errors?: {
    [K in keyof CreatePostFormData]?: string[];
  };
  message?: string;
  success?: boolean;
  postId?: string;
};

export async function createPostAction(
  prevState: CreatePostFormState,
  formData: FormData
): Promise<CreatePostFormState> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      slug: formData.get('slug') as string,
      status: formData.get('status') as 'draft' | 'published' | 'scheduled',
      category: formData.get('category') as string,
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      featured: formData.get('featured') === 'true',
      thumbnailUrl: formData.get('thumbnailUrl') as string,
      thumbnailAlt: formData.get('thumbnailAlt') as string,
      scheduledAt: formData.get('scheduledAt') as string,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      metaKeywords: JSON.parse(formData.get('metaKeywords') as string || '[]'),
      openGraphTitle: formData.get('openGraphTitle') as string,
      openGraphDescription: formData.get('openGraphDescription') as string,
      openGraphImage: formData.get('openGraphImage') as string,
      twitterTitle: formData.get('twitterTitle') as string,
      twitterDescription: formData.get('twitterDescription') as string,
      twitterImage: formData.get('twitterImage') as string,
    };

    const validatedData = createPostSchema.parse(rawData);
    
    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = generateSlug(validatedData.title);
    }

    // Calculate estimated read time
    const estimatedReadTime = calculateReadTime(validatedData.content);
    
    // Calculate SEO score
    const seoScore = calculateSeoScore({
      title: validatedData.title,
      content: validatedData.content,
      excerpt: validatedData.excerpt,
      metaTitle: validatedData.metaTitle,
      metaDescription: validatedData.metaDescription,
      tags: validatedData.tags
    });

    // In production, save to database
    // For now, simulate saving
    console.log('Creating post:', {
      ...validatedData,
      authorId: session.user.id,
      author: session.user.name || session.user.email,
      estimatedReadTime,
      seoScore,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(validatedData.status === 'published' && { publishedAt: new Date() })
    });

    // Simulate database operation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const postId = Date.now().toString();
    
    // Revalidate the posts page
    revalidatePath('/dashboard/editor');
    revalidatePath('/dashboard/editor/posts');
    
    return {
      success: true,
      message: validatedData.status === 'published' ? 'Post published successfully!' : 'Post saved as draft!',
      postId
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string[] } = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return {
        success: false,
        errors,
        message: 'Please fix the validation errors'
      };
    }
    
    console.error('Error creating post:', error);
    return {
      success: false,
      message: 'Failed to create post. Please try again.'
    };
  }
}

export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: 'Authentication required' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { error: 'Only image files are allowed' };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size too large. Maximum 5MB allowed.' };
    }

    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, simulate upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const url = `/uploads/images/${fileName}`;
    
    return { url };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { error: 'Failed to upload image' };
  }
}

export async function analyzeSeoAction(
  title: string,
  content: string,
  excerpt: string,
  metaTitle?: string,
  metaDescription?: string,
  tags: string[] = []
): Promise<SeoAnalysis> {
  const analysis: SeoAnalysis = {
    score: 0,
    issues: [],
    suggestions: [],
    readabilityScore: 0,
    keywordDensity: {}
  };
  
  let score = 0;
  
  // Title analysis
  const titleLength = (metaTitle || title).length;
  if (titleLength >= 30 && titleLength <= 60) {
    score += 15;
  } else if (titleLength < 30) {
    analysis.issues.push({
      type: 'warning',
      message: 'Title is too short. Aim for 30-60 characters.',
      field: 'title'
    });
    analysis.suggestions.push({
      message: 'Make your title more descriptive and engaging',
      priority: 'high'
    });
  } else {
    analysis.issues.push({
      type: 'error',
      message: 'Title is too long. Keep it under 60 characters.',
      field: 'title'
    });
  }
  
  // Meta description analysis
  const metaDescLength = (metaDescription || excerpt).length;
  if (metaDescLength >= 120 && metaDescLength <= 160) {
    score += 15;
  } else if (metaDescLength < 120) {
    analysis.issues.push({
      type: 'warning',
      message: 'Meta description is too short. Aim for 120-160 characters.',
      field: 'metaDescription'
    });
  } else {
    analysis.issues.push({
      type: 'error',
      message: 'Meta description is too long. Keep it under 160 characters.',
      field: 'metaDescription'
    });
  }
  
  // Content length analysis
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount >= 300) {
    score += 10;
    if (wordCount >= 1000) {
      score += 10;
    }
  } else {
    analysis.issues.push({
      type: 'error',
      message: 'Content is too short. Aim for at least 300 words.',
      field: 'content'
    });
  }
  
  // Tags analysis
  if (tags.length >= 3 && tags.length <= 8) {
    score += 10;
  } else if (tags.length < 3) {
    analysis.issues.push({
      type: 'warning',
      message: 'Add at least 3 relevant tags.',
      field: 'tags'
    });
  } else {
    analysis.issues.push({
      type: 'warning',
      message: 'Too many tags. Limit to 8 most relevant tags.',
      field: 'tags'
    });
  }
  
  // Readability analysis (simplified)
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / sentences;
  if (avgWordsPerSentence <= 20) {
    score += 10;
    analysis.readabilityScore = 85;
  } else if (avgWordsPerSentence <= 25) {
    analysis.readabilityScore = 70;
    score += 5;
  } else {
    analysis.readabilityScore = 50;
    analysis.suggestions.push({
      message: 'Consider breaking up long sentences for better readability',
      priority: 'medium'
    });
  }
  
  // Heading analysis
  const headingMatches = content.match(/#{1,6}\s/g);
  if (headingMatches && headingMatches.length >= 2) {
    score += 10;
  } else {
    analysis.suggestions.push({
      message: 'Add headings (H2, H3) to structure your content better',
      priority: 'medium'
    });
  }
  
  // Image analysis
  const imageMatches = content.match(/!\[.*?\]\(.*?\)/g);
  if (imageMatches && imageMatches.length >= 1) {
    score += 5;
  } else {
    analysis.suggestions.push({
      message: 'Add relevant images to make your content more engaging',
      priority: 'low'
    });
  }
  
  // Link analysis
  const linkMatches = content.match(/\[.*?\]\(.*?\)/g);
  if (linkMatches && linkMatches.length >= 1) {
    score += 5;
  }
  
  analysis.score = Math.min(score, 100);
  
  return analysis;
}

// Utility functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function calculateSeoScore(data: {
  title: string;
  content: string;
  excerpt: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
}): number {
  let score = 0;
  
  // Title optimization
  const titleLength = (data.metaTitle || data.title).length;
  if (titleLength >= 30 && titleLength <= 60) score += 20;
  
  // Meta description
  const metaLength = (data.metaDescription || data.excerpt).length;
  if (metaLength >= 120 && metaLength <= 160) score += 20;
  
  // Content length
  const wordCount = data.content.trim().split(/\s+/).length;
  if (wordCount >= 300) score += 15;
  if (wordCount >= 1000) score += 10;
  
  // Tags
  if (data.tags.length >= 3 && data.tags.length <= 8) score += 15;
  
  // Structure
  if (data.content.includes('#')) score += 10;
  if (data.content.includes('![')) score += 10;
  
  return Math.min(score, 100);
}

export async function saveDraftAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: 'Authentication required' };
    }

    // Save draft to localStorage or database
    const draftData = {
      title: formData.get('title'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      category: formData.get('category'),
      tags: formData.get('tags'),
      lastSaved: new Date().toISOString()
    };

    // In production, save to database
    console.log('Saving draft:', draftData);
    
    return { success: true, message: 'Draft saved successfully' };
  } catch (error) {
    console.error('Error saving draft:', error);
    return { success: false, message: 'Failed to save draft' };
  }
}
