'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormRegister, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EditorFormData, MediaUploadProgress } from '@/lib/editor/types';
import { MediaItem } from '@/types/blog';

interface MediaTabProps {
  register: UseFormRegister<EditorFormData>;
  setValue: UseFormSetValue<EditorFormData>;
  getValues: UseFormGetValues<EditorFormData>;
  uploadProgress: MediaUploadProgress[];
  mediaLibrary: MediaItem[];
  dragActive: boolean;
  searchQuery: string;
  mediaFilter: 'all' | 'images' | 'videos' | 'documents';
  aiAltTextSuggestions: {[key: string]: string};
  showImageEditor: boolean;
  editingImage: string | null;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (files: File[]) => void;
  setSearchQuery: (query: string) => void;
  setMediaFilter: (filter: 'all' | 'images' | 'videos' | 'documents') => void;
  setShowImageEditor: (show: boolean) => void;
  setEditingImage: (image: string | null) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  register,
  setValue,
  getValues,
  uploadProgress,
  mediaLibrary,
  dragActive,
  searchQuery,
  mediaFilter,
  aiAltTextSuggestions,
  showImageEditor,
  editingImage,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  setSearchQuery,
  setMediaFilter,
  setShowImageEditor,
  setEditingImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
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
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
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
            onChange={handleFileInputChange}
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
                  AI suggests: &ldquo;{aiAltTextSuggestions[getValues('thumbnailUrl') || '']}&rdquo;
                </p>
              )}
            </div>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-hot-pink transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-2">🖼️</div>
            <h4 className="font-medium text-charcoal dark:text-white mb-1">
              Add Featured Image
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload an eye-catching image for your post
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
          
          {/* Search and Filter */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40"
            />
            <select
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="documents">Documents</option>
            </select>
          </div>
        </div>

        {mediaLibrary.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaLibrary
              .filter(item => {
                const matchesSearch = !searchQuery || 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.alt?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFilter = mediaFilter === 'all' || item.type.startsWith(mediaFilter);
                return matchesSearch && matchesFilter;
              })
              .map((item) => (
                <div key={item.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group bg-white dark:bg-gray-800">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <span className="text-2xl">
                        {item.type === 'video' ? '🎥' : '📄'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setValue('thumbnailUrl', item.url);
                        setValue('thumbnailAlt', item.alt || '');
                      }}
                    >
                      Use
                    </Button>
                    {item.type === 'image' && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingImage(item.url);
                          setShowImageEditor(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-charcoal dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(item.size / 1024).toFixed(1)} KB
                      {item.dimensions && ` • ${item.dimensions.width}×${item.dimensions.height}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-4xl mb-4">📁</div>
            <h4 className="font-medium text-charcoal dark:text-white mb-2">
              No media files yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload images, videos, or documents to get started
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Media
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};