'use client';

import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, UseFormGetValues, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { EditorFormData } from '@/lib/editor/types';
import { categories } from '@/lib/editor/constants';

interface SettingsTabProps {
  register: UseFormRegister<EditorFormData>;
  watch: UseFormWatch<EditorFormData>;
  setValue: UseFormSetValue<EditorFormData>;
  getValues: UseFormGetValues<EditorFormData>;
  errors: FieldErrors<EditorFormData>;
  tagInput: string;
  setTagInput: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  register,
  watch,
  setValue,
  getValues,
  errors,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  onKeyPress
}) => {
  const watchedStatus = watch('status');
  const watchedFeatured = watch('featured');
  const watchedTags = watch('tags') || [];

  return (
    <div className="space-y-6">
      {/* Publishing Status */}
      <div>
        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-4">
          Publication Status
        </label>
        <div className="space-y-3">
          {[
            { value: 'draft', label: 'Draft', description: 'Save as draft - not visible to readers', icon: '📝' },
            { value: 'published', label: 'Published', description: 'Publish immediately for all readers', icon: '🌐' },
            { value: 'scheduled', label: 'Scheduled', description: 'Schedule for future publication', icon: '⏰' }
          ].map((status) => (
            <label
              key={status.value}
              className={cn(
                'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all',
                watchedStatus === status.value
                  ? 'border-hot-pink bg-hot-pink/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <input
                type="radio"
                {...register('status')}
                value={status.value}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{status.icon}</span>
                  <span className="font-medium text-charcoal dark:text-white">{status.label}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{status.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.status && (
          <p className="mt-1 text-sm text-error-red">{errors.status.message}</p>
        )}
      </div>

      {/* Scheduled Date - only show when scheduled is selected */}
      {watchedStatus === 'scheduled' && (
        <div>
          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
            Schedule Date & Time
          </label>
          <Input
            {...register('scheduledAt')}
            type="datetime-local"
            error={errors.scheduledAt?.message}
          />
          <p className="text-xs text-gray-500 mt-1">
            Post will be automatically published at this time
          </p>
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
          Category
        </label>
        <select
          {...register('category')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-error-red">{errors.category.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
          Tags
        </label>
        
        {/* Tag Input */}
        <div className="flex gap-2 mb-3">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Add a tag and press Enter"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={onAddTag}
            variant="outline"
            size="md"
            disabled={!tagInput.trim() || watchedTags.includes(tagInput.trim())}
          >
            Add Tag
          </Button>
        </div>

        {/* Tags Display */}
        {watchedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {watchedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-hot-pink/10 text-hot-pink border border-hot-pink/20 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="text-hot-pink hover:text-deep-pink"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Use relevant tags to help readers find your content</span>
          <span className={cn(
            watchedTags.length > 10 ? 'text-error-red' : watchedTags.length >= 3 ? 'text-success-green' : 'text-gray-500'
          )}>
            {watchedTags.length}/10 tags
          </span>
        </div>
        
        {errors.tags && (
          <p className="mt-1 text-sm text-error-red">{errors.tags.message}</p>
        )}
      </div>

      {/* Featured Post Toggle */}
      <div>
        <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <input
            type="checkbox"
            {...register('featured')}
            className="mt-1"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⭐</span>
              <span className="font-medium text-charcoal dark:text-white">Featured Post</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mark this post as featured to highlight it on your blog homepage
            </p>
          </div>
        </label>
      </div>

      {/* Featured Image URL (if needed) */}
      <div>
        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
          Featured Image URL
        </label>
        <Input
          {...register('thumbnailUrl')}
          placeholder="https://example.com/image.jpg"
          error={errors.thumbnailUrl?.message}
        />
        <p className="text-xs text-gray-500 mt-1">
          You can also upload images in the Media tab
        </p>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
          Content Language
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-hot-pink focus:border-hot-pink">
          <option value="en">🇺🇸 English</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="fr">🇫🇷 French</option>
          <option value="de">🇩🇪 German</option>
          <option value="it">🇮🇹 Italian</option>
          <option value="pt">🇵🇹 Portuguese</option>
          <option value="zh">🇨🇳 Chinese</option>
          <option value="ja">🇯🇵 Japanese</option>
          <option value="ko">🇰🇷 Korean</option>
          <option value="ar">🇸🇦 Arabic</option>
        </select>
      </div>

      {/* Post Visibility */}
      <div>
        <label className="block text-body-md font-medium text-charcoal dark:text-white mb-4">
          Post Visibility
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="public" defaultChecked />
            <span className="text-sm">🌐 Public - Visible to everyone</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="private" />
            <span className="text-sm">🔒 Private - Only visible to you</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="password" />
            <span className="text-sm">🔐 Password Protected - Requires password</span>
          </label>
        </div>
      </div>
    </div>
  );
};