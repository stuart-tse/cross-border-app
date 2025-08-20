'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Shield, Star, Trophy } from 'lucide-react';
import { UserType } from '@prisma/client';
import { UniversalProfileData } from '@/types/profile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: UniversalProfileData;
  isEditing?: boolean;
  onEditToggle?: () => void;
  onAvatarUpload?: (file: File) => Promise<string>;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditing = false,
  onEditToggle,
  onAvatarUpload,
  className
}) => {
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarUpload) {
      setAvatarUploading(true);
      try {
        await onAvatarUpload(file);
      } catch (error) {
        console.error('Avatar upload failed:', error);
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  const getRoleIcon = (role: UserType) => {
    switch (role) {
      case UserType.CLIENT:
        return '👤';
      case UserType.DRIVER:
        return '🚗';
      case UserType.BLOG_EDITOR:
        return '✍️';
      case UserType.ADMIN:
        return '👑';
      default:
        return '👤';
    }
  };

  const getRoleColor = (role: UserType) => {
    switch (role) {
      case UserType.CLIENT:
        return 'from-blue-500 to-purple-600';
      case UserType.DRIVER:
        return 'from-green-500 to-teal-600';
      case UserType.BLOG_EDITOR:
        return 'from-orange-500 to-red-600';
      case UserType.ADMIN:
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBadgeInfo = () => {
    const badges = [];
    
    if (profile.user.isVerified) {
      badges.push({ icon: <Shield className="w-4 h-4" />, text: 'Verified', color: 'text-success-green' });
    }
    
    // Role-specific badges
    if (profile.driverProfile?.performance.averageRating >= 4.8) {
      badges.push({ icon: <Star className="w-4 h-4" />, text: 'Top Rated', color: 'text-warning-amber' });
    }
    
    if (profile.editorProfile?.contentStats.publishedPosts > 50) {
      badges.push({ icon: <Trophy className="w-4 h-4" />, text: 'Prolific Writer', color: 'text-hot-pink' });
    }
    
    return badges;
  };

  const badges = getBadgeInfo();

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Background Gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-5',
        getRoleColor(profile.activeRole)
      )} />
      
      <div className="relative p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.user.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className={cn(
                  'w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg',
                  'flex items-center justify-center text-white text-2xl md:text-3xl font-bold',
                  `bg-gradient-to-br ${getRoleColor(profile.activeRole)}`
                )}>
                  {getInitials(profile.user.name)}
                </div>
              )}
              
              {/* Avatar Upload Overlay */}
              {onAvatarUpload && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    {avatarUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                </div>
              )}
            </div>
            
            {/* Role Badge */}
            <div className={cn(
              'absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white shadow-md',
              'flex items-center justify-center text-sm',
              `bg-gradient-to-br ${getRoleColor(profile.activeRole)}`
            )}>
              {getRoleIcon(profile.activeRole)}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">
                  {profile.user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-body-lg text-gray-600">
                    {profile.user.email}
                  </span>
                  {profile.phone && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-body-md text-gray-600">
                        {profile.phone}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Role Indicator */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium text-white',
                    `bg-gradient-to-r ${getRoleColor(profile.activeRole)}`
                  )}>
                    {getRoleIcon(profile.activeRole)} {profile.activeRole.replace('_', ' ')}
                  </span>
                  
                  {/* Additional Roles */}
                  {profile.roles.filter(role => role !== profile.activeRole).map(role => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {getRoleIcon(role)} {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn('flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs', badge.color)}
                      >
                        {badge.icon}
                        <span>{badge.text}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {onEditToggle && (
                  <Button
                    variant={isEditing ? 'secondary' : 'primary'}
                    onClick={onEditToggle}
                    className="px-6"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-4">
                <p className="text-body-md text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-charcoal">
                  {profile.profileCompletion}%
                </div>
                <div className="text-xs text-gray-600">Profile Complete</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-charcoal">
                  {profile.activityFeed.length}
                </div>
                <div className="text-xs text-gray-600">Recent Activities</div>
              </div>
              
              {/* Role-specific stats */}
              {profile.clientProfile && (
                <>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-hot-pink">
                      {profile.clientProfile.totalTrips}
                    </div>
                    <div className="text-xs text-gray-600">Total Trips</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-hot-pink">
                      {profile.clientProfile.loyaltyPoints}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                </>
              )}
              
              {profile.driverProfile && (
                <>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-success-green">
                      {profile.driverProfile.performance.totalTrips}
                    </div>
                    <div className="text-xs text-gray-600">Trips Completed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-success-green">
                      {profile.driverProfile.performance.averageRating.toFixed(1)}⭐
                    </div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </>
              )}
              
              {profile.editorProfile && (
                <>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {profile.editorProfile.contentStats.publishedPosts}
                    </div>
                    <div className="text-xs text-gray-600">Published</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {Math.round(profile.editorProfile.contentStats.averageSeoScore)}%
                    </div>
                    <div className="text-xs text-gray-600">SEO Score</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Completion Progress */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-bold text-hot-pink">{profile.profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-hot-pink to-deep-pink h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profile.profileCompletion}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {profile.profileCompletion < 100 && (
            <p className="text-xs text-gray-600 mt-2">
              Complete your profile to unlock all features and improve your experience
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};