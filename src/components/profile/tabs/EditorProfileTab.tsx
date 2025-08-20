'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UniversalProfileData } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EditorProfileTabProps {
  profile: UniversalProfileData;
  isEditing?: boolean;
  onSave?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onCancel?: () => void;
  onChange?: () => void;
  isLoading?: boolean;
}

export const EditorProfileTab: React.FC<EditorProfileTabProps> = ({
  profile,
  isEditing = false
}) => {
  const editorProfile = profile.editorProfile;
  
  if (!editorProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">✍️</span>
            <div className="text-sm">Editor profile not found</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">Content Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-success-green/5 rounded-lg">
                <div className="text-2xl font-bold text-success-green">
                  {editorProfile.contentStats.publishedPosts}
                </div>
                <div className="text-sm text-gray-600">Published Posts</div>
              </div>
              
              <div className="text-center p-4 bg-warning-amber/5 rounded-lg">
                <div className="text-2xl font-bold text-warning-amber">
                  {editorProfile.contentStats.draftPosts}
                </div>
                <div className="text-sm text-gray-600">Draft Posts</div>
              </div>
              
              <div className="text-center p-4 bg-hot-pink/5 rounded-lg">
                <div className="text-2xl font-bold text-hot-pink">
                  {editorProfile.contentStats.totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              
              <div className="text-center p-4 bg-electric-blue/5 rounded-lg">
                <div className="text-2xl font-bold text-electric-blue">
                  {Math.round(editorProfile.contentStats.averageSeoScore)}%
                </div>
                <div className="text-sm text-gray-600">Avg SEO Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editorial Identity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-title-lg font-semibold text-charcoal mb-4">Editorial Identity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Editor Level</label>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    editorProfile.editorLevel === 'CHIEF' && 'bg-purple-100 text-purple-700',
                    editorProfile.editorLevel === 'LEAD' && 'bg-blue-100 text-blue-700',
                    editorProfile.editorLevel === 'SENIOR' && 'bg-green-100 text-green-700',
                    editorProfile.editorLevel === 'JUNIOR' && 'bg-gray-100 text-gray-700'
                  )}>
                    {editorProfile.editorLevel.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {editorProfile.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-hot-pink/10 text-hot-pink rounded-full text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {editorProfile.contentCategories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-electric-blue/10 text-electric-blue rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {editorProfile.editorialTeam && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Editorial Team</label>
                    <div className="text-body-md text-charcoal">{editorProfile.editorialTeam}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Publishing Rights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-title-lg font-semibold text-charcoal mb-4">Publishing Rights</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Direct Publishing</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    editorProfile.publishingRights.canPublishDirectly 
                      ? 'bg-success-green/10 text-success-green' 
                      : 'bg-error-red/10 text-error-red'
                  )}>
                    {editorProfile.publishingRights.canPublishDirectly ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Edit Others' Content</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    editorProfile.publishingRights.canEditOthersContent 
                      ? 'bg-success-green/10 text-success-green' 
                      : 'bg-error-red/10 text-error-red'
                  )}>
                    {editorProfile.publishingRights.canEditOthersContent ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Schedule Posts</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    editorProfile.publishingRights.canSchedulePosts 
                      ? 'bg-success-green/10 text-success-green' 
                      : 'bg-error-red/10 text-error-red'
                  )}>
                    {editorProfile.publishingRights.canSchedulePosts ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Manage Media</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    editorProfile.publishingRights.canManageMedia 
                      ? 'bg-success-green/10 text-success-green' 
                      : 'bg-error-red/10 text-error-red'
                  )}>
                    {editorProfile.publishingRights.canManageMedia ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Daily Post Limit</span>
                    <span className="text-sm font-medium text-charcoal">
                      {editorProfile.publishingRights.maxPostsPerDay}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SEO Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="text-title-lg font-semibold text-charcoal mb-4">SEO Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Tone</label>
                <div className="text-body-md text-charcoal">
                  {editorProfile.seoPreferences.contentTone.replace('_', ' ')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="text-body-md text-charcoal">
                  {editorProfile.seoPreferences.targetAudience}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Post Length</label>
                <div className="text-body-md text-charcoal">
                  {editorProfile.seoPreferences.preferredPostLength}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Optimization</label>
                <div className={cn(
                  'text-body-md',
                  editorProfile.seoPreferences.autoOptimization ? 'text-success-green' : 'text-error-red'
                )}>
                  {editorProfile.seoPreferences.autoOptimization ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Keywords</label>
              <div className="flex flex-wrap gap-2">
                {editorProfile.seoPreferences.defaultKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-warning-amber/10 text-warning-amber rounded-full text-xs"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Regions</label>
              <div className="flex flex-wrap gap-2">
                {editorProfile.seoPreferences.focusRegions.map((region) => (
                  <span
                    key={region}
                    className="px-2 py-1 bg-success-green/10 text-success-green rounded-full text-xs"
                  >
                    📍 {region}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="text-title-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                className="w-full bg-gradient-to-r from-hot-pink to-deep-pink"
                onClick={() => window.location.href = '/dashboard/editor'}
              >
                📝 Create New Post
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/dashboard/editor?tab=media'}
              >
                🖼️ Manage Media
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/dashboard/editor?tab=analytics'}
              >
                📊 View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};