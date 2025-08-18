'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  department?: string;
  position?: string;
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    department: '',
    position: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would fetch from API
      // For now, using mock data based on current user
      const mockProfile: AdminProfile = {
        id: user?.id || '1',
        name: user?.name || 'Administrator',
        email: user?.email || 'admin@crossborder.com',
        phone: '+852 9999 8888',
        bio: 'Senior system administrator with 5+ years of experience managing cross-border transportation platforms.',
        department: 'Operations',
        position: 'Senior Admin',
        permissions: [
          'USER_MANAGEMENT',
          'ANALYTICS_VIEW',
          'SYSTEM_SETTINGS',
          'CONTENT_MANAGEMENT',
          'FINANCIAL_REPORTS',
          'SUPPORT_MANAGEMENT'
        ],
        lastLogin: new Date(),
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      };

      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio || '',
        department: mockProfile.department || '',
        position: mockProfile.position || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // In production, this would call API
      // const response = await fetch('/api/admin/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Mock update
      setProfile(prev => prev ? {
        ...prev,
        ...formData,
        updatedAt: new Date()
      } : null);

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || '',
        bio: profile.bio || '',
        department: profile.department || '',
        position: profile.position || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF69B4] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <Button onClick={loadProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl py-8">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
              <p className="text-gray-600">Manage your administrator profile and settings</p>
            </div>
            {!isEditing && (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="text-center">
              {/* Avatar */}
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Basic Info */}
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-[#FF69B4] font-medium mb-2">{profile.position}</p>
              <p className="text-gray-600 text-sm mb-4">{profile.department}</p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 {profile.email}</p>
                {profile.phone && <p>📱 {profile.phone}</p>}
                <p>🕒 Last login: {profile.lastLogin?.toLocaleDateString()}</p>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {isEditing && (
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-500">{profile.email} (cannot be changed)</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      placeholder="+852 0000 0000"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      placeholder="Operations"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.department || 'Not specified'}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      placeholder="Senior Admin"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.position || 'Not specified'}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Permissions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.permissions.map((permission) => (
                  <div key={permission} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-green-800 font-medium">
                      {permission.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Created:</span>
                  <span className="font-medium">{profile.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{profile.updatedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium">{profile.lastLogin?.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminProfilePage, [UserType.ADMIN]);