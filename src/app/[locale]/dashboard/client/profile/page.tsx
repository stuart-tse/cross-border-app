'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { ProfileCard } from '@/components/client/ProfileCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SimpleToast } from '@/components/ui/SimpleToast';
import { cn } from '@/lib/utils';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  profile?: {
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    passportNumber?: string;
    emergencyContact?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    preferredVehicle?: string;
    specialRequests?: string;
    profileCompletion: number;
    documentVerified: boolean;
    loyaltyPoints: number;
    membershipTier: string;
  };
}

const ClientProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/client/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.user);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setToast({ type: 'error', message: 'Failed to load profile data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (formData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        updateUser(data.user);
        setToast({ type: 'success', message: 'Profile updated successfully' });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ type: 'error', message: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    const response = await fetch('/api/client/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const data = await response.json();
    
    // Update profile data with new avatar
    if (profileData) {
      const updatedProfile = { ...profileData, avatar: data.url };
      setProfileData(updatedProfile);
      updateUser(updatedProfile);
    }

    setToast({ type: 'success', message: 'Avatar updated successfully' });
    return data.url;
  };

  const getCompletionTips = (completion: number) => {
    const tips = [];
    if (!profileData?.phone) tips.push('Add your phone number');
    if (!profileData?.profile?.dateOfBirth) tips.push('Add your date of birth');
    if (!profileData?.profile?.emergencyContact) tips.push('Add an emergency contact');
    if (!profileData?.profile?.nationality) tips.push('Add your nationality');
    if (!profileData?.profile?.passportNumber) tips.push('Add your passport number');
    
    return tips;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-md text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-body-md text-error-red">Failed to load profile data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const completionTips = getCompletionTips(profileData.profile?.profileCompletion || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-headline-md font-bold text-charcoal mb-2">My Profile</h1>
          <p className="text-body-lg text-gray-600">
            Manage your personal information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <ProfileCard
              user={profileData}
              onSave={handleSaveProfile}
              onUploadAvatar={handleAvatarUpload}
              isLoading={isSaving}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Profile Completion */}
            <Card className="p-6">
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Profile Completion
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-body-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-charcoal">
                    {profileData.profile?.profileCompletion || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-hot-pink to-deep-pink h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${profileData.profile?.profileCompletion || 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {completionTips.length > 0 && (
                <div>
                  <h4 className="text-body-md font-medium text-charcoal mb-2">
                    Complete your profile:
                  </h4>
                  <ul className="space-y-1">
                    {completionTips.map((tip, index) => (
                      <li key={index} className="text-body-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-hot-pink rounded-full mr-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Membership & Loyalty */}
            <Card className="p-6">
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Membership Status
              </h3>
              
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-hot-pink to-deep-pink rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-lg font-bold">
                    {profileData.profile?.membershipTier?.charAt(0) || 'B'}
                  </span>
                </div>
                <h4 className="text-title-sm font-semibold text-charcoal capitalize">
                  {profileData.profile?.membershipTier?.toLowerCase() || 'Basic'} Member
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-600">Loyalty Points</span>
                  <span className="text-body-md font-semibold text-hot-pink">
                    {profileData.profile?.loyaltyPoints || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-gray-600">Member Since</span>
                  <span className="text-body-sm text-charcoal">
                    {new Date(profileData.profile?.profileCompletion ? '2024-01-01' : Date.now()).getFullYear()}
                  </span>
                </div>

                {profileData.profile?.documentVerified && (
                  <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <svg className="w-5 h-5 text-success-green mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-body-sm font-medium text-success-green">
                      Documents Verified
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-title-md font-semibold text-charcoal mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-gradient-to-r from-hot-pink to-deep-pink"
                  onClick={() => window.location.href = '/dashboard/client/payment-methods'}
                >
                  Manage Payment Methods
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard/client/settings'}
                >
                  Account Settings
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard/client/trips'}
                >
                  View Trip History
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

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

export default withAuth(ClientProfilePage, [UserType.CLIENT]);