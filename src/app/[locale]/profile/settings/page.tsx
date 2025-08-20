'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import Link from 'next/link';
import { ArrowLeft, Bell, Shield, Eye, Globe, Moon, Sun, Smartphone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  email: {
    marketing: boolean;
    transactional: boolean;
    security: boolean;
    updates: boolean;
    newsletter: boolean;
    frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  };
  sms: {
    bookingUpdates: boolean;
    emergencyAlerts: boolean;
    paymentConfirmations: boolean;
    securityAlerts: boolean;
    promotions: boolean;
  };
  push: {
    enabled: boolean;
    booking: boolean;
    messages: boolean;
    promotions: boolean;
    updates: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    showPreview: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONTACTS_ONLY';
  showEmail: boolean;
  showPhone: boolean;
  showActivity: boolean;
  allowContact: boolean;
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'zh-CN' | 'zh-TW';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  currency: 'HKD' | 'CNY' | 'USD';
}

type SettingTab = 'notifications' | 'privacy' | 'appearance' | 'account';

const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingTab>('notifications');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      marketing: false,
      transactional: true,
      security: true,
      updates: true,
      newsletter: false,
      frequency: 'IMMEDIATE'
    },
    sms: {
      bookingUpdates: true,
      emergencyAlerts: true,
      paymentConfirmations: true,
      securityAlerts: true,
      promotions: false
    },
    push: {
      enabled: true,
      booking: true,
      messages: true,
      promotions: false,
      updates: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    inApp: {
      enabled: true,
      sound: true,
      vibration: false,
      showPreview: true
    }
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showPhone: false,
    showActivity: true,
    allowContact: true,
    dataSharing: false,
    analytics: true,
    marketing: false
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Hong_Kong',
    dateFormat: 'DD/MM/YYYY',
    currency: 'HKD'
  });

  const updateNotificationSetting = (section: keyof NotificationSettings, key: string, value: any) => {
    setNotifications(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const updateAppearanceSetting = (key: keyof AppearanceSettings, value: any) => {
    setAppearance(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-hot-pink/10 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-hot-pink" />
            </div>
            <div>
              <h3 className="text-title-lg font-semibold text-charcoal">Email Notifications</h3>
              <p className="text-sm text-gray-600">Manage what emails you receive from us</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Transactional Emails</div>
                <div className="text-sm text-gray-600">Booking confirmations, receipts, and important updates</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email.transactional}
                  onChange={(e) => updateNotificationSetting('email', 'transactional', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Security Alerts</div>
                <div className="text-sm text-gray-600">Login attempts, password changes, and security updates</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email.security}
                  onChange={(e) => updateNotificationSetting('email', 'security', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Product Updates</div>
                <div className="text-sm text-gray-600">New features, improvements, and service announcements</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email.updates}
                  onChange={(e) => updateNotificationSetting('email', 'updates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Marketing Emails</div>
                <div className="text-sm text-gray-600">Promotions, travel tips, and special offers</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email.marketing}
                  onChange={(e) => updateNotificationSetting('email', 'marketing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-charcoal">Email Frequency</div>
              </div>
              <select
                value={notifications.email.frequency}
                onChange={(e) => updateNotificationSetting('email', 'frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
              >
                <option value="IMMEDIATE">Immediate</option>
                <option value="DAILY">Daily Digest</option>
                <option value="WEEKLY">Weekly Summary</option>
                <option value="MONTHLY">Monthly Roundup</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-electric-blue/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-electric-blue" />
            </div>
            <div>
              <h3 className="text-title-lg font-semibold text-charcoal">Push Notifications</h3>
              <p className="text-sm text-gray-600">Manage notifications on your devices</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Enable Push Notifications</div>
                <div className="text-sm text-gray-600">Receive notifications on your device</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push.enabled}
                  onChange={(e) => updateNotificationSetting('push', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            {notifications.push.enabled && (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-charcoal">Booking Updates</div>
                    <div className="text-sm text-gray-600">Trip confirmations and status changes</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push.booking}
                      onChange={(e) => updateNotificationSetting('push', 'booking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-charcoal">Quiet Hours</div>
                      <div className="text-sm text-gray-600">Don't disturb during these hours</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push.quietHours.enabled}
                        onChange={(e) => updateNotificationSetting('push', 'quietHours', {
                          ...notifications.push.quietHours,
                          enabled: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                    </label>
                  </div>

                  {notifications.push.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">From</label>
                        <Input
                          type="time"
                          value={notifications.push.quietHours.start}
                          onChange={(e) => updateNotificationSetting('push', 'quietHours', {
                            ...notifications.push.quietHours,
                            start: e.target.value
                          })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">To</label>
                        <Input
                          type="time"
                          value={notifications.push.quietHours.end}
                          onChange={(e) => updateNotificationSetting('push', 'quietHours', {
                            ...notifications.push.quietHours,
                            end: e.target.value
                          })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-warning-amber/10 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-warning-amber" />
            </div>
            <div>
              <h3 className="text-title-lg font-semibold text-charcoal">Privacy Settings</h3>
              <p className="text-sm text-gray-600">Control your privacy and data sharing preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <div className="font-medium text-charcoal">Profile Visibility</div>
                <div className="text-sm text-gray-600">Who can see your profile information</div>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
              >
                <option value="PUBLIC">Public - Anyone can see</option>
                <option value="CONTACTS_ONLY">Contacts Only</option>
                <option value="PRIVATE">Private - Only me</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Show Email Address</div>
                <div className="text-sm text-gray-600">Display your email on your public profile</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={(e) => updatePrivacySetting('showEmail', e.target.checked)}
                  className="sr-only peer"
                  disabled={privacy.profileVisibility === 'PRIVATE'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink peer-disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Allow Contact</div>
                <div className="text-sm text-gray-600">Let other users contact you through the platform</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.allowContact}
                  onChange={(e) => updatePrivacySetting('allowContact', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Data Analytics</div>
                <div className="text-sm text-gray-600">Help improve our services with anonymous usage data</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.analytics}
                  onChange={(e) => updatePrivacySetting('analytics', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success-green/10 rounded-full flex items-center justify-center">
              {appearance.theme === 'dark' ? <Moon className="w-5 h-5 text-success-green" /> : <Sun className="w-5 h-5 text-success-green" />}
            </div>
            <div>
              <h3 className="text-title-lg font-semibold text-charcoal">Appearance</h3>
              <p className="text-sm text-gray-600">Customize how the app looks and behaves</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <div className="font-medium text-charcoal">Theme</div>
                <div className="text-sm text-gray-600">Choose your preferred color scheme</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'light', label: 'Light', icon: Sun },
                  { key: 'dark', label: 'Dark', icon: Moon },
                  { key: 'auto', label: 'Auto', icon: Globe }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => updateAppearanceSetting('theme', key)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                      appearance.theme === key
                        ? 'border-hot-pink bg-hot-pink/5 text-hot-pink'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <div className="font-medium text-charcoal">Language</div>
                <div className="text-sm text-gray-600">Choose your preferred language</div>
              </div>
              <select
                value={appearance.language}
                onChange={(e) => updateAppearanceSetting('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
              >
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <div className="font-medium text-charcoal">Date Format</div>
                <div className="text-sm text-gray-600">Choose how dates are displayed</div>
              </div>
              <select
                value={appearance.dateFormat}
                onChange={(e) => updateAppearanceSetting('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <div className="font-medium text-charcoal">Currency</div>
                <div className="text-sm text-gray-600">Preferred currency for pricing</div>
              </div>
              <select
                value={appearance.currency}
                onChange={(e) => updateAppearanceSetting('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
              >
                <option value="HKD">Hong Kong Dollar (HKD)</option>
                <option value="CNY">Chinese Yuan (CNY)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Account Management</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-charcoal mb-2">Change Password</h4>
              <p className="text-sm text-gray-600 mb-4">Keep your account secure with a strong password</p>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-charcoal mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="p-4 bg-warning-amber/5 border border-warning-amber/20 rounded-lg">
              <h4 className="font-medium text-warning-amber mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data</p>
              <Button variant="danger" size="sm">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'appearance': return renderAppearanceSettings();
      case 'account': return renderAccountSettings();
      default: return renderNotificationSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
              <h1 className="text-3xl font-bold text-charcoal">Settings</h1>
              <p className="text-gray-600">Manage your account preferences and privacy settings</p>
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
                { key: 'notifications', label: 'Notifications', icon: Bell },
                { key: 'privacy', label: 'Privacy', icon: Shield },
                { key: 'appearance', label: 'Appearance', icon: Sun },
                { key: 'account', label: 'Account', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as SettingTab)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200',
                    activeTab === key
                      ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-md'
                      : 'text-gray-600 hover:text-charcoal hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </motion.div>

        {/* Unsaved Changes Warning */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-warning-amber/20 bg-warning-amber/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-warning-amber text-xl">⚠️</span>
                      <div>
                        <h4 className="text-sm font-medium text-warning-amber">Unsaved Changes</h4>
                        <p className="text-xs text-gray-600">You have unsaved changes. Don't forget to save them.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHasChanges(false)}
                      >
                        Discard
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isLoading}
                        onClick={handleSave}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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

export default withAuth(ProfileSettingsPage, [UserType.CLIENT, UserType.DRIVER, UserType.BLOG_EDITOR, UserType.ADMIN]);