'use client';

import { useEffect, useCallback, useRef } from 'react';
import { UseFormGetValues } from 'react-hook-form';
import { EditorFormData } from '@/lib/editor/types';
import { saveDraftAction } from '@/app/actions/blog';

interface UseAutoSaveProps {
  title: string | undefined;
  content: string | undefined;
  getValues: UseFormGetValues<EditorFormData>;
  setIsDraftSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  intervalMs?: number;
}

export const useAutoSave = ({
  title,
  content,
  getValues,
  setIsDraftSaving,
  setLastSaved,
  intervalMs = 30000 // 30 seconds
}: UseAutoSaveProps) => {
  // Store setter functions in refs to avoid them being dependencies
  const setIsDraftSavingRef = useRef(setIsDraftSaving);
  const setLastSavedRef = useRef(setLastSaved);
  
  // Update refs when props change
  setIsDraftSavingRef.current = setIsDraftSaving;
  setLastSavedRef.current = setLastSaved;
  
  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (title || content) {
      setIsDraftSavingRef.current(true);
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
        setLastSavedRef.current(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsDraftSavingRef.current(false);
      }
    }
  }, [title, content, getValues]);

  // Auto-save every specified interval
  useEffect(() => {
    // Create a stable function reference that calls the current autoSave
    const intervalCallback = () => {
      autoSave();
    };
    
    const interval = setInterval(intervalCallback, intervalMs);
    return () => clearInterval(interval);
  }, [autoSave, intervalMs]);

  return autoSave;
};