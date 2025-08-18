'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
    profileCompletion: number;
    documentVerified: boolean;
  };
}

interface ProfileCardProps {
  user: ProfileData;
  onSave: (data: any) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
  isLoading?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onSave,
  onUploadAvatar,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    dateOfBirth: user.profile?.dateOfBirth || '',
    gender: user.profile?.gender || '',
    nationality: user.profile?.nationality || '',
    passportNumber: user.profile?.passportNumber || '',
    emergencyContact: user.profile?.emergencyContact || '',
    emergencyContactPhone: user.profile?.emergencyContactPhone || '',
    emergencyContactRelation: user.profile?.emergencyContactRelation || ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleSave = async () => {
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      await onUploadAvatar(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-success-green';
    if (completion >= 50) return 'text-warning-amber';
    return 'text-error-red';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 bg-hot-pink rounded-full p-2 cursor-pointer hover:bg-deep-pink transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-title-lg font-semibold text-charcoal">{user.name}</h2>
            <p className="text-body-md text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className={cn('text-body-sm font-medium', getCompletionColor(user.profile?.profileCompletion || 0))}>
                Profile {user.profile?.profileCompletion || 0}% Complete
              </div>
              {user.profile?.documentVerified && (
                <div className="flex items-center text-success-green text-body-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          variant={isEditing ? "secondary" : "primary"}
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-hot-pink to-deep-pink h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${user.profile?.profileCompletion || 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-body-sm text-gray-500 mt-2">
          Complete your profile to unlock all features
        </p>
      </div>

      {/* Profile Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={isEditing ? formData.name : user.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={!isEditing}
          required
        />

        <Input
          label="Phone Number"
          value={isEditing ? formData.phone : user.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={!isEditing}
          placeholder="+852 XXXX XXXX"
        />

        <Input
          label="Date of Birth"
          type="date"
          value={isEditing ? formData.dateOfBirth : user.profile?.dateOfBirth || ''}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          disabled={!isEditing}
        />

        <div className="space-y-1">
          <label className="block text-body-sm font-medium text-charcoal">Gender</label>
          <select
            value={isEditing ? formData.gender : user.profile?.gender || ''}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <Input
          label="Nationality"
          value={isEditing ? formData.nationality : user.profile?.nationality || ''}
          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
          disabled={!isEditing}
          placeholder="e.g., Hong Kong, Chinese, British"
        />

        <Input
          label="Passport Number"
          value={isEditing ? formData.passportNumber : user.profile?.passportNumber || ''}
          onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
          disabled={!isEditing}
          placeholder="For border crossing verification"
        />
      </div>

      {/* Emergency Contact Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-title-md font-semibold text-charcoal mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Contact Name"
            value={isEditing ? formData.emergencyContact : user.profile?.emergencyContact || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            disabled={!isEditing}
            placeholder="Full name"
          />

          <Input
            label="Contact Phone"
            value={isEditing ? formData.emergencyContactPhone : user.profile?.emergencyContactPhone || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
            disabled={!isEditing}
            placeholder="+852 XXXX XXXX"
          />

          <div className="space-y-1">
            <label className="block text-body-sm font-medium text-charcoal">Relationship</label>
            <select
              value={isEditing ? formData.emergencyContactRelation : user.profile?.emergencyContactRelation || ''}
              onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hot-pink focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select Relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-hot-pink to-deep-pink"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </Card>
  );
};