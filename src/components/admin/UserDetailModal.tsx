'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import UserStatusBadge from './UserStatusBadge';
import { cn } from '@/lib/utils';
import { ExtendedUser } from '@/lib/data/user-service';
import { UserDisplayService } from '@/lib/data/user-display-service';

interface UserDetailModalProps {
  user: ExtendedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ExtendedUser>) => Promise<void>;
  readonly?: boolean;
  className?: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  readonly = false,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedUser>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'stats'>('profile');

  // Generate display data using the display service
  const displayInfo = user ? UserDisplayService.getUserDisplayInfo(user) : null;
  const userStats = user ? UserDisplayService.getUserStatsDisplay(user) : [];
  const performanceMetrics = user ? UserDisplayService.getPerformanceMetrics(user) : [];
  const accountSummary = user ? UserDisplayService.getAccountSummary(user) : [];
  const recentActivity = user ? UserDisplayService.getFormattedActivity(user) : [];

  useEffect(() => {
    if (user) {
      setFormData(user);
      setIsEditing(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData || !user) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (profileType: 'clientProfile' | 'driverProfile' | 'blogEditorProfile', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [profileType]: {
        ...prev[profileType],
        [field]: value
      }
    }));
  };

  const primaryRole = user ? UserDisplayService.getPrimaryRole(user) : 'CLIENT';

  if (!user || !displayInfo) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="User Details"
      className={cn('max-w-4xl', className)}
    >
      <div className="space-y-6">
        {/* User Header */}
        <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {displayInfo.avatar}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{displayInfo.name}</h3>
              <UserStatusBadge 
                status={user.isActive ? 'active' : 'inactive'} 
                verified={user.isVerified}
              />
            </div>
            
            <div className="space-y-1 text-gray-600">
              <p>{displayInfo.email}</p>
              {displayInfo.phone !== 'No phone' && <p>{displayInfo.phone}</p>}
              <p className="text-sm">
                {displayInfo.roleDisplayName} • Member since {displayInfo.memberSince}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                UserDisplayService.getRoleBadgeStyle(primaryRole)
              )}>
                {displayInfo.roleDisplayName}
              </span>
              
              {user.clientProfile?.membershipTier && (
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium border',
                  UserDisplayService.getMembershipTierStyle(user.clientProfile.membershipTier)
                )}>
                  {user.clientProfile.membershipTier} Member
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Profile Completion</div>
            <div className="text-2xl font-bold text-[#FF69B4] mb-2">{displayInfo.profileCompletion}%</div>
            {!readonly && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'secondary' : 'primary'}
                size="sm"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <div className="text-2xl font-bold text-[#FF69B4] mb-1">
                {stat.formatted}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile Details', icon: '👤' },
              { id: 'activity', label: 'Recent Activity', icon: '📋' },
              { id: 'stats', label: 'Statistics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                  activeTab === tab.id
                    ? 'border-[#FF69B4] text-[#FF69B4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      ) : (
                        <p className="text-gray-900">{user.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      ) : (
                        <p className="text-gray-900">{user.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Status
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <UserStatusBadge 
                          status={user.isActive ? 'active' : 'inactive'} 
                          verified={user.isVerified}
                        />
                      )}
                    </div>
                  </div>
                </Card>

                {/* Role-specific Information */}
                {primaryRole === 'CLIENT' && user.clientProfile && (
                  <Card>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Membership Tier
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.clientProfile?.membershipTier || 'BASIC'}
                            onChange={(e) => handleProfileChange('clientProfile', 'membershipTier', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                          >
                            <option value="BASIC">Basic</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="VIP">VIP</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{user.clientProfile.membershipTier}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emergency Contact
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.clientProfile?.emergencyContact || ''}
                            onChange={(e) => handleProfileChange('clientProfile', 'emergencyContact', e.target.value)}
                            placeholder="Emergency contact information"
                          />
                        ) : (
                          <p className="text-gray-900">{user.clientProfile.emergencyContact || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.clientProfile?.specialRequests || ''}
                          onChange={(e) => handleProfileChange('clientProfile', 'specialRequests', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-[#FF69B4]"
                          placeholder="Any special requirements or preferences..."
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user.clientProfile.specialRequests || 'No special requests'}
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {primaryRole === 'DRIVER' && user.driverProfile && (
                  <Card>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          License Number
                        </label>
                        <p className="text-gray-900">{user.driverProfile.licenseNumber}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          License Expiry
                        </label>
                        <p className="text-gray-900">
                          {new Date(user.driverProfile.licenseExpiry).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Languages
                        </label>
                        <p className="text-gray-900">
                          {user.driverProfile.languages.join(', ') || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approval Status
                        </label>
                        <UserStatusBadge 
                          status={user.driverProfile.isApproved ? 'active' : 'pending'} 
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <Card>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white text-lg',
                        activity.statusColor
                      )}>
                        {activity.icon}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.timeAgo}</p>
                      </div>
                      
                      {activity.amount && (
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{activity.amount}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performanceMetrics.length > 0 && (
                  <Card>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-4">
                      {performanceMetrics.map((metric, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{metric.label}</span>
                          <span className="font-semibold">{metric.formatted}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h4>
                  <div className="space-y-4">
                    {accountSummary.map((summary, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">{summary.label}</span>
                        <span className="font-semibold">{summary.formatted}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              onClick={() => setIsEditing(false)}
              variant="secondary"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;