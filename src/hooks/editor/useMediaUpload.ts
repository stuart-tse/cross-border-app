'use client';

import { useCallback } from 'react';
import { uploadImageAction } from '@/app/actions/blog';
import { MediaUploadProgress } from '@/lib/editor/types';
import { MediaItem } from '@/types/blog';
import { generateAiAltText, getImageDimensions } from '@/lib/editor/utils';

interface UseMediaUploadProps {
  addUploadProgress: (progress: MediaUploadProgress) => void;
  updateUploadProgress: (id: string, updates: Partial<MediaUploadProgress>) => void;
  removeUploadProgress: (id: string) => void;
  setMediaLibrary: (updater: (prev: MediaItem[]) => MediaItem[]) => void;
  setAiAltTextSuggestions: (updater: (prev: {[key: string]: string}) => {[key: string]: string}) => void;
}

export const useMediaUpload = ({
  addUploadProgress,
  updateUploadProgress,
  removeUploadProgress,
  setMediaLibrary,
  setAiAltTextSuggestions
}: UseMediaUploadProps) => {
  
  const handleMultipleImageUpload = useCallback(async (files: File[]) => {
    const uploadPromises = files.map(async (file, index) => {
      const progressId = `upload-${Date.now()}-${index}`;
      
      addUploadProgress({ file, progress: 0, id: progressId });
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          updateUploadProgress(progressId, { progress });
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
          
          updateUploadProgress(progressId, { url: result.url, progress: 100 });
          
          // Auto-remove from progress after 3 seconds
          setTimeout(() => {
            removeUploadProgress(progressId);
          }, 3000);
          
          return result.url;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        updateUploadProgress(progressId, { 
          error: 'Upload failed', 
          progress: 0 
        });
        return null;
      }
    });
    
    await Promise.all(uploadPromises);
  }, [addUploadProgress, updateUploadProgress, removeUploadProgress, setMediaLibrary, setAiAltTextSuggestions]);

  const handleImageUpload = useCallback(async (file: File) => {
    return await handleMultipleImageUpload([file]);
  }, [handleMultipleImageUpload]);

  return {
    handleMultipleImageUpload,
    handleImageUpload
  };
};