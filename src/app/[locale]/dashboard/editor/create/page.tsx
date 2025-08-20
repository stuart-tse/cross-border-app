'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  featured: boolean;
  thumbnailUrl?: string;
  scheduledAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

interface SeoAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
}

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media' | 'settings'>('content');
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
    featured: false
  });

  const [tagInput, setTagInput] = useState('');
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis>({
    score: 0,
    issues: [],
    suggestions: []
  });

  const categories = [
    'Travel Guide',
    'Industry Trends',
    'Business Travel',
    'Route Analysis',
    'Digital Nomad',
    'Transportation Tech',
    'Cross-Border Tips',
    'Luxury Travel',
    'Budget Travel',
    'Safety & Security'
  ];

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (postData.title || postData.content) {
      // In production, this would save to the backend
      localStorage.setItem('draft_post', JSON.stringify({
        ...postData,
        lastSaved: new Date().toISOString()
      }));
    }
  }, [postData]);

  // Load draft from localStorage on mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('draft_post');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setPostData(draft);
        setWordCount(countWords(draft.content));
        setReadTime(calculateReadTime(draft.content));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Update word count and read time
  React.useEffect(() => {
    const words = countWords(postData.content);
    setWordCount(words);
    setReadTime(calculateReadTime(postData.content));
    performSeoAnalysis();
  }, [postData.content, postData.title, postData.excerpt, postData.metaTitle, postData.metaDescription]);

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const calculateReadTime = (text: string) => {
    const words = countWords(text);
    return Math.ceil(words / 200); // Average reading speed: 200 words per minute
  };

  const performSeoAnalysis = () => {
    let score = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Title analysis
    if (postData.title) {
      if (postData.title.length >= 30 && postData.title.length <= 60) {
        score += 20;
      } else if (postData.title.length < 30) {
        issues.push('Title is too short (< 30 characters)');
        suggestions.push('Make your title more descriptive and engaging');
      } else {
        issues.push('Title is too long (> 60 characters)');
        suggestions.push('Shorten your title for better SEO');
      }
    } else {
      issues.push('Title is missing');
    }

    // Meta description analysis
    if (postData.metaDescription) {
      if (postData.metaDescription.length >= 120 && postData.metaDescription.length <= 160) {
        score += 20;
      } else if (postData.metaDescription.length < 120) {
        issues.push('Meta description is too short');
        suggestions.push('Expand your meta description to 120-160 characters');
      } else {
        issues.push('Meta description is too long');
        suggestions.push('Shorten your meta description to under 160 characters');
      }
    } else {
      issues.push('Meta description is missing');
      suggestions.push('Add a compelling meta description');
    }

    // Content analysis
    if (postData.content) {
      if (wordCount >= 300) {
        score += 15;
      } else {
        issues.push('Content is too short (< 300 words)');
        suggestions.push('Add more valuable content to improve SEO');
      }

      if (wordCount >= 1000) {
        score += 10;
      }
    } else {
      issues.push('Content is empty');
    }

    // Excerpt analysis
    if (postData.excerpt) {
      score += 10;
    } else {
      issues.push('Excerpt is missing');
      suggestions.push('Add an excerpt to summarize your post');
    }

    // Category analysis
    if (postData.category) {
      score += 10;
    } else {
      issues.push('Category is not selected');
    }

    // Tags analysis
    if (postData.tags.length >= 3 && postData.tags.length <= 8) {
      score += 15;
    } else if (postData.tags.length < 3) {
      issues.push('Add at least 3 tags');
      suggestions.push('Use relevant tags to improve discoverability');
    } else {
      issues.push('Too many tags (> 8)');
      suggestions.push('Reduce to 3-8 most relevant tags');
    }

    setSeoAnalysis({ score, issues, suggestions });
  };

  const handleInputChange = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...postData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', postData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = editorRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = postData.content;
      const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);
      handleInputChange('content', newContent);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const formatText = (format: string) => {
    const formatMap: { [key: string]: string } = {
      'bold': '**Bold Text**',
      'italic': '*Italic Text*',
      'heading1': '\n# Heading 1\n',
      'heading2': '\n## Heading 2\n',
      'heading3': '\n### Heading 3\n',
      'link': '[Link Text](https://example.com)',
      'image': '![Alt Text](https://example.com/image.jpg)',
      'quote': '\n> Quote\n',
      'code': '`code`',
      'list': '\n- List Item\n- List Item\n',
      'numberedList': '\n1. Numbered Item\n2. Numbered Item\n'
    };
    
    const text = formatMap[format];
    if (text) {
      insertTextAtCursor(text);
    }
  };

  const handleSave = async (status: PostData['status']) => {
    setIsSaving(true);
    try {
      const postToSave = {
        ...postData,
        status,
        slug: postData.slug || generateSlug(postData.title),
        metaTitle: postData.metaTitle || postData.title,
        metaDescription: postData.metaDescription || postData.excerpt
      };

      // In production, this would save to the backend
      console.log('Saving post:', postToSave);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear draft from localStorage
      localStorage.removeItem('draft_post');
      
      // Redirect to posts list
      router.push('/dashboard/editor/posts');
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-headline-lg font-bold text-charcoal dark:text-white">
            Create New Post
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300 mt-1">
            Write and publish engaging content for your audience
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-body-sm text-gray-500 dark:text-gray-400">
            {wordCount} words • {readTime}m read
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={() => handleSave('draft')}
            isLoading={isSaving}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => handleSave('published')}
            isLoading={isSaving}
          >
            Publish
          </Button>
        </div>
      </motion.header>

      {/* Auto-save indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-body-sm text-gray-500"
      >
        <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
        Auto-saving enabled
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Input
              placeholder="Enter your post title..."
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-headline-md font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-hot-pink rounded-none px-0 bg-transparent"
            />
          </motion.div>

          {/* Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1 p-1">
                  {[
                    { key: 'content', label: 'Content', icon: '✏️' },
                    { key: 'seo', label: 'SEO', icon: '🎯' },
                    { key: 'media', label: 'Media', icon: '🖼️' },
                    { key: 'settings', label: 'Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200',
                        activeTab === tab.key
                          ? 'bg-hot-pink text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <CardContent className="p-6">
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Excerpt */}
                    <div>
                      <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                        Excerpt
                      </label>
                      <textarea
                        placeholder="Brief description of your post..."
                        value={postData.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => formatText('bold')} title="Bold">
                            <strong>B</strong>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('italic')} title="Italic">
                            <em>I</em>
                          </Button>
                        </div>
                        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => formatText('heading1')} title="Heading 1">
                            H1
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('heading2')} title="Heading 2">
                            H2
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('heading3')} title="Heading 3">
                            H3
                          </Button>
                        </div>
                        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => formatText('link')} title="Link">
                            🔗
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('image')} title="Image">
                            🖼️
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('quote')} title="Quote">
                            💬
                          </Button>
                        </div>
                        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => formatText('list')} title="Bullet List">
                            • List
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('numberedList')} title="Numbered List">
                            1. List
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => formatText('code')} title="Code">
                            {`</>`}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                        Content (Markdown supported)
                      </label>
                      <textarea
                        ref={editorRef}
                        placeholder="Start writing your amazing post..."
                        value={postData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white font-mono text-sm"
                        rows={20}
                        style={{ minHeight: '400px' }}
                      />
                      <div className="flex justify-between mt-2 text-body-sm text-gray-500">
                        <span>Markdown formatting supported</span>
                        <span>{wordCount} words • {readTime} min read</span>
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
                          <div className={cn('text-display-sm font-bold', getSeoScoreColor(seoAnalysis.score))}>
                            {seoAnalysis.score}%
                          </div>
                          <div>
                            <div className="text-title-md font-semibold text-charcoal dark:text-white">
                              SEO Score
                            </div>
                            <div className={cn('text-body-sm', getSeoScoreColor(seoAnalysis.score))}>
                              {getSeoScoreLabel(seoAnalysis.score)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${seoAnalysis.score}%` }}
                            className={cn(
                              'h-2 rounded-full transition-all duration-500',
                              seoAnalysis.score >= 80 ? 'bg-success-green' :
                              seoAnalysis.score >= 60 ? 'bg-warning-amber' : 'bg-error-red'
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* SEO Issues */}
                    {seoAnalysis.issues.length > 0 && (
                      <div>
                        <h3 className="text-title-sm font-semibold text-error-red mb-3">Issues to Fix</h3>
                        <div className="space-y-2">
                          {seoAnalysis.issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-error-red/10 border border-error-red/20 rounded-lg">
                              <span className="text-error-red mt-0.5">⚠️</span>
                              <span className="text-body-sm text-error-red">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEO Suggestions */}
                    {seoAnalysis.suggestions.length > 0 && (
                      <div>
                        <h3 className="text-title-sm font-semibold text-electric-blue mb-3">Suggestions</h3>
                        <div className="space-y-2">
                          {seoAnalysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
                              <span className="text-electric-blue mt-0.5">💡</span>
                              <span className="text-body-sm text-electric-blue">{suggestion}</span>
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
                          placeholder="Custom SEO title (leave empty to use post title)"
                          value={postData.metaTitle || ''}
                          onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                          className="mb-1"
                        />
                        <div className={cn(
                          'text-xs',
                          (postData.metaTitle?.length || postData.title.length) > 60 ? 'text-error-red' : 'text-gray-500'
                        )}>
                          {postData.metaTitle?.length || postData.title.length}/60 characters
                        </div>
                      </div>

                      <div>
                        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                          Meta Description
                        </label>
                        <textarea
                          placeholder="Brief description for search engines"
                          value={postData.metaDescription || ''}
                          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white"
                          rows={3}
                        />
                        <div className={cn(
                          'text-xs mt-1',
                          (postData.metaDescription?.length || 0) > 160 ? 'text-error-red' : 'text-gray-500'
                        )}>
                          {postData.metaDescription?.length || 0}/160 characters
                        </div>
                      </div>

                      <div>
                        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                          URL Slug
                        </label>
                        <Input
                          placeholder="url-slug-for-your-post"
                          value={postData.slug || ''}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Preview: /blog/{postData.slug || generateSlug(postData.title) || 'your-post-slug'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                        Featured Image
                      </h3>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                        <div className="text-4xl mb-4">🖼️</div>
                        <div className="text-body-md text-gray-600 dark:text-gray-400 mb-4">
                          Upload a featured image for your post
                        </div>
                        <Button variant="outline" size="md">
                          Choose Image
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">
                        Media Library
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <div key={item} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <span className="text-2xl">🖼️</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                          Category
                        </label>
                        <select
                          value={postData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                          Status
                        </label>
                        <select
                          value={postData.status}
                          onChange={(e) => handleInputChange('status', e.target.value as PostData['status'])}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>

                    {postData.status === 'scheduled' && (
                      <div>
                        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                          Scheduled Date & Time
                        </label>
                        <Input
                          type="datetime-local"
                          value={postData.scheduledAt || ''}
                          onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {postData.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-hot-pink/10 text-hot-pink text-sm rounded-full"
                          >
                            #{tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-hot-pink/20 rounded-full p-0.5 ml-1"
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
                          variant="outline"
                          size="md"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Press Enter to add tags quickly. Use 3-8 relevant tags.
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={postData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                        className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                      />
                      <label htmlFor="featured" className="text-body-md text-charcoal dark:text-white">
                        Mark as featured post
                      </label>
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
                <h3 className="text-title-sm font-semibold">Quick Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-600 dark:text-gray-400">Words:</span>
                  <span className="text-body-md font-semibold">{wordCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-600 dark:text-gray-400">Read time:</span>
                  <span className="text-body-md font-semibold">{readTime}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-600 dark:text-gray-400">SEO Score:</span>
                  <span className={cn('text-body-md font-semibold', getSeoScoreColor(seoAnalysis.score))}>
                    {seoAnalysis.score}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-600 dark:text-gray-400">Tags:</span>
                  <span className="text-body-md font-semibold">{postData.tags.length}</span>
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
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleSave('draft')}
                  isLoading={isSaving}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => handleSave('scheduled')}
                  isLoading={isSaving}
                  disabled={!postData.scheduledAt && postData.status === 'scheduled'}
                >
                  Schedule Post
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleSave('published')}
                  isLoading={isSaving}
                >
                  Publish Now
                </Button>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    asChild
                  >
                    <Link href="/dashboard/editor/posts">
                      ← Back to Posts
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-electric-blue/10 to-hot-pink/10 border-electric-blue/20">
              <CardContent className="p-4">
                <h3 className="text-title-sm font-semibold text-electric-blue mb-3">Writing Tips</h3>
                <div className="space-y-2 text-body-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-electric-blue">💡</span>
                    <span>Use engaging headlines that promise value</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-electric-blue">💡</span>
                    <span>Include relevant keywords naturally</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-electric-blue">💡</span>
                    <span>Break up text with headings and lists</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-electric-blue">💡</span>
                    <span>Add images to make content more engaging</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CreatePostPage, [UserType.BLOG_EDITOR]);