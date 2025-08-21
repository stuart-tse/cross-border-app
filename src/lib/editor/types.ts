import { z } from 'zod';

// Validation schema for published/scheduled posts - strict validation
export const publishSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(300, 'Excerpt too long'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Too many tags'),
  featured: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  thumbnailAlt: z.string().optional(),
  scheduledAt: z.string().optional(),
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  metaKeywords: z.array(z.string()).max(10, 'Too many keywords').optional().default([]),
  openGraphTitle: z.string().max(60, 'OG title too long').optional(),
  openGraphDescription: z.string().max(160, 'OG description too long').optional(),
  openGraphImage: z.string().optional(),
  twitterTitle: z.string().max(60, 'Twitter title too long').optional(),
  twitterDescription: z.string().max(160, 'Twitter description too long').optional(),
  twitterImage: z.string().optional(),
});

// Validation schema for drafts - lenient validation
export const draftSchema = z.object({
  title: z.string().max(200, 'Title too long').optional().or(z.literal('')),
  excerpt: z.string().max(300, 'Excerpt too long').optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  category: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).max(10, 'Too many tags').default([]),
  featured: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  thumbnailAlt: z.string().optional(),
  scheduledAt: z.string().optional(),
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  metaKeywords: z.array(z.string()).max(10, 'Too many keywords').optional().default([]),
  openGraphTitle: z.string().max(60, 'OG title too long').optional(),
  openGraphDescription: z.string().max(160, 'OG description too long').optional(),
  openGraphImage: z.string().optional(),
  twitterTitle: z.string().max(60, 'Twitter title too long').optional(),
  twitterDescription: z.string().max(160, 'Twitter description too long').optional(),
  twitterImage: z.string().optional(),
});

// Default to publish schema for backward compatibility
export const formSchema = publishSchema;

export type EditorFormData = z.infer<typeof formSchema>;
export type DraftFormData = z.infer<typeof draftSchema>;

export interface PostStats {
  wordCount: number;
  readTime: number;
  characterCount: number;
  headingCount: number;
  imageCount: number;
  linkCount: number;
  paragraphCount: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  category: string;
  tags: string[];
}

export interface MediaUploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
  id: string;
}

export interface RevisionHistory {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  changes: string;
}

export interface SocialPreview {
  platform: 'facebook' | 'twitter' | 'linkedin';
  title: string;
  description: string;
  image?: string;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  optimizationScore: number;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

export type ActiveTab = 'content' | 'seo' | 'media' | 'settings' | 'templates' | 'collaboration' | 'analytics';

export interface EditorState {
  activeTab: ActiveTab;
  stats: PostStats;
  uploadProgress: MediaUploadProgress[];
  revisionHistory: RevisionHistory[];
  collaborators: Collaborator[];
  liveEditing: boolean;
  wordCountTarget: number;
  keywordDensity: {[key: string]: number};
  contentStructureScore: number;
  socialPreviewPlatform: 'facebook' | 'twitter' | 'linkedin';
  isDraftSaving: boolean;
  lastSaved: Date | null;
  editorReady: boolean;
  dragActive: boolean;
  searchQuery: string;
  mediaFilter: 'all' | 'images' | 'videos' | 'documents';
  aiAltTextSuggestions: {[key: string]: string};
  currentLanguage: string;
}