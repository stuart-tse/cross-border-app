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
  content?: string;
  status: 'published' | 'draft' | 'review' | 'scheduled';
  views: number;
  lastModified: string;
  author: string;
  category: string;
  featured: boolean;
  seoScore: number;
  thumbnailUrl?: string;
  publishedAt?: string;
  scheduledAt?: string;
  estimatedReadTime?: number;
  tags?: string[];
  wordCount?: number;
}

type ViewMode = 'cards' | 'list' | 'table';
type SortOption = 'newest' | 'oldest' | 'views' | 'title' | 'seo' | 'modified';

interface FilterState {
  search: string;
  status: 'all' | BlogPost['status'];
  category: string;
  dateRange: string;
  author: string;
  featured: 'all' | 'yes' | 'no';
}

const PostsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    category: 'all',
    dateRange: 'all',
    author: 'all',
    featured: 'all'
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Ultimate Guide to Cross-Border Travel 2024',
      excerpt: 'Complete comprehensive guide for seamless border crossings between Hong Kong and Mainland China with updated requirements, procedures, and insider tips.',
      status: 'published',
      views: 5432,
      lastModified: '2 hours ago',
      author: 'Editorial Team',
      category: 'Travel Guide',
      featured: true,
      seoScore: 94,
      thumbnailUrl: '/images/travel-guide-thumb.jpg',
      publishedAt: '2024-01-15T08:00:00Z',
      estimatedReadTime: 15,
      wordCount: 3200,
      tags: ['travel', 'border-crossing', 'guide', '2024', 'hong-kong', 'china']
    },
    {
      id: '2',
      title: 'Tesla-Style Luxury Transportation Revolution',
      excerpt: 'Exploring the future of premium cross-border vehicle services with cutting-edge technology, sustainable practices, and unparalleled comfort.',
      status: 'published',
      views: 3876,
      lastModified: '1 day ago',
      author: 'Michael Chen',
      category: 'Industry Trends',
      featured: false,
      seoScore: 88,
      thumbnailUrl: '/images/tesla-transport-thumb.jpg',
      publishedAt: '2024-01-14T10:30:00Z',
      estimatedReadTime: 12,
      wordCount: 2800,
      tags: ['luxury', 'tesla', 'transportation', 'innovation', 'sustainability']
    },
    {
      id: '3',
      title: 'Business Travel Optimization: Expert Strategies',
      excerpt: 'How to maximize efficiency and comfort during cross-border business trips with proven strategies, cost-saving tips, and insider insights.',
      status: 'draft',
      views: 0,
      lastModified: '3 days ago',
      author: 'Sarah Wong',
      category: 'Business Travel',
      featured: false,
      seoScore: 76,
      estimatedReadTime: 8,
      wordCount: 2100,
      tags: ['business', 'travel', 'optimization', 'productivity', 'efficiency']
    },
    {
      id: '4',
      title: 'HK-Shenzhen Routes: Complete Analysis 2024',
      excerpt: 'Comprehensive analysis of the most efficient routes for Hong Kong to Shenzhen travel including traffic patterns, timing recommendations, and cost comparisons.',
      status: 'review',
      views: 0,
      lastModified: '5 days ago',
      author: 'David Liu',
      category: 'Route Analysis',
      featured: false,
      seoScore: 84,
      estimatedReadTime: 10,
      wordCount: 2600,
      tags: ['routes', 'hong-kong', 'shenzhen', 'analysis', 'traffic']
    },
    {
      id: '5',
      title: 'Digital Nomad Guide: Cross-Border Living',
      excerpt: 'Essential guide for digital nomads navigating cross-border living between Hong Kong and mainland China, including visa requirements and co-working spaces.',
      status: 'scheduled',
      views: 0,
      lastModified: '1 week ago',
      author: 'Emma Zhang',
      category: 'Digital Nomad',
      featured: true,
      seoScore: 91,
      scheduledAt: '2024-01-20T09:00:00Z',
      estimatedReadTime: 14,
      wordCount: 3500,
      tags: ['digital-nomad', 'remote-work', 'visa', 'co-working', 'lifestyle']
    }
  ]);

  // Enhanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => {
      const matchesSearch = filters.search === '' || 
        post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.author.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' || post.status === filters.status;
      const matchesCategory = filters.category === 'all' || post.category === filters.category;
      const matchesAuthor = filters.author === 'all' || post.author === filters.author;
      const matchesFeatured = filters.featured === 'all' || 
        (filters.featured === 'yes' && post.featured) ||
        (filters.featured === 'no' && !post.featured);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesAuthor && matchesFeatured;
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
        case 'modified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [blogPosts, filters, sortBy]);

  // Get unique values for filter options
  const categories = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.category)));
  }, [blogPosts]);

  const authors = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.author)));
  }, [blogPosts]);

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return 'bg-success-green/10 text-success-green border-success-green/20';
      case 'draft':
        return 'bg-warning-amber/10 text-warning-amber border-warning-amber/20';
      case 'review':
        return 'bg-electric-blue/10 text-electric-blue border-electric-blue/20';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return '✓';
      case 'draft':
        return '📝';
      case 'review':
        return '👀';
      case 'scheduled':
        return '🕰';
      default:
        return '❓';
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-green';
    if (score >= 80) return 'text-electric-blue';
    if (score >= 70) return 'text-warning-amber';
    return 'text-error-red';
  };

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    setIsLoading(true);
    switch (action) {
      case 'publish':
        setBlogPosts(posts => posts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, status: 'published' as const, publishedAt: new Date().toISOString() }
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
      case 'feature':
        setBlogPosts(posts => posts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, featured: true }
            : post
        ));
        break;
      case 'unfeature':
        setBlogPosts(posts => posts.map(post => 
          selectedPosts.includes(post.id) 
            ? { ...post, featured: false }
            : post
        ));
        break;
      case 'delete':
        setBlogPosts(posts => posts.filter(post => !selectedPosts.includes(post.id)));
        break;
    }
    setSelectedPosts([]);
    setShowBulkActions(false);
    setTimeout(() => setIsLoading(false), 500);
  }, [selectedPosts]);

  const togglePostSelection = useCallback((postId: string) => {
    setSelectedPosts(prev => {
      const newSelection = prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  const selectAllPosts = useCallback(() => {
    const allVisible = filteredAndSortedPosts.map(post => post.id);
    const newSelection = selectedPosts.length === allVisible.length ? [] : allVisible;
    setSelectedPosts(newSelection);
    setShowBulkActions(newSelection.length > 0);
  }, [filteredAndSortedPosts, selectedPosts.length]);

  const clearSelection = useCallback(() => {
    setSelectedPosts([]);
    setShowBulkActions(false);
  }, []);

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
            Posts Management
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300 mt-1">
            Manage all your content with advanced filtering and bulk operations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
          >
            <span className="mr-2">📤</span>
            Import
          </Button>
          <Button
            variant="primary"
            size="md"
            asChild
          >
            <Link href="/dashboard/editor/create">
              <span className="mr-2">+</span>
              New Post
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Stats Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {[
          { label: 'Total Posts', value: blogPosts.length, color: 'text-electric-blue', icon: '📝' },
          { label: 'Published', value: blogPosts.filter(p => p.status === 'published').length, color: 'text-success-green', icon: '✓' },
          { label: 'Drafts', value: blogPosts.filter(p => p.status === 'draft').length, color: 'text-warning-amber', icon: '📝' },
          { label: 'In Review', value: blogPosts.filter(p => p.status === 'review').length, color: 'text-electric-blue', icon: '👀' },
          { label: 'Scheduled', value: blogPosts.filter(p => p.status === 'scheduled').length, color: 'text-purple-600', icon: '🕰' }
        ].map((stat, index) => (
          <Card key={stat.label} className="text-center p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={cn('text-2xl font-bold mb-1', stat.color)}>{stat.value}</div>
            <div className="text-body-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </motion.section>

      {/* Filters and Controls */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Input
                placeholder="Search posts, authors, tags, or content..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="scheduled">Scheduled</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Posts</option>
                <option value="yes">Featured Only</option>
                <option value="no">Non-Featured</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="modified">Recently Modified</option>
                <option value="views">Most Viewed</option>
                <option value="title">Alphabetical</option>
                <option value="seo">SEO Score</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                  { mode: 'cards' as ViewMode, icon: '⊙', label: 'Cards' },
                  { mode: 'list' as ViewMode, icon: '☰', label: 'List' },
                  { mode: 'table' as ViewMode, icon: '☷', label: 'Table' }
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'p-2 rounded-md text-sm transition-all duration-200',
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-600 text-hot-pink shadow-sm'
                        : 'text-gray-500 hover:text-charcoal dark:hover:text-white'
                    )}
                    title={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {Object.entries(filters).some(([key, value]) => 
            key !== 'search' && value !== 'all' || (key === 'search' && value)
          ) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if ((key !== 'search' && value !== 'all') || (key === 'search' && value)) {
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-hot-pink/10 text-hot-pink text-xs rounded-full"
                    >
                      {key === 'search' ? `Search: "${value}"` : `${key}: ${value}`}
                      <button
                        onClick={() => handleFilterChange(key as keyof FilterState, key === 'search' ? '' : 'all')}
                        className="hover:bg-hot-pink/20 rounded-full p-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  );
                }
                return null;
              })}
            </div>
          )}
        </Card>
      </motion.section>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-hot-pink">
                  {selectedPosts.length} posts selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleBulkAction('publish')}>
                    Publish
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleBulkAction('draft')}>
                    Draft
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleBulkAction('feature')}>
                    Feature
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleBulkAction('unfeature')}>
                    Unfeature
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleBulkAction('delete')} className="text-error-red">
                    Delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Display */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredAndSortedPosts.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-title-lg font-semibold text-charcoal dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-body-md text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or create a new post to get started.
            </p>
            <Button variant="primary" asChild>
              <Link href="/dashboard/editor/create">
                Create Your First Post
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard
                      post={post}
                      isSelected={selectedPosts.includes(post.id)}
                      onToggleSelect={() => togglePostSelection(post.id)}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getSeoScoreColor={getSeoScoreColor}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <Card>
                <CardContent className="divide-y divide-gray-100 dark:divide-gray-700">
                  {/* Select All Header */}
                  <div className="flex items-center gap-3 py-3 px-1">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === filteredAndSortedPosts.length && filteredAndSortedPosts.length > 0}
                      onChange={selectAllPosts}
                      className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                    />
                    <span className="text-body-sm text-gray-600 dark:text-gray-400">
                      Select All ({filteredAndSortedPosts.length} posts)
                    </span>
                  </div>

                  {filteredAndSortedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostListItem
                        post={post}
                        isSelected={selectedPosts.includes(post.id)}
                        onToggleSelect={() => togglePostSelection(post.id)}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                        getSeoScoreColor={getSeoScoreColor}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {viewMode === 'table' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left p-4">
                          <input
                            type="checkbox"
                            checked={selectedPosts.length === filteredAndSortedPosts.length && filteredAndSortedPosts.length > 0}
                            onChange={selectAllPosts}
                            className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                          />
                        </th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Title</th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Author</th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Views</th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">SEO</th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Modified</th>
                        <th className="text-left p-4 text-body-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedPosts.map((post, index) => (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.id)}
                              onChange={() => togglePostSelection(post.id)}
                              className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
                            />
                          </td>
                          <td className="p-4">
                            <div>
                              <Link href={`/dashboard/editor/posts/${post.id}`} className="font-medium text-charcoal dark:text-white hover:text-hot-pink">
                                {post.title}
                              </Link>
                              {post.featured && (
                                <span className="ml-2 text-xs bg-gradient-to-r from-hot-pink to-deep-pink text-white px-2 py-0.5 rounded-full">
                                  ★ Featured
                                </span>
                              )}
                              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {post.excerpt}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium border',
                              getStatusColor(post.status)
                            )}>
                              <span className="mr-1">{getStatusIcon(post.status)}</span>
                              {post.status}
                            </span>
                          </td>
                          <td className="p-4 text-body-sm text-gray-600 dark:text-gray-400">
                            {post.author}
                          </td>
                          <td className="p-4 text-body-sm text-gray-600 dark:text-gray-400">
                            {post.views.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={cn('text-body-sm font-semibold', getSeoScoreColor(post.seoScore))}>
                              {post.seoScore}%
                            </span>
                          </td>
                          <td className="p-4 text-body-sm text-gray-600 dark:text-gray-400">
                            {post.lastModified}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/dashboard/editor/posts/${post.id}/edit`}>
                                  Edit
                                </Link>
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/blog/${post.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </motion.section>

      {/* Pagination */}
      {filteredAndSortedPosts.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(page => (
                <Button
                  key={page}
                  variant={page === 1 ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Post Card Component
interface PostCardProps {
  post: BlogPost;
  isSelected: boolean;
  onToggleSelect: () => void;
  getStatusColor: (status: BlogPost['status']) => string;
  getStatusIcon: (status: BlogPost['status']) => string;
  getSeoScoreColor: (score: number) => string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  isSelected,
  onToggleSelect,
  getStatusColor,
  getStatusIcon,
  getSeoScoreColor
}) => {
  return (
    <Card className={cn(
      "h-full hover:shadow-lg transition-all duration-300 border relative group",
      isSelected ? "ring-2 ring-hot-pink border-hot-pink" : "border-gray-200 dark:border-gray-700"
    )}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
        />
      </div>

      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        {post.thumbnailUrl ? (
          <img 
            src={post.thumbnailUrl} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-gray-400">📝</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
            getStatusColor(post.status),
            'bg-white/90 dark:bg-gray-800/90'
          )}>
            <span className="mr-1">{getStatusIcon(post.status)}</span>
            {post.status}
          </span>
        </div>

        {/* Featured Badge */}
        {post.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-gradient-to-r from-hot-pink to-deep-pink text-white text-xs rounded-full font-medium">
              ★ Featured
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex-1">
          {/* Post Header */}
          <div className="mb-3">
            <h3 className="text-title-sm font-semibold text-charcoal dark:text-white line-clamp-2 group-hover:text-hot-pink transition-colors">
              <Link href={`/dashboard/editor/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h3>
            <div className="flex items-center gap-2 text-body-sm text-gray-500 dark:text-gray-400 mt-2">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {post.category}
              </span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
          </div>

          <p className="text-body-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-body-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                👀 {post.views.toLocaleString()}
              </span>
              {post.estimatedReadTime && (
                <span className="flex items-center gap-1">
                  ⏱️ {post.estimatedReadTime}m
                </span>
              )}
              {post.wordCount && (
                <span className="flex items-center gap-1">
                  🗺 {post.wordCount.toLocaleString()} words
                </span>
              )}
            </div>
            <div className={cn('text-body-sm font-semibold', getSeoScoreColor(post.seoScore))}>
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
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/editor/posts/${post.id}/edit`}>
                Edit
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/blog/${post.id}`}>
                View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Post List Item Component
interface PostListItemProps {
  post: BlogPost;
  isSelected: boolean;
  onToggleSelect: () => void;
  getStatusColor: (status: BlogPost['status']) => string;
  getStatusIcon: (status: BlogPost['status']) => string;
  getSeoScoreColor: (score: number) => string;
}

const PostListItem: React.FC<PostListItemProps> = ({
  post,
  isSelected,
  onToggleSelect,
  getStatusColor,
  getStatusIcon,
  getSeoScoreColor
}) => {
  return (
    <div className={cn(
      "flex items-center gap-4 py-4 px-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group",
      isSelected && "bg-hot-pink/5 border-l-4 border-hot-pink pl-3"
    )}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
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
            <span className="text-gray-400">📝</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-body-lg font-medium text-charcoal dark:text-white truncate group-hover:text-hot-pink transition-colors">
                <Link href={`/dashboard/editor/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              {post.featured && (
                <span className="flex-shrink-0 text-xs bg-gradient-to-r from-hot-pink to-deep-pink text-white px-2 py-0.5 rounded-full">
                  ★
                </span>
              )}
            </div>
            <p className="text-body-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-body-sm text-gray-500 dark:text-gray-400">
              <span>{post.category}</span>
              <span>•</span>
              <span>{post.author}</span>
              <span>•</span>
              <span>{post.lastModified}</span>
              {post.estimatedReadTime && (
                <>
                  <span>•</span>
                  <span>{post.estimatedReadTime}m read</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-body-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium border',
              getStatusColor(post.status)
            )}>
              <span className="mr-1">{getStatusIcon(post.status)}</span>
              {post.status}
            </span>
            
            <span className="flex items-center gap-1">
              👀 {post.views.toLocaleString()}
            </span>

            <div className={cn('text-body-sm font-semibold', getSeoScoreColor(post.seoScore))}>
              {post.seoScore}%
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/editor/posts/${post.id}/edit`}>
                  Edit
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/blog/${post.id}`}>
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(PostsManagementPage, [UserType.BLOG_EDITOR]);