'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PostStats } from '@/lib/editor/types';
import { getSeoScoreColor } from '@/lib/editor/utils';
import { SeoAnalysis } from '@/types/blog';

interface EditorHeaderProps {
  stats: PostStats;
  seoAnalysis: SeoAnalysis | null;
  liveEditing: boolean;
  isDraftSaving: boolean;
  lastSaved: Date | null;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  stats,
  seoAnalysis,
  liveEditing,
  isDraftSaving,
  lastSaved
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-hot-pink to-deep-pink rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
            <span className="text-white font-bold text-xl" aria-hidden="true">✏️</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-charcoal via-hot-pink to-electric-blue bg-clip-text text-transparent dark:from-white dark:via-hot-pink dark:to-electric-blue">
              Create New Post
            </h1>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-body-sm text-gray-500">
                <li><Link href="/dashboard" className="hover:text-hot-pink">Dashboard</Link></li>
                <li aria-hidden="true">•</li>
                <li><Link href="/dashboard/editor" className="hover:text-hot-pink">Editor</Link></li>
                <li aria-hidden="true">•</li>
                <li className="text-charcoal dark:text-white">Create</li>
              </ol>
            </nav>
          </div>
        </div>
        <p className="text-body-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Write and publish engaging travel content with our comprehensive editor
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            liveEditing ? "bg-success-green animate-pulse shadow-lg shadow-success-green/50" : "bg-gray-400"
          )}></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {liveEditing ? "Live" : "Offline"}
          </span>
        </div>
        
        {/* Metrics Display */}
        <div className="flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stats.wordCount} words
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stats.readTime}m read
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className={cn(
            "text-sm font-medium",
            seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : "text-gray-400"
          )}>
            SEO: {seoAnalysis ? Math.round(seoAnalysis.score) : 0}%
          </div>
        </div>
        
        {/* Auto-save Status */}
        {lastSaved && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              isDraftSaving ? "bg-warning-amber animate-pulse shadow-lg shadow-warning-amber/50" : "bg-success-green shadow-lg shadow-success-green/50"
            )}></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isDraftSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
            </span>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};