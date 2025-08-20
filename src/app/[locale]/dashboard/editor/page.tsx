'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft' | 'review';
  views: number;
  lastModified: string;
  author: string;
  category: string;
  featured: boolean;
  seoScore: number;
  thumbnailUrl?: string;
  publishedAt?: string;
  estimatedReadTime?: number;
  tags?: string[];
}

interface ContentStats {
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  avgSeoScore: number;
}

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  uploadedAt: string;
  url: string;
  thumbnailUrl?: string;
  dimensions?: string;
  description?: string;
}

type ViewMode = 'cards' | 'list';
type SortOption = 'newest' | 'oldest' | 'views' | 'title' | 'seo';

interface FilterState {
  search: string;
  status: 'all' | 'published' | 'draft' | 'review';
  category: string;
  dateRange: string;
  author: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const BlogEditorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'analytics'>('posts');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    category: 'all',
    dateRange: 'all',
    author: 'all'
  });
  
  const [stats, setStats] = useState<ContentStats>({
    publishedPosts: 24,
    draftPosts: 6,
    totalViews: 12500,
    avgSeoScore: 85,
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Cross-Border Travel Guide 2024',
      excerpt: 'Complete guide for seamless border crossings between Hong Kong and Mainland China with updated requirements and procedures.',
      status: 'published',
      views: 2341,
      lastModified: '2 hours ago',
      author: 'Editorial Team',
      category: 'Travel Guide',
      featured: true,
      seoScore: 92,
      thumbnailUrl: '/images/travel-guide-thumb.jpg',
      publishedAt: '2024-01-15T08:00:00Z',
      estimatedReadTime: 12,
      tags: ['travel', 'border-crossing', 'guide', '2024']
    },
    {
      id: '2',
      title: 'Tesla-Style Luxury Transportation',
      excerpt: 'Exploring the future of premium cross-border vehicle services with cutting-edge technology and unparalleled comfort.',
      status: 'published',
      views: 1876,
      lastModified: '1 day ago',
      author: 'Michael Chen',
      category: 'Industry News',
      featured: false,
      seoScore: 88,
      thumbnailUrl: '/images/tesla-transport-thumb.jpg',
      publishedAt: '2024-01-14T10:30:00Z',
      estimatedReadTime: 8,
      tags: ['luxury', 'tesla', 'transportation', 'innovation']
    },
    {
      id: '3',
      title: 'Business Travel Optimization Tips',
      excerpt: 'How to maximize efficiency and comfort during cross-border business trips with proven strategies and insider insights.',
      status: 'draft',
      views: 0,
      lastModified: '3 days ago',
      author: 'Sarah Wong',
      category: 'Business',
      featured: false,
      seoScore: 76,
      thumbnailUrl: '/images/business-travel-thumb.jpg',
      estimatedReadTime: 6,
      tags: ['business', 'travel', 'optimization', 'productivity']
    },
    {
      id: '4',
      title: 'Hong Kong to Shenzhen: Best Routes',
      excerpt: 'Comprehensive analysis of the most efficient routes for HK-SZ travel including traffic patterns and timing recommendations.',
      status: 'review',
      views: 0,
      lastModified: '5 days ago',
      author: 'David Liu',
      category: 'Route Analysis',
      featured: false,
      seoScore: 84,
      thumbnailUrl: '/images/hk-sz-routes-thumb.jpg',
      estimatedReadTime: 10,
      tags: ['routes', 'hong-kong', 'shenzhen', 'analysis']
    },
  ]);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      name: 'hong-kong-skyline.jpg',
      type: 'image',
      size: '2.4 MB',
      uploadedAt: '2 days ago',
      url: '/images/hong-kong-skyline.jpg',
    },
    {
      id: '2',
      name: 'business-travel-video.mp4',
      type: 'video',
      size: '15.7 MB',
      uploadedAt: '1 week ago',
      url: '/videos/business-travel.mp4',
    },
    {
      id: '3',
      name: 'route-map-diagram.png',
      type: 'image',
      size: '890 KB',
      uploadedAt: '3 days ago',
      url: '/images/route-map.png',
    },
  ]);

  // Enhanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => {
      const matchesSearch = filters.search === '' || 
        post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.author.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || post.status === filters.status;
      const matchesCategory = filters.category === 'all' || post.category === filters.category;
      const matchesAuthor = filters.author === 'all' || post.author === filters.author;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesAuthor;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'oldest':
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        case 'views':
          return b.views - a.views;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'seo':
          return b.seoScore - a.seoScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [blogPosts, filters, sortBy]);

  // Get unique categories and authors for filter dropdowns
  const categories = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.category)));
  }, [blogPosts]);

  const authors = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.author)));
  }, [blogPosts]);

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return 'bg-success-green/10 text-success-green';
      case 'draft':
        return 'bg-warning-amber/10 text-warning-amber';
      case 'review':
        return 'bg-electric-blue/10 text-electric-blue';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return '✅';
      case 'draft':
        return '📝';
      case 'review':
        return '👁️';
      default:
        return '❓';
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-green';
    if (score >= 70) return 'text-warning-amber';
    return 'text-error-red';
  };

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      default:
        return '📁';
    }
  };

  // Enhanced handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'publish':
        setBlogPosts(posts => posts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, status: 'published' as const }
            : post
        ));
        break;
      case 'draft':
        setBlogPosts(posts => posts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, status: 'draft' as const }
            : post
        ));
        break;
      case 'delete':
        setBlogPosts(posts => posts.filter(post => !selectedPosts.includes(post.id)));
        break;
    }
    setSelectedPosts([]);
  }, [selectedPosts]);

  const togglePostSelection = useCallback((postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const selectAllPosts = useCallback(() => {
    const allVisible = filteredAndSortedPosts.map(post => post.id);
    setSelectedPosts(prev => 
      prev.length === allVisible.length ? [] : allVisible
    );
  }, [filteredAndSortedPosts]);

  const handleNewPost = () => {
    window.location.href = '/editor/new';
  };

  const handleEditPost = (postId: string) => {
    window.location.href = `/editor/${postId}`;
  };

  const handleViewPost = (postId: string) => {
    window.location.href = `/blog/${postId}`;
  };

  const handleDeletePost = (postId: string) => {
    setBlogPosts(posts => posts.filter(post => post.id !== postId));
  };

  const handleDuplicatePost = (postId: string) => {
    const originalPost = blogPosts.find(post => post.id === postId);
    if (originalPost) {
      const newPost = {
        ...originalPost,
        id: Date.now().toString(),
        title: `${originalPost.title} (Copy)`,
        status: 'draft' as const,
        views: 0,
        lastModified: 'Just now'
      };
      setBlogPosts(posts => [newPost, ...posts]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl py-6 md:py-8">
        {/* Enhanced Header with Better Hierarchy */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          role="banner"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg" aria-hidden="true">📝</span>
              </div>
              <div>
                <h1 className="text-headline-lg font-bold text-charcoal dark:text-white">
                  Content Management
                </h1>
                <nav aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-body-sm text-gray-500">
                    <li><Link href="/dashboard" className="hover:text-hot-pink">Dashboard</Link></li>
                    <li aria-hidden="true">•</li>
                    <li className="text-charcoal dark:text-white">Editor</li>
                  </ol>
                </nav>
              </div>
            </div>
            <p className="text-body-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Create, manage, and analyze your travel content with our comprehensive editorial suite
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              className="hidden md:flex"
              aria-label="Import content from external sources"
            >
              Import
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleNewPost}
              className="bg-gradient-to-r from-hot-pink to-deep-pink hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              aria-label="Create new blog post"
            >
              <span className="mr-2 text-lg" aria-hidden="true">+</span>
              <span className="hidden sm:inline">New Post</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </motion.header>

        {/* Enhanced Stats Overview with Better Visual Hierarchy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
          aria-label="Content statistics overview"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent pointer-events-none" />
              <CardContent className="relative text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl" aria-hidden="true">✅</span>
                  </div>
                </div>
                <div className="text-display-sm font-bold text-success-green group-hover:scale-105 transition-transform duration-300">
                  {stats.publishedPosts}
                </div>
                <div className="text-body-md text-gray-600 dark:text-gray-400">Published</div>
                <div className="text-body-sm text-gray-500 mt-1">+3 this week</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-warning-amber/5 to-transparent pointer-events-none" />
              <CardContent className="relative text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-warning-amber/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl" aria-hidden="true">📝</span>
                  </div>
                </div>
                <div className="text-display-sm font-bold text-warning-amber group-hover:scale-105 transition-transform duration-300">
                  {stats.draftPosts}
                </div>
                <div className="text-body-md text-gray-600 dark:text-gray-400">Drafts</div>
                <div className="text-body-sm text-gray-500 mt-1">2 pending review</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-hot-pink/5 to-transparent pointer-events-none" />
              <CardContent className="relative text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-hot-pink/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl" aria-hidden="true">👁️</span>
                  </div>
                </div>
                <div className="text-display-sm font-bold text-hot-pink group-hover:scale-105 transition-transform duration-300">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-body-md text-gray-600 dark:text-gray-400">Total Views</div>
                <div className="text-body-sm text-success-green mt-1">+12% this month</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent pointer-events-none" />
              <CardContent className="relative text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-electric-blue/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl" aria-hidden="true">🎯</span>
                  </div>
                </div>
                <div className="text-display-sm font-bold text-electric-blue group-hover:scale-105 transition-transform duration-300">
                  {stats.avgSeoScore}%
                </div>
                <div className="text-body-md text-gray-600 dark:text-gray-400">SEO Score</div>
                <div className="text-body-sm text-gray-500 mt-1">Above average</div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Enhanced Navigation Tabs with Better UX */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
          aria-label="Content management sections"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <div className="flex space-x-1">
              {[
                { key: 'posts', label: 'Posts', icon: '📄', count: blogPosts.length },
                { key: 'media', label: 'Media', icon: '🖼️', count: mediaItems.length },
                { key: 'analytics', label: 'Analytics', icon: '📊', count: null }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 relative',
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`${tab.key}-panel`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full font-medium',
                      activeTab === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.nav>

        {/* Posts Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              role="tabpanel"
              id="posts-panel"
              aria-labelledby="posts-tab"
            >
              {/* Enhanced Filter Toolbar */}
              <Card className="mb-6 overflow-hidden">
                <CardContent className="p-6">
                  {/* Search Bar */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Search posts, authors, or content..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 pr-4 py-3 text-body-md"
                        aria-label="Search posts"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <span className="text-lg">🔍</span>
                      </div>
                      {filters.search && (
                        <button
                          onClick={() => handleFilterChange('search', '')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center">
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                        aria-label="Filter by status"
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                      </select>

                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                        aria-label="Filter by category"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
                        aria-label="Sort posts"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="views">Most Viewed</option>
                        <option value="title">Alphabetical</option>
                        <option value="seo">SEO Score</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Bulk Actions */}
                      <AnimatePresence>
                        {selectedPosts.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 px-3 py-2 bg-hot-pink/10 rounded-lg border border-hot-pink/20"
                          >
                            <span className="text-sm text-hot-pink font-medium">
                              {selectedPosts.length} selected
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleBulkAction('publish')}
                              className="text-xs"
                            >
                              Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleBulkAction('delete')}
                              className="text-xs text-error-red"
                            >
                              Delete
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('cards')}
                          className={cn(
                            'p-2 rounded-md text-sm transition-all duration-200',
                            viewMode === 'cards'
                              ? 'bg-white dark:bg-gray-600 text-hot-pink shadow-sm'
                              : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                          )}
                          aria-label="Card view"
                        >
                          ⊞
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={cn(
                            'p-2 rounded-md text-sm transition-all duration-200',
                            viewMode === 'list'
                              ? 'bg-white dark:bg-gray-600 text-hot-pink shadow-sm'
                              : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                          )}
                          aria-label="List view"
                        >
                          ☰
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(filters.status !== 'all' || filters.category !== 'all' || filters.search) && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                      {filters.status !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-hot-pink/10 text-hot-pink text-xs rounded-full">
                          Status: {filters.status}
                          <button onClick={() => handleFilterChange('status', 'all')} className="hover:bg-hot-pink/20 rounded-full p-0.5">✕</button>
                        </span>
                      )}
                      {filters.category !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-electric-blue/10 text-electric-blue text-xs rounded-full">
                          Category: {filters.category}
                          <button onClick={() => handleFilterChange('category', 'all')} className="hover:bg-electric-blue/20 rounded-full p-0.5">✕</button>
                        </span>
                      )}
                      {filters.search && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning-amber/10 text-warning-amber text-xs rounded-full">
                          Search: &ldquo;{filters.search}&rdquo;
                          <button onClick={() => handleFilterChange('search', '')} className="hover:bg-warning-amber/20 rounded-full p-0.5">✕</button>
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Posts Display - Card or List View */}
              {filteredAndSortedPosts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4" aria-hidden="true">📝</div>
                    <h3 className="text-title-lg font-semibold text-charcoal dark:text-white mb-2">
                      {filters.search || filters.status !== 'all' ? 'No posts match your filters' : 'No posts yet'}
                    </h3>
                    <p className="text-body-md text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {filters.search || filters.status !== 'all' 
                        ? 'Try adjusting your search terms or filters to find what you are looking for.'
                        : 'Start creating engaging travel content for your audience.'
                      }
                    </p>
                    {(!filters.search && filters.status === 'all') && (
                      <Button
                        variant="primary"
                        onClick={handleNewPost}
                        className="bg-gradient-to-r from-hot-pink to-deep-pink"
                      >
                        Create Your First Post
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {viewMode === 'cards' ? (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                      {filteredAndSortedPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          variants={itemVariants}
                          layout
                          className="group"
                        >
                          <Card className="h-full relative overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                            {/* Selection Checkbox */}
                            <div className="absolute top-3 left-3 z-10">
                              <input
                                type="checkbox"
                                checked={selectedPosts.includes(post.id)}
                                onChange={() => togglePostSelection(post.id)}
                                className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                                aria-label={`Select ${post.title}`}
                              />
                            </div>

                            {/* Post Thumbnail */}
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                              {post.thumbnailUrl ? (
                                <img 
                                  src={post.thumbnailUrl} 
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-4xl text-gray-400" aria-hidden="true">📄</span>
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <span className={cn(
                                  'px-2 py-1 rounded-full text-xs font-medium flex items-center backdrop-blur-sm',
                                  getStatusColor(post.status),
                                  'bg-white/90 dark:bg-gray-800/90'
                                )}>
                                  <span className="mr-1" aria-hidden="true">{getStatusIcon(post.status)}</span>
                                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                </span>
                              </div>

                              {/* Featured Badge */}
                              {post.featured && (
                                <div className="absolute bottom-3 left-3">
                                  <span className="px-2 py-1 bg-gradient-to-r from-hot-pink to-deep-pink text-white text-xs rounded-full font-medium backdrop-blur-sm">
                                    ⭐ Featured
                                  </span>
                                </div>
                              )}
                            </div>

                            <CardContent className="p-5 flex flex-col h-full">
                              {/* Post Header */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-title-sm font-semibold text-charcoal dark:text-white line-clamp-2 group-hover:text-hot-pink transition-colors">
                                      <a 
                                        href={`/editor/${post.id}`}
                                        className="hover:underline focus:outline-none focus:ring-2 focus:ring-hot-pink rounded"
                                      >
                                        {post.title}
                                      </a>
                                    </h3>
                                    <div className="flex items-center gap-2 text-body-sm text-gray-500 dark:text-gray-400 mt-1">
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                        {post.category}
                                      </span>
                                      <span>•</span>
                                      <span>{post.author}</span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-body-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                  {post.excerpt}
                                </p>

                                {/* Post Meta */}
                                <div className="flex items-center justify-between text-body-sm text-gray-500 dark:text-gray-400 mb-4">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <span aria-hidden="true">👁️</span>
                                      {post.views.toLocaleString()}
                                    </span>
                                    {post.estimatedReadTime && (
                                      <span className="flex items-center gap-1">
                                        <span aria-hidden="true">⏱️</span>
                                        {post.estimatedReadTime}m read
                                      </span>
                                    )}
                                  </div>
                                  <div className={cn(
                                    'text-body-sm font-semibold',
                                    getSeoScoreColor(post.seoScore)
                                  )}>
                                    SEO: {post.seoScore}%
                                  </div>
                                </div>

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {post.tags.slice(0, 3).map((tag) => (
                                      <span 
                                        key={tag}
                                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                    {post.tags.length > 3 && (
                                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                                        +{post.tags.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-body-sm text-gray-500 dark:text-gray-400">
                                  {post.lastModified}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPost(post.id)}
                                    className="text-xs hover:bg-hot-pink/10 hover:text-hot-pink"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewPost(post.id)}
                                    className="text-xs hover:bg-electric-blue/10 hover:text-electric-blue"
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDuplicatePost(post.id)}
                                    className="text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    Copy
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    // List View
                    <Card>
                      <CardContent className="divide-y divide-gray-100 dark:divide-gray-700">
                        {/* Select All Header */}
                        <div className="flex items-center gap-3 py-3 px-1">
                          <input
                            type="checkbox"
                            checked={selectedPosts.length === filteredAndSortedPosts.length}
                            onChange={selectAllPosts}
                            className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                            aria-label="Select all posts"
                          />
                          <span className="text-body-sm text-gray-600 dark:text-gray-400">
                            Select All ({filteredAndSortedPosts.length} posts)
                          </span>
                        </div>

                        {filteredAndSortedPosts.map((post) => (
                          <motion.div
                            key={post.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex items-center gap-4 py-4 px-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.id)}
                              onChange={() => togglePostSelection(post.id)}
                              className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                              aria-label={`Select ${post.title}`}
                            />
                            
                            {/* Thumbnail */}
                            <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                              {post.thumbnailUrl ? (
                                <img 
                                  src={post.thumbnailUrl} 
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400" aria-hidden="true">📄</span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-body-lg font-medium text-charcoal dark:text-white truncate group-hover:text-hot-pink transition-colors">
                                    <a 
                                      href={`/editor/${post.id}`}
                                      className="hover:underline focus:outline-none focus:ring-2 focus:ring-hot-pink rounded"
                                    >
                                      {post.title}
                                    </a>
                                  </h3>
                                  <p className="text-body-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                                    {post.excerpt}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-body-sm text-gray-500 dark:text-gray-400">
                                    <span>{post.category}</span>
                                    <span>•</span>
                                    <span>{post.author}</span>
                                    <span>•</span>
                                    <span>{post.lastModified}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 text-body-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                                  <span className={cn(
                                    'px-2 py-1 rounded-full text-xs font-medium flex items-center',
                                    getStatusColor(post.status)
                                  )}>
                                    <span className="mr-1" aria-hidden="true">{getStatusIcon(post.status)}</span>
                                    {post.status}
                                  </span>
                                  
                                  <span className="flex items-center gap-1">
                                    <span aria-hidden="true">👁️</span>
                                    {post.views.toLocaleString()}
                                  </span>

                                  <div className={cn(
                                    'text-body-sm font-semibold',
                                    getSeoScoreColor(post.seoScore)
                                  )}>
                                    {post.seoScore}%
                                  </div>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditPost(post.id)}
                                      className="text-xs hover:bg-hot-pink/10 hover:text-hot-pink"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewPost(post.id)}
                                      className="text-xs hover:bg-electric-blue/10 hover:text-electric-blue"
                                    >
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              role="tabpanel"
              id="media-panel"
              aria-labelledby="media-tab"
            >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-title-lg font-semibold text-charcoal">Media Library</h2>
                <Button variant="primary" size="md">
                  Upload Media
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">{getMediaIcon(item.type)}</div>
                      <h3 className="text-body-md font-medium text-charcoal truncate">
                        {item.name}
                      </h3>
                    </div>
                    
                    <div className="text-body-sm text-gray-500 space-y-1">
                      <div>Size: {item.size}</div>
                      <div>Uploaded: {item.uploadedAt}</div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="flex-1">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        Copy URL
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
              role="tabpanel"
              id="analytics-panel"
              aria-labelledby="analytics-tab"
            >
            <Card>
              <h2 className="text-title-lg font-semibold text-charcoal mb-6">
                Content Performance
              </h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-title-md font-semibold text-charcoal mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-body-md text-gray-600 mb-4">
                  Detailed analytics and insights coming soon
                </p>
                <Button variant="secondary">
                  View Basic Reports
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-title-md font-semibold text-charcoal mb-4">
                  Top Performing Posts
                </h3>
                <div className="space-y-3">
                  {blogPosts.filter(p => p.status === 'published')
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 3)
                    .map((post, index) => (
                      <div key={post.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-body-sm font-bold text-hot-pink">
                            #{index + 1}
                          </span>
                          <span className="text-body-sm text-charcoal truncate">
                            {post.title}
                          </span>
                        </div>
                        <span className="text-body-sm text-gray-600">
                          {post.views.toLocaleString()} views
                        </span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-title-md font-semibold text-charcoal mb-4">
                  SEO Performance
                </h3>
                <div className="space-y-3">
                  {['Excellent (90-100%)', 'Good (70-89%)', 'Needs Improvement (<70%)'].map((range, index) => {
                    const count = blogPosts.filter(post => {
                      if (index === 0) return post.seoScore >= 90;
                      if (index === 1) return post.seoScore >= 70 && post.seoScore < 90;
                      return post.seoScore < 70;
                    }).length;
                    
                    return (
                      <div key={range} className="flex items-center justify-between">
                        <span className="text-body-sm text-charcoal">{range}</span>
                        <span className={cn(
                          'text-body-sm font-semibold',
                          index === 0 && 'text-success-green',
                          index === 1 && 'text-warning-amber',
                          index === 2 && 'text-error-red'
                        )}>
                          {count} posts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default withAuth(BlogEditorDashboard, [UserType.BLOG_EDITOR]);