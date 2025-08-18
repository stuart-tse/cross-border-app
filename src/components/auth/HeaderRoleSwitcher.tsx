'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { useAuth } from '@/lib/context/AuthContext';
import { USER_TYPE_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface HeaderRoleSwitcherProps {
  className?: string;
}

export const HeaderRoleSwitcher: React.FC<HeaderRoleSwitcherProps> = ({ className }) => {
  const { user, selectedRole, switchRole, getAvailableRoles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = getAvailableRoles();

  // Don't show the switcher if user has only one role or is not authenticated
  if (!user || availableRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = async (role: UserType) => {
    if (role === selectedRole || isLoading) return;

    try {
      setIsLoading(true);
      await switchRole(role);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch role:', error);
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
    <div className={cn('relative', className)}>
      {/* Current Role Badge Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
          'border-2 border-transparent hover:border-gray-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-[#FF69B4] focus:ring-offset-2'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Role Badge */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm',
          getBgClass(currentRoleInfo.color)
        )}>
          <span>{currentRoleInfo.icon}</span>
        </div>
        
        {/* Role Label (Hidden on mobile) */}
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-[#171A20]">{currentRoleInfo.label}</p>
        </div>

        {/* Dropdown Arrow */}
        <motion.svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="w-4 h-4 border-2 border-[#FF69B4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </motion.button>

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
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm',
                    getBgClass(currentRoleInfo.color)
                  )}>
                    <span>{currentRoleInfo.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#171A20]">Switch Active Role</p>
                    <p className="text-xs text-gray-600">Currently: {currentRoleInfo.label}</p>
                  </div>
                </div>
              </div>

              {/* Role Options */}
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
                    <motion.button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      disabled={isLoading || isSelected}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200',
                        isSelected 
                          ? 'bg-gray-50 cursor-default' 
                          : `${getHoverBgClass(roleInfo.color)} cursor-pointer hover:shadow-sm`,
                        isLoading && 'opacity-50 cursor-not-allowed'
                      )}
                      whileHover={!isSelected && !isLoading ? { x: 4 } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Role Badge */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm',
                        getBgClass(roleInfo.color)
                      )}>
                        <span className="text-base">{roleInfo.icon}</span>
                      </div>
                      
                      {/* Role Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-[#171A20]">{roleInfo.label}</p>
                          {isSelected && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{roleInfo.description}</p>
                      </div>
                      
                      {/* Switch Arrow */}
                      {!isSelected && (
                        <motion.div
                          className="text-gray-400"
                          whileHover={{ x: 2 }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  {availableRoles.length} roles available
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};