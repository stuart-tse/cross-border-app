'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import SettingsClient from './components/SettingsClient';
import { withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';

// Client Component for fetching settings data
function getDriverSettings() {
  // This would typically fetch from your API
  return {
    notifications: {
      tripRequests: true,
      earnings: true,
      messages: false,
      promotions: false,
      systemUpdates: true,
    },
    workingHours: {
      monday: { start: '09:00', end: '18:00', enabled: true },
      tuesday: { start: '09:00', end: '18:00', enabled: true },
      wednesday: { start: '09:00', end: '18:00', enabled: true },
      thursday: { start: '09:00', end: '18:00', enabled: true },
      friday: { start: '09:00', end: '18:00', enabled: true },
      saturday: { start: '10:00', end: '16:00', enabled: false },
      sunday: { start: '10:00', end: '16:00', enabled: false },
    },
    security: {
      twoFactorAuth: false,
      lastPasswordChange: '2024-01-01',
      loginNotifications: true,
    },
    paymentMethods: [
      {
        id: '1',
        type: 'bank',
        name: 'HSBC Hong Kong',
        accountNumber: '***-***-1234',
        isPrimary: true,
      },
      {
        id: '2',
        type: 'digital',
        name: 'Alipay HK',
        accountNumber: '***-***-5678',
        isPrimary: false,
      },
    ],
    preferences: {
      language: 'en',
      currency: 'HKD',
      distanceUnit: 'km',
      theme: 'light',
    },
  };
}

function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const settings = getDriverSettings();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/driver"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Driver Settings</h1>
              <p className="text-gray-600">Manage your notifications, working hours, security, and payment preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content - Client Component for interactivity */}
        <Suspense fallback={<SettingsLoading />}>
          <SettingsClient initialSettings={settings} />
        </Suspense>
      </div>
    </div>
  );
}

// Export the protected version of the component
export default withAuth(SettingsPage, [UserType.DRIVER]);