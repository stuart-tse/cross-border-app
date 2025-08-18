'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { DASHBOARD_NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { user, selectedRole } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get navigation items based on user's selected role
  const currentRole = selectedRole || user?.roles?.[0]?.role || 'CLIENT';
  const userTypeKey = currentRole.toLowerCase() as keyof typeof DASHBOARD_NAV_ITEMS;
  const navItems = DASHBOARD_NAV_ITEMS[userTypeKey] || DASHBOARD_NAV_ITEMS.client;

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      
      // Find matching nav item
      const navItem = navItems.find(item => item.href === currentPath);
      if (navItem) {
        breadcrumbs.push({
          label: navItem.label,
          href: currentPath,
          isActive: currentPath === pathname
        });
      } else {
        // Generate readable label from segment
        const label = segment.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        breadcrumbs.push({
          label,
          href: currentPath,
          isActive: currentPath === pathname
        });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#FF69B4] rounded-full"></div>
              <span className="ml-3 text-xl font-bold text-charcoal">CrossBorder</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                  pathname === item.href
                    ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-pink-tint hover:text-hot-pink hover:shadow-md hover:transform hover:scale-102'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#FF69B4] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {(() => {
                    const roleMap: Record<string, string> = {
                      'CLIENT': 'Client',
                      'DRIVER': 'Driver',
                      'BLOG_EDITOR': 'Editor',
                      'ADMIN': 'Administrator',
                    };
                    return roleMap[currentRole] || 'User';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <div></div>
          </div>
        </div>

        {/* Page header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Breadcrumbs */}
              {breadcrumbs.length > 1 && (
                <nav className="flex mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={crumb.href} className="flex items-center">
                        {index > 0 && (
                          <span className="mx-2 text-gray-400">/</span>
                        )}
                        {crumb.isActive ? (
                          <span className="text-hot-pink font-medium">{crumb.label}</span>
                        ) : (
                          <Link 
                            href={crumb.href}
                            className="text-gray-600 hover:text-hot-pink transition-colors duration-200"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </motion.div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};