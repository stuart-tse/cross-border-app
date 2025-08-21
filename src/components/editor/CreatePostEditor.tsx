'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';

import { createPostAction, analyzeSeoAction, saveDraftAction } from '@/app/actions/blog';
import { CreatePostFormState, SeoAnalysis, MediaItem } from '@/types/blog';
import { EditorFormData, PostStats, formSchema, draftSchema, publishSchema } from '@/lib/editor/types';
import { generateSlug } from '@/lib/editor/utils';

// Components
import { EditorHeader } from './EditorHeader';
import { EditorTabs } from './EditorTabs';
import { EditorSidebar } from './EditorSidebar';
import { ContentTab, SEOTab, MediaTab, SettingsTab } from './tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// Hooks
import {
  useEditorState,
  useContentAnalysis,
  useAutoSave,
  useMediaUpload,
  useDragAndDrop
} from '@/hooks/editor';

export const CreatePostEditor: React.FC = () => {
  const router = useRouter();
  const [createState, createFormAction, isCreating] = useActionState(createPostAction, { success: false });
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [stats, setStats] = useState<PostStats>({ 
    wordCount: 0, 
    readTime: 0, 
    characterCount: 0, 
    headingCount: 0, 
    imageCount: 0, 
    linkCount: 0, 
    paragraphCount: 0 
  });
  const [tagInput, setTagInput] = useState('');
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);

  // Editor state management
  const editorState = useEditorState();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
    setError,
    reset,
    trigger
  } = useForm<EditorFormData>({
    resolver: zodResolver(draftSchema),
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

  // Custom validation state - only validate after first submission attempt or explicit trigger
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // Check form validity manually when needed
  const checkFormValidity = async (schema = draftSchema) => {
    try {
      const currentValues = getValues();
      schema.parse(currentValues);
      setIsFormValid(true);
      return true;
    } catch (error) {
      setIsFormValid(false);
      return false;
    }
  };

  // Only show errors after submission attempt
  const shouldShowErrors = isSubmitted || hasAttemptedSubmit;
  const displayErrors = shouldShowErrors ? errors : {};

  // Check form validity periodically for button state (but don't show errors)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Always check with draft schema for button availability
      checkFormValidity(draftSchema);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [title, excerpt, content, watchedValues.category, watchedValues.tags]);

  // Content analysis hook
  useContentAnalysis({
    content,
    setStats,
    setContentStructureScore: editorState.setContentStructureScore,
    setKeywordDensity: editorState.setKeywordDensity
  });

  // Auto-save hook
  useAutoSave({
    title,
    content,
    getValues,
    setIsDraftSaving: editorState.setIsDraftSaving,
    setLastSaved: editorState.setLastSaved
  });

  // Media upload hook
  const { handleMultipleImageUpload } = useMediaUpload({
    addUploadProgress: editorState.addUploadProgress,
    updateUploadProgress: editorState.updateUploadProgress,
    removeUploadProgress: editorState.removeUploadProgress,
    setMediaLibrary,
    setAiAltTextSuggestions: editorState.setAiAltTextSuggestions
  });

  // Drag and drop hook
  const dragAndDrop = useDragAndDrop({
    setDragActive: editorState.setDragActive,
    onFilesDropped: handleMultipleImageUpload
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft_post');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        reset(draft);
        editorState.setLastSaved(new Date(draft.lastSaved));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
    // Only run on mount - remove dependencies to prevent infinite loop
  }, []);

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

  // Initialize mock collaborators for demo
  useEffect(() => {
    editorState.setCollaborators([
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
    // Only run on mount - remove editorState dependency to prevent infinite loop
  }, []);

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

  const onSubmit = async (data: EditorFormData) => {
    setHasAttemptedSubmit(true);
    
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
        error.errors.forEach((err: z.ZodIssue) => {
          const fieldName = err.path.join('.') as keyof EditorFormData;
          setError(fieldName, { message: err.message });
        });
      }
    }
  };

  const handlePublishingAction = async (status: 'draft' | 'scheduled' | 'published') => {
    setHasAttemptedSubmit(true);
    setValue('status', status);
    
    // Use appropriate validation schema based on status
    const schema = status === 'draft' ? draftSchema : publishSchema;
    const currentValues = getValues();
    
    try {
      // Validate with the appropriate schema
      const validatedData = schema.parse(currentValues);
      
      // If validation passes, submit the form
      handleSubmit(onSubmit)();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set specific validation errors
        error.errors.forEach((err: z.ZodIssue) => {
          const fieldName = err.path.join('.') as keyof EditorFormData;
          setError(fieldName, { message: err.message });
        });
      }
      console.log('Form has validation errors for', status);
    }
  };

  const renderTabContent = () => {
    switch (editorState.activeTab) {
      case 'content':
        return (
          <ContentTab
            register={register}
            setValue={setValue}
            errors={displayErrors}
            title={title}
            excerpt={excerpt}
            content={content}
            stats={stats}
            currentLanguage={editorState.currentLanguage}
            editorReady={editorState.editorReady}
            setEditorReady={editorState.setEditorReady}
          />
        );
      case 'seo':
        return (
          <SEOTab
            register={register}
            getValues={getValues}
            errors={displayErrors}
            seoAnalysis={seoAnalysis}
            title={title}
            excerpt={excerpt}
            socialPreviewPlatform={editorState.socialPreviewPlatform}
            setSocialPreviewPlatform={editorState.setSocialPreviewPlatform}
          />
        );
      case 'media':
        return (
          <MediaTab
            register={register}
            setValue={setValue}
            getValues={getValues}
            uploadProgress={editorState.uploadProgress}
            mediaLibrary={mediaLibrary}
            dragActive={editorState.dragActive}
            searchQuery={editorState.searchQuery}
            mediaFilter={editorState.mediaFilter}
            aiAltTextSuggestions={editorState.aiAltTextSuggestions}
            showImageEditor={editorState.showImageEditor}
            editingImage={editorState.editingImage}
            onDragEnter={dragAndDrop.handleDragEnter}
            onDragLeave={dragAndDrop.handleDragLeave}
            onDragOver={dragAndDrop.handleDragOver}
            onDrop={dragAndDrop.handleDrop}
            onFileSelect={handleMultipleImageUpload}
            setSearchQuery={editorState.setSearchQuery}
            setMediaFilter={editorState.setMediaFilter}
            setShowImageEditor={editorState.setShowImageEditor}
            setEditingImage={editorState.setEditingImage}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            register={register}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
            errors={displayErrors}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onKeyPress={handleKeyPress}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-title-md font-semibold text-charcoal dark:text-white mb-2">
              {editorState.activeTab.charAt(0).toUpperCase() + editorState.activeTab.slice(1)} Tab
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This tab is coming soon. Please use the available tabs for now.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-charcoal dark:via-gray-900 dark:to-black transition-all duration-500">
      {/* Tesla-inspired glass morphism background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-hot-pink/20 to-deep-pink/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-electric-blue/20 to-hot-pink/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 max-w-7xl py-6 md:py-8">
        {/* Header */}
        <EditorHeader
          stats={stats}
          seoAnalysis={seoAnalysis}
          liveEditing={editorState.liveEditing}
          isDraftSaving={editorState.isDraftSaving}
          lastSaved={editorState.lastSaved}
        />

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
                    error={displayErrors.title?.message}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>SEO-friendly titles are 30-60 characters</span>
                    <span className={title?.length > 60 ? 'text-error-red' : title?.length >= 30 ? 'text-success-green' : 'text-gray-500'}>
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
                  <EditorTabs
                    activeTab={editorState.activeTab}
                    onTabChange={editorState.setActiveTab}
                    seoAnalysis={seoAnalysis}
                    mediaLibrary={mediaLibrary}
                    collaborators={editorState.collaborators}
                  />
                  <CardContent className="p-6 bg-white/50 dark:bg-gray-900/50">
                    {renderTabContent()}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <EditorSidebar
                stats={stats}
                seoAnalysis={seoAnalysis}
                getValues={getValues}
                isValid={isFormValid}
                isCreating={isCreating}
                onSubmit={handlePublishingAction}
                contentStructureScore={editorState.contentStructureScore}
                wordCountTarget={editorState.wordCountTarget}
                title={title}
                excerpt={excerpt}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};