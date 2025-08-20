'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, BaseCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { updateDriverSettings, type DriverSettingsUpdateState } from '@/app/actions/driver';

interface DriverSettings {
  notifications: {
    tripRequests: boolean;
    tripUpdates: boolean;
    soundAlerts: boolean;
    paymentConfirmations: boolean;
    weeklySummary: boolean;
  };
  workingHours: {
    isOnline: boolean;
    schedule: Array<{
      day: string;
      enabled: boolean;
      startTime: string;
      endTime: string;
    }>;
    autoOffline: boolean;
    breakReminders: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    locationTracking: boolean;
    shareProfile: boolean;
  };
}

interface SettingsFormProps {
  initialSettings: DriverSettings;
  onSettingsUpdate?: (settings: DriverSettings) => void;
}

export default function SettingsForm({ initialSettings, onSettingsUpdate }: SettingsFormProps) {
  const [settings, setSettings] = useState<DriverSettings>(initialSettings);
  const [settingsState, settingsAction] = useActionState(
    updateDriverSettings,
    undefined
  );

  const handleSettingToggle = (category: keyof DriverSettings, setting: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    };
    setSettings(newSettings);
    onSettingsUpdate?.(newSettings);
  };

  const handleScheduleUpdate = (dayIndex: number, updates: Partial<DriverSettings['workingHours']['schedule'][0]>) => {
    const newSchedule = [...settings.workingHours.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], ...updates };
    
    const newSettings = {
      ...settings,
      workingHours: {
        ...settings.workingHours,
        schedule: newSchedule
      }
    };
    setSettings(newSettings);
    onSettingsUpdate?.(newSettings);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    settingsAction(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notification Settings */}
      <BaseCard>
        <h3 className="text-title-lg font-semibold text-charcoal mb-6">Notification Preferences</h3>
        
        <div className="space-y-6">
          {/* Trip Notifications */}
          <div>
            <h4 className="text-title-md font-semibold text-charcoal mb-4">Trip Notifications</h4>
            <div className="space-y-4">
              {[
                { key: 'tripRequests', label: 'New trip requests', description: 'Get notified when new trips are available', checked: settings.notifications.tripRequests },
                { key: 'tripUpdates', label: 'Trip updates', description: 'Updates about accepted trips', checked: settings.notifications.tripUpdates },
                { key: 'soundAlerts', label: 'Sound alerts', description: 'Audio notifications for urgent requests', checked: settings.notifications.soundAlerts }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-body-md font-medium">{setting.label}</div>
                    <div className="text-body-sm text-gray-600">{setting.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name={`notifications.${setting.key}`}
                      checked={setting.checked}
                      onChange={(e) => handleSettingToggle('notifications', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings Notifications */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-title-md font-semibold text-charcoal mb-4">Earnings & Payments</h4>
            <div className="space-y-4">
              {[
                { key: 'paymentConfirmations', label: 'Payment confirmations', description: 'When payments are processed', checked: settings.notifications.paymentConfirmations },
                { key: 'weeklySummary', label: 'Weekly earnings summary', description: 'Summary of weekly performance', checked: settings.notifications.weeklySummary }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-body-md font-medium">{setting.label}</div>
                    <div className="text-body-sm text-gray-600">{setting.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name={`notifications.${setting.key}`}
                      checked={setting.checked}
                      onChange={(e) => handleSettingToggle('notifications', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Working Hours */}
      <BaseCard>
        <h3 className="text-title-lg font-semibold text-charcoal mb-6">Working Hours & Availability</h3>
        
        <div className="space-y-6">
          {/* Weekly Schedule */}
          <div>
            <h4 className="text-title-md font-semibold text-charcoal mb-4">Weekly Schedule</h4>
            <div className="space-y-3">
              {settings.workingHours.schedule.map((daySchedule, index) => (
                <div key={daySchedule.day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      name={`workingHours.schedule[${index}].enabled`}
                      checked={daySchedule.enabled}
                      className="mr-3 text-hot-pink"
                      onChange={(e) => handleScheduleUpdate(index, { enabled: e.target.checked })}
                    />
                    <span className="text-body-md font-medium">{daySchedule.day}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select 
                      name={`workingHours.schedule[${index}].startTime`}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={daySchedule.startTime}
                      onChange={(e) => handleScheduleUpdate(index, { startTime: e.target.value })}
                      disabled={!daySchedule.enabled}
                    >
                      {Array.from({length: 24}, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                      })}
                    </select>
                    <span className="text-gray-500">to</span>
                    <select 
                      name={`workingHours.schedule[${index}].endTime`}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={daySchedule.endTime}
                      onChange={(e) => handleScheduleUpdate(index, { endTime: e.target.value })}
                      disabled={!daySchedule.enabled}
                    >
                      {Array.from({length: 24}, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return <option key={i} value={`${hour}:00`}>{hour}:00</option>;
                      })}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-offline Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-title-md font-semibold text-charcoal mb-4">Auto-offline Settings</h4>
            <div className="space-y-4">
              {[
                { key: 'autoOffline', label: 'Go offline after work hours', description: 'Automatically stop receiving requests', checked: settings.workingHours.autoOffline },
                { key: 'breakReminders', label: 'Break reminders', description: 'Remind to take breaks after 4 hours', checked: settings.workingHours.breakReminders }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-body-md font-medium">{setting.label}</div>
                    <div className="text-body-sm text-gray-600">{setting.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name={`workingHours.${setting.key}`}
                      checked={setting.checked}
                      onChange={(e) => handleSettingToggle('workingHours', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Security Settings */}
      <BaseCard>
        <h3 className="text-title-lg font-semibold text-charcoal mb-6">Security & Privacy</h3>
        
        <div className="space-y-6">
          {/* Privacy Settings */}
          <div>
            <h4 className="text-title-md font-semibold text-charcoal mb-4">Privacy Settings</h4>
            <div className="space-y-4">
              {[
                { key: 'locationTracking', label: 'Location tracking', description: 'Allow location tracking during trips', checked: settings.security.locationTracking },
                { key: 'shareProfile', label: 'Share profile with clients', description: 'Show your name and rating to clients', checked: settings.security.shareProfile }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-body-md font-medium">{setting.label}</div>
                    <div className="text-body-sm text-gray-600">{setting.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name={`security.${setting.key}`}
                      checked={setting.checked}
                      onChange={(e) => handleSettingToggle('security', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Status Messages */}
      {settingsState?.message && (
        <div className={cn(
          'p-4 rounded-lg',
          settingsState.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {settingsState.message}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          type="submit"
          className="bg-hot-pink hover:bg-deep-pink font-medium"
          isLoading={settingsState?.success === undefined && settingsState !== undefined}
        >
          Save All Changes
        </Button>
      </div>
    </form>
  );
}