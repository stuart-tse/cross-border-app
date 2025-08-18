'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { USER_TYPE_INFO } from '@/lib/constants';
import { AuthUser } from '@/types/auth';
import { UserType } from '@prisma/client';
import { RoleSwitcher } from './RoleSwitcher';

interface UserMenuProps {
  user: AuthUser;
  selectedRole: UserType | null;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, selectedRole, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper function to get background class based on user type
  const getBgClass = (color: string): string => {
    switch (color) {
      case 'hot-pink':
        return 'bg-[#FF69B4]';
      case 'electric-blue':
        return 'bg-blue-500';
      case 'success-green':
        return 'bg-green-500';
      case 'charcoal':
        return 'bg-[#171A20]';
      default:
        return 'bg-gray-500';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current selected role and corresponding info
  const currentRole = selectedRole || user.roles?.[0]?.role || UserType.CLIENT;
  const userTypeKey = currentRole.toLowerCase() as keyof typeof USER_TYPE_INFO;
  const userTypeInfo = USER_TYPE_INFO[userTypeKey] || {
    label: 'User',
    description: 'System user',
    icon: '👤',
    color: 'gray-500',
  };

  // Check if user has multiple roles
  const hasMultipleRoles = (user.roles?.length || 0) > 1;

  // Get dashboard path based on current selected role
  const getDashboardPath = () => {
    const routes: Record<string, string> = {
      'CLIENT': '/dashboard/client',
      'DRIVER': '/dashboard/driver',
      'BLOG_EDITOR': '/dashboard/editor',
      'ADMIN': '/dashboard/admin',
    };
    return routes[currentRole] || '/dashboard/client';
  };
  // Get role-based profile and settings paths
  const getProfilePath = () => {
    const routes: Record<string, string> = {
      'CLIENT': '/dashboard/client/profile',
      'DRIVER': '/dashboard/driver/profile',
      'BLOG_EDITOR': '/dashboard/editor/profile',
      'ADMIN': '/dashboard/admin/profile',
    };
    return routes[currentRole] || '/dashboard/client/profile';
  };

  const getSettingsPath = () => {
    const routes: Record<string, string> = {
      'CLIENT': '/dashboard/client/settings',
      'DRIVER': '/dashboard/driver/settings',
      'BLOG_EDITOR': '/dashboard/editor/settings',
      'ADMIN': '/dashboard/admin/settings',
    };
    return routes[currentRole] || '/dashboard/client/settings';
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: getDashboardPath(),
      icon: '📊',
    },
    {
      label: 'Profile',
      href: getProfilePath(),
      icon: '👤',
    },
    ...(currentRole === 'CLIENT' ? [
      { label: 'Book Trip', href: '/booking', icon: '🚗' },
      { label: 'Trip History', href: '/dashboard/client/trips', icon: '📋' },
    ] : []),
    ...(currentRole === 'DRIVER' ? [
      { label: 'Trip Requests', href: '/dashboard/driver/requests', icon: '📱' },
      { label: 'Earnings', href: '/dashboard/driver/earnings', icon: '💰' },
      { label: 'Vehicle Info', href: '/dashboard/driver/vehicle', icon: '🚙' },
    ] : []),
    ...(currentRole === 'BLOG_EDITOR' ? [
      { label: 'Create Post', href: '/dashboard/editor/posts', icon: '✍️' },
      { label: 'Media Library', href: '/dashboard/editor/media', icon: '🖼️' },
      { label: 'Analytics', href: '/dashboard/editor/analytics', icon: '📈' },
    ] : []),
    ...(currentRole === 'ADMIN' ? [
      { label: 'User Management', href: '/dashboard/admin/users', icon: '👥' },
      { label: 'System Settings', href: '/dashboard/admin/settings', icon: '⚙️' },
      { label: 'Support Tickets', href: '/dashboard/admin/support', icon: '🎫' },
    ] : []),
    {
      label: 'Settings',
      href: getSettingsPath(),
      icon: '⚙️',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Enhanced User Identity Button with Prominent Role Display */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#FFF0F5] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Role Badge - Now Prominent in Header */}
        <div className="relative">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm',
            getBgClass(userTypeInfo.color)
          )}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-base">{userTypeInfo.icon}</span>
            )}
          </div>
          {/* Multi-role indicator */}
          {hasMultipleRoles && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF69B4] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.roles?.length || 1}</span>
            </div>
          )}
        </div>
        
        {/* User Info with Role Badge */}
        <div className="hidden md:block text-left">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-[#171A20]">{user.name || 'User'}</p>
            {hasMultipleRoles && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                +{(user.roles?.length || 1) - 1}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className={cn(
              'inline-block w-2 h-2 rounded-full',
              getBgClass(userTypeInfo.color)
            )}></span>
            <p className="text-xs font-medium text-gray-700">{userTypeInfo.label}</p>
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <motion.svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white',
                  getBgClass(userTypeInfo.color)
                )}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg">{userTypeInfo.icon}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#171A20]">{user.name || 'User'}</p>
                  <p className="text-sm text-gray-600">{user.email || 'No email provided'}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full text-white',
                      getBgClass(userTypeInfo.color)
                    )}>
                      {userTypeInfo.label}
                    </span>
                    {user.isVerified && (
                      <span className="text-xs text-green-500">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Role Switcher Section */}
            {hasMultipleRoles && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#FFF0F5] to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs',
                      getBgClass(userTypeInfo.color)
                    )}>
                      <span>{userTypeInfo.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-[#171A20]">Active: {userTypeInfo.label}</p>
                      <p className="text-xs text-gray-600">{user.roles?.length || 1} roles available</p>
                    </div>
                  </div>
                  <RoleSwitcher compact onRoleSwitch={() => setIsOpen(false)} />
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center space-x-3 px-4 py-2 text-sm text-[#171A20] hover:bg-[#FFF0F5] hover:text-[#FF69B4] transition-colors duration-200"
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
              >
                <span className="text-base">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};