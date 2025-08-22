'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface EditorProfile {
  id: string;
  userId: string;
  bio: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    github?: string;
  };
  specialties: string[];
  experience: string;
  location: string;
  timezone: string;
  isApproved: boolean;
  permissions: string[];
  stats: {
    postsPublished: number;
    totalViews: number;
    avgSeoScore: number;
    featuredPosts: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    icon: string;
  }>;
}

interface UserSettings {
  notifications: {
    emailNotifications: boolean;
    postComments: boolean;
    postShares: boolean;
    weeklyDigest: boolean;
    systemUpdates: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dateFormat: string;
    timezone: string;
    autoSave: boolean;
    editorMode: 'visual' | 'markdown' | 'hybrid';
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    showEmail: boolean;
  };
}

const EditorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'achievements'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [editorProfile, setEditorProfile] = useState<EditorProfile>({
    id: '1',
    userId: user?.id || '1',
    bio: 'Senior content editor with 8+ years of experience in travel and transportation content. Passionate about creating engaging, SEO-optimized articles that help people navigate cross-border travel with confidence.',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/editor',
      twitter: 'https://twitter.com/editor',
      website: 'https://myportfolio.com',
      github: 'https://github.com/editor'
    },
    specialties: ['Travel Writing', 'SEO Optimization', 'Content Strategy', 'Cross-Border Travel', 'Transportation'],
    experience: '8+ years',
    location: 'Hong Kong',
    timezone: 'Asia/Hong_Kong',
    isApproved: true,
    permissions: ['WRITE', 'EDIT', 'PUBLISH', 'DELETE'],
    stats: {
      postsPublished: 24,
      totalViews: 45236,
      avgSeoScore: 84,
      featuredPosts: 8
    },
    achievements: [
      {
        id: '1',
        title: 'Top Performer',
        description: 'Published 10+ high-quality articles this month',
        earnedAt: '2024-01-15',
        icon: '🏆'
      },
      {
        id: '2',
        title: 'SEO Expert',
        description: 'Maintained average SEO score above 80%',
        earnedAt: '2024-01-10',
        icon: '🎯'
      },
      {
        id: '3',
        title: 'Engagement Master',
        description: 'Articles generated over 10K views in a month',
        earnedAt: '2024-01-05',
        icon: '👑'
      },
      {
        id: '4',
        title: 'Consistent Creator',
        description: 'Published articles for 30 consecutive days',
        earnedAt: '2023-12-20',
        icon: '🔥'
      }
    ]
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      emailNotifications: true,
      postComments: true,
      postShares: false,
      weeklyDigest: true,
      systemUpdates: true
    },
    preferences: {
      theme: 'auto',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'Asia/Hong_Kong',
      autoSave: true,
      editorMode: 'hybrid'
    },
    privacy: {
      showProfile: true,
      showStats: true,
      showEmail: false
    }
  });

  const handleProfileUpdate = useCallback((field: string, value: any) => {
    setEditorProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSocialLinkUpdate = useCallback((platform: string, url: string) => {
    setEditorProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url }
    }));
  }, []);

  const handleSpecialtyAdd = useCallback((specialty: string) => {
    if (specialty && !editorProfile.specialties.includes(specialty)) {
      setEditorProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  }, [editorProfile.specialties]);

  const handleSpecialtyRemove = useCallback((specialty: string) => {
    setEditorProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  }, []);

  const handleSettingUpdate = useCallback((category: keyof UserSettings, field: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile updated:', { editorProfile, userSettings });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editorProfile, userSettings]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'WRITE': return 'bg-electric-blue/10 text-electric-blue';
      case 'EDIT': return 'bg-warning-amber/10 text-warning-amber';
      case 'PUBLISH': return 'bg-success-green/10 text-success-green';
      case 'DELETE': return 'bg-error-red/10 text-error-red';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-headline-lg font-bold text-charcoal dark:text-white">
            Editor Profile
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300 mt-1">
            Manage your profile, settings, and preferences
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsEditing(true)}
            >
              <span className="mr-2">✏️</span>
              Edit Profile
            </Button>
          )}
        </div>
      </motion.header>

      {/* Profile Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-hot-pink/10 to-deep-pink/10 border-hot-pink/20">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-hot-pink to-deep-pink rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || 'E'
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-2 border-hot-pink flex items-center justify-center text-hot-pink hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      📷
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-title-xl font-bold text-charcoal dark:text-white mb-2">
                      {user?.name || 'Editor Name'}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-body-md text-gray-600 dark:text-gray-400">
                        {user?.email}
                      </span>
                      {editorProfile.isApproved && (
                        <span className="inline-flex items-center px-2 py-1 bg-success-green/10 text-success-green text-xs rounded-full font-medium">
                          ✓ Verified Editor
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-body-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        📍 {editorProfile.location}
                      </span>
                      <span className="flex items-center gap-1">
                        🕒 {editorProfile.timezone}
                      </span>
                      <span className="flex items-center gap-1">
                        💼 {editorProfile.experience}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <textarea
                    value={editorProfile.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-body-md text-gray-700 dark:text-gray-300 mb-4">
                    {editorProfile.bio}
                  </p>
                )}

                {/* Specialties */}
                <div className="flex flex-wrap gap-2">
                  {editorProfile.specialties.map((specialty) => (
                    <span 
                      key={specialty}
                      className="inline-flex items-center px-3 py-1 bg-electric-blue/10 text-electric-blue text-sm rounded-full"
                    >
                      {specialty}
                      {isEditing && (
                        <button
                          onClick={() => handleSpecialtyRemove(specialty)}
                          className="ml-2 hover:bg-electric-blue/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {isEditing && (
                    <button className="inline-flex items-center px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm rounded-full hover:border-hot-pink hover:text-hot-pink transition-colors">
                      + Add Specialty
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Stats Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {
          [
            { label: 'Posts Published', value: editorProfile.stats.postsPublished, icon: '📝', color: 'text-electric-blue' },
            { label: 'Total Views', value: formatNumber(editorProfile.stats.totalViews), icon: '👁️', color: 'text-hot-pink' },
            { label: 'Avg SEO Score', value: `${editorProfile.stats.avgSeoScore}%`, icon: '🎯', color: 'text-success-green' },
            { label: 'Featured Posts', value: editorProfile.stats.featuredPosts, icon: '⭐', color: 'text-warning-amber' }
          ].map((stat, index) => (
            <Card key={stat.label} className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={cn('text-2xl font-bold mb-1', stat.color)}>{stat.value}</div>
              <div className="text-body-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </Card>
          ))
        }
      </motion.section>

      {/* Navigation Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'profile', label: 'Profile Details', icon: '👤' },
            { key: 'settings', label: 'Preferences', icon: '⚙️' },
            { key: 'security', label: 'Security', icon: '🔒' },
            { key: 'achievements', label: 'Achievements', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex-1 justify-center',
                activeTab === tab.key
                  ? 'bg-hot-pink text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              )}
            >
              <span>{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Contact Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Email Address
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Location
                  </label>
                  <Input
                    value={editorProfile.location}
                    onChange={(e) => handleProfileUpdate('location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Timezone
                  </label>
                  <select
                    value={editorProfile.timezone}
                    onChange={(e) => handleProfileUpdate('timezone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                  >
                    <option value="Asia/Hong_Kong">Asia/Hong Kong</option>
                    <option value="Asia/Shanghai">Asia/Shanghai</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={editorProfile.experience}
                    onChange={(e) => handleProfileUpdate('experience', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
                  >
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-8 years">5-8 years</option>
                    <option value="8+ years">8+ years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Social Links</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(editorProfile.socialLinks).map(([platform, url]) => (
                  <div key={platform}>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {platform}
                    </label>
                    <Input
                      value={url || ''}
                      onChange={(e) => handleSocialLinkUpdate(platform, e.target.value)}
                      disabled={!isEditing}
                      placeholder={`https://${platform}.com/username`}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Permissions */}
            <Card className="lg:col-span-2">
              <div>
                <h3 className="text-title-lg font-semibold">Editor Permissions</h3>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  {editorProfile.permissions.map((permission) => (
                    <span 
                      key={permission}
                      className={cn(
                        'inline-flex items-center px-3 py-1 text-sm rounded-full font-medium',
                        getPermissionColor(permission)
                      )}
                    >
                      {permission}
                    </span>
                  ))}
                </div>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-3">
                  These permissions define what actions you can perform in the content management system.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Notifications</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(userSettings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'postComments' && 'Get notified when someone comments on your posts'}
                        {key === 'postShares' && 'Get notified when your posts are shared'}
                        {key === 'weeklyDigest' && 'Receive weekly performance summary'}
                        {key === 'systemUpdates' && 'Get notified about system updates'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingUpdate('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Preferences */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Preferences</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Theme
                  </label>
                  <select
                    value={userSettings.preferences.theme}
                    onChange={(e) => handleSettingUpdate('preferences', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Language
                  </label>
                  <select
                    value={userSettings.preferences.language}
                    onChange={(e) => handleSettingUpdate('preferences', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="zh-HK">繁體中文</option>
                    <option value="zh-CN">简体中文</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Editor Mode
                  </label>
                  <select
                    value={userSettings.preferences.editorMode}
                    onChange={(e) => handleSettingUpdate('preferences', 'editorMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="visual">Visual Editor</option>
                    <option value="markdown">Markdown Only</option>
                    <option value="hybrid">Hybrid Mode</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-body-md text-charcoal dark:text-white font-medium">
                      Auto-save
                    </label>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">
                      Automatically save drafts while writing
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userSettings.preferences.autoSave}
                      onChange={(e) => handleSettingUpdate('preferences', 'autoSave', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                  </label>
                </div>
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="lg:col-span-2">
              <div>
                <h3 className="text-title-lg font-semibold">Privacy Settings</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(userSettings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        {key === 'showProfile' && 'Make your profile visible to other users'}
                        {key === 'showStats' && 'Display your writing statistics publicly'}
                        {key === 'showEmail' && 'Show your email address on your profile'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingUpdate('privacy', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Password & Authentication</h3>
              </div>
              <div className="space-y-4">
                <Button variant="outline" size="md" fullWidth className="justify-start">
                  <span className="mr-3">🔑</span>
                  Change Password
                </Button>
                <Button variant="outline" size="md" fullWidth className="justify-start">
                  <span className="mr-3">📱</span>
                  Setup Two-Factor Authentication
                </Button>
                <Button variant="outline" size="md" fullWidth className="justify-start">
                  <span className="mr-3">🔐</span>
                  View Login History
                </Button>
              </div>
            </Card>

            {/* Account */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Account Management</h3>
              </div>
              <div className="space-y-4">
                <Button variant="outline" size="md" fullWidth className="justify-start">
                  <span className="mr-3">📧</span>
                  Change Email Address
                </Button>
                <Button variant="outline" size="md" fullWidth className="justify-start">
                  <span className="mr-3">📄</span>
                  Download Account Data
                </Button>
                <Button variant="outline" size="md" fullWidth className="justify-start text-error-red hover:bg-error-red/10">
                  <span className="mr-3">🗑️</span>
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Achievement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {
                [
                  { label: 'Total Achievements', value: editorProfile.achievements.length, icon: '🏆' },
                  { label: 'This Month', value: 2, icon: '📅' },
                  { label: 'Achievement Score', value: '1,250', icon: '⭐' },
                  { label: 'Rank', value: '#3', icon: '👑' }
                ].map((stat, index) => (
                  <Card key={stat.label} className="text-center p-4">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-hot-pink mb-1">{stat.value}</div>
                    <div className="text-body-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </Card>
                ))
              }
            </div>

            {/* Achievements List */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Your Achievements</h3>
              </div>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editorProfile.achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 bg-gradient-to-br from-hot-pink/5 to-electric-blue/5 rounded-lg border border-hot-pink/10">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-body-lg font-semibold text-charcoal dark:text-white mb-1">
                            {achievement.title}
                          </h4>
                          <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-2">
                            {achievement.description}
                          </p>
                          <div className="text-body-sm text-hot-pink font-medium">
                            Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Available Achievements */}
            <Card>
              <div>
                <h3 className="text-title-lg font-semibold">Available Achievements</h3>
              </div>
              <div>
                <div className="space-y-3">
                  {[
                    { title: 'Social Media Master', description: 'Get 100+ shares on a single post', progress: 87, icon: '📱' },
                    { title: 'Speed Writer', description: 'Publish 5 posts in a single day', progress: 40, icon: '⚡' },
                    { title: 'SEO Guru', description: 'Achieve 95%+ SEO score on 10 posts', progress: 70, icon: '🚀' },
                    { title: 'Community Favorite', description: 'Receive 50+ comments on a post', progress: 25, icon: '❤️' }
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl opacity-50">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-body-md font-medium text-charcoal dark:text-white">
                          {achievement.title}
                        </h4>
                        <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-hot-pink h-2 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                          <span className="text-body-sm text-gray-600 dark:text-gray-400">
                            {achievement.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default withAuth(EditorProfilePage, [UserType.BLOG_EDITOR]);