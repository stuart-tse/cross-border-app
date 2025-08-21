'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, withAuth } from '@/lib/context/AuthContext';
import { UserType } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

interface EditorLayoutProps {
  children: React.ReactNode;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems = [
    {
      href: `/${locale}/dashboard/editor`,
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview and stats'
    },
    {
      href: `/${locale}/dashboard/editor/posts`,
      label: 'Posts',
      icon: '📝',
      description: 'Manage content'
    },
    {
      href: `/${locale}/dashboard/editor/create`,
      label: 'Create Post',
      icon: '✍️',
      description: 'New article'
    },
    {
      href: `/${locale}/dashboard/editor/media`,
      label: 'Media Library',
      icon: '🖼️',
      description: 'Files and images'
    },
    {
      href: `/${locale}/dashboard/editor/analytics`,
      label: 'Analytics',
      icon: '📈',
      description: 'Performance insights'
    },
    {
      href: `/${locale}/dashboard/editor/profile`,
      label: 'Profile',
      icon: '👤',
      description: 'Editor settings'
    },
    {
      href: `/${locale}/dashboard/editor/settings`,
      label: 'Settings',
      icon: '⚙️',
      description: 'Preferences'
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === `/${locale}/dashboard/editor`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal transition-colors duration-300">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarCollapsed ? '80px' : '280px'
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen shadow-sm"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                animate={{
                  opacity: sidebarCollapsed ? 0 : 1
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✍️</span>
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h2 className="text-title-sm font-bold text-charcoal dark:text-white">
                      Content Studio
                    </h2>
                    <p className="text-body-sm text-gray-500">
                      Editor Dashboard
                    </p>
                  </div>
                )}
              </motion.div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <motion.span
                  animate={{
                    rotate: sidebarCollapsed ? 0 : 180
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-lg"
                >
                  ◀
                </motion.span>
              </Button>
            </div>

            {/* User Info */}
            <motion.div
              animate={{
                opacity: sidebarCollapsed ? 0 : 1
              }}
              className="mb-6 p-4 bg-gradient-to-r from-hot-pink/10 to-deep-pink/10 rounded-lg border border-hot-pink/20"
            >
              {!sidebarCollapsed && (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-hot-pink text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {user?.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <h3 className="text-body-md font-semibold text-charcoal dark:text-white">
                        {user?.name || 'Editor'}
                      </h3>
                      <p className="text-body-sm text-gray-500">
                        Content Editor
                      </p>
                    </div>
                  </div>
                  <div className="text-body-sm text-hot-pink font-medium">
                    ✨ Active Status
                  </div>
                </>
              )}
            </motion.div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative',
                        isActive
                          ? 'bg-gradient-to-r from-hot-pink to-deep-pink text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-charcoal dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      
                      <motion.div
                        animate={{
                          opacity: sidebarCollapsed ? 0 : 1,
                          width: sidebarCollapsed ? 0 : 'auto'
                        }}
                        className="overflow-hidden"
                      >
                        {!sidebarCollapsed && (
                          <>
                            <div className="text-body-md font-medium">
                              {item.label}
                            </div>
                            <div className={cn(
                              'text-body-sm opacity-75',
                              isActive ? 'text-white/80' : 'text-gray-500'
                            )}>
                              {item.description}
                            </div>
                          </>
                        )}
                      </motion.div>

                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="active-nav-indicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                          initial={false}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <motion.div
              animate={{
                opacity: sidebarCollapsed ? 0 : 1
              }}
              className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              {!sidebarCollapsed && (
                <>
                  <h3 className="text-body-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="justify-start text-left"
                      asChild
                    >
                      <Link href={`/${locale}/dashboard/editor/create`}>
                        <span className="mr-2">✍️</span>
                        New Post
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="justify-start text-left"
                    >
                      <span className="mr-2">📤</span>
                      Import Content
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default withAuth(EditorLayout, [UserType.BLOG_EDITOR]);