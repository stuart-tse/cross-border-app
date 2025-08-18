'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserType, User, ClientProfile, DriverProfile, BlogEditorProfile } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import UserStatusBadge from './UserStatusBadge';
import UserActionMenu from './UserActionMenu';
import { cn } from '@/lib/utils';

interface ExtendedUser extends User {
  clientProfile?: ClientProfile | null;
  driverProfile?: DriverProfile | null;
  blogEditorProfile?: BlogEditorProfile | null;
  userRoles?: { role: UserType }[];
}

interface ResponsiveUserCardProps {
  user: ExtendedUser;
  onUserClick: (user: ExtendedUser) => void;
  onUserSelect: (userId: string, selected: boolean) => void;
  isSelected: boolean;
  index: number;
  className?: string;
}

const ResponsiveUserCard: React.FC<ResponsiveUserCardProps> = ({
  user,
  onUserClick,
  onUserSelect,
  isSelected,
  index,
  className
}) => {
  const getPrimaryRole = (): UserType => {
    if (!user.userRoles || user.userRoles.length === 0) return 'CLIENT';
    return user.userRoles[0].role;
  };

  const getUserAvatar = () => {
    return user.name?.charAt(0)?.toUpperCase() || 'U';
  };

  const getDisplayValue = (field: string) => {
    switch (field) {
      case 'trips':
        if (user.clientProfile?.loyaltyPoints) {
          return Math.floor(user.clientProfile.loyaltyPoints / 20);
        }
        return user.driverProfile?.totalTrips || 0;
      case 'rating':
        return user.driverProfile?.rating || 'N/A';
      case 'loyaltyPoints':
        return user.clientProfile?.loyaltyPoints || 0;
      case 'membershipTier':
        return user.clientProfile?.membershipTier || 'N/A';
      default:
        return 'N/A';
    }
  };

  const primaryRole = getPrimaryRole();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn('w-full', className)}
    >
      <Card 
        className={cn(
          'relative p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border',
          isSelected && 'border-[#FF69B4] bg-[#FF69B4]/5 shadow-md'
        )}
        onClick={() => onUserClick(user)}
      >
        {/* Header with Avatar and Selection */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-full flex items-center justify-center text-white text-lg font-bold">
                {getUserAvatar()}
              </div>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">{user.name}</h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-gray-400 truncate">{user.phone}</p>
              )}
            </div>
          </div>

          {/* Selection and Action Menu */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onUserSelect(user.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300 text-[#FF69B4] focus:ring-[#FF69B4] h-4 w-4"
            />
            <div onClick={(e) => e.stopPropagation()}>
              <UserActionMenu
                userId={user.id}
                userType={primaryRole}
                userStatus={user.isActive ? 'active' : 'inactive'}
                onViewProfile={() => onUserClick(user)}
                onEditUser={() => onUserClick(user)}
                onViewBookings={() => {}}
                onManagePermissions={() => {}}
                onToggleStatus={() => {}}
                onSuspendUser={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-4">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            primaryRole === 'CLIENT' && 'bg-blue-100 text-blue-800',
            primaryRole === 'DRIVER' && 'bg-green-100 text-green-800',
            primaryRole === 'BLOG_EDITOR' && 'bg-purple-100 text-purple-800',
            primaryRole === 'ADMIN' && 'bg-red-100 text-red-800'
          )}>
            {primaryRole === 'BLOG_EDITOR' ? 'Blog Editor' : primaryRole}
          </span>
          
          {user.clientProfile?.membershipTier && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF69B4]/10 text-[#FF69B4]">
              {user.clientProfile.membershipTier}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-[#FF69B4]">
              {getDisplayValue('trips')}
            </div>
            <div className="text-xs text-gray-600">
              {primaryRole === 'CLIENT' ? 'Trips' : 
               primaryRole === 'DRIVER' ? 'Completed' : 'Articles'}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-[#FF69B4]">
              {primaryRole === 'DRIVER' ? 
                (user.driverProfile?.rating || 0).toFixed(1) :
                primaryRole === 'CLIENT' ? 
                  user.clientProfile?.loyaltyPoints || 0 : 
                  '4.8'}
            </div>
            <div className="text-xs text-gray-600">
              {primaryRole === 'DRIVER' ? 'Rating' :
               primaryRole === 'CLIENT' ? 'Points' : 'Rating'}
            </div>
          </div>
        </div>

        {/* Status and Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <UserStatusBadge
              status={user.isActive ? 'active' : 'inactive'}
              verified={user.isVerified}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Joined</span>
            <span className="text-sm text-gray-900 font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          {primaryRole === 'DRIVER' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">License</span>
              <span className="text-sm text-gray-900 font-medium">
                {user.driverProfile?.licenseNumber?.slice(-6) || 'N/A'}
              </span>
            </div>
          )}

          {primaryRole === 'CLIENT' && user.clientProfile?.specialRequests && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 line-clamp-2">
                {user.clientProfile.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* Mobile-specific Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 sm:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUserClick(user);
              }}
              className="text-sm text-[#FF69B4] font-medium hover:text-[#FF1493] transition-colors"
            >
              View Details
            </button>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Last updated</span>
              <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ResponsiveUserCard;