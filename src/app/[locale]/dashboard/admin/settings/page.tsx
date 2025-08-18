'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  payment: {
    baseFare: number;
    pricePerKm: number;
    pricePerMinute: number;
    surchargeWeekend: number;
    surchargeNight: number;
    cancellationFee: number;
  };
  features: {
    realTimeTracking: boolean;
    scheduleBookings: boolean;
    multipleStops: boolean;
    carSharingMode: boolean;
    loyaltyProgram: boolean;
  };
}

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would fetch from API
      // For now, using mock data
      const mockSettings: SystemSettings = {
        general: {
          siteName: 'CrossBorder Transportation',
          siteDescription: 'Professional cross-border transportation services between Hong Kong and Shenzhen',
          maintenanceMode: false,
          registrationEnabled: true,
          emailVerificationRequired: true
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: false,
          adminAlerts: true
        },
        security: {
          sessionTimeout: 30, // minutes
          passwordMinLength: 8,
          twoFactorRequired: false,
          ipWhitelist: ['127.0.0.1', '10.0.0.0/8']
        },
        payment: {
          baseFare: 50.00,
          pricePerKm: 8.50,
          pricePerMinute: 2.50,
          surchargeWeekend: 1.25,
          surchargeNight: 1.50,
          cancellationFee: 25.00
        },
        features: {
          realTimeTracking: true,
          scheduleBookings: true,
          multipleStops: true,
          carSharingMode: false,
          loyaltyProgram: true
        }
      };

      setSettings(mockSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;

    setSettings(prev => prev ? {
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    } : prev);
    
    setHasChanges(true);
  };

  const handleArrayChange = (section: keyof SystemSettings, field: string, value: string) => {
    if (!settings) return;

    const arrayValue = value.split('\n').filter(item => item.trim());
    handleSettingsChange(section, field, arrayValue);
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);

      // In production, this would call API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });

      console.log('Settings saved:', settings);
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'features', label: 'Features', icon: '🚀' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF69B4] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load settings</p>
          <Button onClick={loadSettings}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
              <p className="text-gray-600">Configure system-wide settings and preferences</p>
            </div>
            {hasChanges && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Settings Sections</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#FF69B4] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card>
              {/* General Settings */}
              {activeSection === 'general' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => handleSettingsChange('general', 'siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        rows={3}
                        value={settings.general.siteDescription}
                        onChange={(e) => handleSettingsChange('general', 'siteDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => handleSettingsChange('general', 'maintenanceMode', e.target.checked)}
                          className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Maintenance Mode</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.general.registrationEnabled}
                          onChange={(e) => handleSettingsChange('general', 'registrationEnabled', e.target.checked)}
                          className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow New User Registration</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.general.emailVerificationRequired}
                          onChange={(e) => handleSettingsChange('general', 'emailVerificationRequired', e.target.checked)}
                          className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require Email Verification</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingsChange('notifications', 'emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Email Notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingsChange('notifications', 'smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable SMS Notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingsChange('notifications', 'pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Push Notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.adminAlerts}
                        onChange={(e) => handleSettingsChange('notifications', 'adminAlerts', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Admin Alerts</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="50"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleSettingsChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorRequired}
                          onChange={(e) => handleSettingsChange('security', 'twoFactorRequired', e.target.checked)}
                          className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require Two-Factor Authentication</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IP Whitelist (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={settings.security.ipWhitelist.join('\n')}
                        onChange={(e) => handleArrayChange('security', 'ipWhitelist', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                        placeholder="127.0.0.1&#10;10.0.0.0/8"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeSection === 'payment' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Fare (HKD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payment.baseFare}
                        onChange={(e) => handleSettingsChange('payment', 'baseFare', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per KM (HKD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payment.pricePerKm}
                        onChange={(e) => handleSettingsChange('payment', 'pricePerKm', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Minute (HKD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payment.pricePerMinute}
                        onChange={(e) => handleSettingsChange('payment', 'pricePerMinute', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weekend Surcharge (multiplier)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payment.surchargeWeekend}
                        onChange={(e) => handleSettingsChange('payment', 'surchargeWeekend', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Night Surcharge (multiplier)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payment.surchargeNight}
                        onChange={(e) => handleSettingsChange('payment', 'surchargeNight', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Fee (HKD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payment.cancellationFee}
                        onChange={(e) => handleSettingsChange('payment', 'cancellationFee', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Settings */}
              {activeSection === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Feature Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.features.realTimeTracking}
                        onChange={(e) => handleSettingsChange('features', 'realTimeTracking', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Real-Time Tracking</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.features.scheduleBookings}
                        onChange={(e) => handleSettingsChange('features', 'scheduleBookings', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow Scheduled Bookings</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.features.multipleStops}
                        onChange={(e) => handleSettingsChange('features', 'multipleStops', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow Multiple Stops</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.features.carSharingMode}
                        onChange={(e) => handleSettingsChange('features', 'carSharingMode', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Car Sharing Mode</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.features.loyaltyProgram}
                        onChange={(e) => handleSettingsChange('features', 'loyaltyProgram', e.target.checked)}
                        className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Loyalty Program</span>
                    </label>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminSettingsPage, [UserType.ADMIN]);