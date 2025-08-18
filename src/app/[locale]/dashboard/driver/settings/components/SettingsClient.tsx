'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface SettingsData {
  notifications: {
    tripRequests: boolean;
    earnings: boolean;
    messages: boolean;
    promotions: boolean;
    systemUpdates: boolean;
  };
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      enabled: boolean;
    };
  };
  security: {
    twoFactorAuth: boolean;
    lastPasswordChange: string;
    loginNotifications: boolean;
  };
  paymentMethods: Array<{
    id: string;
    type: string;
    name: string;
    accountNumber: string;
    isPrimary: boolean;
  }>;
  preferences: {
    language: string;
    currency: string;
    distanceUnit: string;
    theme: string;
  };
}

interface SettingsClientProps {
  initialSettings: SettingsData;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'working-hours' | 'security' | 'payment'>('notifications');
  const [settings, setSettings] = useState(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setHasChanges(true);
  };

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    // In production, this would make an API call
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Show success toast
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Save/Reset Actions */}
      {hasChanges && (
        <div className="bg-warning-amber/10 border border-warning-amber/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-warning-amber">⚠️</span>
              <span className="text-body-md font-medium text-charcoal">
                You have unsaved changes
              </span>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" size="sm" onClick={resetSettings}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={saveSettings}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'notifications', label: 'Notifications', icon: '🔔' },
          { id: 'working-hours', label: 'Working Hours', icon: '⏰' },
          { id: 'security', label: 'Security', icon: '🔐' },
          { id: 'payment', label: 'Payment', icon: '💳' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all',
              activeTab === tab.id
                ? 'bg-white shadow-sm text-hot-pink font-medium'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="tesla-card">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">Trip Notifications</h3>
            <div className="space-y-4">
              {[
                { key: 'tripRequests', label: 'New Trip Requests', description: 'Get notified when clients book trips' },
                { key: 'earnings', label: 'Earnings Updates', description: 'Payment confirmations and earnings reports' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-body-md font-medium text-charcoal">{item.label}</div>
                    <div className="text-body-sm text-gray-600">{item.description}</div>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key as keyof typeof settings.notifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.notifications[item.key as keyof typeof settings.notifications]
                        ? 'bg-hot-pink'
                        : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition',
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="tesla-card">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">System Notifications</h3>
            <div className="space-y-4">
              {[
                { key: 'messages', label: 'Messages', description: 'Client messages and support updates' },
                { key: 'promotions', label: 'Promotions', description: 'Special offers and bonus opportunities' },
                { key: 'systemUpdates', label: 'System Updates', description: 'App updates and maintenance notices' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-body-md font-medium text-charcoal">{item.label}</div>
                    <div className="text-body-sm text-gray-600">{item.description}</div>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key as keyof typeof settings.notifications)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.notifications[item.key as keyof typeof settings.notifications]
                        ? 'bg-hot-pink'
                        : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition',
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Working Hours Tab */}
      {activeTab === 'working-hours' && (
        <Card className="tesla-card">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Weekly Schedule</h3>
          <div className="space-y-4">
            {Object.entries(settings.workingHours).map(([day, schedule]) => (
              <div key={day} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateWorkingHours(day, 'enabled', !schedule.enabled)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        schedule.enabled ? 'bg-hot-pink' : 'bg-gray-300'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition',
                          schedule.enabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                    <h4 className="text-title-sm font-semibold text-charcoal capitalize">
                      {day}
                    </h4>
                  </div>
                  <div className={cn(
                    'px-3 py-1 rounded-full text-body-sm font-medium',
                    schedule.enabled 
                      ? 'bg-success-green/10 text-success-green' 
                      : 'bg-gray-100 text-gray-500'
                  )}>
                    {schedule.enabled ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {schedule.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <Input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-gray-700 mb-2">End Time</label>
                      <Input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="tesla-card">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <div className="text-body-md font-medium text-charcoal">Two-Factor Authentication</div>
                  <div className="text-body-sm text-gray-600">Extra security for your account</div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: !prev.security.twoFactorAuth }
                  }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.security.twoFactorAuth ? 'bg-hot-pink' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition',
                      settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <div className="text-body-md font-medium text-charcoal">Login Notifications</div>
                  <div className="text-body-sm text-gray-600">Get notified of new logins</div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, loginNotifications: !prev.security.loginNotifications }
                  }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    settings.security.loginNotifications ? 'bg-hot-pink' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition',
                      settings.security.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-title-md font-semibold text-charcoal mb-4">Password</h4>
              <div className="space-y-3">
                <div className="text-body-sm text-gray-600">
                  Last changed: {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                </div>
                <Button variant="secondary" size="sm">
                  Change Password
                </Button>
              </div>
            </div>
          </Card>

          <Card className="tesla-card">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">Privacy & Data</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-body-md font-semibold text-charcoal mb-2">Data Usage</h4>
                <p className="text-body-sm text-gray-600 mb-3">
                  Your data is used to provide better trip matching and improve our services.
                </p>
                <Button variant="secondary" size="sm">
                  View Privacy Policy
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-body-md font-semibold text-charcoal mb-2">Account Export</h4>
                <p className="text-body-sm text-gray-600 mb-3">
                  Download your account data and trip history.
                </p>
                <Button variant="secondary" size="sm">
                  Export Data
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <Card className="tesla-card">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">Payment Methods</h3>
            <div className="space-y-4">
              {settings.paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">
                        {method.type === 'bank' ? '🏦' : '📱'}
                      </span>
                    </div>
                    <div>
                      <div className="text-body-md font-semibold text-charcoal">{method.name}</div>
                      <div className="text-body-sm text-gray-600">{method.accountNumber}</div>
                      {method.isPrimary && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-hot-pink text-white">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!method.isPrimary && (
                      <Button variant="secondary" size="sm">
                        Set Primary
                      </Button>
                    )}
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="secondary" className="w-full">
                + Add Payment Method
              </Button>
            </div>
          </Card>

          <Card className="tesla-card">
            <h3 className="text-title-lg font-semibold text-charcoal mb-6">Payout Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Payout Frequency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Minimum Payout</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="100">HK$100</option>
                  <option value="500">HK$500</option>
                  <option value="1000">HK$1,000</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}