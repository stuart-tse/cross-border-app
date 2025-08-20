'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalProfileData } from '@/types/profile';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs, ProfileTabType } from './ProfileTabs';
import { ProfileOverview } from './tabs/ProfileOverview';
import { ProfilePersonal } from './tabs/ProfilePersonal';
import { ProfileActivity } from './tabs/ProfileActivity';
import { ProfileSettings } from './tabs/ProfileSettings';
import { ProfileSecurity } from './tabs/ProfileSecurity';
import { ClientProfileTab } from './tabs/ClientProfileTab';
import { DriverProfileTab } from './tabs/DriverProfileTab';
import { EditorProfileTab } from './tabs/EditorProfileTab';
import { AdminProfileTab } from './tabs/AdminProfileTab';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface UniversalProfileProps {
  profile: UniversalProfileData;
  onProfileUpdate?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onAvatarUpload?: (file: File) => Promise<string>;
  onPasswordChange?: (oldPassword: string, newPassword: string) => Promise<void>;
  onSecurityUpdate?: (settings: any) => Promise<void>;
  className?: string;
}

export const UniversalProfile: React.FC<UniversalProfileProps> = ({
  profile,
  onProfileUpdate,
  onAvatarUpload,
  onPasswordChange,
  onSecurityUpdate,
  className
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleTabChange = (tab: ProfileTabType) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave this tab?')) {
        return;
      }
      setHasUnsavedChanges(false);
      setIsEditing(false);
    }
    setActiveTab(tab);
  };

  const handleEditToggle = () => {
    if (isEditing && hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel editing?')) {
        return;
      }
      setHasUnsavedChanges(false);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (data: Partial<UniversalProfileData>) => {
    if (!onProfileUpdate) return;
    
    setIsLoading(true);
    try {
      await onProfileUpdate(data);
      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = () => {
    setHasUnsavedChanges(true);
  };

  const getTabContent = () => {
    const tabProps = {
      profile,
      isEditing,
      onSave: handleSave,
      onCancel: () => {
        setIsEditing(false);
        setHasUnsavedChanges(false);
      },
      onChange: handleDataChange,
      isLoading
    };

    switch (activeTab) {
      case 'overview':
        return <ProfileOverview {...tabProps} />;
      
      case 'personal':
        return <ProfilePersonal {...tabProps} />;
      
      case 'activity':
        return <ProfileActivity {...tabProps} />;
      
      case 'settings':
        return <ProfileSettings {...tabProps} />;
      
      case 'security':
        return (
          <ProfileSecurity 
            {...tabProps} 
            onPasswordChange={onPasswordChange}
            onSecurityUpdate={onSecurityUpdate}
          />
        );
      
      case 'client':
        return profile.clientProfile ? <ClientProfileTab {...tabProps} /> : null;
      
      case 'driver':
        return profile.driverProfile ? <DriverProfileTab {...tabProps} /> : null;
      
      case 'editor':
        return profile.editorProfile ? <EditorProfileTab {...tabProps} /> : null;
      
      case 'admin':
        return profile.adminProfile ? <AdminProfileTab {...tabProps} /> : null;
      
      default:
        return <ProfileOverview {...tabProps} />;
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 py-8', className)}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ProfileHeader
            profile={profile}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
            onAvatarUpload={onAvatarUpload}
          />
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ProfileTabs
            profile={profile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </motion.div>

        {/* Unsaved Changes Warning */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-warning-amber/20 bg-warning-amber/5">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-warning-amber text-xl">⚠️</span>
                    <div>
                      <h4 className="text-sm font-medium text-warning-amber">
                        Unsaved Changes
                      </h4>
                      <p className="text-xs text-gray-600">
                        You have unsaved changes. Save your changes to keep them.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setHasUnsavedChanges(false);
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isLoading}
                      onClick={() => handleSave(profile)}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
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

        {/* Floating Action Button (Mobile) */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-6 right-6 md:hidden z-50"
            >
              <div className="flex flex-col gap-2">
                {hasUnsavedChanges && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full w-14 h-14 shadow-lg"
                    onClick={() => handleSave(profile)}
                    isLoading={isLoading}
                  >
                    ✓
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-14 h-14 shadow-lg"
                  onClick={handleEditToggle}
                >
                  ✕
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};