'use client';

import { useState, useCallback } from 'react';
import { EditorState, ActiveTab, MediaUploadProgress, RevisionHistory, Collaborator, PerformanceMetrics } from '@/lib/editor/types';

export const useEditorState = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistory[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [liveEditing, setLiveEditing] = useState(false);
  const [wordCountTarget, setWordCountTarget] = useState(500);
  const [keywordDensity, setKeywordDensity] = useState<{[key: string]: number}>({});
  const [contentStructureScore, setContentStructureScore] = useState(0);
  const [socialPreviewPlatform, setSocialPreviewPlatform] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [aiAltTextSuggestions, setAiAltTextSuggestions] = useState<{[key: string]: string}>({});
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    optimizationScore: 0
  });
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  // Upload progress management
  const addUploadProgress = useCallback((progress: MediaUploadProgress) => {
    setUploadProgress(prev => [...prev, progress]);
  }, []);

  const updateUploadProgress = useCallback((id: string, updates: Partial<MediaUploadProgress>) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const removeUploadProgress = useCallback((id: string) => {
    setUploadProgress(prev => prev.filter(item => item.id !== id));
  }, []);

  // Revision history management
  const addRevision = useCallback((revision: Omit<RevisionHistory, 'id'>) => {
    const newRevision: RevisionHistory = {
      ...revision,
      id: `revision-${Date.now()}`
    };
    setRevisionHistory(prev => [newRevision, ...prev].slice(0, 10)); // Keep only last 10 revisions
  }, []);

  return {
    // State
    activeTab,
    uploadProgress,
    revisionHistory,
    collaborators,
    liveEditing,
    wordCountTarget,
    keywordDensity,
    contentStructureScore,
    socialPreviewPlatform,
    isDraftSaving,
    lastSaved,
    editorReady,
    dragActive,
    searchQuery,
    mediaFilter,
    aiAltTextSuggestions,
    currentLanguage,
    performanceMetrics,
    showImageEditor,
    editingImage,

    // Setters
    setActiveTab,
    setCollaborators,
    setLiveEditing,
    setWordCountTarget,
    setKeywordDensity,
    setContentStructureScore,
    setSocialPreviewPlatform,
    setIsDraftSaving,
    setLastSaved,
    setEditorReady,
    setDragActive,
    setSearchQuery,
    setMediaFilter,
    setAiAltTextSuggestions,
    setCurrentLanguage,
    setPerformanceMetrics,
    setShowImageEditor,
    setEditingImage,

    // Upload progress methods
    addUploadProgress,
    updateUploadProgress,
    removeUploadProgress,

    // Revision methods
    addRevision,
  };
};