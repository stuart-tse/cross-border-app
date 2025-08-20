'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserType } from '@prisma/client';
import { UniversalProfileData } from '@/types/profile';
import { cn } from '@/lib/utils';

export type ProfileTabType = 
  | 'overview' 
  | 'personal' 
  | 'activity' 
  | 'settings' 
  | 'security'
  | 'client'
  | 'driver'
  | 'editor'
  | 'admin';

interface TabConfig {
  id: ProfileTabType;
  label: string;
  icon: string;
  description?: string;
  requiresRole?: UserType[];
  badge?: string | number;
}

interface ProfileTabsProps {
  profile: UniversalProfileData;
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  className?: string;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profile,
  activeTab,
  onTabChange,
  className
}) => {
  const getTabConfig = (): TabConfig[] => {
    const baseTabs: TabConfig[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊',
        description: 'Profile summary and key metrics'
      },
      {
        id: 'personal',
        label: 'Personal Info',
        icon: '👤',
        description: 'Personal details and preferences'
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: '📈',
        description: 'Recent activity and engagement',
        badge: profile.activityFeed.length > 99 ? '99+' : profile.activityFeed.length
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        description: 'Account preferences and configuration'
      },
      {
        id: 'security',
        label: 'Security',
        icon: '🔒',
        description: 'Security settings and privacy controls',
        badge: profile.securitySettings.twoFactorEnabled ? '✓' : '!'
      }
    ];

    // Add role-specific tabs
    const roleSpecificTabs: TabConfig[] = [];

    if (profile.roles.includes(UserType.CLIENT) && profile.clientProfile) {
      roleSpecificTabs.push({
        id: 'client',
        label: 'Travel Profile',
        icon: '✈️',
        description: 'Travel preferences and booking history',
        requiresRole: [UserType.CLIENT],
        badge: profile.clientProfile.totalTrips
      });
    }

    if (profile.roles.includes(UserType.DRIVER) && profile.driverProfile) {
      roleSpecificTabs.push({
        id: 'driver',
        label: 'Driver Profile',
        icon: '🚗',
        description: 'Vehicle info, performance, and earnings',
        requiresRole: [UserType.DRIVER],
        badge: profile.driverProfile.availability.isOnline ? 'ONLINE' : 'OFFLINE'
      });
    }

    if (profile.roles.includes(UserType.BLOG_EDITOR) && profile.editorProfile) {
      roleSpecificTabs.push({
        id: 'editor',
        label: 'Editorial',
        icon: '✍️',
        description: 'Content management and publishing tools',
        requiresRole: [UserType.BLOG_EDITOR],
        badge: profile.editorProfile.contentStats.draftPosts
      });
    }

    if (profile.roles.includes(UserType.ADMIN) && profile.adminProfile) {
      roleSpecificTabs.push({
        id: 'admin',
        label: 'Administration',
        icon: '👑',
        description: 'System administration and user management',
        requiresRole: [UserType.ADMIN],
        badge: profile.adminProfile.managementStats.activeIncidents || undefined
      });
    }

    return [...baseTabs, ...roleSpecificTabs];
  };

  const tabs = getTabConfig();

  const getBadgeColor = (badge: string | number | undefined, tabId: ProfileTabType) => {
    if (!badge) return '';
    
    if (tabId === 'security') {
      return badge === '✓' ? 'bg-success-green text-white' : 'bg-warning-amber text-white';
    }
    
    if (tabId === 'driver' && typeof badge === 'string') {
      return badge === 'ONLINE' ? 'bg-success-green text-white' : 'bg-gray-400 text-white';
    }
    
    if (typeof badge === 'number' && badge > 0) {
      return 'bg-hot-pink text-white';
    }
    
    return 'bg-gray-400 text-white';
  };

  const isTabVisible = (tab: TabConfig): boolean => {
    if (!tab.requiresRole) return true;
    return tab.requiresRole.some(role => profile.roles.includes(role));
  };

  const visibleTabs = tabs.filter(isTabVisible);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1">
            {visibleTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-200',
                  'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-hot-pink/20',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-md'
                    : 'text-gray-600 hover:text-charcoal'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg" aria-hidden="true">{tab.icon}</span>
                <div className="flex flex-col items-start">
                  <span>{tab.label}</span>
                  {tab.description && (
                    <span className={cn(
                      'text-xs',
                      activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                    )}>
                      {tab.description}
                    </span>
                  )}
                </div>
                
                {/* Badge */}
                {tab.badge && (
                  <span className={cn(
                    'absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full font-medium min-w-[20px] text-center',
                    getBadgeColor(tab.badge, tab.id),
                    activeTab === tab.id ? 'bg-white text-hot-pink' : ''
                  )}>
                    {tab.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Tabs - Horizontal Scroll */}
      <div className="md:hidden">
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-4 py-3 rounded-md font-medium text-xs transition-all duration-200 min-w-[80px] flex-shrink-0',
                  'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-hot-pink/20',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-md'
                    : 'text-gray-600 hover:text-charcoal'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl" aria-hidden="true">{tab.icon}</span>
                <span className="leading-tight text-center">{tab.label}</span>
                
                {/* Badge */}
                {tab.badge && (
                  <span className={cn(
                    'absolute -top-1 -right-1 px-1 py-0.5 text-xs rounded-full font-medium min-w-[16px] text-center',
                    getBadgeColor(tab.badge, tab.id),
                    activeTab === tab.id ? 'bg-white text-hot-pink' : ''
                  )}>
                    {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </nav>
      </div>

      {/* Tab Content Indicator */}
      <div className="mt-4 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{visibleTabs.find(tab => tab.id === activeTab)?.icon}</span>
            <div>
              <h2 className="text-title-lg font-semibold text-charcoal">
                {visibleTabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              {visibleTabs.find(tab => tab.id === activeTab)?.description && (
                <p className="text-body-sm text-gray-600">
                  {visibleTabs.find(tab => tab.id === activeTab)?.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Tab-specific Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'activity' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-hot-pink hover:text-deep-pink font-medium px-3 py-1 rounded-full border border-hot-pink/20 hover:bg-hot-pink/5 transition-colors"
                onClick={() => {/* Clear activity filters */}}
              >
                Clear Filters
              </motion.button>
            )}
            
            {activeTab === 'security' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-success-green hover:text-green-600 font-medium px-3 py-1 rounded-full border border-success-green/20 hover:bg-success-green/5 transition-colors"
                onClick={() => {/* Security audit */}}
              >
                Security Audit
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};