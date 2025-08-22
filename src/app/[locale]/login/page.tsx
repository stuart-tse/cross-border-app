'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { USER_TYPE_INFO } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { UserType } from '@/types';
import { useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'register' | 'userTypeSelection';

export default function LoginPage() {
  const { isAuthenticated, isLoading, selectedRole } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const searchParams = useSearchParams();

  // Redirect if already authenticated - with more precise conditions
  useEffect(() => {
    // Only redirect if we're definitely authenticated and not in a loading state
    if (isAuthenticated && !isLoading && selectedRole) {
      const callbackUrl = searchParams.get('callbackUrl');
      
      console.log('Auth redirect triggered:', { 
        isAuthenticated, 
        isLoading, 
        selectedRole, 
        callbackUrl 
      });
      
      if (callbackUrl) {
        // Use the callback URL if provided
        window.location.href = decodeURIComponent(callbackUrl);
      } else {
        // Fallback to role-based dashboard with locale prefix
        const dashboardRoutes = {
          'CLIENT': '/en/dashboard/client',
          'DRIVER': '/en/dashboard/driver',
          'BLOG_EDITOR': '/en/dashboard/editor',
          'ADMIN': '/en/dashboard/admin',
        };
        const defaultRoute = dashboardRoutes[selectedRole as keyof typeof dashboardRoutes] || '/en/dashboard/client';
        window.location.href = defaultRoute;
      }
    }
  }, [isAuthenticated, isLoading, selectedRole, searchParams]);

  // Handle user type selection
  const handleUserTypeSelection = (userType: UserType) => {
    setSelectedUserType(userType);
    setAuthMode('register');
  };

  // Handle navigation between forms
  const handleBackToUserSelection = () => {
    setAuthMode('userTypeSelection');
    setSelectedUserType(null);
  };

  const handleSwitchToRegister = () => {
    setAuthMode('userTypeSelection');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
    setSelectedUserType(null);
  };

  // Show loading only if we're loading AND already authenticated
  // If we're not authenticated, show the login form immediately
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-tint to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hot-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-tint to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-hot-pink to-deep-pink rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-charcoal text-xl">CrossBorder</span>
                <span className="text-sm text-gray-600">Premium Services</span>
              </div>
            </Link>
          </motion.div>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <AnimatePresence mode="wait">
              {authMode === 'userTypeSelection' && (
                <motion.div
                  key="userTypeSelection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-headline-sm font-bold text-charcoal mb-2">
                      Choose Account Type
                    </h1>
                    <p className="text-body-md text-gray-600">
                      Select the type of account you&apos;d like to create
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    {Object.entries(USER_TYPE_INFO).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => handleUserTypeSelection(key as UserType)}
                        className={cn(
                          'w-full p-4 border-2 rounded-lg text-left transition-all duration-200',
                          'hover:border-hot-pink hover:bg-pink-tint/50 focus:outline-none focus:ring-2 focus:ring-hot-pink',
                          'border-gray-200'
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-hot-pink to-deep-pink rounded-xl flex items-center justify-center text-white text-lg">
                            {info.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-title-sm font-semibold text-charcoal">
                              {info.label}
                            </h3>
                            <p className="text-body-sm text-gray-600 mt-1">
                              {info.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSwitchToLogin}
                    className="w-full text-center text-body-md text-gray-600 hover:text-hot-pink transition-colors"
                  >
                    ← Back to login
                  </button>
                </motion.div>
              )}

              {authMode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-headline-sm font-bold text-charcoal mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-body-md text-gray-600">
                      Sign in to your account to continue
                    </p>
                  </div>

                  <LoginForm onSwitchToRegister={handleSwitchToRegister} />
                </motion.div>
              )}

              {authMode === 'register' && selectedUserType && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-headline-sm font-bold text-charcoal mb-2">
                      Create Account
                    </h1>
                    <p className="text-body-md text-gray-600">
                      Get started with your {USER_TYPE_INFO[selectedUserType]?.label} account
                    </p>
                  </div>

                  <RegistrationForm
                    selectedUserType={selectedUserType}
                    onBack={handleBackToUserSelection}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-body-sm text-gray-500"
          >
            <p>
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-hot-pink hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-hot-pink hover:underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
  );
}