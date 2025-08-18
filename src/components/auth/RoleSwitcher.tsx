'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { useAuth } from '@/lib/context/AuthContext';
import { USER_TYPE_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RoleSwitcherProps {
  onRoleSwitch?: () => void;
  compact?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onRoleSwitch, compact = false }) => {
  const { user, selectedRole, switchRole, getAvailableRoles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = getAvailableRoles();

  // Don't show the switcher if user has only one role
  if (availableRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = async (role: UserType) => {
    if (role === selectedRole || isLoading) return;

    try {
      setIsLoading(true);
      await switchRole(role);
      setIsOpen(false);
      onRoleSwitch?.();
    } catch (error) {
      console.error('Failed to switch role:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

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

  const getHoverBgClass = (color: string): string => {
    switch (color) {
      case 'hot-pink':
        return 'hover:bg-[#FF69B4]/10';
      case 'electric-blue':
        return 'hover:bg-blue-500/10';
      case 'success-green':
        return 'hover:bg-green-500/10';
      case 'charcoal':
        return 'hover:bg-[#171A20]/10';
      default:
        return 'hover:bg-gray-100';
    }
  };

  const currentRoleInfo = USER_TYPE_INFO[selectedRole?.toLowerCase() as keyof typeof USER_TYPE_INFO] || {
    label: 'User',
    description: 'System user',
    icon: '👤',
    color: 'gray-500',
  };

  return (
    <div className="relative">
      {/* Current Role Display / Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          compact 
            ? 'space-x-1 px-2 py-1 rounded hover:bg-gray-100' 
            : 'space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300'
        )}
      >
        <div className={cn(
          'rounded-full flex items-center justify-center text-white',
          compact ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-xs',
          getBgClass(currentRoleInfo.color)
        )}>
          <span>{currentRoleInfo.icon}</span>
        </div>
        {!compact && (
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-[#171A20]">{currentRoleInfo.label}</p>
          </div>
        )}
        <motion.svg
          className={cn('text-gray-500', compact ? 'w-3 h-3' : 'w-4 h-4')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Role Selection Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50',
                compact ? 'w-56' : 'w-64'
              )}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-charcoal">Switch Role</p>
                <p className="text-xs text-gray-600">Choose your active role</p>
              </div>

              <div className="py-2">
                {availableRoles.map((role) => {
                  const roleKey = role.toLowerCase() as keyof typeof USER_TYPE_INFO;
                  const roleInfo = USER_TYPE_INFO[roleKey] || {
                    label: role,
                    description: 'System role',
                    icon: '👤',
                    color: 'gray-500',
                  };
                  const isSelected = role === selectedRole;

                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      disabled={isLoading || isSelected}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200',
                        isSelected 
                          ? 'bg-gray-50 cursor-default' 
                          : `${getHoverBgClass(roleInfo.color)} cursor-pointer`,
                        isLoading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white',
                        getBgClass(roleInfo.color)
                      )}>
                        <span className="text-sm">{roleInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-charcoal">{roleInfo.label}</p>
                          {isSelected && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{roleInfo.description}</p>
                      </div>
                      {!isSelected && (
                        <motion.div
                          whileHover={{ x: 2 }}
                          className="text-gray-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {availableRoles.length > 2 && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    You have {availableRoles.length} roles available
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};