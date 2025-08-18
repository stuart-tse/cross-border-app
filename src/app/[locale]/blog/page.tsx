'use client';

import React, { useState } from 'react';
import type { Metadata } from 'next';
import { motion } from 'framer-motion';
import Image from 'next/image';

const categories = [
  { id: 'all', label: 'All', active: true },
  { id: 'travel-tips', label: 'Travel Tips', active: false },
  { id: 'regulations', label: 'Regulations', active: false },
  { id: 'business', label: 'Business', active: false },
  { id: 'updates', label: 'Updates', active: false },
];

const featuredArticle = {
  id: 'featured-1',
  title: '2024 Cross-Border Travel Guide',
  excerpt: 'Everything you need to know about traveling between Hong Kong and Mainland China in 2024, including new regulations, best practices, and insider tips...',
  category: 'FEATURED',
  author: 'Expert Team',
  date: 'March 15, 2024',
  readTime: '8 min read',
  image: '/images/placeholder.svg',
  views: '12,543'
};

const articles = [
  {
    id: 'article-1',
    title: 'New Border Crossing Procedures',
    excerpt: 'Recent updates to border crossing procedures and what travelers need to know...',
    category: 'Regulations',
    date: 'March 10, 2024',
    image: '/images/placeholder.svg',
    views: '8,932'
  },
  {
    id: 'article-2',
    title: 'Best Routes for Business Travel',
    excerpt: 'Optimize your business trips with our recommended routes and timing...',
    category: 'Business',
    date: 'March 5, 2024',
    image: '/images/placeholder.svg',
    views: '7,654'
  },
  {
    id: 'article-3',
    title: 'Executive Transportation Trends',
    excerpt: 'Latest developments in premium business transportation services...',
    category: 'Business',
    date: 'February 28, 2024',
    image: '/images/placeholder.svg',
    views: '6,321'
  },
  {
    id: 'article-4',
    title: 'Travel Documents Checklist',
    excerpt: 'Essential documents for smooth cross-border travel...',
    category: 'Travel Tips',
    date: 'February 25, 2024',
    image: '/images/placeholder.svg',
    views: '9,876'
  }
];

const popularArticles = [
  { title: 'Hong Kong to Shenzhen Guide', views: '12,543' },
  { title: 'Business Travel Essentials', views: '8,932' },
  { title: 'Vehicle Selection Tips', views: '7,654' },
  { title: 'Border Crossing Updates', views: '6,321' }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header Section - Wireframe Design */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#171A20] mb-4">
            Cross-Border Travel Magazine
          </h1>
          <p className="text-lg text-gray-600">
            Expert insights, travel guides, and industry updates
          </p>
        </div>

        {/* Magazine Layout - Wireframe Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Featured Article */}
            <motion.div 
              className="bg-white rounded-lg border border-gray-100 overflow-hidden mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative h-80 bg-gradient-to-br from-[#FFB6C1] to-[#FF69B4]">
                <div className="absolute top-4 left-4">
                  <span className="bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                    {featuredArticle.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-3xl font-bold mb-2">{featuredArticle.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-600 mb-3">
                  {featuredArticle.date} • {featuredArticle.category} • {featuredArticle.readTime}
                </div>
                <p className="text-gray-700 leading-relaxed">{featuredArticle.excerpt}</p>
              </div>
            </motion.div>

            {/* Article List */}
            <div className="space-y-6">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex gap-4 p-6">
                    <div className="w-32 h-20 bg-gradient-to-br from-[#FFB6C1] to-[#FF69B4] rounded flex-shrink-0"></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#171A20] mb-2">
                        {article.title}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {article.date} • {article.category}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <motion.div 
              className="bg-white rounded-lg border border-gray-100 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold text-[#171A20] mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#FFF0F5] text-[#FF69B4]'
                        : 'bg-gray-100 text-gray-600 hover:bg-[#FFF0F5] hover:text-[#FF69B4]'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Popular Articles */}
            <motion.div 
              className="bg-white rounded-lg border border-gray-100 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-[#171A20] mb-4">Popular Articles</h3>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div key={index} className="pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="font-medium text-[#171A20] mb-1 text-sm">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {article.views} views
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div 
              className="bg-[#FF69B4] rounded-lg p-6 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm mb-4 text-white/90">
                Get the latest cross-border travel insights delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded text-[#171A20] text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full bg-white text-[#FF69B4] py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}