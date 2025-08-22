import React, { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import ListManagementClient from './ListManagementClient';
import Link from 'next/link';

interface ListsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    listType?: string;
    search?: string;
  }>;
}

/**
 * Server Component for Dynamic Lists Management
 */
export default async function ListsPage({
  params,
  searchParams
}: ListsPageProps) {
  const { locale } = await params;
  const { listType = 'VEHICLE_FEATURES', search = '' } = await searchParams;

  const availableListTypes = [
    {
      key: 'VEHICLE_FEATURES',
      label: 'Vehicle Features',
      description: 'Features available in vehicles (AC, WiFi, etc.)',
      icon: '🚗',
      count: 12
    },
    {
      key: 'SPECIAL_EQUIPMENT',
      label: 'Special Equipment',
      description: 'Special equipment options (Child seats, wheelchair access, etc.)',
      icon: '🛡️',
      count: 8
    },
    {
      key: 'COLORS',
      label: 'Vehicle Colors',
      description: 'Available vehicle colors',
      icon: '🎨',
      count: 15
    },
    {
      key: 'FUEL_TYPES',
      label: 'Fuel Types',
      description: 'Types of fuel (Gasoline, Electric, Hybrid, etc.)',
      icon: '⛽',
      count: 6
    },
    {
      key: 'VEHICLE_MAKES',
      label: 'Vehicle Makes',
      description: 'Vehicle manufacturers and brands',
      icon: '🏭',
      count: 25
    },
    {
      key: 'VEHICLE_MODELS',
      label: 'Vehicle Models',
      description: 'Specific vehicle models by manufacturer',
      icon: '🚙',
      count: 156
    },
    {
      key: 'COUNTRIES',
      label: 'Countries',
      description: 'Service countries and regions',
      icon: '🌍',
      count: 8
    },
    {
      key: 'CITIES',
      label: 'Cities',
      description: 'Service cities and locations',
      icon: '🏙️',
      count: 42
    },
    {
      key: 'LANGUAGES',
      label: 'Languages',
      description: 'Supported languages',
      icon: '🗣️',
      count: 12
    },
    {
      key: 'CURRENCIES',
      label: 'Currencies',
      description: 'Supported currencies',
      icon: '💱',
      count: 5
    },
    {
      key: 'DOCUMENT_TYPES',
      label: 'Document Types',
      description: 'Types of documents for verification',
      icon: '📄',
      count: 18
    },
    {
      key: 'PAYMENT_METHODS',
      label: 'Payment Methods',
      description: 'Available payment options',
      icon: '💳',
      count: 9
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/admin/content`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-4"
          >
            ← Back to Content Management
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dynamic Lists Management</h1>
              <p className="text-gray-600">Manage dropdown options and dynamic content lists used throughout the application</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total List Items</div>
              <div className="text-2xl font-bold text-[#FF69B4]">316</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{availableListTypes.length}</div>
            <div className="text-sm text-gray-600">List Types</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {availableListTypes.reduce((sum, type) => sum + type.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">5</div>
            <div className="text-sm text-gray-600">Languages</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Updated Today</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* List Types Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">List Types</h2>
              <div className="space-y-2">
                {availableListTypes.map((type) => (
                  <Link
                    key={type.key}
                    href={`/${locale}/dashboard/admin/content/lists?listType=${type.key}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      listType === type.key
                        ? 'bg-[#FF69B4] text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{type.label}</div>
                        <div className={`text-xs truncate ${
                          listType === type.key ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {type.count} items
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ListManagementLoading />}>
              <ListManagementClient
                listType={listType}
                locale={locale}
                initialSearch={search}
                availableListTypes={availableListTypes}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading component for list management
 */
function ListManagementLoading() {
  return (
    <Card>
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </Card>
  );
}