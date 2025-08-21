'use client';

import React, { useState, useRef, useCallback, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { createPostAction, analyzeSeoAction, uploadImageAction, saveDraftAction } from '@/app/actions/blog';
import { CreatePostFormData, SeoAnalysis, MediaItem, CreatePostFormState } from '@/types/blog';
import dynamic from 'next/dynamic';

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => ({ default: mod.CKEditor })),
  { ssr: false }
);
const ClassicEditor = dynamic(
  () => import('@ckeditor/ckeditor5-build-classic'),
  { ssr: false }
);

// Validation schema for client-side form validation
const formSchema = z.object({
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

type FormData = z.infer<typeof formSchema>;

interface PostStats {
  wordCount: number;
  readTime: number;
  characterCount: number;
  headingCount: number;
  imageCount: number;
  linkCount: number;
  paragraphCount: number;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  category: string;
  tags: string[];
}

interface MediaUploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
  id: string;
}

interface RevisionHistory {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  changes: string;
}

interface SocialPreview {
  platform: 'facebook' | 'twitter' | 'linkedin';
  title: string;
  description: string;
  image?: string;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  optimizationScore: number;
}

const categories = [
  'Travel Guide',
  'Industry News',
  'Business Travel', 
  'Route Analysis',
  'Digital Nomad',
  'Transportation Tech',
  'Cross-Border Tips',
  'Luxury Travel',
  'Budget Travel',
  'Safety & Security',
  'Regulations',
  'Tips & Tricks'
];

const contentTemplates: ContentTemplate[] = [
  {
    id: 'travel-guide',
    name: 'Travel Guide',
    description: 'Comprehensive destination guide template',
    icon: '🗺️',
    content: '# Destination Guide: [Location]\n\n## Overview\n\n[Brief introduction to the destination]\n\n## Getting There\n\n### Transportation Options\n- By Air: [Airport information]\n- By Land: [Border crossings, bus routes]\n- By Sea: [Ferry information]\n\n## Visa Requirements\n\n[Visa information for different nationalities]\n\n## Best Time to Visit\n\n[Seasonal information and recommendations]\n\n## Top Attractions\n\n### Must-See Places\n1. [Attraction 1]\n2. [Attraction 2]\n3. [Attraction 3]\n\n## Local Transportation\n\n[Information about getting around locally]\n\n## Accommodation\n\n### Budget Options\n### Mid-Range Options\n### Luxury Options\n\n## Food & Dining\n\n[Local cuisine and restaurant recommendations]\n\n## Safety Tips\n\n[Important safety information]\n\n## Budget Planning\n\n[Cost breakdown and budgeting tips]',
    category: 'Travel Guide',
    tags: ['destination', 'guide', 'travel-tips']
  },
  {
    id: 'route-analysis',
    name: 'Route Analysis',
    description: 'Transportation route analysis template',
    icon: '🛣️',
    content: '# Route Analysis: [Origin] to [Destination]\n\n## Executive Summary\n\n[Brief overview of the route analysis]\n\n## Route Overview\n\n- **Total Distance**: [Distance]\n- **Estimated Travel Time**: [Time]\n- **Primary Transportation Modes**: [Modes]\n- **Border Crossings**: [Number and locations]\n\n## Detailed Analysis\n\n### Route Segments\n\n#### Segment 1: [Location A] to [Location B]\n- Distance: [km]\n- Transportation: [Method]\n- Duration: [Time]\n- Notes: [Special considerations]\n\n### Border Crossing Information\n\n[Detailed information about each border crossing]\n\n### Cost Analysis\n\n[Breakdown of transportation costs]\n\n### Seasonal Considerations\n\n[How weather and seasons affect the route]\n\n### Alternative Routes\n\n[Alternative transportation options]\n\n## Recommendations\n\n[Summary of recommendations for this route]',
    category: 'Route Analysis',
    tags: ['transportation', 'route', 'analysis']
  },
  {
    id: 'news-article',
    name: 'Industry News',
    description: 'Breaking news article template',
    icon: '📰',
    content: '# [Headline]\n\n## Summary\n\n[Brief summary of the news story]\n\n## Background\n\n[Context and background information]\n\n## Key Details\n\n- **What**: [What happened]\n- **When**: [Timeline]\n- **Where**: [Location]\n- **Who**: [Key players involved]\n- **Why**: [Reasons/causes]\n\n## Impact Analysis\n\n### Industry Impact\n[How this affects the industry]\n\n### Consumer Impact\n[How this affects travelers/consumers]\n\n## Expert Opinions\n\n[Quotes and analysis from industry experts]\n\n## Looking Forward\n\n[Future implications and expectations]\n\n## Related Stories\n\n[Links to related articles]',
    category: 'Industry News',
    tags: ['news', 'industry', 'update']
  },
  {
    id: 'tips-tricks',
    name: 'Tips & Tricks',
    description: 'Practical advice and tips template',
    icon: '💡',
    content: '# [Tips Topic]: Expert Guide\n\n## Introduction\n\n[Brief introduction to the topic]\n\n## Quick Tips Summary\n\n- [Tip 1]\n- [Tip 2]\n- [Tip 3]\n- [Tip 4]\n- [Tip 5]\n\n## Detailed Guide\n\n### Tip 1: [Title]\n\n[Detailed explanation]\n\n**Why it works**: [Explanation]\n**Pro tip**: [Additional advice]\n\n### Tip 2: [Title]\n\n[Detailed explanation]\n\n### Common Mistakes to Avoid\n\n1. [Mistake 1]\n2. [Mistake 2]\n3. [Mistake 3]\n\n## Advanced Techniques\n\n[More advanced tips for experienced users]\n\n## Tools and Resources\n\n[Recommended tools, apps, or resources]\n\n## Conclusion\n\n[Summary and key takeaways]',
    category: 'Tips & Tricks',
    tags: ['tips', 'advice', 'guide']
  }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
];

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [createState, createFormAction, isCreating] = useActionState(createPostAction, { success: false });
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media' | 'settings' | 'templates' | 'collaboration' | 'analytics'>('content');
  const [stats, setStats] = useState<PostStats>({ 
    wordCount: 0, 
    readTime: 0, 
    characterCount: 0, 
    headingCount: 0, 
    imageCount: 0, 
    linkCount: 0, 
    paragraphCount: 0 
  });
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistory[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [socialPreviews, setSocialPreviews] = useState<SocialPreview[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    optimizationScore: 0
  });
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [serializationError, setSerializationError] = useState<string | null>(null);
  const [aiAltTextSuggestions, setAiAltTextSuggestions] = useState<{[key: string]: string}>({});
  const [collaborators, setCollaborators] = useState<Array<{id: string, name: string, avatar: string, status: 'online' | 'offline'}>>([]);
  const [liveEditing, setLiveEditing] = useState(false);
  const [wordCountTarget, setWordCountTarget] = useState(500);
  const [keywordDensity, setKeywordDensity] = useState<{[key: string]: number}>({});
  const [contentStructureScore, setContentStructureScore] = useState(0);
  const [socialPreviewPlatform, setSocialPreviewPlatform] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const imageEditorRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    setError,
    reset
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      status: 'draft',
      featured: false,
      metaKeywords: [],
    },
    mode: 'onSubmit'
  });
  
  const watchedValues = watch();
  const content = watch('content');
  const title = watch('title');
  const excerpt = watch('excerpt');

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft_post');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        reset(draft);
        setLastSaved(new Date(draft.lastSaved));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [reset]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (title || content) {
      setIsDraftSaving(true);
      const formData = new FormData();
      const currentValues = getValues();
      
      Object.entries(currentValues).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value || ''));
        }
      });
      
      try {
        await saveDraftAction(formData);
        localStorage.setItem('draft_post', JSON.stringify({
          ...currentValues,
          lastSaved: new Date().toISOString()
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsDraftSaving(false);
      }
    }
  }, [title, content, getValues]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Update stats when content changes
  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
      const chars = content.length;
      const readTime = Math.ceil(words / 200);
      
      // Enhanced content analysis
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      const headings = (content.match(/#{1,6}\s/g) || []).length;
      const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
      const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
      
      setStats({ 
        wordCount: words, 
        readTime, 
        characterCount: chars,
        headingCount: headings,
        imageCount: images,
        linkCount: links,
        paragraphCount: paragraphs
      });
      
      // Calculate content structure score
      let structureScore = 0;
      if (headings >= 2) structureScore += 25;
      if (paragraphs >= 3) structureScore += 25;
      if (images >= 1) structureScore += 25;
      if (links >= 1) structureScore += 25;
      setContentStructureScore(structureScore);
      
      // Calculate keyword density
      const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'];
      const contentWords = content.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      const wordFreq: {[key: string]: number} = {};
      
      contentWords.forEach(word => {
        if (word.length > 3 && !commonWords.includes(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      
      const totalWords = contentWords.length;
      const density: {[key: string]: number} = {};
      Object.entries(wordFreq).forEach(([word, count]) => {
        density[word] = Math.round((count / totalWords) * 100 * 100) / 100;
      });
      
      setKeywordDensity(density);
    } else {
      setStats({ wordCount: 0, readTime: 0, characterCount: 0, headingCount: 0, imageCount: 0, linkCount: 0, paragraphCount: 0 });
      setContentStructureScore(0);
      setKeywordDensity({});
    }
  }, [content]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !getValues('slug')) {
      const slug = generateSlug(title);
      setValue('slug', slug);
    }
  }, [title, setValue, getValues]);

  // SEO Analysis
  useEffect(() => {
    if (title && content && excerpt) {
      const timeoutId = setTimeout(async () => {
        try {
          const analysis = await analyzeSeoAction(
            title,
            content,
            excerpt,
            getValues('metaTitle'),
            getValues('metaDescription'),
            getValues('tags')
          );
          setSeoAnalysis(analysis);
        } catch (error) {
          console.error('SEO analysis failed:', error);
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [title, content, excerpt, getValues]);

  const handleAddTag = () => {
    if (tagInput.trim() && !getValues('tags').includes(tagInput.trim())) {
      const currentTags = getValues('tags');
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = getValues('tags');
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Enhanced drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await handleMultipleImageUpload(imageFiles);
    }
  }, []);

  const handleMultipleImageUpload = async (files: File[]) => {
    const uploadPromises = files.map(async (file, index) => {
      const progressId = `upload-${Date.now()}-${index}`;
      
      setUploadProgress(prev => [
        ...prev,
        { file, progress: 0, id: progressId }
      ]);
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => 
            prev.map(item => 
              item.id === progressId 
                ? { ...item, progress }
                : item
            )
          );
        }
        
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadImageAction(formData);
        
        if (result.url) {
          // Generate AI alt text suggestion
          const altTextSuggestion = await generateAiAltText(file.name, result.url);
          setAiAltTextSuggestions(prev => ({
            ...prev,
            [result.url]: altTextSuggestion
          }));
          
          const newMediaItem: MediaItem = {
            id: progressId,
            name: file.name,
            url: result.url,
            type: 'image',
            size: file.size,
            dimensions: await getImageDimensions(result.url),
            alt: altTextSuggestion,
            uploadedAt: new Date()
          };
          
          setMediaLibrary(prev => [...prev, newMediaItem]);
          
          setUploadProgress(prev => 
            prev.map(item => 
              item.id === progressId 
                ? { ...item, url: result.url, progress: 100 }
                : item
            )
          );
          
          // Auto-remove from progress after 3 seconds
          setTimeout(() => {
            setUploadProgress(prev => prev.filter(item => item.id !== progressId));
          }, 3000);
          
          return result.url;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        setUploadProgress(prev => 
          prev.map(item => 
            item.id === progressId 
              ? { ...item, error: 'Upload failed', progress: 0 }
              : item
          )
        );
        return null;
      }
    });
    
    await Promise.all(uploadPromises);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      return await handleMultipleImageUpload([file]);
    } finally {
      setIsUploading(false);
    }
  };

  // AI-powered alt text generation (mock implementation)
  const generateAiAltText = async (filename: string, url: string): Promise<string> => {
    // In production, this would use an AI service like OpenAI Vision or Google Cloud Vision
    const suggestions = [
      `Professional photo related to ${filename.split('.')[0]}`,
      `High-quality image showing ${filename.split('.')[0].replace(/-|_/g, ' ')}`,
      `Detailed view of ${filename.split('.')[0].replace(/-|_/g, ' ')}`,
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  // Get image dimensions
  const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  const onSubmit = async (data: FormData) => {
    // Manual validation
    try {
      const validatedData = formSchema.parse(data);
      
      const formData = new FormData();
      
      Object.entries(validatedData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value || ''));
        }
      });
      
      await createFormAction(formData);
      
      if (createState.success) {
        localStorage.removeItem('draft_post');
        router.push('/dashboard/editor');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach((err) => {
          const fieldName = err.path.join('.') as keyof FormData;
          setError(fieldName, { message: err.message });
        });
      }
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-green';
    if (score >= 60) return 'text-warning-amber';
    return 'text-error-red';
  };

  const getSeoScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  // Initialize mock collaborators for demo
  useEffect(() => {
    setCollaborators([
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGQ0U3RjMiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMyIgcj0iNSIgZmlsbD0iI0VDNDg5OSIvPgo8cGF0aCBkPSJNNCAyNnYtMmE4IDggMCAwIDEgMTYgMHYyIiBmaWxsPSIjRUM0ODk5Ii8+Cjwvc3ZnPgo=',
        status: 'online' as const
      },
      {
        id: '2',
        name: 'Marcus Johnson',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNERkYyRkYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMyIgcj0iNSIgZmlsbD0iIzBFQTVFOSIvPgo8cGF0aCBkPSJNNCAyNnYtMmE4IDggMCAwIDEgMTYgMHYyIiBmaWxsPSIjMEVBNUU5Ii8+Cjwvc3ZnPgo=',
        status: 'offline' as const
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-charcoal dark:via-gray-900 dark:to-black transition-all duration-500">
      {/* Tesla-inspired glass morphism background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-hot-pink/20 to-deep-pink/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-electric-blue/20 to-hot-pink/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 max-w-7xl py-6 md:py-8">
        {/* Tesla-inspired Header with Glass Morphism */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-hot-pink to-deep-pink rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                <span className="text-white font-bold text-xl" aria-hidden="true">✏️</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-charcoal via-hot-pink to-electric-blue bg-clip-text text-transparent dark:from-white dark:via-hot-pink dark:to-electric-blue">
                  Create New Post
                </h1>
                <nav aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-body-sm text-gray-500">
                    <li><Link href="/dashboard" className="hover:text-hot-pink">Dashboard</Link></li>
                    <li aria-hidden="true">•</li>
                    <li><Link href="/dashboard/editor" className="hover:text-hot-pink">Editor</Link></li>
                    <li aria-hidden="true">•</li>
                    <li className="text-charcoal dark:text-white">Create</li>
                  </ol>
                </nav>
              </div>
            </div>
            <p className="text-body-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Write and publish engaging travel content with our comprehensive editor
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                liveEditing ? "bg-success-green animate-pulse shadow-lg shadow-success-green/50" : "bg-gray-400"
              )}></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {liveEditing ? "Live" : "Offline"}
              </span>
            </div>
            
            {/* Metrics Display */}
            <div className="flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.wordCount} words
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.readTime}m read
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className={cn(
                "text-sm font-medium",
                seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : "text-gray-400"
              )}>
                SEO: {seoAnalysis ? Math.round(seoAnalysis.score) : 0}%
              </div>
            </div>
            
            {/* Auto-save Status */}
            {lastSaved && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isDraftSaving ? "bg-warning-amber animate-pulse shadow-lg shadow-warning-amber/50" : "bg-success-green shadow-lg shadow-success-green/50"
                )}></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {isDraftSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
                </span>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Form Errors */}
        <AnimatePresence>
          {createState.errors && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-error-red/10 border border-error-red/20 rounded-lg p-4 mb-6"
            >
              <h3 className="text-error-red font-medium mb-2">Please fix the following errors:</h3>
              <ul className="text-sm text-error-red space-y-1">
                {Object.entries(createState.errors).map(([field, errors]) => (
                  errors?.map((error, index) => (
                    <li key={`${field}-${index}`}>• {error}</li>
                  ))
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {createState.success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success-green/10 border border-success-green/20 rounded-lg p-4 mb-6"
          >
            <p className="text-success-green font-medium">{createState.message}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Title Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="space-y-2">
                  <Input
                    {...register('title')}
                    placeholder="Enter your post title..."
                    className="text-headline-md font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-hot-pink rounded-none px-0 bg-transparent"
                    error={errors.title?.message}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>SEO-friendly titles are 30-60 characters</span>
                    <span className={cn(
                      title?.length > 60 ? 'text-error-red' : title?.length >= 30 ? 'text-success-green' : 'text-gray-500'
                    )}>
                      {title?.length || 0}/60 characters
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Content Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                  {/* Tesla-inspired Tab Navigation */}
                  <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex space-x-1 p-2 overflow-x-auto">
                      {[
                        { key: 'content', label: 'Content', icon: '✏️' },
                        { key: 'seo', label: 'SEO', icon: '🎯', badge: seoAnalysis ? Math.round(seoAnalysis.score) : null },
                        { key: 'media', label: 'Media', icon: '🖼️', badge: mediaLibrary.length || null },
                        { key: 'settings', label: 'Settings', icon: '⚙️' },
                        { key: 'templates', label: 'Templates', icon: '📋' },
                        { key: 'collaboration', label: 'Collaboration', icon: '👥', badge: collaborators.filter(c => c.status === 'online').length || null },
                        { key: 'analytics', label: 'Analytics', icon: '📊' }
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key as any)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 relative group',
                            activeTab === tab.key
                              ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-lg scale-105 transform'
                              : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md hover:scale-102 transform'
                          )}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                          {tab.badge !== null && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                'px-2 py-0.5 text-xs rounded-full font-medium shadow-sm',
                                activeTab === tab.key
                                  ? 'bg-white/20 text-white'
                                  : 'bg-hot-pink/10 text-hot-pink border border-hot-pink/20'
                              )}
                            >
                              {tab.badge}{tab.key === 'seo' ? '%' : ''}
                            </motion.span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CardContent className="p-6 bg-white/50 dark:bg-gray-900/50">
                    {activeTab === 'content' && (
                      <div className="space-y-6">
                        {/* Excerpt */}
                        <div>
                          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                            Excerpt
                          </label>
                          <Textarea
                            {...register('excerpt')}
                            placeholder="Brief description of your post that will appear in previews and search results..."
                            rows={3}
                            error={errors.excerpt?.message}
                          />
                          <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>Compelling excerpts improve click-through rates</span>
                            <span className={cn(
                              excerpt?.length > 300 ? 'text-error-red' : excerpt?.length >= 120 ? 'text-success-green' : 'text-gray-500'
                            )}>
                              {excerpt?.length || 0}/300 characters
                            </span>
                          </div>
                        </div>

                        {/* Rich Text Editor */}
                        <div>
                          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                            Content
                          </label>
                          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <Suspense fallback={
                              <div className="h-96 flex items-center justify-center bg-gray-50">
                                <div className="text-gray-500">Loading editor...</div>
                              </div>
                            }>
                              {typeof window !== 'undefined' && CKEditor && ClassicEditor && (
                                <CKEditor
                                  editor={ClassicEditor}
                                  data={content || ''}
                                  onReady={(editor: any) => {
                                    setEditorReady(true);
                                    editor.editing.view.change((writer: any) => {
                                      writer.setStyle('height', '400px', editor.editing.view.document.getRoot());
                                    });
                                  }}
                                  onChange={(event: any, editor: any) => {
                                    const data = editor.getData();
                                    setValue('content', data);
                                  }}
                                  config={{
                                    toolbar: {
                                      items: [
                                        'heading',
                                        '|',
                                        'fontSize',
                                        'fontColor',
                                        'fontBackgroundColor',
                                        '|',
                                        'bold',
                                        'italic',
                                        'underline',
                                        'strikethrough',
                                        'code',
                                        '|',
                                        'link',
                                        'linkImage',
                                        '|',
                                        'bulletedList',
                                        'numberedList',
                                        'todoList',
                                        '|',
                                        'outdent',
                                        'indent',
                                        'alignment',
                                        '|',
                                        'imageUpload',
                                        'mediaEmbed',
                                        'insertTable',
                                        'blockQuote',
                                        'codeBlock',
                                        'horizontalLine',
                                        'specialCharacters',
                                        '|',
                                        'undo',
                                        'redo',
                                        'findAndReplace',
                                        'selectAll',
                                        '|',
                                        'sourceEditing'
                                      ],
                                      shouldNotGroupWhenFull: true
                                    },
                                    language: currentLanguage,
                                    fontSize: {
                                      options: [ 9, 11, 13, 'default', 17, 19, 21 ],
                                      supportAllValues: true
                                    },
                                    fontColor: {
                                      colors: [
                                        {
                                          color: 'hsl(0, 0%, 0%)',
                                          label: 'Black'
                                        },
                                        {
                                          color: 'hsl(0, 0%, 30%)',
                                          label: 'Dim grey'
                                        },
                                        {
                                          color: 'hsl(0, 0%, 60%)',
                                          label: 'Grey'
                                        },
                                        {
                                          color: 'hsl(0, 0%, 90%)',
                                          label: 'Light grey'
                                        },
                                        {
                                          color: 'hsl(0, 0%, 100%)',
                                          label: 'White',
                                          hasBorder: true
                                        },
                                        {
                                          color: 'hsl(4, 90%, 58%)',
                                          label: 'Red'
                                        },
                                        {
                                          color: 'hsl(340, 82%, 52%)',
                                          label: 'Hot Pink'
                                        },
                                        {
                                          color: 'hsl(291, 64%, 42%)',
                                          label: 'Deep Pink'
                                        },
                                        {
                                          color: 'hsl(199, 84%, 55%)',
                                          label: 'Electric Blue'
                                        },
                                        {
                                          color: 'hsl(162, 73%, 46%)',
                                          label: 'Success Green'
                                        },
                                        {
                                          color: 'hsl(37, 90%, 51%)',
                                          label: 'Warning Amber'
                                        }
                                      ]
                                    },
                                    fontBackgroundColor: {
                                      colors: [
                                        {
                                          color: 'hsl(0, 0%, 100%)',
                                          label: 'White'
                                        },
                                        {
                                          color: 'hsl(0, 0%, 90%)',
                                          label: 'Light grey'
                                        },
                                        {
                                          color: 'hsl(4, 90%, 93%)',
                                          label: 'Light red'
                                        },
                                        {
                                          color: 'hsl(340, 82%, 95%)',
                                          label: 'Light pink'
                                        },
                                        {
                                          color: 'hsl(199, 84%, 95%)',
                                          label: 'Light blue'
                                        },
                                        {
                                          color: 'hsl(162, 73%, 93%)',
                                          label: 'Light green'
                                        },
                                        {
                                          color: 'hsl(37, 90%, 93%)',
                                          label: 'Light yellow'
                                        }
                                      ]
                                    },
                                    heading: {
                                      options: [
                                        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                                        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                                        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                                        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
                                      ]
                                    },
                                    alignment: {
                                      options: [ 'left', 'right', 'center', 'justify' ]
                                    },
                                    image: {
                                      toolbar: [
                                        'imageTextAlternative',
                                        'imageStyle:inline',
                                        'imageStyle:block',
                                        'imageStyle:side',
                                        'imageStyle:alignLeft',
                                        'imageStyle:alignCenter',
                                        'imageStyle:alignRight',
                                        'linkImage',
                                        'imageResize'
                                      ],
                                      styles: [
                                        'full',
                                        'side',
                                        'alignLeft',
                                        'alignCenter',
                                        'alignRight'
                                      ],
                                      resizeOptions: [
                                        {
                                          name: 'resizeImage:original',
                                          value: null,
                                          icon: 'original'
                                        },
                                        {
                                          name: 'resizeImage:50',
                                          value: '50',
                                          icon: 'medium'
                                        },
                                        {
                                          name: 'resizeImage:75',
                                          value: '75',
                                          icon: 'large'
                                        }
                                      ]
                                    },
                                    table: {
                                      contentToolbar: [
                                        'tableColumn',
                                        'tableRow',
                                        'mergeTableCells',
                                        'tableCellProperties',
                                        'tableProperties'
                                      ]
                                    },
                                    link: {
                                      decorators: {
                                        openInNewTab: {
                                          mode: 'manual',
                                          label: 'Open in a new tab',
                                          attributes: {
                                            target: '_blank',
                                            rel: 'noopener noreferrer'
                                          }
                                        }
                                      }
                                    },
                                    codeBlock: {
                                      languages: [
                                        { language: 'javascript', label: 'JavaScript' },
                                        { language: 'typescript', label: 'TypeScript' },
                                        { language: 'python', label: 'Python' },
                                        { language: 'css', label: 'CSS' },
                                        { language: 'html', label: 'HTML' },
                                        { language: 'json', label: 'JSON' },
                                        { language: 'xml', label: 'XML' },
                                        { language: 'sql', label: 'SQL' },
                                        { language: 'bash', label: 'Bash' },
                                        { language: 'php', label: 'PHP' }
                                      ]
                                    },
                                    mediaEmbed: {
                                      previewsInData: true,
                                      providers: [
                                        {
                                          name: 'youtube',
                                          url: /^youtube\.com\/watch\?v=([\w-]+)/,
                                          html: match => `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/${match[1]}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`
                                        },
                                        {
                                          name: 'vimeo',
                                          url: /^vimeo\.com\/(\d+)/,
                                          html: match => `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://player.vimeo.com/video/${match[1]}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`
                                        }
                                      ]
                                    },
                                    wordCount: {
                                      onUpdate: (stats: any) => {
                                        // Update word count in real-time
                                        console.log('Word count:', stats.words);
                                      }
                                    },
                                    autosave: {
                                      save: (editor: any) => {
                                        return new Promise(resolve => {
                                          setTimeout(() => {
                                            const data = editor.getData();
                                            setValue('content', data);
                                            resolve(data);
                                          }, 1000);
                                        });
                                      }
                                    },
                                    licenseKey: '',
                                  }}
                                />
                              )}
                            </Suspense>
                          </div>
                          {errors.content && (
                            <p className="mt-1 text-sm text-error-red">{errors.content.message}</p>
                          )}
                          <div className="flex justify-between mt-2 text-sm text-gray-500">
                            <span>Use the toolbar above to format your content</span>
                            <span>{stats.wordCount} words • {stats.readTime} min read</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'seo' && (
                      <div className="space-y-6">
                        {/* SEO Score */}
                        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                          <CardContent className="text-center p-6">
                            <div className="flex items-center justify-center gap-4 mb-4">
                              <div className={cn(
                                'text-display-sm font-bold',
                                seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : 'text-gray-400'
                              )}>
                                {seoAnalysis ? Math.round(seoAnalysis.score) : 0}%
                              </div>
                              <div>
                                <div className="text-title-md font-semibold text-charcoal dark:text-white">
                                  SEO Score
                                </div>
                                <div className={cn(
                                  'text-body-sm',
                                  seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : 'text-gray-400'
                                )}>
                                  {seoAnalysis ? getSeoScoreLabel(seoAnalysis.score) : 'Analyzing...'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${seoAnalysis?.score || 0}%` }}
                                className={cn(
                                  'h-2 rounded-full transition-all duration-500',
                                  !seoAnalysis ? 'bg-gray-300' :
                                  seoAnalysis.score >= 80 ? 'bg-success-green' :
                                  seoAnalysis.score >= 60 ? 'bg-warning-amber' : 'bg-error-red'
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* SEO Issues */}
                        {seoAnalysis && seoAnalysis.issues.length > 0 && (
                          <div>
                            <h3 className="text-title-sm font-semibold text-error-red mb-3">Issues to Fix</h3>
                            <div className="space-y-2">
                              {seoAnalysis.issues.map((issue, index) => (
                                <div key={index} className={cn(
                                  'flex items-start gap-2 p-3 rounded-lg border',
                                  issue.type === 'error' 
                                    ? 'bg-error-red/10 border-error-red/20'
                                    : 'bg-warning-amber/10 border-warning-amber/20'
                                )}>
                                  <span className={cn(
                                    'mt-0.5',
                                    issue.type === 'error' ? 'text-error-red' : 'text-warning-amber'
                                  )}>
                                    {issue.type === 'error' ? '⚠️' : '⚡'}
                                  </span>
                                  <span className={cn(
                                    'text-body-sm',
                                    issue.type === 'error' ? 'text-error-red' : 'text-warning-amber'
                                  )}>
                                    {issue.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SEO Suggestions */}
                        {seoAnalysis && seoAnalysis.suggestions.length > 0 && (
                          <div>
                            <h3 className="text-title-sm font-semibold text-electric-blue mb-3">Suggestions</h3>
                            <div className="space-y-2">
                              {seoAnalysis.suggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
                                  <span className="text-electric-blue mt-0.5">💡</span>
                                  <div className="flex-1">
                                    <span className="text-body-sm text-electric-blue">{suggestion.message}</span>
                                    <span className={cn(
                                      'ml-2 px-2 py-0.5 text-xs rounded-full',
                                      suggestion.priority === 'high' ? 'bg-error-red/20 text-error-red' :
                                      suggestion.priority === 'medium' ? 'bg-warning-amber/20 text-warning-amber' :
                                      'bg-gray-100 text-gray-600'
                                    )}>
                                      {suggestion.priority} priority
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Meta Fields */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                              SEO Title
                            </label>
                            <Input
                              {...register('metaTitle')}
                              placeholder="Custom SEO title (leave empty to use post title)"
                              error={errors.metaTitle?.message}
                            />
                            <div className={cn(
                              'text-xs mt-1',
                              (getValues('metaTitle')?.length || title?.length || 0) > 60 ? 'text-error-red' : 'text-gray-500'
                            )}>
                              {(getValues('metaTitle')?.length || title?.length || 0)}/60 characters
                            </div>
                          </div>

                          <div>
                            <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                              Meta Description
                            </label>
                            <Textarea
                              {...register('metaDescription')}
                              placeholder="Brief description for search engines (120-160 characters)"
                              rows={3}
                              error={errors.metaDescription?.message}
                            />
                            <div className={cn(
                              'text-xs mt-1',
                              (getValues('metaDescription')?.length || 0) > 160 ? 'text-error-red' : 'text-gray-500'
                            )}>
                              {getValues('metaDescription')?.length || 0}/160 characters
                            </div>
                          </div>

                          <div>
                            <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                              URL Slug
                            </label>
                            <Input
                              {...register('slug')}
                              placeholder="url-slug-for-your-post"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Preview: /blog/{getValues('slug') || 'your-post-slug'}
                            </div>
                          </div>
                          
                          {/* Social Media Preview */}
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">Social Media Preview</h4>
                            
                            {/* Platform Selector */}
                            <div className="flex gap-2 mb-4">
                              {[{id: 'facebook', name: 'Facebook', icon: '📘'}, {id: 'twitter', name: 'Twitter', icon: '🐦'}, {id: 'linkedin', name: 'LinkedIn', icon: '💼'}].map((platform) => (
                                <button
                                  key={platform.id}
                                  type="button"
                                  onClick={() => setSocialPreviewPlatform(platform.id as any)}
                                  className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                    socialPreviewPlatform === platform.id
                                      ? "bg-hot-pink text-white"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                  )}
                                >
                                  {platform.icon} {platform.name}
                                </button>
                              ))}
                            </div>
                            
                            {/* Social Preview Card */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
                              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                                {socialPreviewPlatform} Preview
                              </div>
                              <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                                {getValues('thumbnailUrl') && (
                                  <img 
                                    src={getValues('thumbnailUrl')} 
                                    alt="" 
                                    className={cn(
                                      "w-full object-cover",
                                      socialPreviewPlatform === 'twitter' ? "h-32" : "h-40"
                                    )}
                                  />
                                )}
                                <div className="p-3">
                                  <div className="text-xs text-gray-500 mb-1">your-domain.com</div>
                                  <h3 className="font-semibold text-sm text-charcoal dark:text-white mb-1 line-clamp-2">
                                    {getValues(`${socialPreviewPlatform === 'twitter' ? 'twitter' : 'openGraph'}Title`) || title || 'Your Post Title'}
                                  </h3>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {getValues(`${socialPreviewPlatform === 'twitter' ? 'twitter' : 'openGraph'}Description`) || excerpt || 'Your post description will appear here...'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Social Media Fields */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                                  {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook/LinkedIn'} Title
                                </label>
                                <Input
                                  {...register(socialPreviewPlatform === 'twitter' ? 'twitterTitle' : 'openGraphTitle')}
                                  placeholder="Custom title for social sharing"
                                  error={errors[socialPreviewPlatform === 'twitter' ? 'twitterTitle' : 'openGraphTitle']?.message}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  Leave empty to use post title. {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook/LinkedIn'} optimal: 60 characters
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                                  {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook/LinkedIn'} Description
                                </label>
                                <Textarea
                                  {...register(socialPreviewPlatform === 'twitter' ? 'twitterDescription' : 'openGraphDescription')}
                                  placeholder="Description for social media previews"
                                  rows={2}
                                  error={errors[socialPreviewPlatform === 'twitter' ? 'twitterDescription' : 'openGraphDescription']?.message}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook'} optimal: 125-160 characters
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                                  {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Open Graph'} Image
                                </label>
                                <Input
                                  {...register(socialPreviewPlatform === 'twitter' ? 'twitterImage' : 'openGraphImage')}
                                  placeholder="Custom image URL for social sharing"
                                  error={errors[socialPreviewPlatform === 'twitter' ? 'twitterImage' : 'openGraphImage']?.message}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  Leave empty to use featured image. Recommended size: {socialPreviewPlatform === 'twitter' ? '1200x675px' : '1200x630px'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* SERP Preview */}
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">Search Engine Preview</h4>
                            
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                              <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Google Search Result</div>
                              <div className="bg-white dark:bg-gray-900 p-4 rounded border">
                                <div className="text-xs text-green-600 mb-1">https://your-domain.com/blog/{getValues('slug') || 'your-post-slug'}</div>
                                <h3 className="text-lg text-blue-600 hover:underline cursor-pointer mb-1 line-clamp-1">
                                  {getValues('metaTitle') || title || 'Your Post Title Here'}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {getValues('metaDescription') || excerpt || 'Your meta description will appear here. Make it compelling to encourage clicks from search results.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'media' && (
                      <div className="space-y-6">
                        {/* Upload Progress */}
                        <AnimatePresence>
                          {uploadProgress.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-2"
                            >
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading Media</h4>
                              {uploadProgress.map((upload) => (
                                <div key={upload.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    {upload.url ? (
                                      <img src={upload.url} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                      <span className="text-sm">{upload.file.name.split('.').pop()?.toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium truncate">{upload.file.name}</span>
                                      <span className="text-xs text-gray-500">{upload.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className={cn(
                                          "h-2 rounded-full transition-all duration-300",
                                          upload.error ? "bg-error-red" : "bg-hot-pink"
                                        )}
                                        style={{ width: `${upload.progress}%` }}
                                      />
                                    </div>
                                    {upload.error && (
                                      <p className="text-xs text-error-red mt-1">{upload.error}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Enhanced Drag & Drop Upload Area */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Media Upload
                          </h3>
                          <div 
                            ref={dropZoneRef}
                            className={cn(
                              "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
                              dragActive 
                                ? "border-hot-pink bg-hot-pink/5 scale-102" 
                                : "border-gray-300 dark:border-gray-600 hover:border-hot-pink hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className={cn(
                              "text-6xl mb-4 transition-transform duration-300",
                              dragActive ? "scale-110" : ""
                            )}>
                              {dragActive ? "📤" : "🖼️"}
                            </div>
                            <h4 className="text-lg font-semibold text-charcoal dark:text-white mb-2">
                              {dragActive ? "Drop files here" : "Upload Media Files"}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {dragActive 
                                ? "Release to upload your files" 
                                : "Drag and drop images, videos, or documents here, or click to browse"
                              }
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <Button 
                                type="button"
                                variant="primary" 
                                size="md"
                                className="bg-gradient-to-r from-hot-pink to-deep-pink"
                              >
                                Choose Files
                              </Button>
                              <Button 
                                type="button"
                                variant="outline" 
                                size="md"
                              >
                                Browse Library
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Supports: JPEG, PNG, WEBP, GIF, MP4, PDF (Max 10MB each)
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,video/*,.pdf,.doc,.docx"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                  const imageFiles = files.filter(f => f.type.startsWith('image/'));
                                  if (imageFiles.length > 0) {
                                    await handleMultipleImageUpload(imageFiles);
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Featured Image Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-title-sm font-semibold text-charcoal dark:text-white">
                              Featured Image
                            </h3>
                            {getValues('thumbnailUrl') && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowImageEditor(true)}
                                className="text-hot-pink hover:text-deep-pink"
                              >
                                ✏️ Edit
                              </Button>
                            )}
                          </div>
                          
                          {getValues('thumbnailUrl') ? (
                            <div className="space-y-4">
                              <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group">
                                <img
                                  src={getValues('thumbnailUrl')}
                                  alt={getValues('thumbnailAlt') || 'Featured image'}
                                  className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowImageEditor(true)}
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setValue('thumbnailUrl', '');
                                      setValue('thumbnailAlt', '');
                                    }}
                                  >
                                    🗑️ Remove
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-body-md font-medium text-charcoal dark:text-white">
                                    Alt Text (for accessibility)
                                  </label>
                                  {aiAltTextSuggestions[getValues('thumbnailUrl') || ''] && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const suggestion = aiAltTextSuggestions[getValues('thumbnailUrl') || ''];
                                        setValue('thumbnailAlt', suggestion);
                                      }}
                                      className="text-electric-blue hover:text-hot-pink text-xs"
                                    >
                                      🤖 Use AI Suggestion
                                    </Button>
                                  )}
                                </div>
                                <Input
                                  {...register('thumbnailAlt')}
                                  placeholder="Describe this image for screen readers"
                                />
                                {aiAltTextSuggestions[getValues('thumbnailUrl') || ''] && (
                                  <p className="text-xs text-electric-blue mt-1">
                                    AI suggests: "{aiAltTextSuggestions[getValues('thumbnailUrl') || '']}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                              <div className="text-3xl mb-2">🖼️</div>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                No featured image selected
                              </p>
                              <p className="text-xs text-gray-500">
                                Upload an image above or select from your media library
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Media Library */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-title-sm font-semibold text-charcoal dark:text-white">
                              Media Library ({mediaLibrary.length})
                            </h3>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Search media..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-40"
                              />
                              <select
                                value={mediaFilter}
                                onChange={(e) => setMediaFilter(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                              >
                                <option value="all">All Media</option>
                                <option value="images">Images</option>
                                <option value="videos">Videos</option>
                                <option value="documents">Documents</option>
                              </select>
                            </div>
                          </div>
                          
                          {mediaLibrary.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                              {mediaLibrary
                                .filter(item => {
                                  if (mediaFilter !== 'all' && item.type !== mediaFilter) return false;
                                  if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                                  return true;
                                })
                                .map((item) => (
                                <motion.div 
                                  key={item.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-hot-pink transition-all"
                                  onClick={() => {
                                    setValue('thumbnailUrl', item.url);
                                    setValue('thumbnailAlt', item.alt || '');
                                  }}
                                >
                                  {item.type === 'image' ? (
                                    <img 
                                      src={item.url} 
                                      alt={item.alt || item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-2xl">
                                        {item.type === 'video' ? '🎥' : '📄'}
                                      </span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                      <p className="text-white text-xs font-medium mb-1">{item.name}</p>
                                      <p className="text-white text-xs">
                                        {item.dimensions ? `${item.dimensions.width}×${item.dimensions.height}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                  {getValues('thumbnailUrl') === item.url && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-hot-pink rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="text-4xl mb-3">📁</div>
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No media files yet
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                Upload some images to get started with your media library
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Image Editor Modal */}
                        <AnimatePresence>
                          {showImageEditor && getValues('thumbnailUrl') && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                              onClick={() => setShowImageEditor(false)}
                            >
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                  <h3 className="text-lg font-semibold">Image Editor</h3>
                                  <div className="flex items-center gap-2">
                                    <Button variant="primary" size="sm">Save Changes</Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setShowImageEditor(false)}
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </div>
                                <div className="p-4 h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                  <img 
                                    src={getValues('thumbnailUrl')} 
                                    alt="Editor preview" 
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-4">
                                    <Button variant="outline" size="sm">🔄 Rotate</Button>
                                    <Button variant="outline" size="sm">✂️ Crop</Button>
                                    <Button variant="outline" size="sm">🎨 Filters</Button>
                                    <Button variant="outline" size="sm">📏 Resize</Button>
                                    <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                                      Image editor functionality coming soon
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {activeTab === 'templates' && (
                      <div className="space-y-6">
                        {/* Content Templates */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Content Templates
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Choose from pre-built templates to jumpstart your content creation
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {contentTemplates.map((template) => (
                              <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                                  selectedTemplate === template.id
                                    ? "border-hot-pink bg-hot-pink/5"
                                    : "border-gray-200 dark:border-gray-700 hover:border-hot-pink/50"
                                )}
                                onClick={() => setSelectedTemplate(
                                  selectedTemplate === template.id ? null : template.id
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl flex-shrink-0">{template.icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-charcoal dark:text-white mb-1">
                                      {template.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      {template.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                                        {template.category}
                                      </span>
                                      <div className="flex gap-1">
                                        {template.tags.slice(0, 2).map((tag) => (
                                          <span key={tag} className="px-2 py-1 bg-hot-pink/10 text-hot-pink text-xs rounded-full">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <AnimatePresence>
                                  {selectedTemplate === template.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="space-y-3">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                          <strong>Preview:</strong>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs font-mono">
                                          {template.content.substring(0, 200)}...
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                              setValue('content', template.content);
                                              setValue('category', template.category);
                                              setValue('tags', template.tags);
                                              setActiveTab('content');
                                            }}
                                          >
                                            Use Template
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const currentContent = getValues('content');
                                              setValue('content', currentContent + '\n\n' + template.content);
                                            }}
                                          >
                                            Append to Content
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Multi-Language Support */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Multi-Language Support
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                                Primary Language
                              </label>
                              <select
                                value={currentLanguage}
                                onChange={(e) => setCurrentLanguage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                              >
                                {languages.map((lang) => (
                                  <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {languages.slice(0, 6).map((lang) => (
                                <div
                                  key={lang.code}
                                  className={cn(
                                    "p-3 border rounded-lg cursor-pointer transition-all",
                                    currentLanguage === lang.code
                                      ? "border-hot-pink bg-hot-pink/5"
                                      : "border-gray-200 dark:border-gray-700 hover:border-hot-pink/50"
                                  )}
                                  onClick={() => setCurrentLanguage(lang.code)}
                                >
                                  <div className="text-center">
                                    <div className="text-xl mb-1">{lang.flag}</div>
                                    <div className="text-sm font-medium">{lang.name}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="p-4 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
                              <div className="flex items-start gap-2">
                                <span className="text-electric-blue">💡</span>
                                <div>
                                  <h4 className="font-medium text-electric-blue mb-1">Translation Features</h4>
                                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• Auto-translate content using AI (coming soon)</li>
                                    <li>• Maintain separate SEO metadata per language</li>
                                    <li>• Language-specific URL structures</li>
                                    <li>• RTL language support for Arabic</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Version Control & Revision History */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Revision History
                          </h3>
                          
                          {revisionHistory.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {revisionHistory.map((revision, index) => (
                                <div key={revision.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                  <div className="w-8 h-8 bg-hot-pink/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-hot-pink text-sm font-medium">{index + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-charcoal dark:text-white truncate">
                                        {revision.title || 'Untitled'}
                                      </h4>
                                      <span className="text-xs text-gray-500">
                                        {new Date(revision.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {revision.changes}
                                    </p>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setValue('title', revision.title);
                                          setValue('content', revision.content);
                                        }}
                                      >
                                        Restore
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                      >
                                        Compare
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="text-3xl mb-2">📝</div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                No revision history yet
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Start writing to automatically save revision history
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-4 p-3 bg-warning-amber/10 border border-warning-amber/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-warning-amber">⚡</span>
                              <div className="text-sm">
                                <strong className="text-warning-amber">Auto-save enabled:</strong>
                                <span className="text-gray-600 dark:text-gray-400 ml-1">
                                  Your changes are automatically saved every 30 seconds
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'collaboration' && (
                      <div className="space-y-6">
                        {/* Live Collaboration */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-title-sm font-semibold text-charcoal dark:text-white">
                              Live Collaboration
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                liveEditing ? "bg-success-green animate-pulse" : "bg-gray-400"
                              )}></div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {liveEditing ? "Live editing enabled" : "Offline mode"}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setLiveEditing(!liveEditing)}
                              >
                                {liveEditing ? "Disable" : "Enable"} Live Mode
                              </Button>
                            </div>
                          </div>
                          
                          {/* Active Collaborators */}
                          <div>
                            <h4 className="font-medium text-charcoal dark:text-white mb-3">
                              Active Collaborators ({collaborators.filter(c => c.status === 'online').length})
                            </h4>
                            {collaborators.length > 0 ? (
                              <div className="space-y-2">
                                {collaborators.map((collaborator) => (
                                  <div key={collaborator.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="relative">
                                      <img 
                                        src={collaborator.avatar} 
                                        alt={collaborator.name}
                                        className="w-8 h-8 rounded-full"
                                      />
                                      <div className={cn(
                                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                                        collaborator.status === 'online' ? "bg-success-green" : "bg-gray-400"
                                      )}></div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-charcoal dark:text-white">
                                        {collaborator.name}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {collaborator.status === 'online' ? 'Currently editing' : 'Last seen 5m ago'}
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">💬</Button>
                                      <Button variant="ghost" size="sm">👁️</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="text-3xl mb-2">👥</div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                  No active collaborators
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  Invite team members to collaborate on this post
                                </p>
                                <Button variant="primary" size="sm">
                                  📧 Invite Collaborators
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Comments & Suggestions */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Comments & Suggestions
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="p-4 bg-warning-amber/10 border border-warning-amber/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <img 
                                  src="/avatars/editor.jpg" 
                                  alt="Editor"
                                  className="w-8 h-8 rounded-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMyIgcj0iNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNCAyNnYtMmE4IDggMCAwIDEgMTYgMHYyIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-charcoal dark:text-white">Content Editor</span>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Consider adding more specific examples in the second paragraph to improve readability.
                                  </p>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Reply</Button>
                                    <Button variant="ghost" size="sm">Resolve</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
                              <div className="flex items-start gap-3">
                                <img 
                                  src="/avatars/seo-specialist.jpg" 
                                  alt="SEO Specialist"
                                  className="w-8 h-8 rounded-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNERkYyRkYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMyIgcj0iNSIgZmlsbD0iIzBFQTVFOSIvPgo8cGF0aCBkPSJNNCAyNnYtMmE4IDggMCAwIDEgMTYgMHYyIiBmaWxsPSIjMEVBNUU5Ii8+Cjwvc3ZnPgo=';
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-charcoal dark:text-white">SEO Specialist</span>
                                    <span className="text-xs text-gray-500">1 hour ago</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Great job! Consider adding 2-3 internal links to related posts to boost SEO performance.
                                  </p>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Reply</Button>
                                    <Button variant="ghost" size="sm">Resolve</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <textarea
                              placeholder="Add a comment or suggestion..."
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                              rows={3}
                            />
                            <div className="flex justify-end mt-2">
                              <Button variant="primary" size="sm">
                                Add Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'analytics' && (
                      <div className="space-y-6">
                        {/* Content Performance Metrics */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Content Performance
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-2xl font-bold text-charcoal dark:text-white mb-1">
                                {contentStructureScore}%
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Content Structure
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="h-2 rounded-full bg-gradient-to-r from-hot-pink to-deep-pink transition-all duration-500"
                                  style={{ width: `${contentStructureScore}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-2xl font-bold text-charcoal dark:text-white mb-1">
                                {seoAnalysis?.readabilityScore || 0}%
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Readability Score
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                  className="h-2 rounded-full bg-gradient-to-r from-electric-blue to-hot-pink transition-all duration-500"
                                  style={{ width: `${seoAnalysis?.readabilityScore || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Keyword Density Analysis */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Keyword Density Analysis
                          </h3>
                          
                          {Object.keys(keywordDensity).length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {Object.entries(keywordDensity)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 10)
                                .map(([word, density]) => (
                                <div key={word} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <span className="text-sm font-medium text-charcoal dark:text-white">{word}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className={cn(
                                          "h-2 rounded-full transition-all duration-300",
                                          density > 3 ? "bg-error-red" : density > 1.5 ? "bg-warning-amber" : "bg-success-green"
                                        )}
                                        style={{ width: `${Math.min(density * 20, 100)}%` }}
                                      />
                                    </div>
                                    <span className={cn(
                                      "text-xs font-medium",
                                      density > 3 ? "text-error-red" : density > 1.5 ? "text-warning-amber" : "text-success-green"
                                    )}>
                                      {density}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              Start writing content to see keyword density analysis
                            </div>
                          )}
                        </div>

                        {/* Content Statistics */}
                        <div>
                          <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                            Detailed Statistics
                          </h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                              <div className="text-lg font-bold text-charcoal dark:text-white">{stats.paragraphCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Paragraphs</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                              <div className="text-lg font-bold text-charcoal dark:text-white">{stats.headingCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Headings</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                              <div className="text-lg font-bold text-charcoal dark:text-white">{stats.imageCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Images</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                              <div className="text-lg font-bold text-charcoal dark:text-white">{stats.linkCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Links</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                              <div className="text-lg font-bold text-charcoal dark:text-white">
                                {Math.round((stats.wordCount / wordCountTarget) * 100)}%
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Goal Progress</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                              <div className="text-lg font-bold text-charcoal dark:text-white">
                                {stats.wordCount > 0 ? Math.round(stats.wordCount / stats.paragraphCount) : 0}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Words/Para</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                              Category *
                            </label>
                            <select
                              {...register('category')}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Select Category</option>
                              {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                            {errors.category && (
                              <p className="mt-1 text-sm text-error-red">{errors.category.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                              Status
                            </label>
                            <select
                              {...register('status')}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="scheduled">Scheduled</option>
                            </select>
                          </div>
                        </div>

                        {watch('status') === 'scheduled' && (
                          <div>
                            <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                              Scheduled Date & Time
                            </label>
                            <Input
                              {...register('scheduledAt')}
                              type="datetime-local"
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                            Tags *
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {getValues('tags').map((tag) => (
                              <span 
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-hot-pink/10 text-hot-pink text-sm rounded-full"
                              >
                                #{tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="hover:bg-hot-pink/20 rounded-full p-0.5 ml-1 transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a tag..."
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="md"
                              onClick={handleAddTag}
                              disabled={!tagInput.trim() || getValues('tags').length >= 10}
                            >
                              Add
                            </Button>
                          </div>
                          {errors.tags && (
                            <p className="mt-1 text-sm text-error-red">{errors.tags.message}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Press Enter to add tags quickly. Use 3-8 relevant tags for best SEO.
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <input
                            {...register('featured')}
                            type="checkbox"
                            id="featured"
                            className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                          />
                          <label htmlFor="featured" className="text-body-md text-charcoal dark:text-white">
                            Mark as featured post
                          </label>
                          <span className="text-xs text-gray-500 ml-2">
                            Featured posts appear prominently on the homepage
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-title-sm font-semibold">Content Stats</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Words:</span>
                      <span className={cn(
                        'text-body-md font-semibold',
                        stats.wordCount >= 300 ? 'text-success-green' : 'text-warning-amber'
                      )}>
                        {stats.wordCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Paragraphs:</span>
                      <span className="text-body-md font-semibold">{stats.paragraphCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Headings:</span>
                      <span className="text-body-md font-semibold">{stats.headingCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Images:</span>
                      <span className="text-body-md font-semibold">{stats.imageCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Links:</span>
                      <span className="text-body-md font-semibold">{stats.linkCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Read time:</span>
                      <span className="text-body-md font-semibold">{stats.readTime}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Characters:</span>
                      <span className="text-body-md font-semibold">{stats.characterCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">SEO Score:</span>
                      <span className={cn(
                        'text-body-md font-semibold',
                        seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : 'text-gray-400'
                      )}>
                        {seoAnalysis ? Math.round(seoAnalysis.score) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600 dark:text-gray-400">Tags:</span>
                      <span className={cn(
                        'text-body-md font-semibold',
                        getValues('tags').length >= 3 && getValues('tags').length <= 8 ? 'text-success-green' : 'text-warning-amber'
                      )}>
                        {getValues('tags').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Publishing Options */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <h3 className="text-title-sm font-semibold">Publishing</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => setValue('status', 'draft')}
                      isLoading={isCreating && getValues('status') === 'draft'}
                      disabled={!isValid}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => setValue('status', 'scheduled')}
                      isLoading={isCreating && getValues('status') === 'scheduled'}
                      disabled={!isValid || (getValues('status') === 'scheduled' && !getValues('scheduledAt'))}
                    >
                      Schedule Post
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => setValue('status', 'published')}
                      isLoading={isCreating && getValues('status') === 'published'}
                      disabled={!isValid}
                      className="bg-gradient-to-r from-hot-pink to-deep-pink hover:shadow-lg"
                    >
                      Publish Now
                    </Button>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth
                        asChild
                      >
                        <Link href="/dashboard/editor">
                          ← Back to Editor
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Writing Assistant */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-electric-blue/10 to-hot-pink/10 border-electric-blue/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-title-sm font-semibold text-electric-blue">AI Writing Assistant</h3>
                      <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Word Count Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-electric-blue">Word Goal Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round((stats.wordCount / wordCountTarget) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((stats.wordCount / wordCountTarget) * 100, 100)}%` }}
                          className="h-2 rounded-full bg-gradient-to-r from-electric-blue to-hot-pink transition-all duration-500"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.wordCount} / {wordCountTarget} words
                      </div>
                    </div>
                    
                    {/* Dynamic Writing Tips */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-electric-blue">🎯</span>
                          <span className="text-sm font-medium">Content Quality</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            contentStructureScore >= 75 ? "bg-success-green" : 
                            contentStructureScore >= 50 ? "bg-warning-amber" : "bg-error-red"
                          )}></div>
                          <span className="text-sm font-medium">{contentStructureScore}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-body-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            title && title.length >= 30 && title.length <= 60 ? "text-success-green" : "text-warning-amber"
                          )}>
                            {title && title.length >= 30 && title.length <= 60 ? "✓" : "⚠️"}
                          </span>
                          <span>Write compelling headlines (30-60 chars)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            stats.headingCount >= 2 ? "text-success-green" : "text-warning-amber"
                          )}>
                            {stats.headingCount >= 2 ? "✓" : "⚠️"}
                          </span>
                          <span>Structure content with headings ({stats.headingCount}/2+ headings)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            stats.imageCount >= 1 ? "text-success-green" : "text-warning-amber"
                          )}>
                            {stats.imageCount >= 1 ? "✓" : "⚠️"}
                          </span>
                          <span>Add relevant images ({stats.imageCount}/1+ images)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            getValues('tags').length >= 3 ? "text-success-green" : "text-warning-amber"
                          )}>
                            {getValues('tags').length >= 3 ? "✓" : "⚠️"}
                          </span>
                          <span>Use relevant tags ({getValues('tags').length}/3+ tags)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            stats.linkCount >= 2 ? "text-success-green" : "text-warning-amber"
                          )}>
                            {stats.linkCount >= 2 ? "✓" : "⚠️"}
                          </span>
                          <span>Include internal/external links ({stats.linkCount}/2+ links)</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          fullWidth
                          className="text-electric-blue border-electric-blue hover:bg-electric-blue hover:text-white"
                        >
                          🤖 Get AI Suggestions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* SEO Checklist */}
              {seoAnalysis && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <h3 className="text-title-sm font-semibold">SEO Checklist</h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className={cn(
                        'flex items-center gap-2 text-body-sm',
                        title && title.length >= 30 && title.length <= 60 ? 'text-success-green' : 'text-gray-500'
                      )}>
                        <span>{title && title.length >= 30 && title.length <= 60 ? '✅' : '⭕'}</span>
                        <span>Optimized title length</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 text-body-sm',
                        excerpt && excerpt.length >= 120 ? 'text-success-green' : 'text-gray-500'
                      )}>
                        <span>{excerpt && excerpt.length >= 120 ? '✅' : '⭕'}</span>
                        <span>Good meta description</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 text-body-sm',
                        stats.wordCount >= 300 ? 'text-success-green' : 'text-gray-500'
                      )}>
                        <span>{stats.wordCount >= 300 ? '✅' : '⭕'}</span>
                        <span>Sufficient content length</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 text-body-sm',
                        getValues('tags').length >= 3 ? 'text-success-green' : 'text-gray-500'
                      )}>
                        <span>{getValues('tags').length >= 3 ? '✅' : '⭕'}</span>
                        <span>Enough tags added</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 text-body-sm',
                        getValues('category') ? 'text-success-green' : 'text-gray-500'
                      )}>
                        <span>{getValues('category') ? '✅' : '⭕'}</span>
                        <span>Category selected</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-2 text-body-sm',
                        getValues('thumbnailUrl') ? 'text-success-green' : 'text-gray-500'
                      )}>
                        <span>{getValues('thumbnailUrl') ? '✅' : '⭕'}</span>
                        <span>Featured image added</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(CreatePostPage, [UserType.BLOG_EDITOR]);