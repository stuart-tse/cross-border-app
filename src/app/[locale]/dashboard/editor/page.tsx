'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

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
}

const BlogEditorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'analytics'>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'review'>('all');
  
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
      excerpt: 'Complete guide for seamless border crossings between Hong Kong and Mainland China...',
      status: 'published',
      views: 2341,
      lastModified: '2 hours ago',
      author: 'Editorial Team',
      category: 'Travel Guide',
      featured: true,
      seoScore: 92,
    },
    {
      id: '2',
      title: 'Tesla-Style Luxury Transportation',
      excerpt: 'Exploring the future of premium cross-border vehicle services...',
      status: 'published',
      views: 1876,
      lastModified: '1 day ago',
      author: 'Michael Chen',
      category: 'Industry News',
      featured: false,
      seoScore: 88,
    },
    {
      id: '3',
      title: 'Business Travel Optimization Tips',
      excerpt: 'How to maximize efficiency and comfort during cross-border business trips...',
      status: 'draft',
      views: 0,
      lastModified: '3 days ago',
      author: 'Sarah Wong',
      category: 'Business',
      featured: false,
      seoScore: 76,
    },
    {
      id: '4',
      title: 'Hong Kong to Shenzhen: Best Routes',
      excerpt: 'Comprehensive analysis of the most efficient routes for HK-SZ travel...',
      status: 'review',
      views: 0,
      lastModified: '5 days ago',
      author: 'David Liu',
      category: 'Route Analysis',
      featured: false,
      seoScore: 84,
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

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  const handleNewPost = () => {
    // Navigate to post editor
    window.location.href = '/editor/new';
  };

  const handleEditPost = (postId: string) => {
    // Navigate to post editor with post ID
    window.location.href = `/editor/${postId}`;
  };

  const handleViewPost = (postId: string) => {
    // Navigate to public post view
    window.location.href = `/blog/${postId}`;
  };

  const handleDeletePost = (postId: string) => {
    setBlogPosts(posts => posts.filter(post => post.id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-headline-lg font-bold text-charcoal">
              Content Management
            </h1>
            <p className="text-body-lg text-gray-600">
              Create and manage travel content for CrossBorder Services
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleNewPost}
            className="bg-gradient-to-r from-hot-pink to-deep-pink"
            leftIcon="+"
          >
            New Post
          </Button>
        </motion.div>

        {/* Content Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="text-display-sm font-bold text-success-green">
              {stats.publishedPosts}
            </div>
            <div className="text-body-md text-gray-600">Published Posts</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-display-sm font-bold text-warning-amber">
              {stats.draftPosts}
            </div>
            <div className="text-body-md text-gray-600">Draft Posts</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-display-sm font-bold text-hot-pink">
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="text-body-md text-gray-600">Total Views</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-display-sm font-bold text-electric-blue">
              {stats.avgSeoScore}%
            </div>
            <div className="text-body-md text-gray-600">SEO Score</div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['posts', 'media', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                    activeTab === tab
                      ? 'border-hot-pink text-hot-pink'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Search and Filter */}
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="review">Under Review</option>
                </select>
              </div>
            </Card>

            {/* Posts Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 text-body-md font-semibold text-gray-600">
                        Title
                      </th>
                      <th className="text-left p-4 text-body-md font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-left p-4 text-body-md font-semibold text-gray-600">
                        Views
                      </th>
                      <th className="text-left p-4 text-body-md font-semibold text-gray-600">
                        SEO
                      </th>
                      <th className="text-left p-4 text-body-md font-semibold text-gray-600">
                        Last Modified
                      </th>
                      <th className="text-left p-4 text-body-md font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <h3 className="text-body-lg font-medium text-charcoal flex items-center">
                              {post.title}
                              {post.featured && (
                                <span className="ml-2 px-2 py-1 bg-hot-pink text-white text-xs rounded-full">
                                  Featured
                                </span>
                              )}
                            </h3>
                            <p className="text-body-sm text-gray-500 mt-1 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="text-body-sm text-gray-400 mt-1">
                              {post.category} • {post.author}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-body-sm font-medium flex items-center w-fit',
                            getStatusColor(post.status)
                          )}>
                            <span className="mr-1">{getStatusIcon(post.status)}</span>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-body-md text-gray-600">
                          {post.views.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className={cn(
                            'text-body-md font-semibold',
                            getSeoScoreColor(post.seoScore)
                          )}>
                            {post.seoScore}%
                          </div>
                        </td>
                        <td className="p-4 text-body-md text-gray-600">
                          {post.lastModified}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPost(post.id)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-error-red hover:bg-red-50"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'media' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
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
      </div>
    </div>
  );
};

export default withAuth(BlogEditorDashboard, [UserType.BLOG_EDITOR]);