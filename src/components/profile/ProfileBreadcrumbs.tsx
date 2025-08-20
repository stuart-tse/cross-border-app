'use client';

import React from 'react';
import Link from 'next/link';
import { UserType } from '@prisma/client';
import { ChevronRight, Home, User, Users, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface ProfileBreadcrumbsProps {
  role: UserType;
  currentPage: string;
  locale: string;
  customPath?: BreadcrumbItem[];
  className?: string;
}

const getRoleIcon = (role: UserType) => {
  switch (role) {
    case UserType.CLIENT:
      return <User className="w-4 h-4" />;
    case UserType.DRIVER:
      return <Users className="w-4 h-4" />;
    case UserType.BLOG_EDITOR:
      return <FileText className="w-4 h-4" />;
    case UserType.ADMIN:
      return <Shield className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const getRoleLabel = (role: UserType) => {
  switch (role) {
    case UserType.CLIENT:
      return 'Client';
    case UserType.DRIVER:
      return 'Driver';
    case UserType.BLOG_EDITOR:
      return 'Editor';
    case UserType.ADMIN:
      return 'Admin';
    default:
      return 'Profile';
  }
};

const getRoleDashboardPath = (role: UserType) => {
  switch (role) {
    case UserType.CLIENT:
      return '/dashboard/client';
    case UserType.DRIVER:
      return '/dashboard/driver';
    case UserType.BLOG_EDITOR:
      return '/dashboard/editor';
    case UserType.ADMIN:
      return '/dashboard/admin';
    default:
      return '/dashboard';
  }
};

export const ProfileBreadcrumbs: React.FC<ProfileBreadcrumbsProps> = ({
  role,
  currentPage,
  locale,
  customPath,
  className
}) => {
  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = customPath || [
    {
      label: 'Home',
      href: `/${locale}`,
      icon: <Home className="w-4 h-4" />
    },
    {
      label: `${getRoleLabel(role)} Dashboard`,
      href: `/${locale}${getRoleDashboardPath(role)}`,
      icon: getRoleIcon(role)
    },
    {
      label: currentPage,
      isActive: true
    }
  ];

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm text-gray-500 mb-6', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" aria-hidden="true" />
              )}
              
              {item.href && !item.isActive ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-gray-500 hover:text-hot-pink transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-hot-pink focus:ring-offset-2 rounded px-1 py-0.5"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    'flex items-center gap-2 px-1 py-0.5 rounded',
                    item.isActive 
                      ? 'text-charcoal font-medium bg-hot-pink/5' 
                      : 'text-gray-500'
                  )}
                  aria-current={item.isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Enhanced breadcrumb component with additional features
interface EnhancedBreadcrumbsProps extends ProfileBreadcrumbsProps {
  showRoleSwitch?: boolean;
  availableRoles?: UserType[];
  onRoleSwitch?: (role: UserType) => void;
}

export const EnhancedBreadcrumbs: React.FC<EnhancedBreadcrumbsProps> = ({
  role,
  currentPage,
  locale,
  customPath,
  className,
  showRoleSwitch = false,
  availableRoles = [],
  onRoleSwitch
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <ProfileBreadcrumbs
        role={role}
        currentPage={currentPage}
        locale={locale}
        customPath={customPath}
      />
      
      {showRoleSwitch && availableRoles.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Switch to:</span>
          <div className="flex items-center gap-1">
            {availableRoles.filter(r => r !== role).map((availableRole) => (
              <button
                key={availableRole}
                onClick={() => onRoleSwitch?.(availableRole)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-hot-pink/10 hover:text-hot-pink rounded-md transition-colors"
                title={`Switch to ${getRoleLabel(availableRole)} dashboard`}
              >
                {getRoleIcon(availableRole)}
                <span>{getRoleLabel(availableRole)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
