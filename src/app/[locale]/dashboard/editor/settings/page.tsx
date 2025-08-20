'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface EditorSettings {
  general: {
    siteName: string;
    tagline: string;
    defaultCategory: string;
    postsPerPage: number;
    allowComments: boolean;
    moderateComments: boolean;
    allowGuestComments: boolean;
  };
  publishing: {
    defaultStatus: 'draft' | 'published' | 'review';
    requireReview: boolean;
    autoPublish: boolean;
    scheduleTime: string;
    seoOptimization: boolean;
    generateExcerpts: boolean;
    wordCountTarget: number;
  };
  media: {
    maxFileSize: number;
    allowedTypes: string[];
    imageQuality: number;
    autoOptimize: boolean;
    generateThumbnails: boolean;
    watermark: boolean;
    cdnEnabled: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    sitemap: boolean;
    robotsTxt: boolean;
    analytics: {
      googleAnalytics: string;
      googleTagManager: string;
      facebookPixel: string;
    };
  };
  integrations: {
    socialMedia: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
    };
    newsletter: {
      provider: 'mailchimp' | 'sendgrid' | 'none';
      apiKey: string;
      listId: string;
    };
    backup: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      retention: number;
    };
  };
  advanced: {
    customCSS: string;
    customJS: string;
    maintenance: boolean;
    debugMode: boolean;
    cacheEnabled: boolean;
    compression: boolean;
  };
}

type SettingsTab = 'general' | 'publishing' | 'media' | 'seo' | 'integrations' | 'advanced';

const EditorSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<EditorSettings>({
    general: {
      siteName: 'CrossBorder Travel Blog',
      tagline: 'Your guide to seamless cross-border travel',
      defaultCategory: 'Travel Guide',
      postsPerPage: 12,
      allowComments: true,
      moderateComments: true,
      allowGuestComments: false
    },
    publishing: {
      defaultStatus: 'draft',
      requireReview: true,
      autoPublish: false,
      scheduleTime: '09:00',
      seoOptimization: true,
      generateExcerpts: true,
      wordCountTarget: 1000
    },
    media: {
      maxFileSize: 10,
      allowedTypes: ['jpg', 'png', 'gif', 'webp', 'mp4', 'pdf'],
      imageQuality: 85,
      autoOptimize: true,
      generateThumbnails: true,
      watermark: false,
      cdnEnabled: true
    },
    seo: {
      metaTitle: 'CrossBorder Travel - Premium Transport Services',
      metaDescription: 'Experience seamless cross-border travel with our premium transport services between Hong Kong and Mainland China.',
      keywords: ['cross-border travel', 'hong kong transport', 'luxury travel', 'business travel'],
      sitemap: true,
      robotsTxt: true,
      analytics: {
        googleAnalytics: 'GA-XXXXXXXXX',
        googleTagManager: 'GTM-XXXXXXX',
        facebookPixel: ''
      }
    },
    integrations: {
      socialMedia: {
        facebook: 'https://facebook.com/crossbordertravel',
        twitter: 'https://twitter.com/crossbordertravel',
        linkedin: 'https://linkedin.com/company/crossbordertravel',
        instagram: 'https://instagram.com/crossbordertravel'
      },
      newsletter: {
        provider: 'mailchimp',
        apiKey: '',
        listId: ''
      },
      backup: {
        enabled: true,
        frequency: 'daily',
        retention: 30
      }
    },
    advanced: {
      customCSS: '',
      customJS: '',
      maintenance: false,
      debugMode: false,
      cacheEnabled: true,
      compression: true
    }
  });

  const categories = [
    'Travel Guide',
    'Industry Trends',
    'Business Travel',
    'Route Analysis',
    'Digital Nomad',
    'Transportation Tech',
    'Cross-Border Tips',
    'Luxury Travel',
    'Budget Travel',
    'Safety & Security'
  ];

  const handleSettingUpdate = useCallback((category: keyof EditorSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
    setHasChanges(true);
  }, []);

  const handleNestedSettingUpdate = useCallback((category: keyof EditorSettings, nested: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [nested]: { ...prev[category][nested], [field]: value }
      }
    }));
    setHasChanges(true);
  }, []);

  const handleArrayUpdate = useCallback((category: keyof EditorSettings, field: string, value: string[]) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Settings saved:', settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const handleReset = useCallback(() => {
    // Reset to default values
    setHasChanges(false);
  }, []);

  const addKeyword = useCallback((keyword: string) => {
    if (keyword && !settings.seo.keywords.includes(keyword)) {
      handleArrayUpdate('seo', 'keywords', [...settings.seo.keywords, keyword]);
    }
  }, [settings.seo.keywords, handleArrayUpdate]);

  const removeKeyword = useCallback((keyword: string) => {
    handleArrayUpdate('seo', 'keywords', settings.seo.keywords.filter(k => k !== keyword));
  }, [settings.seo.keywords, handleArrayUpdate]);

  const toggleFileType = useCallback((fileType: string) => {
    const currentTypes = settings.media.allowedTypes;
    const updatedTypes = currentTypes.includes(fileType)
      ? currentTypes.filter(type => type !== fileType)
      : [...currentTypes, fileType];
    handleArrayUpdate('media', 'allowedTypes', updatedTypes);
  }, [settings.media.allowedTypes, handleArrayUpdate]);

  const tabs = [
    { key: 'general', label: 'General', icon: '⚙️' },
    { key: 'publishing', label: 'Publishing', icon: '📝' },
    { key: 'media', label: 'Media', icon: '🖼️' },
    { key: 'seo', label: 'SEO & Analytics', icon: '🎯' },
    { key: 'integrations', label: 'Integrations', icon: '🔗' },
    { key: 'advanced', label: 'Advanced', icon: '🚀' }
  ];

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
            Editor Settings
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300 mt-1">
            Configure your content management system preferences
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-body-sm text-warning-amber flex items-center gap-1">
              <div className="w-2 h-2 bg-warning-amber rounded-full animate-pulse"></div>
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            size="md"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SettingsTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-hot-pink text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Site Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Site Name
                    </label>
                    <Input
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingUpdate('general', 'siteName', e.target.value)}
                      placeholder="Your site name"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Tagline
                    </label>
                    <Input
                      value={settings.general.tagline}
                      onChange={(e) => handleSettingUpdate('general', 'tagline', e.target.value)}
                      placeholder="Brief description of your site"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Default Category
                    </label>
                    <select
                      value={settings.general.defaultCategory}
                      onChange={(e) => handleSettingUpdate('general', 'defaultCategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Posts Per Page
                    </label>
                    <Input
                      type="number"
                      value={settings.general.postsPerPage}
                      onChange={(e) => handleSettingUpdate('general', 'postsPerPage', parseInt(e.target.value))}
                      min="1"
                      max="50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Comment Settings</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Allow Comments
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Enable commenting on posts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.allowComments}
                        onChange={(e) => handleSettingUpdate('general', 'allowComments', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Moderate Comments
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Require approval before comments appear
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.moderateComments}
                        onChange={(e) => handleSettingUpdate('general', 'moderateComments', e.target.checked)}
                        className="sr-only peer"
                        disabled={!settings.general.allowComments}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink peer-disabled:opacity-50"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Guest Comments
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Allow comments from non-registered users
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.allowGuestComments}
                        onChange={(e) => handleSettingUpdate('general', 'allowGuestComments', e.target.checked)}
                        className="sr-only peer"
                        disabled={!settings.general.allowComments}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Publishing Settings */}
          {activeTab === 'publishing' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Default Publishing Options</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Default Status
                    </label>
                    <select
                      value={settings.publishing.defaultStatus}
                      onChange={(e) => handleSettingUpdate('publishing', 'defaultStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="review">Under Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Schedule Time (Default)
                    </label>
                    <Input
                      type="time"
                      value={settings.publishing.scheduleTime}
                      onChange={(e) => handleSettingUpdate('publishing', 'scheduleTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Word Count Target
                    </label>
                    <Input
                      type="number"
                      value={settings.publishing.wordCountTarget}
                      onChange={(e) => handleSettingUpdate('publishing', 'wordCountTarget', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Publishing Workflow</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Require Review
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Posts must be reviewed before publishing
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.publishing.requireReview}
                        onChange={(e) => handleSettingUpdate('publishing', 'requireReview', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        SEO Optimization
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Automatically optimize for search engines
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.publishing.seoOptimization}
                        onChange={(e) => handleSettingUpdate('publishing', 'seoOptimization', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Generate Excerpts
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Auto-generate post excerpts if not provided
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.publishing.generateExcerpts}
                        onChange={(e) => handleSettingUpdate('publishing', 'generateExcerpts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Media Settings */}
          {activeTab === 'media' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">File Upload Settings</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Max File Size (MB)
                    </label>
                    <Input
                      type="number"
                      value={settings.media.maxFileSize}
                      onChange={(e) => handleSettingUpdate('media', 'maxFileSize', parseFloat(e.target.value))}
                      min="1"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Allowed File Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['jpg', 'png', 'gif', 'webp', 'svg', 'mp4', 'mov', 'pdf', 'doc', 'txt'].map(type => (
                        <button
                          key={type}
                          onClick={() => toggleFileType(type)}
                          className={cn(
                            'px-3 py-1 text-sm rounded-full border transition-colors',
                            settings.media.allowedTypes.includes(type)
                              ? 'bg-hot-pink text-white border-hot-pink'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-hot-pink'
                          )}
                        >
                          {type.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Image Quality (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={settings.media.imageQuality}
                        onChange={(e) => handleSettingUpdate('media', 'imageQuality', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <span className="w-12 text-center text-body-sm font-medium">
                        {settings.media.imageQuality}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Media Processing</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Auto Optimize
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Automatically optimize images for web
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.media.autoOptimize}
                        onChange={(e) => handleSettingUpdate('media', 'autoOptimize', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Generate Thumbnails
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Create thumbnail versions of images
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.media.generateThumbnails}
                        onChange={(e) => handleSettingUpdate('media', 'generateThumbnails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        CDN Enabled
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Use content delivery network for faster loading
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.media.cdnEnabled}
                        onChange={(e) => handleSettingUpdate('media', 'cdnEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Meta Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Meta Title
                    </label>
                    <Input
                      value={settings.seo.metaTitle}
                      onChange={(e) => handleSettingUpdate('seo', 'metaTitle', e.target.value)}
                      placeholder="Your site's meta title"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.seo.metaTitle.length}/60 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={settings.seo.metaDescription}
                      onChange={(e) => handleSettingUpdate('seo', 'metaDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white"
                      rows={3}
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.seo.metaDescription.length}/160 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Keywords
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settings.seo.keywords.map((keyword) => (
                        <span 
                          key={keyword}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-electric-blue/10 text-electric-blue text-sm rounded-full"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="hover:bg-electric-blue/20 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a keyword and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Analytics & Tracking</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Google Analytics ID
                    </label>
                    <Input
                      value={settings.seo.analytics.googleAnalytics}
                      onChange={(e) => handleNestedSettingUpdate('seo', 'analytics', 'googleAnalytics', e.target.value)}
                      placeholder="GA-XXXXXXXXX or G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Google Tag Manager ID
                    </label>
                    <Input
                      value={settings.seo.analytics.googleTagManager}
                      onChange={(e) => handleNestedSettingUpdate('seo', 'analytics', 'googleTagManager', e.target.value)}
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Facebook Pixel ID
                    </label>
                    <Input
                      value={settings.seo.analytics.facebookPixel}
                      onChange={(e) => handleNestedSettingUpdate('seo', 'analytics', 'facebookPixel', e.target.value)}
                      placeholder="Facebook Pixel ID"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Generate Sitemap
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Automatically generate XML sitemap
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.seo.sitemap}
                        onChange={(e) => handleSettingUpdate('seo', 'sitemap', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <>
              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Social Media</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.integrations.socialMedia).map(([platform, url]) => (
                    <div key={platform}>
                      <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                        {platform} URL
                      </label>
                      <Input
                        value={url}
                        onChange={(e) => handleNestedSettingUpdate('integrations', 'socialMedia', platform, e.target.value)}
                        placeholder={`https://${platform}.com/username`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Newsletter & Backup</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Newsletter Provider
                    </label>
                    <select
                      value={settings.integrations.newsletter.provider}
                      onChange={(e) => handleNestedSettingUpdate('integrations', 'newsletter', 'provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="none">None</option>
                      <option value="mailchimp">Mailchimp</option>
                      <option value="sendgrid">SendGrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Backup Frequency
                    </label>
                    <select
                      value={settings.integrations.backup.frequency}
                      onChange={(e) => handleNestedSettingUpdate('integrations', 'backup', 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Enable Backups
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Automatically backup content and settings
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.integrations.backup.enabled}
                        onChange={(e) => handleNestedSettingUpdate('integrations', 'backup', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Custom Code</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Custom CSS
                    </label>
                    <textarea
                      value={settings.advanced.customCSS}
                      onChange={(e) => handleSettingUpdate('advanced', 'customCSS', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white font-mono text-sm"
                      rows={6}
                      placeholder="/* Add your custom CSS here */"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Custom JavaScript
                    </label>
                    <textarea
                      value={settings.advanced.customJS}
                      onChange={(e) => handleSettingUpdate('advanced', 'customJS', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink resize-none bg-white dark:bg-gray-700 dark:text-white font-mono text-sm"
                      rows={6}
                      placeholder="// Add your custom JavaScript here"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">System Settings</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Maintenance Mode
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Show maintenance page to visitors
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.advanced.maintenance}
                        onChange={(e) => handleSettingUpdate('advanced', 'maintenance', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Cache Enabled
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Enable caching for better performance
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.advanced.cacheEnabled}
                        onChange={(e) => handleSettingUpdate('advanced', 'cacheEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Compression
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Enable GZIP compression for faster loading
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.advanced.compression}
                        onChange={(e) => handleSettingUpdate('advanced', 'compression', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-body-md text-charcoal dark:text-white font-medium">
                        Debug Mode
                      </label>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Enable debug mode for development
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.advanced.debugMode}
                        onChange={(e) => handleSettingUpdate('advanced', 'debugMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/20 dark:peer-focus:ring-hot-pink/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-title-lg font-semibold">Danger Zone</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-error-red/5 border border-error-red/20 rounded-lg">
                    <h4 className="text-body-md font-semibold text-error-red mb-2">
                      Reset All Settings
                    </h4>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">
                      This action will reset all settings to their default values. This cannot be undone.
                    </p>
                    <Button variant="danger" size="sm">
                      Reset to Defaults
                    </Button>
                  </div>

                  <div className="p-4 bg-error-red/5 border border-error-red/20 rounded-lg">
                    <h4 className="text-body-md font-semibold text-error-red mb-2">
                      Export Settings
                    </h4>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">
                      Export your current settings configuration as a JSON file for backup or migration.
                    </p>
                    <Button variant="outline" size="sm">
                      Export Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default withAuth(EditorSettingsPage, [UserType.BLOG_EDITOR]);