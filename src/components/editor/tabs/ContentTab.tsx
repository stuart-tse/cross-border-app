'use client';

import React, { useEffect, useRef } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/Input';
import { EditorFormData, PostStats } from '@/lib/editor/types';

// Quill editor configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['blockquote', 'code-block'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

// Fixed formats array to match toolbar configuration
const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'indent', 'link', 'image', 'video',
  'align', 'color', 'background', 'blockquote', 'code-block'
];

interface ContentTabProps {
  register: UseFormRegister<EditorFormData>;
  setValue: UseFormSetValue<EditorFormData>;
  errors: FieldErrors<EditorFormData>;
  title: string | undefined;
  excerpt: string | undefined;
  content: string | undefined;
  stats: PostStats;
  currentLanguage: string;
  editorReady: boolean;
  setEditorReady: (ready: boolean) => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({
  register,
  setValue,
  errors,
  title,
  excerpt,
  content,
  stats,
  currentLanguage,
  editorReady,
  setEditorReady
}) => {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    // Set editor as ready once component mounts
    setEditorReady(true);
  }, [setEditorReady]);

  const handleContentChange = (value: string) => {
    setValue('content', value);
  };

  return (
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
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content || ''}
            onChange={handleContentChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Start writing your content here..."
            style={{
              height: '400px',
              backgroundColor: 'white'
            }}
            className="bg-white dark:bg-gray-900"
          />
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
  );
};