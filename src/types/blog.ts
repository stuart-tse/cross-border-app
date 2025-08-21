export interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  category: string;
  tags: string[];
  featured: boolean;
  author: string;
  authorId: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  publishedAt?: Date | string;
  scheduledAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  views: number;
  estimatedReadTime: number;
  
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Analytics
  seoScore: number;
}

export interface CreatePostFormData {
  title: string;
  excerpt: string;
  content: string;
  slug?: string;
  status: 'draft' | 'published' | 'scheduled';
  category: string;
  tags: string[];
  featured: boolean;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  scheduledAt?: string;
  
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface SeoAnalysis {
  score: number;
  issues: SeoIssue[];
  suggestions: SeoSuggestion[];
  readabilityScore: number;
  keywordDensity: { [key: string]: number };
}

export interface SeoIssue {
  type: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface SeoSuggestion {
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  alt?: string;
  description?: string;
  uploadedAt: Date | string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  avgSeoScore: number;
  categoriesUsed: number;
  tagsUsed: number;
}

export type CreatePostFormState = {
  errors?: {
    [K in keyof CreatePostFormData]?: string[];
  };
  message?: string;
  success?: boolean;
  postId?: string;
};
