'use client';

import { useCallback } from 'react';

interface UseDragAndDropProps {
  setDragActive: (active: boolean) => void;
  onFilesDropped: (files: File[]) => void;
}

export const useDragAndDrop = ({
  setDragActive,
  onFilesDropped
}: UseDragAndDropProps) => {

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, [setDragActive]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, [setDragActive]);

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
      onFilesDropped(imageFiles);
    }
  }, [setDragActive, onFilesDropped]);

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  };
};