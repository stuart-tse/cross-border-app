'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Languages, Award, TrendingUp, Clock } from 'lucide-react';
import { UserType } from '@prisma/client';
import { UniversalProfileData } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ProfileOverviewProps {
  profile: UniversalProfileData;
  isEditing?: boolean;
  onSave?: (data: Partial<UniversalProfileData>) => Promise<void>;
  onCancel?: () => void;
  onChange?: () => void;
  isLoading?: boolean;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  profile,
  isEditing = false,
  onSave,
  onCancel,
  onChange,
  isLoading = false
}) => {
  const getCompletionStatus = () => {
    const percentage = profile.profileCompletion;
    if (percentage >= 90) return { status: 'Excellent', color: 'text-success-green', bg: 'bg-success-green/10' };
    if (percentage >= 70) return { status: 'Good', color: 'text-warning-amber', bg: 'bg-warning-amber/10' };
    if (percentage >= 50) return { status: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'Needs Improvement', color: 'text-error-red', bg: 'bg-error-red/10' };
  };

  const getLastActivityText = () => {
    const recent = profile.activityFeed[0];
    if (!recent) return 'No recent activity';
    
    const timeDiff = Date.now() - new Date(recent.timestamp).getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently active';
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-hot-pink/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-hot-pink/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-hot-pink" />
                </div>
                <span className={cn('text-sm font-medium px-2 py-1 rounded-full', completionStatus.bg, completionStatus.color)}>
                  {completionStatus.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {profile.profileCompletion}%
              </div>
              <div className="text-sm text-gray-600">Profile Complete</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-electric-blue/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-electric-blue" />
                </div>
                <div className="w-3 h-3 bg-success-green rounded-full animate-pulse" />
              </div>
              <div className="text-lg font-bold text-charcoal group-hover:scale-105 transition-transform">
                {getLastActivityText()}
              </div>
              <div className="text-sm text-gray-600">Last Activity</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-success-green" />
                </div>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {profile.roles.length}
              </div>
              <div className="text-sm text-gray-600">Active Role{profile.roles.length !== 1 ? 's' : ''}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-warning-amber/5 to-transparent" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-warning-amber/10 rounded-full flex items-center justify-center">
                  <Languages className="w-6 h-6 text-warning-amber" />
                </div>
              </div>
              <div className="text-2xl font-bold text-charcoal group-hover:scale-105 transition-transform">
                {profile.languages.length}
              </div>
              <div className="text-sm text-gray-600">Language{profile.languages.length !== 1 ? 's' : ''}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Date of Birth</div>
                      <div className="font-medium text-charcoal">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Nationality</div>
                      <div className="font-medium text-charcoal">
                        {profile.nationality || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Languages className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Languages</div>
                      <div className="font-medium text-charcoal">
                        {profile.languages.length > 0 ? profile.languages.join(', ') : 'None specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">🔒</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Privacy Setting</div>
                      <div className="font-medium text-charcoal">
                        {profile.isPublic ? 'Public Profile' : 'Private Profile'}
                      </div>
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                    <p className="text-body-md text-gray-700 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Role-Specific Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-lg font-semibold text-charcoal mb-6">Role Highlights</h3>
                
                <div className="space-y-4">
                  {profile.roles.map((role, index) => (
                    <div key={role} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {role === UserType.CLIENT && '👤'}
                            {role === UserType.DRIVER && '🚗'}
                            {role === UserType.BLOG_EDITOR && '✍️'}
                            {role === UserType.ADMIN && '👑'}
                          </span>
                          <div>
                            <div className="font-medium text-charcoal">
                              {role.replace('_', ' ')}
                              {role === profile.activeRole && (
                                <span className="ml-2 px-2 py-0.5 bg-hot-pink text-white text-xs rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {/* Role-specific description */}
                              {role === UserType.CLIENT && profile.clientProfile && 
                                `${profile.clientProfile.totalTrips} trips • ${profile.clientProfile.membershipTier} member`
                              }
                              {role === UserType.DRIVER && profile.driverProfile && 
                                `${profile.driverProfile.performance.totalTrips} trips • ${profile.driverProfile.performance.averageRating.toFixed(1)}⭐ rating`
                              }
                              {role === UserType.BLOG_EDITOR && profile.editorProfile && 
                                `${profile.editorProfile.contentStats.publishedPosts} published • ${profile.editorProfile.contentStats.averageSeoScore}% SEO`
                              }
                              {role === UserType.ADMIN && profile.adminProfile && 
                                `${profile.adminProfile.adminLevel} • ${profile.adminProfile.permissions.length} permissions`
                              }
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Since {new Date(profile.user.createdAt).getFullYear()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-md font-semibold text-charcoal mb-4">Profile Completion</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-charcoal">{profile.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-hot-pink to-deep-pink h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.profileCompletion}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-success-green rounded-full mr-2" />
                    <span className="text-gray-600">Basic info complete</span>
                  </div>
                  {profile.avatar && (
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-success-green rounded-full mr-2" />
                      <span className="text-gray-600">Profile photo added</span>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-success-green rounded-full mr-2" />
                      <span className="text-gray-600">Bio added</span>
                    </div>
                  )}
                  {!profile.phone && (
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-warning-amber rounded-full mr-2" />
                      <span className="text-gray-600">Add phone number</span>
                    </div>
                  )}
                  {!profile.dateOfBirth && (
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-warning-amber rounded-full mr-2" />
                      <span className="text-gray-600">Add date of birth</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-title-md font-semibold text-charcoal">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {profile.activityFeed.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                        activity.importance === 'HIGH' && 'bg-error-red/10 text-error-red',
                        activity.importance === 'MEDIUM' && 'bg-warning-amber/10 text-warning-amber',
                        activity.importance === 'LOW' && 'bg-gray-100 text-gray-600'
                      )}>
                        {activity.type === 'LOGIN' && '🔐'}
                        {activity.type === 'PROFILE_UPDATE' && '✏️'}
                        {activity.type === 'TRIP' && '🚗'}
                        {activity.type === 'CONTENT' && '📝'}
                        {activity.type === 'PAYMENT' && '💳'}
                        {activity.type === 'REVIEW' && '⭐'}
                        {activity.type === 'ACHIEVEMENT' && '🏆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-charcoal">
                          {activity.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {profile.activityFeed.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">📝</span>
                      <div className="text-sm">No recent activity</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-title-md font-semibold text-charcoal mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  {profile.recentActions.slice(0, 4).map((action, index) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={action.onClick}
                    >
                      <span className="mr-3">{action.icon}</span>
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};