'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UseFormRegister, UseFormGetValues, FieldErrors } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EditorFormData } from '@/lib/editor/types';
import { getSeoScoreColor, getSeoScoreLabel } from '@/lib/editor/utils';
import { SeoAnalysis } from '@/types/blog';

interface SEOTabProps {
  register: UseFormRegister<EditorFormData>;
  getValues: UseFormGetValues<EditorFormData>;
  errors: FieldErrors<EditorFormData>;
  seoAnalysis: SeoAnalysis | null;
  title: string | undefined;
  excerpt: string | undefined;
  socialPreviewPlatform: 'facebook' | 'twitter' | 'linkedin';
  setSocialPreviewPlatform: (platform: 'facebook' | 'twitter' | 'linkedin') => void;
}

export const SEOTab: React.FC<SEOTabProps> = ({
  register,
  getValues,
  errors,
  seoAnalysis,
  title,
  excerpt,
  socialPreviewPlatform,
  setSocialPreviewPlatform
}) => {
  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <CardContent className="text-center p-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={cn(
              'text-display-sm font-bold',
              seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : 'text-gray-400'
            )}>
              {seoAnalysis ? Math.round(seoAnalysis.score) : 0}%
            </div>
            <div>
              <div className="text-title-md font-semibold text-charcoal dark:text-white">
                SEO Score
              </div>
              <div className={cn(
                'text-body-sm',
                seoAnalysis ? getSeoScoreColor(seoAnalysis.score) : 'text-gray-400'
              )}>
                {seoAnalysis ? getSeoScoreLabel(seoAnalysis.score) : 'Analyzing...'}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${seoAnalysis?.score || 0}%` }}
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                !seoAnalysis ? 'bg-gray-300' :
                seoAnalysis.score >= 80 ? 'bg-success-green' :
                seoAnalysis.score >= 60 ? 'bg-warning-amber' : 'bg-error-red'
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Issues */}
      {seoAnalysis && seoAnalysis.issues.length > 0 && (
        <div>
          <h3 className="text-title-sm font-semibold text-error-red mb-3">Issues to Fix</h3>
          <div className="space-y-2">
            {seoAnalysis.issues.map((issue, index) => (
              <div key={index} className={cn(
                'flex items-start gap-2 p-3 rounded-lg border',
                issue.type === 'error' 
                  ? 'bg-error-red/10 border-error-red/20'
                  : 'bg-warning-amber/10 border-warning-amber/20'
              )}>
                <span className={cn(
                  'mt-0.5',
                  issue.type === 'error' ? 'text-error-red' : 'text-warning-amber'
                )}>
                  {issue.type === 'error' ? '⚠️' : '⚡'}
                </span>
                <span className={cn(
                  'text-body-sm',
                  issue.type === 'error' ? 'text-error-red' : 'text-warning-amber'
                )}>
                  {issue.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Suggestions */}
      {seoAnalysis && seoAnalysis.suggestions.length > 0 && (
        <div>
          <h3 className="text-title-sm font-semibold text-electric-blue mb-3">Suggestions</h3>
          <div className="space-y-2">
            {seoAnalysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-electric-blue/10 border border-electric-blue/20 rounded-lg">
                <span className="text-electric-blue mt-0.5">💡</span>
                <div className="flex-1">
                  <span className="text-body-sm text-electric-blue">{suggestion.message}</span>
                  <span className={cn(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    suggestion.priority === 'high' ? 'bg-error-red/20 text-error-red' :
                    suggestion.priority === 'medium' ? 'bg-warning-amber/20 text-warning-amber' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {suggestion.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
            SEO Title
          </label>
          <Input
            {...register('metaTitle')}
            placeholder="Custom SEO title (leave empty to use post title)"
            error={errors.metaTitle?.message}
          />
          <div className={cn(
            'text-xs mt-1',
            (getValues('metaTitle')?.length || title?.length || 0) > 60 ? 'text-error-red' : 'text-gray-500'
          )}>
            {(getValues('metaTitle')?.length || title?.length || 0)}/60 characters
          </div>
        </div>

        <div>
          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
            Meta Description
          </label>
          <Textarea
            {...register('metaDescription')}
            placeholder="Brief description for search engines (120-160 characters)"
            rows={3}
            error={errors.metaDescription?.message}
          />
          <div className={cn(
            'text-xs mt-1',
            (getValues('metaDescription')?.length || 0) > 160 ? 'text-error-red' : 'text-gray-500'
          )}>
            {getValues('metaDescription')?.length || 0}/160 characters
          </div>
        </div>

        <div>
          <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
            URL Slug
          </label>
          <Input
            {...register('slug')}
            placeholder="url-slug-for-your-post"
          />
          <div className="text-xs text-gray-500 mt-1">
            Preview: /blog/{getValues('slug') || 'your-post-slug'}
          </div>
        </div>
        
        {/* Social Media Preview */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">Social Media Preview</h4>
          
          {/* Platform Selector */}
          <div className="flex gap-2 mb-4">
            {[{id: 'facebook', name: 'Facebook', icon: '📘'}, {id: 'twitter', name: 'Twitter', icon: '🐦'}, {id: 'linkedin', name: 'LinkedIn', icon: '💼'}].map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSocialPreviewPlatform(platform.id as any)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  socialPreviewPlatform === platform.id
                    ? "bg-hot-pink text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {platform.icon} {platform.name}
              </button>
            ))}
          </div>
          
          {/* Social Preview Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              {socialPreviewPlatform} Preview
            </div>
            <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
              {getValues('thumbnailUrl') && (
                <img 
                  src={getValues('thumbnailUrl')} 
                  alt="" 
                  className={cn(
                    "w-full object-cover",
                    socialPreviewPlatform === 'twitter' ? "h-32" : "h-40"
                  )}
                />
              )}
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">your-domain.com</div>
                <h3 className="font-semibold text-sm text-charcoal dark:text-white mb-1 line-clamp-2">
                  {getValues(`${socialPreviewPlatform === 'twitter' ? 'twitter' : 'openGraph'}Title`) || title || 'Your Post Title'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {getValues(`${socialPreviewPlatform === 'twitter' ? 'twitter' : 'openGraph'}Description`) || excerpt || 'Your post description will appear here...'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Social Media Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook/LinkedIn'} Title
              </label>
              <Input
                {...register(socialPreviewPlatform === 'twitter' ? 'twitterTitle' : 'openGraphTitle')}
                placeholder="Custom title for social sharing"
                error={errors[socialPreviewPlatform === 'twitter' ? 'twitterTitle' : 'openGraphTitle']?.message}
              />
              <div className="text-xs text-gray-500 mt-1">
                Leave empty to use post title. {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook/LinkedIn'} optimal: 60 characters
              </div>
            </div>
            
            <div>
              <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook/LinkedIn'} Description
              </label>
              <Textarea
                {...register(socialPreviewPlatform === 'twitter' ? 'twitterDescription' : 'openGraphDescription')}
                placeholder="Description for social media previews"
                rows={2}
                error={errors[socialPreviewPlatform === 'twitter' ? 'twitterDescription' : 'openGraphDescription']?.message}
              />
              <div className="text-xs text-gray-500 mt-1">
                {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Facebook'} optimal: 125-160 characters
              </div>
            </div>
            
            <div>
              <label className="block text-body-md font-medium text-charcoal dark:text-white mb-2">
                {socialPreviewPlatform === 'twitter' ? 'Twitter' : 'Open Graph'} Image
              </label>
              <Input
                {...register(socialPreviewPlatform === 'twitter' ? 'twitterImage' : 'openGraphImage')}
                placeholder="Custom image URL for social sharing"
                error={errors[socialPreviewPlatform === 'twitter' ? 'twitterImage' : 'openGraphImage']?.message}
              />
              <div className="text-xs text-gray-500 mt-1">
                Leave empty to use featured image. Recommended size: {socialPreviewPlatform === 'twitter' ? '1200x675px' : '1200x630px'}
              </div>
            </div>
          </div>
        </div>
        
        {/* SERP Preview */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-title-sm font-semibold text-charcoal dark:text-white mb-4">Search Engine Preview</h4>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Google Search Result</div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded border">
              <div className="text-xs text-green-600 mb-1">https://your-domain.com/blog/{getValues('slug') || 'your-post-slug'}</div>
              <h3 className="text-lg text-blue-600 hover:underline cursor-pointer mb-1 line-clamp-1">
                {getValues('metaTitle') || title || 'Your Post Title Here'}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {getValues('metaDescription') || excerpt || 'Your meta description will appear here. Make it compelling to encourage clicks from search results.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};