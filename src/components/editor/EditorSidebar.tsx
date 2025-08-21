'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UseFormGetValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PostStats, EditorFormData } from '@/lib/editor/types';
import { getSeoScoreColor } from '@/lib/editor/utils';
import { SeoAnalysis } from '@/types/blog';

interface EditorSidebarProps {
  stats: PostStats;
  seoAnalysis: SeoAnalysis | null;
  getValues: UseFormGetValues<EditorFormData>;
  isValid: boolean;
  isCreating: boolean;
  onSubmit: (status: 'draft' | 'scheduled' | 'published') => void;
  contentStructureScore: number;
  wordCountTarget: number;
  title?: string;
  excerpt?: string;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  stats,
  seoAnalysis,
  getValues,
  isValid,
  isCreating,
  onSubmit,
  contentStructureScore,
  wordCountTarget,
  title,
  excerpt
}) => {
  return (
    <div className="space-y-6">
      {/* Content Statistics */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-title-sm font-semibold">Content Statistics</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Words:</span>
              <span className={cn(
                'text-body-md font-semibold',
                stats.wordCount >= 300 ? 'text-success-green' : 'text-warning-amber'
              )}>
                {stats.wordCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Paragraphs:</span>
              <span className="text-body-md font-semibold">{stats.paragraphCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Headings:</span>
              <span className="text-body-md font-semibold">{stats.headingCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Images:</span>
              <span className="text-body-md font-semibold">{stats.imageCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Links:</span>
              <span className="text-body-md font-semibold">{stats.linkCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Read time:</span>
              <span className="text-body-md font-semibold">{stats.readTime}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Characters:</span>
              <span className="text-body-md font-semibold">{stats.characterCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">SEO Score:</span>
              <span className={cn(
                'text-body-md font-semibold',
                seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : 'text-gray-400'
              )}>
                {seoAnalysis ? Math.round(seoAnalysis.score) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-gray-600 dark:text-gray-400">Tags:</span>
              <span className={cn(
                'text-body-md font-semibold',
                getValues('tags').length >= 3 && getValues('tags').length <= 8 ? 'text-success-green' : 'text-warning-amber'
              )}>
                {getValues('tags').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Publishing Options */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-title-sm font-semibold">Publishing</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onSubmit('draft')}
              isLoading={isCreating && getValues('status') === 'draft'}
              disabled={!isValid}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onSubmit('scheduled')}
              isLoading={isCreating && getValues('status') === 'scheduled'}
              disabled={!isValid || (getValues('status') === 'scheduled' && !getValues('scheduledAt'))}
            >
              Schedule Post
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => onSubmit('published')}
              isLoading={isCreating && getValues('status') === 'published'}
              disabled={!isValid}
              className="bg-gradient-to-r from-hot-pink to-deep-pink hover:shadow-lg"
            >
              Publish Now
            </Button>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                fullWidth
                asChild
              >
                <Link href="/dashboard/editor">
                  ← Back to Editor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Writing Assistant */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-electric-blue/10 to-hot-pink/10 border-electric-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-title-sm font-semibold text-electric-blue">AI Writing Assistant</h3>
              <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
            </div>
            
            {/* Word Count Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-electric-blue">Word Goal Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((stats.wordCount / wordCountTarget) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stats.wordCount / wordCountTarget) * 100, 100)}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-electric-blue to-hot-pink transition-all duration-500"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.wordCount} / {wordCountTarget} words
              </div>
            </div>
            
            {/* Dynamic Writing Tips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-electric-blue">🎯</span>
                  <span className="text-sm font-medium">Content Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    contentStructureScore >= 75 ? "bg-success-green" : 
                    contentStructureScore >= 50 ? "bg-warning-amber" : "bg-error-red"
                  )}></div>
                  <span className="text-sm font-medium">{contentStructureScore}%</span>
                </div>
              </div>
              
              <div className="space-y-2 text-body-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <span className={cn(
                    title && title.length >= 30 && title.length <= 60 ? "text-success-green" : "text-warning-amber"
                  )}>
                    {title && title.length >= 30 && title.length <= 60 ? "✓" : "⚠️"}
                  </span>
                  <span>Write compelling headlines (30-60 chars)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={cn(
                    stats.headingCount >= 2 ? "text-success-green" : "text-warning-amber"
                  )}>
                    {stats.headingCount >= 2 ? "✓" : "⚠️"}
                  </span>
                  <span>Structure content with headings ({stats.headingCount}/2+ headings)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={cn(
                    stats.imageCount >= 1 ? "text-success-green" : "text-warning-amber"
                  )}>
                    {stats.imageCount >= 1 ? "✓" : "⚠️"}
                  </span>
                  <span>Add relevant images ({stats.imageCount}/1+ images)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={cn(
                    getValues('tags').length >= 3 ? "text-success-green" : "text-warning-amber"
                  )}>
                    {getValues('tags').length >= 3 ? "✓" : "⚠️"}
                  </span>
                  <span>Use relevant tags ({getValues('tags').length}/3+ tags)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={cn(
                    stats.linkCount >= 2 ? "text-success-green" : "text-warning-amber"
                  )}>
                    {stats.linkCount >= 2 ? "✓" : "⚠️"}
                  </span>
                  <span>Include internal/external links ({stats.linkCount}/2+ links)</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  className="text-electric-blue border-electric-blue hover:bg-electric-blue hover:text-white"
                >
                  🤖 Get AI Suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SEO Checklist */}
      {seoAnalysis && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-title-sm font-semibold">SEO Checklist</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className={cn(
                'flex items-center gap-2 text-body-sm',
                title && title.length >= 30 && title.length <= 60 ? 'text-success-green' : 'text-gray-500'
              )}>
                <span>{title && title.length >= 30 && title.length <= 60 ? '✅' : '⭕'}</span>
                <span>Optimized title length</span>
              </div>
              <div className={cn(
                'flex items-center gap-2 text-body-sm',
                excerpt && excerpt.length >= 120 ? 'text-success-green' : 'text-gray-500'
              )}>
                <span>{excerpt && excerpt.length >= 120 ? '✅' : '⭕'}</span>
                <span>Good meta description</span>
              </div>
              <div className={cn(
                'flex items-center gap-2 text-body-sm',
                stats.wordCount >= 300 ? 'text-success-green' : 'text-gray-500'
              )}>
                <span>{stats.wordCount >= 300 ? '✅' : '⭕'}</span>
                <span>Sufficient content length</span>
              </div>
              <div className={cn(
                'flex items-center gap-2 text-body-sm',
                getValues('tags').length >= 3 ? 'text-success-green' : 'text-gray-500'
              )}>
                <span>{getValues('tags').length >= 3 ? '✅' : '⭕'}</span>
                <span>Enough tags added</span>
              </div>
              <div className={cn(
                'flex items-center gap-2 text-body-sm',
                getValues('category') ? 'text-success-green' : 'text-gray-500'
              )}>
                <span>{getValues('category') ? '✅' : '⭕'}</span>
                <span>Category selected</span>
              </div>
              <div className={cn(
                'flex items-center gap-2 text-body-sm',
                getValues('thumbnailUrl') ? 'text-success-green' : 'text-gray-500'
              )}>
                <span>{getValues('thumbnailUrl') ? '✅' : '⭕'}</span>
                <span>Featured image added</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};