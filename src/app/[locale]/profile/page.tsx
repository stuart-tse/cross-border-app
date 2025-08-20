'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { UniversalProfileData, ActivityEntry, ProfileAction, SecuritySettings, NotificationSettings } from '@/types/profile';
import { UniversalProfile } from '@/components/profile/UniversalProfile';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data generator for development
const generateMockProfileData = (user: any, selectedRole: UserType): UniversalProfileData => {
  const mockActivityFeed: ActivityEntry[] = [
    {
      id: '1',
      type: 'LOGIN',
      title: 'Logged in from new device',
      description: 'Successfully logged in from Chrome on Windows',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      importance: 'LOW'
    },
    {
      id: '2',
      type: 'PROFILE_UPDATE',
      title: 'Updated profile information',
      description: 'Changed bio and added languages',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      importance: 'MEDIUM'
    },
    {
      id: '3',
      type: 'ACHIEVEMENT',
      title: 'Profile completion milestone',
      description: 'Reached 80% profile completion',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      importance: 'HIGH'
    }
  ];

  const mockQuickActions: ProfileAction[] = [
    {
      id: '1',
      action: 'edit-profile',
      label: 'Edit Profile',
      href: '/profile?edit=true',
      icon: '✏️',
      category: 'PROFILE',
      isPrimary: true
    },
    {
      id: '2',
      action: 'view-settings',
      label: 'Account Settings',
      href: '/profile/settings',
      icon: '⚙️',
      category: 'SETTINGS'
    },
    {
      id: '3',
      action: 'security',
      label: 'Security Settings',
      href: '/profile/security',
      icon: '🔒',
      category: 'SETTINGS'
    },
    {
      id: '4',
      action: 'dashboard',
      label: `${selectedRole} Dashboard`,
      href: `/dashboard/${selectedRole.toLowerCase()}`,
      icon: selectedRole === UserType.DRIVER ? '🚗' : selectedRole === UserType.BLOG_EDITOR ? '✍️' : selectedRole === UserType.ADMIN ? '👑' : '👤',
      category: 'PROFILE',
      requiresRole: [selectedRole]
    }
  ];

  const mockSecuritySettings: SecuritySettings = {
    twoFactorEnabled: false,
    smsAlerts: true,
    emailAlerts: true,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 120,
    allowedDevices: [],
    lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    securityQuestions: []
  };

  const mockNotificationSettings: NotificationSettings = {
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
      showPreview: true,
      categories: ['booking', 'security', 'updates']
    }
  };

  // Generate role-specific profile data
  let roleSpecificData = {};
  
  if (selectedRole === UserType.CLIENT) {
    roleSpecificData = {
      clientProfile: {
        membershipTier: 'BASIC' as const,
        loyaltyPoints: 1250,
        preferredVehicle: 'Sedan',
        travelPreferences: {
          preferredPickupTime: '09:00',
          preferredVehicleType: 'Sedan',
          climatePref: 'cool' as const,
          musicPref: false,
          communicationStyle: 'quiet' as const,
          routePreference: 'fastest' as const,
          specialRequests: ''
        },
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567890',
          relationship: 'Spouse',
          isPrimary: true
        },
        paymentMethods: [],
        tripHistory: [],
        totalTrips: 12,
        totalSpent: 2500,
        averageRating: 4.8,
        documentStatus: {
          passport: 'VERIFIED' as const,
          nationalId: 'VERIFIED' as const,
          proofOfAddress: 'PENDING' as const
        }
      }
    };
  }

  if (selectedRole === UserType.BLOG_EDITOR) {
    roleSpecificData = {
      editorProfile: {
        editorLevel: 'SENIOR' as const,
        specializations: ['Travel Guides', 'Cross-Border Transport', 'Tourism'],
        contentStats: {
          totalPosts: 45,
          publishedPosts: 38,
          draftPosts: 7,
          totalViews: 125000,
          totalShares: 3200,
          averageSeoScore: 87,
          topPerformingPost: 'Hong Kong to Shenzhen: Complete Guide',
          monthlyGrowth: 15,
          engagementRate: 8.5,
          contentCategories: [
            { category: 'Travel Guides', postCount: 20, views: 65000, avgRating: 4.7 },
            { category: 'Transport Tips', postCount: 12, views: 35000, avgRating: 4.5 },
            { category: 'Cultural Insights', postCount: 6, views: 25000, avgRating: 4.9 }
          ]
        },
        publishingRights: {
          canPublishDirectly: true,
          requiresReview: false,
          maxPostsPerDay: 5,
          allowedCategories: ['Travel Guides', 'Transport Tips', 'Cultural Insights', 'News'],
          canSchedulePosts: true,
          canEditOthersContent: false,
          canDeleteContent: false,
          canManageMedia: true
        },
        seoPreferences: {
          defaultKeywords: ['travel', 'hong kong', 'shenzhen', 'cross-border', 'transportation'],
          targetAudience: 'Business travelers and tourists',
          contentTone: 'PROFESSIONAL' as const,
          focusRegions: ['Hong Kong', 'Shenzhen', 'Guangzhou'],
          preferredPostLength: 'MEDIUM' as const,
          seoTools: ['Yoast SEO', 'Google Analytics'],
          autoOptimization: true
        },
        editorialTeam: 'Travel Content Team',
        contentCategories: ['Travel Guides', 'Transport Tips', 'Cultural Insights', 'News'],
        languageProficiency: [
          { language: 'English', level: 'NATIVE' as const, canWrite: true, canEdit: true, canTranslate: false },
          { language: 'Chinese', level: 'CONVERSATIONAL' as const, canWrite: false, canEdit: false, canTranslate: true }
        ],
        workflowPreferences: {
          preferredEditingTime: 'MORNING' as const,
          notificationFrequency: 'HOURLY' as const,
          collaborationStyle: 'COLLABORATIVE' as const,
          deadlineReminders: true,
          autoSaveDrafts: true,
          contentBackup: true
        },
        collaborationSettings: {
          allowComments: true,
          allowSuggestions: true,
          shareContentByDefault: false,
          allowGuestWriters: false,
          reviewWorkflow: 'PEER' as const,
          mentorshipRole: 'MENTOR' as const
        }
      }
    };
  }

  return {
    id: '1',
    userId: user.id,
    avatar: user.avatar,
    bio: 'Passionate about cross-border travel and connecting cultures through exceptional service.',
    phone: '+852-9876-5432',
    dateOfBirth: '1990-05-15',
    nationality: 'Hong Kong',
    languages: ['English', 'Cantonese', 'Mandarin'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Hong_Kong',
      newsletter: true
    },
    profileCompletion: 85,
    lastUpdated: new Date(),
    isPublic: true,
    user,
    roles: user.roles?.map((r: any) => r.role) || [selectedRole],
    activeRole: selectedRole,
    activityFeed: mockActivityFeed,
    recentActions: mockQuickActions,
    securitySettings: mockSecuritySettings,
    notificationSettings: mockNotificationSettings,
    ...roleSpecificData
  } as UniversalProfileData;
};

const ProfilePage: React.FC = () => {
  const { user, selectedRole } = useAuth();
  const [profileData, setProfileData] = useState<UniversalProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && selectedRole) {
      // In a real app, this would fetch from API
      // For now, generate mock data
      try {
        const mockData = generateMockProfileData(user, selectedRole);
        setProfileData(mockData);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile data generation error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, selectedRole]);

  const handleProfileUpdate = async (data: Partial<UniversalProfileData>) => {
    try {
      // In a real app, this would make an API call
      console.log('Updating profile:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (profileData) {
        setProfileData(prev => prev ? { ...prev, ...data } : null);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      // In a real app, this would upload to a file storage service
      console.log('Uploading avatar:', file.name);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock URL
      const mockUrl = URL.createObjectURL(file);
      
      // Update profile data
      if (profileData) {
        setProfileData(prev => prev ? { ...prev, avatar: mockUrl } : null);
      }
      
      return mockUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
    try {
      // In a real app, this would make an API call
      console.log('Changing password');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  };

  const handleSecurityUpdate = async (settings: any) => {
    try {
      // In a real app, this would make an API call
      console.log('Updating security settings:', settings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Security update failed:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-charcoal mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we load your information...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Unable to Load Profile
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'There was an issue loading your profile data.'}
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <UniversalProfile
      profile={profileData}
      onProfileUpdate={handleProfileUpdate}
      onAvatarUpload={handleAvatarUpload}
      onPasswordChange={handlePasswordChange}
      onSecurityUpdate={handleSecurityUpdate}
    />
  );
};

// Export with authentication wrapper for all user types
export default withAuth(ProfilePage, [UserType.CLIENT, UserType.DRIVER, UserType.BLOG_EDITOR, UserType.ADMIN]);