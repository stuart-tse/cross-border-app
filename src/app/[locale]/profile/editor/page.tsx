'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, BarChart3, FileText, Settings, Users, Zap, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EditorStats {
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  avgSeoScore: number;
  monthlyGrowth: number;
  engagementRate: number;
  topPerformingPost: string;
  contentCategories: CategoryStats[];
}

interface CategoryStats {
  category: string;
  postCount: number;
  views: number;
  avgRating: number;
  growth: number;
}

interface ContentPreferences {
  defaultKeywords: string[];
  targetAudience: string;
  contentTone: 'PROFESSIONAL' | 'CASUAL' | 'FRIENDLY' | 'FORMAL';
  focusRegions: string[];
  preferredPostLength: 'SHORT' | 'MEDIUM' | 'LONG';
  autoOptimization: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
}

type TabType = 'dashboard' | 'content' | 'analytics' | 'team' | 'settings';

const EnhancedEditorProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<EditorStats>({
    publishedPosts: 42,
    draftPosts: 8,
    totalViews: 145000,
    avgSeoScore: 87,
    monthlyGrowth: 23,
    engagementRate: 8.4,
    topPerformingPost: 'Complete Hong Kong to Shenzhen Travel Guide 2024',
    contentCategories: [
      { category: 'Travel Guides', postCount: 18, views: 75000, avgRating: 4.8, growth: 15 },
      { category: 'Transportation', postCount: 14, views: 42000, avgRating: 4.6, growth: 28 },
      { category: 'Cultural Insights', postCount: 8, views: 23000, avgRating: 4.9, growth: 35 },
      { category: 'Business Travel', postCount: 6, views: 18000, avgRating: 4.7, growth: 12 }
    ]
  });

  const [contentPreferences, setContentPreferences] = useState<ContentPreferences>({
    defaultKeywords: ['travel', 'hong kong', 'shenzhen', 'cross-border', 'transportation'],
    targetAudience: 'Business travelers and tourists between HK and mainland China',
    contentTone: 'PROFESSIONAL',
    focusRegions: ['Hong Kong', 'Shenzhen', 'Guangzhou', 'Macau'],
    preferredPostLength: 'MEDIUM',
    autoOptimization: true
  });

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Chen', role: 'Senior Editor', isOnline: true, avatar: undefined },
    { id: '2', name: 'Mike Wong', role: 'Content Manager', isOnline: false, avatar: undefined },
    { id: '3', name: 'Lisa Zhang', role: 'SEO Specialist', isOnline: true, avatar: undefined },
    { id: '4', name: 'David Liu', role: 'Junior Editor', isOnline: true, avatar: undefined }
  ]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatTrend = (growth: number) => {
    if (growth > 20) return { color: 'text-success-green', icon: '📈', label: 'Excellent' };
    if (growth > 10) return { color: 'text-warning-amber', icon: '📊', label: 'Good' };
    if (growth > 0) return { color: 'text-hot-pink', icon: '📉', label: 'Stable' };
    return { color: 'text-error-red', icon: '📉', label: 'Declining' };
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success-green" />
                </div>
                <span className="text-xs text-success-green font-medium px-2 py-1 bg-success-green/10 rounded-full">
                  +{stats.monthlyGrowth}% this month
                </span>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {stats.publishedPosts}
              </div>
              <div className="text-sm text-gray-600">Published Posts</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-warning-amber/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-warning-amber/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-warning-amber" />
                </div>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {stats.draftPosts}
              </div>
              <div className="text-sm text-gray-600">Draft Posts</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-hot-pink/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-hot-pink/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-hot-pink" />
                </div>
                <span className="text-xs text-success-green font-medium px-2 py-1 bg-success-green/10 rounded-full">
                  +15% this month
                </span>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-electric-blue/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-electric-blue" />
                </div>
                <span className="text-xs text-success-green font-medium px-2 py-1 bg-success-green/10 rounded-full">
                  Above avg
                </span>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {stats.avgSeoScore}%
              </div>
              <div className="text-sm text-gray-600">SEO Score</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Performance */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Content Performance</h3>
                
                <div className="space-y-4">
                  {stats.contentCategories.map((category, index) => {
                    const trend = getStatTrend(category.growth);
                    return (
                      <div key={category.category} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-charcoal">{category.category}</h4>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm', trend.color)}>{trend.icon}</span>
                            <span className={cn('text-sm font-medium', trend.color)}>
                              +{category.growth}%
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="block font-medium text-charcoal">{category.postCount}</span>
                            <span>Posts</span>
                          </div>
                          <div>
                            <span className="block font-medium text-charcoal">{category.views.toLocaleString()}</span>
                            <span>Views</span>
                          </div>
                          <div>
                            <span className="block font-medium text-charcoal">{category.avgRating}⭐</span>
                            <span>Rating</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions & Team */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-md font-semibold text-charcoal mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-hot-pink to-deep-pink justify-start"
                    onClick={() => window.location.href = '/dashboard/editor'}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('content')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Content
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('team')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team Collaboration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Editorial Team */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-md font-semibold text-charcoal mb-4">Editorial Team</h3>
                
                <div className="space-y-3">
                  {teamMembers.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-hot-pink to-deep-pink rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(member.name)
                          )}
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-green rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-charcoal truncate">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                  View All Team Members
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Content Management</h3>
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-sm">Content management tools coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Analytics Dashboard</h3>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-sm">Advanced analytics coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Team Collaboration</h3>
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-sm">Team collaboration features coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Editorial Settings</h3>
          <div className="text-center py-12 text-gray-500">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-sm">Settings panel coming soon</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'content': return renderContent();
      case 'analytics': return renderAnalytics();
      case 'team': return renderTeam();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/profile"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Editorial Dashboard</h1>
              <p className="text-gray-600">Manage your content, track performance, and collaborate with your team</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <div className="flex space-x-1">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                { key: 'content', label: 'Content', icon: FileText },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                { key: 'team', label: 'Team', icon: Users },
                { key: 'settings', label: 'Settings', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabType)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200',
                    activeTab === key
                      ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-md'
                      : 'text-gray-600 hover:text-charcoal hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default withAuth(EnhancedEditorProfile, [UserType.BLOG_EDITOR]);