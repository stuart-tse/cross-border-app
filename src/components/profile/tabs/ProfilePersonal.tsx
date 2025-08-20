'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UniversalProfileData, ProfileFormData } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ProfilePersonalProps {
  profile: UniversalProfileData;
  isEditing?: boolean;
  onSave?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onCancel?: () => void;
  onChange?: () => void;
  isLoading?: boolean;
}

export const ProfilePersonal: React.FC<ProfilePersonalProps> = ({
  profile,
  isEditing = false,
  onSave,
  onCancel,
  onChange,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    personalInfo: {
      name: profile.user.name,
      email: profile.user.email,
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth || '',
      nationality: profile.nationality || '',
      bio: profile.bio || '',
      languages: profile.languages || []
    },
    preferences: profile.preferences || {},
    roleSpecific: {},
    privacy: {
      isPublic: profile.isPublic,
      showEmail: false,
      showPhone: false,
      allowContact: true
    }
  });

  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    if (onChange) onChange();
  }, [formData, onChange]);

  const handleInputChange = (field: keyof ProfileFormData['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: keyof ProfileFormData['privacy'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const addLanguage = () => {
    if (newLanguage && !formData.personalInfo.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          languages: [...prev.personalInfo.languages, newLanguage]
        }
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        languages: prev.personalInfo.languages.filter(lang => lang !== language)
      }
    }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    const updatedProfile: Partial<UniversalProfileData> = {
      user: {
        ...profile.user,
        name: formData.personalInfo.name,
        email: formData.personalInfo.email
      },
      phone: formData.personalInfo.phone,
      dateOfBirth: formData.personalInfo.dateOfBirth,
      nationality: formData.personalInfo.nationality,
      bio: formData.personalInfo.bio,
      languages: formData.personalInfo.languages,
      isPublic: formData.privacy.isPublic,
      preferences: formData.preferences
    };

    await onSave(updatedProfile);
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-title-lg font-semibold text-charcoal">Personal Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Toggle edit mode */}}
              >
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="text-body-md text-charcoal font-medium">{profile.user.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="text-body-md text-charcoal font-medium">{profile.user.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="text-body-md text-charcoal font-medium">{profile.phone || 'Not specified'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <div className="text-body-md text-charcoal font-medium">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not specified'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <div className="text-body-md text-charcoal font-medium">{profile.nationality || 'Not specified'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                <div className="text-body-md text-charcoal font-medium">
                  {profile.isPublic ? 'Public' : 'Private'}
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <div className="text-body-md text-charcoal leading-relaxed p-4 bg-gray-50 rounded-lg">
                  {profile.bio}
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language) => (
                  <span
                    key={language}
                    className="px-3 py-1 bg-hot-pink/10 text-hot-pink rounded-full text-sm font-medium"
                  >
                    {language}
                  </span>
                ))}
                {profile.languages.length === 0 && (
                  <span className="text-gray-500 text-sm">No languages specified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-title-lg font-semibold text-charcoal">Edit Personal Information</h3>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSave} 
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                value={formData.personalInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.personalInfo.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <Input
                value={formData.personalInfo.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="Enter your nationality"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.personalInfo.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hot-pink focus:border-hot-pink"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.personalInfo.bio.length}/500 characters
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.personalInfo.languages.map((language) => (
                <span
                  key={language}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-hot-pink/10 text-hot-pink rounded-full text-sm font-medium"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="ml-1 hover:bg-hot-pink/20 rounded-full p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language"
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={addLanguage}
                disabled={!newLanguage}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-title-lg font-semibold text-charcoal mb-6">Privacy Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Public Profile</div>
                <div className="text-sm text-gray-600">
                  Allow others to view your basic profile information
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy.isPublic}
                  onChange={(e) => handlePrivacyChange('isPublic', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Show Email</div>
                <div className="text-sm text-gray-600">
                  Display your email address on your public profile
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy.showEmail}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="sr-only peer"
                  disabled={!formData.privacy.isPublic}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink peer-disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Show Phone</div>
                <div className="text-sm text-gray-600">
                  Display your phone number on your public profile
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="sr-only peer"
                  disabled={!formData.privacy.isPublic}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink peer-disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-charcoal">Allow Contact</div>
                <div className="text-sm text-gray-600">
                  Allow other users to contact you through the platform
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacy.allowContact}
                  onChange={(e) => handlePrivacyChange('allowContact', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hot-pink/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hot-pink"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};