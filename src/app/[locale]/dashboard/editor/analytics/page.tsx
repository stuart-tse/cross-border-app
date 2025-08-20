'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalPosts: number;
    avgViewsPerPost: number;
    totalShares: number;
    totalComments: number;
    bounceRate: number;
    avgTimeOnPage: string;
    topTrafficSource: string;
  };
  viewsOverTime: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    shares: number;
    comments: number;
    publishedAt: string;
    category: string;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  demographics: {
    countries: Array<{
      country: string;
      visitors: number;
      percentage: number;
    }>;
    devices: Array<{
      device: string;
      visitors: number;
      percentage: number;
    }>;
    browsers: Array<{
      browser: string;
      visitors: number;
      percentage: number;
    }>;
  };
  seoMetrics: {
    avgSeoScore: number;
    keywordsRanking: Array<{
      keyword: string;
      position: number;
      clicks: number;
      impressions: number;
    }>;
    backlinks: number;
    indexedPages: number;
  };
}

type DateRange = '7d' | '30d' | '90d' | '1y';
type MetricType = 'views' | 'engagement' | 'seo' | 'traffic';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [activeMetric, setActiveMetric] = useState<MetricType>('views');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    overview: {
      totalViews: 45236,
      totalPosts: 24,
      avgViewsPerPost: 1885,
      totalShares: 1247,
      totalComments: 398,
      bounceRate: 42.3,
      avgTimeOnPage: '3m 42s',
      topTrafficSource: 'Google Search'
    },
    viewsOverTime: [
      { date: '2024-01-01', views: 1200, uniqueVisitors: 890 },
      { date: '2024-01-02', views: 1450, uniqueVisitors: 1120 },
      { date: '2024-01-03', views: 1680, uniqueVisitors: 1280 },
      { date: '2024-01-04', views: 1520, uniqueVisitors: 1150 },
      { date: '2024-01-05', views: 1890, uniqueVisitors: 1420 },
      { date: '2024-01-06', views: 2100, uniqueVisitors: 1580 },
      { date: '2024-01-07', views: 1950, uniqueVisitors: 1460 },
    ],
    topPosts: [
      {
        id: '1',
        title: 'Ultimate Guide to Cross-Border Travel 2024',
        views: 5432,
        shares: 234,
        comments: 67,
        publishedAt: '2024-01-15',
        category: 'Travel Guide'
      },
      {
        id: '2',
        title: 'Tesla-Style Luxury Transportation Revolution',
        views: 3876,
        shares: 189,
        comments: 43,
        publishedAt: '2024-01-14',
        category: 'Industry Trends'
      },
      {
        id: '3',
        title: 'HK-Shenzhen Routes: Complete Analysis 2024',
        views: 2947,
        shares: 156,
        comments: 29,
        publishedAt: '2024-01-10',
        category: 'Route Analysis'
      },
      {
        id: '4',
        title: 'Digital Nomad Guide: Cross-Border Living',
        views: 2156,
        shares: 98,
        comments: 34,
        publishedAt: '2024-01-08',
        category: 'Digital Nomad'
      },
      {
        id: '5',
        title: 'Business Travel Optimization: Expert Strategies',
        views: 1823,
        shares: 87,
        comments: 21,
        publishedAt: '2024-01-06',
        category: 'Business Travel'
      }
    ],
    trafficSources: [
      { source: 'Google Search', visits: 18456, percentage: 40.8 },
      { source: 'Direct', visits: 12834, percentage: 28.4 },
      { source: 'Social Media', visits: 7689, percentage: 17.0 },
      { source: 'Referrals', visits: 4327, percentage: 9.6 },
      { source: 'Email', visits: 1930, percentage: 4.2 }
    ],
    demographics: {
      countries: [
        { country: 'Hong Kong', visitors: 15623, percentage: 34.5 },
        { country: 'China', visitors: 12456, percentage: 27.5 },
        { country: 'Singapore', visitors: 6789, percentage: 15.0 },
        { country: 'Taiwan', visitors: 4532, percentage: 10.0 },
        { country: 'Others', visitors: 5836, percentage: 13.0 }
      ],
      devices: [
        { device: 'Mobile', visitors: 25647, percentage: 56.7 },
        { device: 'Desktop', visitors: 15234, percentage: 33.7 },
        { device: 'Tablet', visitors: 4355, percentage: 9.6 }
      ],
      browsers: [
        { browser: 'Chrome', visitors: 28945, percentage: 64.0 },
        { browser: 'Safari', visitors: 9876, percentage: 21.8 },
        { browser: 'Firefox', visitors: 4123, percentage: 9.1 },
        { browser: 'Edge', visitors: 2292, percentage: 5.1 }
      ]
    },
    seoMetrics: {
      avgSeoScore: 84,
      keywordsRanking: [
        { keyword: 'cross border travel', position: 3, clicks: 1234, impressions: 15678 },
        { keyword: 'hong kong shenzhen transport', position: 5, clicks: 987, impressions: 12345 },
        { keyword: 'luxury cross border service', position: 8, clicks: 654, impressions: 9876 },
        { keyword: 'business travel hong kong', position: 12, clicks: 432, impressions: 7654 },
        { keyword: 'cross border vehicle service', position: 15, clicks: 321, impressions: 5432 }
      ],
      backlinks: 156,
      indexedPages: 24
    }
  };

  const dateRangeLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '1y': 'Last year'
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'views': return '👀';
      case 'engagement': return '💬';
      case 'seo': return '🎯';
      case 'traffic': return '📊';
    }
  };

  const getChangeDirection = (value: number) => {
    if (value > 0) return { icon: '↑', color: 'text-success-green' };
    if (value < 0) return { icon: '↓', color: 'text-error-red' };
    return { icon: '→', color: 'text-gray-500' };
  };

  const getTrafficSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google search': return '🔍';
      case 'direct': return '🔗';
      case 'social media': return '📱';
      case 'referrals': return '🔗';
      case 'email': return '📧';
      default: return '🌍';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return '📱';
      case 'desktop': return '💻';
      case 'tablet': return '📱';
      default: return '📱';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const exportData = async () => {
    setIsLoading(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exporting analytics data...');
    setIsLoading(false);
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
            Content Analytics
          </h1>
          <p className="text-body-lg text-gray-600 dark:text-gray-300 mt-1">
            Track your content performance and audience insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-hot-pink focus:border-hot-pink bg-white dark:bg-gray-700 dark:text-white"
          >
            {Object.entries(dateRangeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <Button
            variant="outline"
            size="md"
            onClick={exportData}
            isLoading={isLoading}
          >
            <span className="mr-2">📤</span>
            Export
          </Button>
        </div>
      </motion.header>

      {/* Key Metrics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
      >
        {
          [
            { label: 'Total Views', value: analyticsData.overview.totalViews, change: 12.3, icon: '👀' },
            { label: 'Posts Published', value: analyticsData.overview.totalPosts, change: 8.7, icon: '📝' },
            { label: 'Avg Views/Post', value: analyticsData.overview.avgViewsPerPost, change: 5.2, icon: '📈' },
            { label: 'Total Shares', value: analyticsData.overview.totalShares, change: 15.6, icon: '🔄' },
            { label: 'Comments', value: analyticsData.overview.totalComments, change: -2.1, icon: '💬' },
            { label: 'Bounce Rate', value: `${analyticsData.overview.bounceRate}%`, change: -8.4, icon: '⚡' },
            { label: 'Avg Time', value: analyticsData.overview.avgTimeOnPage, change: 18.9, icon: '⏱️' },
            { label: 'SEO Score', value: `${analyticsData.seoMetrics.avgSeoScore}%`, change: 6.7, icon: '🎯' }
          ].map((metric, index) => {
            const change = getChangeDirection(typeof metric.change === 'number' ? metric.change : 0);
            return (
              <Card key={metric.label} className="text-center p-4 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-charcoal dark:text-white mb-1">
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </div>
                <div className="text-body-sm text-gray-600 dark:text-gray-400 mb-1">
                  {metric.label}
                </div>
                {typeof metric.change === 'number' && (
                  <div className={cn('text-body-sm flex items-center justify-center gap-1', change.color)}>
                    <span>{change.icon}</span>
                    <span>{Math.abs(metric.change)}%</span>
                  </div>
                )}
              </Card>
            );
          })
        }
      </motion.section>

      {/* Metric Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'views', label: 'Page Views' },
            { key: 'engagement', label: 'Engagement' },
            { key: 'seo', label: 'SEO Performance' },
            { key: 'traffic', label: 'Traffic Sources' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveMetric(tab.key as MetricType)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex-1 justify-center',
                activeMetric === tab.key
                  ? 'bg-hot-pink text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
              )}
            >
              <span>{getMetricIcon(tab.key as MetricType)}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Views Analytics */}
        {activeMetric === 'views' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Views Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Views Over Time</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <div className="text-body-md text-gray-600 dark:text-gray-400">
                      Interactive chart visualization would be here
                    </div>
                    <div className="text-body-sm text-gray-500 mt-2">
                      Shows views and unique visitors over time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Posts */}
            <Card>
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Top Performing Posts</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.topPosts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-hot-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-md font-medium text-charcoal dark:text-white line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 text-body-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          👀 {formatNumber(post.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          🔄 {post.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Engagement Analytics */}
        {activeMetric === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Engagement Metrics</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-hot-pink/10 to-deep-pink/10 rounded-lg">
                    <div className="text-3xl font-bold text-hot-pink mb-1">
                      {formatNumber(analyticsData.overview.totalShares)}
                    </div>
                    <div className="text-body-sm text-gray-600 dark:text-gray-400">Total Shares</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-electric-blue/10 to-hot-pink/10 rounded-lg">
                    <div className="text-3xl font-bold text-electric-blue mb-1">
                      {analyticsData.overview.totalComments}
                    </div>
                    <div className="text-body-sm text-gray-600 dark:text-gray-400">Comments</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-md text-charcoal dark:text-white">Average Time on Page</span>
                    <span className="text-body-md font-semibold text-success-green">
                      {analyticsData.overview.avgTimeOnPage}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-md text-charcoal dark:text-white">Bounce Rate</span>
                    <span className="text-body-md font-semibold text-warning-amber">
                      {analyticsData.overview.bounceRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-md text-charcoal dark:text-white">Pages per Session</span>
                    <span className="text-body-md font-semibold text-electric-blue">2.4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Shares Breakdown */}
            <Card>
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Social Media Breakdown</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: 'Facebook', shares: 456, icon: '🔵', color: 'text-blue-600' },
                    { platform: 'Twitter', shares: 324, icon: '🔵', color: 'text-sky-500' },
                    { platform: 'LinkedIn', shares: 267, icon: '🔵', color: 'text-blue-700' },
                    { platform: 'WeChat', shares: 200, icon: '🟢', color: 'text-green-600' }
                  ].map((social) => (
                    <div key={social.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={social.color}>{social.icon}</span>
                        <span className="text-body-md text-charcoal dark:text-white">
                          {social.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-hot-pink h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(social.shares / 456) * 100}%` }}
                          />
                        </div>
                        <span className="text-body-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                          {social.shares}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SEO Analytics */}
        {activeMetric === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SEO Overview */}
            <Card>
              <CardHeader>
                <h3 className="text-title-lg font-semibold">SEO Overview</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-success-green mb-2">
                    {analyticsData.seoMetrics.avgSeoScore}%
                  </div>
                  <div className="text-body-md text-charcoal dark:text-white mb-1">Average SEO Score</div>
                  <div className="text-body-sm text-success-green">Excellent Performance</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-600 dark:text-gray-400">Backlinks</span>
                    <span className="text-body-md font-semibold">{analyticsData.seoMetrics.backlinks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-600 dark:text-gray-400">Indexed Pages</span>
                    <span className="text-body-md font-semibold">{analyticsData.seoMetrics.indexedPages}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-600 dark:text-gray-400">Keywords Tracked</span>
                    <span className="text-body-md font-semibold">{analyticsData.seoMetrics.keywordsRanking.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Rankings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Keyword Rankings</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.seoMetrics.keywordsRanking.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="text-body-md font-medium text-charcoal dark:text-white mb-1">
                          {keyword.keyword}
                        </div>
                        <div className="flex items-center gap-4 text-body-sm text-gray-600 dark:text-gray-400">
                          <span>📈 {keyword.clicks} clicks</span>
                          <span>👀 {formatNumber(keyword.impressions)} impressions</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          'text-lg font-bold mb-1',
                          keyword.position <= 3 ? 'text-success-green' :
                          keyword.position <= 10 ? 'text-warning-amber' :
                          'text-error-red'
                        )}>
                          #{keyword.position}
                        </div>
                        <div className="text-body-sm text-gray-500">Position</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Traffic Analytics */}
        {activeMetric === 'traffic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Traffic Sources</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTrafficSourceIcon(source.source)}</span>
                        <span className="text-body-md text-charcoal dark:text-white">
                          {source.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-hot-pink h-2 rounded-full transition-all duration-300"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="text-body-sm font-semibold">{formatNumber(source.visits)}</div>
                          <div className="text-body-sm text-gray-500">{source.percentage}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader>
                <h3 className="text-title-lg font-semibold">Audience Demographics</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Countries */}
                <div>
                  <h4 className="text-body-md font-semibold text-charcoal dark:text-white mb-3">Top Countries</h4>
                  <div className="space-y-2">
                    {analyticsData.demographics.countries.slice(0, 4).map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-body-sm text-charcoal dark:text-white">{country.country}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-electric-blue h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-body-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                            {country.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices */}
                <div>
                  <h4 className="text-body-md font-semibold text-charcoal dark:text-white mb-3">Device Types</h4>
                  <div className="space-y-2">
                    {analyticsData.demographics.devices.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getDeviceIcon(device.device)}</span>
                          <span className="text-body-sm text-charcoal dark:text-white">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-warning-amber h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                          <span className="text-body-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                            {device.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.section>

      {/* Export and Insights */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* AI Insights */}
        <Card className="bg-gradient-to-br from-electric-blue/10 to-hot-pink/10 border-electric-blue/20">
          <CardHeader>
            <h3 className="text-title-lg font-semibold text-electric-blue flex items-center gap-2">
              <span>🤖</span>
              AI Insights & Recommendations
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-charcoal dark:text-white mb-2">📈 Content Performance</h4>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Your cross-border travel guides perform 40% better than other content types. Consider creating more comprehensive guides.
              </p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-charcoal dark:text-white mb-2">🕰️ Optimal Publishing Time</h4>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Your audience is most active on weekdays between 9-11 AM HKT. Schedule important posts during this window.
              </p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-charcoal dark:text-white mb-2">🎯 SEO Opportunity</h4>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
&ldquo;Luxury travel Hong Kong&rdquo; has high search volume but low competition. Consider targeting this keyword.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-title-lg font-semibold">Quick Actions</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="md" fullWidth className="justify-start">
              <span className="mr-3">📈</span>
              Generate Monthly Report
            </Button>
            <Button variant="outline" size="md" fullWidth className="justify-start">
              <span className="mr-3">📧</span>
              Email Analytics Summary
            </Button>
            <Button variant="outline" size="md" fullWidth className="justify-start">
              <span className="mr-3">📊</span>
              Set Performance Goals
            </Button>
            <Button variant="outline" size="md" fullWidth className="justify-start">
              <span className="mr-3">🎯</span>
              Keyword Research Tool
            </Button>
            <Button variant="outline" size="md" fullWidth className="justify-start">
              <span className="mr-3">🔔</span>
              Setup Alerts & Notifications
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default withAuth(AnalyticsPage, [UserType.BLOG_EDITOR]);