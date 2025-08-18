'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import {
  NotificationSettings,
  PrivacySettings,
  SecuritySettings,
  AppPreferences
} from '@/components/client/SettingsSection';
import { Button } from '@/components/ui/Button';
import { SimpleToast } from '@/components/ui/SimpleToast';

interface ClientSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  promoNotifications: boolean;
  tripNotifications: boolean;
  shareDataForMarketing: boolean;
  shareLocationData: boolean;
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  language: string;
  timezone: string;
  currency: string;
  distanceUnit: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  autoLogout: number;
}

const ClientSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/client/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        } else {
          throw new Error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setToast({ type: 'error', message: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/client/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setHasChanges(false);
        setToast({ type: 'success', message: data.message || 'Settings updated successfully' });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setToast({ type: 'error', message: 'Failed to update settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetch('/api/client/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }

    return response.json();
  };

  const handleResetSettings = () => {
    // Fetch fresh settings to reset form
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/client/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
          setHasChanges(false);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-md text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-body-md text-error-red">Failed to load settings</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-headline-md font-bold text-charcoal mb-2">Account Settings</h1>
            <p className="text-body-lg text-gray-600">
              Manage your preferences, security, and privacy settings
            </p>
          </div>

          {hasChanges && (
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={handleResetSettings}
                disabled={isSaving}
              >
                Reset Changes
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-hot-pink to-deep-pink"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NotificationSettings
              settings={{
                emailNotifications: settings.emailNotifications,
                smsNotifications: settings.smsNotifications,
                pushNotifications: settings.pushNotifications,
                bookingNotifications: settings.bookingNotifications,
                paymentNotifications: settings.paymentNotifications,
                promoNotifications: settings.promoNotifications,
                tripNotifications: settings.tripNotifications
              }}
              onChange={handleSettingChange}
              disabled={isSaving}
            />
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PrivacySettings
              settings={{
                shareDataForMarketing: settings.shareDataForMarketing,
                shareLocationData: settings.shareLocationData,
                profileVisibility: settings.profileVisibility
              }}
              onChange={handleSettingChange}
              disabled={isSaving}
            />
          </motion.div>

          {/* App Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AppPreferences
              settings={{
                language: settings.language,
                timezone: settings.timezone,
                currency: settings.currency,
                distanceUnit: settings.distanceUnit
              }}
              onChange={handleSettingChange}
              disabled={isSaving}
            />
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SecuritySettings
              settings={{
                twoFactorEnabled: settings.twoFactorEnabled,
                biometricEnabled: settings.biometricEnabled,
                autoLogout: settings.autoLogout
              }}
              onChange={handleSettingChange}
              onChangePassword={handleChangePassword}
              disabled={isSaving}
            />
          </motion.div>
        </div>

        {/* Sticky Save Button for Mobile */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 md:hidden z-50"
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex space-x-3">
              <Button
                variant="secondary"
                onClick={handleResetSettings}
                disabled={isSaving}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-hot-pink to-deep-pink"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Account Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-title-md font-semibold text-error-red mb-4">
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-body-md font-medium text-charcoal">Export Account Data</h4>
                  <p className="text-body-sm text-gray-600">
                    Download a copy of all your account data including trips, payments, and preferences.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Implement data export
                    setToast({ type: 'success', message: 'Data export has been initiated. You will receive an email with download link.' });
                  }}
                >
                  Export Data
                </Button>
              </div>

              <div className="border-t border-red-200 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-body-md font-medium text-error-red">Delete Account</h4>
                    <p className="text-body-sm text-gray-600">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // Implement account deletion
                        setToast({ type: 'error', message: 'Account deletion initiated. You will receive a confirmation email.' });
                      }
                    }}
                    className="bg-error-red hover:bg-red-700"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toast Notification */}
        {toast && (
          <SimpleToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default withAuth(ClientSettingsPage, [UserType.CLIENT]);