import React, { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface AdminContentPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Server Component for Admin Content Management
 */
export default async function AdminContentPage({
  params
}: AdminContentPageProps) {
  const { locale } = await params;

  const contentSections = [
    {
      title: 'Website Content',
      description: 'Manage page content, headings, and text throughout the application',
      icon: '📄',
      href: `/${locale}/dashboard/admin/content/website`,
      stats: { items: 45, updated: '2 hours ago' }
    },
    {
      title: 'Dynamic Lists',
      description: 'Manage dropdown options, vehicle features, equipment, and other lists',
      icon: '📋',
      href: `/${locale}/dashboard/admin/content/lists`,
      stats: { items: 128, updated: '1 day ago' }
    },
    {
      title: 'Application Settings',
      description: 'Configure system settings, pricing rules, and feature flags',
      icon: '⚙️',
      href: `/${locale}/dashboard/admin/content/settings`,
      stats: { items: 23, updated: '3 hours ago' }
    },
    {
      title: 'Locations & Routes',
      description: 'Manage service locations, routes, and geographic data',
      icon: '🗺️',
      href: `/${locale}/dashboard/admin/content/locations`,
      stats: { items: 67, updated: '5 hours ago' }
    },
    {
      title: 'Pricing Rules',
      description: 'Configure dynamic pricing, surcharges, and promotional rules',
      icon: '💰',
      href: `/${locale}/dashboard/admin/content/pricing`,
      stats: { items: 12, updated: '1 hour ago' }
    },
    {
      title: 'Email Templates',
      description: 'Manage email templates for notifications and communications',
      icon: '📧',
      href: `/${locale}/dashboard/admin/content/templates`,
      stats: { items: 18, updated: '6 hours ago' }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/admin`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-4"
          >
            ← Back to Admin Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
              <p className="text-gray-600">Manage all dynamic content, settings, and configuration data</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Content Items</div>
              <div className="text-2xl font-bold text-[#FF69B4]">293</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">45</div>
            <div className="text-sm text-gray-600">Website Content</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">128</div>
            <div className="text-sm text-gray-600">Dynamic Lists</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">23</div>
            <div className="text-sm text-gray-600">Settings</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#FF69B4] mb-1">97</div>
            <div className="text-sm text-gray-600">Locations & Routes</div>
          </Card>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentSections.map((section, index) => (
            <Link key={index} href={section.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#FF69B4] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      {section.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{section.stats.items} items</span>
                      <span>Updated {section.stats.updated}</span>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-[#FF69B4] transition-colors">
                    →
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Content Updates</h2>
          <div className="space-y-3">
            {[
              { content: 'Vehicle Features list updated', user: 'Admin User', time: '2 hours ago', type: 'lists' },
              { content: 'Pricing rules for cross-border trips', user: 'System Admin', time: '3 hours ago', type: 'pricing' },
              { content: 'Welcome email template revised', user: 'Content Manager', time: '5 hours ago', type: 'templates' },
              { content: 'New service location added: Macau', user: 'Admin User', time: '1 day ago', type: 'locations' },
              { content: 'Homepage hero section content updated', user: 'Content Manager', time: '2 days ago', type: 'website' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    activity.type === 'lists' ? 'bg-blue-500' :
                    activity.type === 'pricing' ? 'bg-green-500' :
                    activity.type === 'templates' ? 'bg-purple-500' :
                    activity.type === 'locations' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}>
                    {activity.type === 'lists' ? '📋' :
                     activity.type === 'pricing' ? '💰' :
                     activity.type === 'templates' ? '📧' :
                     activity.type === 'locations' ? '🗺️' :
                     '📄'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.content}</p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}