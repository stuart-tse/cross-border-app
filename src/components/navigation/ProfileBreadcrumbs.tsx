'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Home, User, Settings, Shield, Edit3, Crown, Car, FileText } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface ProfileBreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

export const ProfileBreadcrumbs: React.FC<ProfileBreadcrumbsProps> = ({
  className,
  showHome = true
}) => {
  const pathname = usePathname();
  const { user, selectedRole } = useAuth();

  const getRoleIcon = (role: UserType) => {
    switch (role) {
      case UserType.CLIENT:
        return <User className="w-4 h-4" />;
      case UserType.DRIVER:
        return <Car className="w-4 h-4" />;
      case UserType.BLOG_EDITOR:
        return <Edit3 className="w-4 h-4" />;
      case UserType.ADMIN:
        return <Crown className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always add home if requested
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        icon: <Home className="w-4 h-4" />
      });
    }

    // Add dashboard link based on current role
    if (selectedRole) {
      const dashboardPath = `/dashboard/${selectedRole.toLowerCase().replace('_', '-')}`;
      breadcrumbs.push({
        label: 'Dashboard',
        href: dashboardPath,
        icon: getRoleIcon(selectedRole)
      });
    }

    // Parse current path and add profile-specific breadcrumbs
    const pathSegments = pathname.split('/').filter(segment => segment);
    
    // Remove locale if present (first segment might be locale)
    if (pathSegments[0] && ['en', 'zh', 'zh-cn', 'zh-tw'].includes(pathSegments[0])) {
      pathSegments.shift();
    }

    let currentPath = '';
    
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      const isLast = i === pathSegments.length - 1;
      
      let label = segment;
      let icon: React.ReactNode = undefined;
      
      // Custom labels and icons for specific paths
      switch (segment) {
        case 'profile':
          label = 'Profile';
          icon = <User className="w-4 h-4" />;
          break;
        case 'settings':
          label = 'Settings';
          icon = <Settings className="w-4 h-4" />;
          break;
        case 'security':
          label = 'Security';
          icon = <Shield className="w-4 h-4" />;
          break;
        case 'editor':
          label = 'Editorial';
          icon = <FileText className="w-4 h-4" />;
          break;
        case 'dashboard':
          // Skip adding dashboard again if we already added it
          continue;
        default:
          // Capitalize and format the segment
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        icon,
        isActive: isLast
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs if there's only one item
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            
            {item.isActive ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 font-medium text-charcoal"
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1.5 text-gray-600 hover:text-hot-pink transition-colors duration-200 hover:underline"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};