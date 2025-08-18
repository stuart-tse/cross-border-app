'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
      enabled ? 'bg-hot-pink' : 'bg-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
        enabled ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  className
}) => (
  <Card className={cn('p-6', className)}>
    <div className="mb-6">
      <h2 className="text-title-lg font-semibold text-charcoal">{title}</h2>
      {description && (
        <p className="text-body-md text-gray-600 mt-1">{description}</p>
      )}
    </div>
    {children}
  </Card>
);

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    bookingNotifications: boolean;
    paymentNotifications: boolean;
    promoNotifications: boolean;
    tripNotifications: boolean;
  };
  onChange: (key: string, value: boolean) => void;
  disabled?: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
  disabled = false
}) => (
  <SettingsSection
    title="Notification Preferences"
    description="Choose how you want to receive notifications"
  >
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-title-sm font-medium text-charcoal">Delivery Methods</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-body-md text-charcoal">Email Notifications</span>
              <p className="text-body-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Toggle
              enabled={settings.emailNotifications}
              onChange={(value) => onChange('emailNotifications', value)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-body-md text-charcoal">SMS Notifications</span>
              <p className="text-body-sm text-gray-600">Receive notifications via text message</p>
            </div>
            <Toggle
              enabled={settings.smsNotifications}
              onChange={(value) => onChange('smsNotifications', value)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-body-md text-charcoal">Push Notifications</span>
              <p className="text-body-sm text-gray-600">Receive notifications in your browser/app</p>
            </div>
            <Toggle
              enabled={settings.pushNotifications}
              onChange={(value) => onChange('pushNotifications', value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-title-sm font-medium text-charcoal mb-3">Notification Types</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-md text-charcoal">Booking Updates</span>
            <Toggle
              enabled={settings.bookingNotifications}
              onChange={(value) => onChange('bookingNotifications', value)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-md text-charcoal">Payment Confirmations</span>
            <Toggle
              enabled={settings.paymentNotifications}
              onChange={(value) => onChange('paymentNotifications', value)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-md text-charcoal">Trip Updates</span>
            <Toggle
              enabled={settings.tripNotifications}
              onChange={(value) => onChange('tripNotifications', value)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-md text-charcoal">Promotions & Offers</span>
            <Toggle
              enabled={settings.promoNotifications}
              onChange={(value) => onChange('promoNotifications', value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  </SettingsSection>
);

interface PrivacySettingsProps {
  settings: {
    shareDataForMarketing: boolean;
    shareLocationData: boolean;
    profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  };
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings,
  onChange,
  disabled = false
}) => (
  <SettingsSection
    title="Privacy & Data"
    description="Control how your data is used and shared"
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-body-md text-charcoal">Marketing Data Usage</span>
          <p className="text-body-sm text-gray-600">Allow us to use your data for marketing insights</p>
        </div>
        <Toggle
          enabled={settings.shareDataForMarketing}
          onChange={(value) => onChange('shareDataForMarketing', value)}
          disabled={disabled}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-body-md text-charcoal">Location Data Sharing</span>
          <p className="text-body-sm text-gray-600">Share location data for better service</p>
        </div>
        <Toggle
          enabled={settings.shareLocationData}
          onChange={(value) => onChange('shareLocationData', value)}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-body-md text-charcoal mb-2">Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => onChange('profileVisibility', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="PRIVATE">Private</option>
          <option value="FRIENDS">Friends Only</option>
          <option value="PUBLIC">Public</option>
        </select>
        <p className="text-body-sm text-gray-600 mt-1">
          Control who can see your profile information
        </p>
      </div>
    </div>
  </SettingsSection>
);

interface SecuritySettingsProps {
  settings: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    autoLogout: number;
  };
  onChange: (key: string, value: any) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  disabled?: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  settings,
  onChange,
  onChangePassword,
  disabled = false
}) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <SettingsSection
      title="Security Settings"
      description="Manage your account security preferences"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-body-md text-charcoal">Two-Factor Authentication</span>
            <p className="text-body-sm text-gray-600">Add an extra layer of security</p>
          </div>
          <Toggle
            enabled={settings.twoFactorEnabled}
            onChange={(value) => onChange('twoFactorEnabled', value)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-body-md text-charcoal">Biometric Authentication</span>
            <p className="text-body-sm text-gray-600">Use fingerprint or face recognition</p>
          </div>
          <Toggle
            enabled={settings.biometricEnabled}
            onChange={(value) => onChange('biometricEnabled', value)}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-body-md text-charcoal mb-2">Auto Logout</label>
          <select
            value={settings.autoLogout}
            onChange={(e) => onChange('autoLogout', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={0}>Never</option>
          </select>
          <p className="text-body-sm text-gray-600 mt-1">
            Automatically log out after inactivity
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-body-md text-charcoal">Password</span>
              <p className="text-body-sm text-gray-600">Change your account password</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              disabled={disabled}
            >
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-4 border-t border-gray-200"
            >
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                  className="bg-gradient-to-r from-hot-pink to-deep-pink"
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
};

interface AppPreferencesProps {
  settings: {
    language: string;
    timezone: string;
    currency: string;
    distanceUnit: string;
  };
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}

export const AppPreferences: React.FC<AppPreferencesProps> = ({
  settings,
  onChange,
  disabled = false
}) => (
  <SettingsSection
    title="App Preferences"
    description="Customize your app experience"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-body-sm font-medium text-charcoal mb-2">Language</label>
        <select
          value={settings.language}
          onChange={(e) => onChange('language', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="en">English</option>
          <option value="zh-cn">简体中文</option>
          <option value="zh-tw">繁體中文</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      <div>
        <label className="block text-body-sm font-medium text-charcoal mb-2">Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => onChange('timezone', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="Asia/Hong_Kong">Hong Kong Time</option>
          <option value="Asia/Shanghai">China Standard Time</option>
          <option value="Asia/Tokyo">Japan Standard Time</option>
          <option value="Asia/Seoul">Korea Standard Time</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <div>
        <label className="block text-body-sm font-medium text-charcoal mb-2">Currency</label>
        <select
          value={settings.currency}
          onChange={(e) => onChange('currency', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="HKD">Hong Kong Dollar (HKD)</option>
          <option value="CNY">Chinese Yuan (CNY)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="JPY">Japanese Yen (JPY)</option>
          <option value="KRW">Korean Won (KRW)</option>
        </select>
      </div>

      <div>
        <label className="block text-body-sm font-medium text-charcoal mb-2">Distance Unit</label>
        <select
          value={settings.distanceUnit}
          onChange={(e) => onChange('distanceUnit', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="km">Kilometers</option>
          <option value="miles">Miles</option>
        </select>
      </div>
    </div>
  </SettingsSection>
);