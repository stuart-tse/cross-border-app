'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ActiveTab, Collaborator } from '@/lib/editor/types';
import { getTabBadgeCount } from '@/lib/editor/utils';
import { SeoAnalysis, MediaItem } from '@/types/blog';

interface EditorTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  seoAnalysis: SeoAnalysis | null;
  mediaLibrary: MediaItem[];
  collaborators: Collaborator[];
}

const tabConfig = [
  { key: 'content', label: 'Content', icon: '✏️' },
  { key: 'seo', label: 'SEO', icon: '🎯' },
  { key: 'media', label: 'Media', icon: '🖼️' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  onTabChange,
  seoAnalysis,
  mediaLibrary,
  collaborators
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex space-x-1 p-2 overflow-x-auto">
        {tabConfig.map((tab) => {
          const badgeCount = getTabBadgeCount(tab.key, {
            seoAnalysis,
            mediaLibrary,
            collaborators
          });

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key as ActiveTab)}
              className={cn(
                'flex items-center flex-auto gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 relative group',
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-lg scale-105 transform'
                  : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md hover:scale-102 transform'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {badgeCount !== null && (
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
                  {badgeCount}{tab.key === 'seo' ? '%' : ''}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};