'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserType } from '@prisma/client';
import { cn } from '@/lib/utils';

interface MenuAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface UserActionMenuProps {
  userId: string;
  userType: UserType;
  userStatus: 'active' | 'inactive' | 'suspended' | 'pending';
  onViewProfile: () => void;
  onEditUser: () => void;
  onViewBookings?: () => void;
  onManagePermissions?: () => void;
  onToggleStatus: () => void;
  onSuspendUser: () => void;
  className?: string;
}

const UserActionMenu: React.FC<UserActionMenuProps> = ({
  userId,
  userType,
  userStatus,
  onViewProfile,
  onEditUser,
  onViewBookings,
  onManagePermissions,
  onToggleStatus,
  onSuspendUser,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getActions = (): MenuAction[] => {
    const baseActions: MenuAction[] = [
      {
        id: 'view-profile',
        label: 'View Profile',
        icon: '👁️',
        onClick: onViewProfile
      },
      {
        id: 'edit-user',
        label: 'Edit Details',
        icon: '✏️',
        onClick: onEditUser
      }
    ];

    // Add user type specific actions
    if (userType === 'CLIENT' && onViewBookings) {
      baseActions.push({
        id: 'view-bookings',
        label: 'View Bookings',
        icon: '📅',
        onClick: onViewBookings
      });
    }

    if (userType === 'DRIVER') {
      baseActions.push({
        id: 'view-trips',
        label: 'View Trips',
        icon: '🚗',
        onClick: onViewBookings || (() => {})
      });
      baseActions.push({
        id: 'review-documents',
        label: 'Review Documents',
        icon: '📋',
        onClick: () => {}
      });
    }

    if (userType === 'BLOG_EDITOR' && onManagePermissions) {
      baseActions.push({
        id: 'manage-permissions',
        label: 'Manage Permissions',
        icon: '🔐',
        onClick: onManagePermissions
      });
      baseActions.push({
        id: 'view-articles',
        label: 'View Articles',
        icon: '📝',
        onClick: () => {}
      });
    }

    // Add status management actions
    baseActions.push({
      id: 'toggle-status',
      label: userStatus === 'active' ? 'Deactivate' : 'Activate',
      icon: userStatus === 'active' ? '⏸️' : '▶️',
      onClick: onToggleStatus,
      danger: userStatus === 'active'
    });

    if (userStatus !== 'suspended') {
      baseActions.push({
        id: 'suspend-user',
        label: 'Suspend Account',
        icon: '🚫',
        onClick: onSuspendUser,
        danger: true
      });
    }

    return baseActions;
  };

  const handleKeyDown = (event: React.KeyboardEvent, action?: MenuAction) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (action) {
        action.onClick();
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  const actions = getActions();

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e)}
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF69B4] transition-colors duration-200',
          isOpen && 'text-gray-600 bg-gray-50'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User actions for ${userId}`}
      >
        <svg 
          className="w-5 h-5" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1">
              {actions.map((action, index) => (
                <React.Fragment key={action.id}>
                  {(action.id === 'toggle-status' && index > 0) && (
                    <hr className="my-1 border-gray-200" role="separator" />
                  )}
                  <button
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, action)}
                    disabled={action.disabled}
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm text-left transition-colors duration-150',
                      action.danger 
                        ? 'text-red-700 hover:bg-red-50 hover:text-red-900' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                      action.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    role="menuitem"
                  >
                    <span className="mr-3 text-base" aria-hidden="true">{action.icon}</span>
                    {action.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserActionMenu;