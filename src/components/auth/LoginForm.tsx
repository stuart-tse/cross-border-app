'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useAuth } from '@/lib/context/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { useFormValidation } from '@/hooks/useFormValidation';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
  className?: string;
}

interface LoginAttempt {
  timestamp: number;
  email: string;
}

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSuccess,
  className,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const { success: showSuccess, error: showError, info: showInfo } = useNotifications();
  
  // Use new form validation hook
  const form = useFormValidation(loginSchema, {
    email: '',
    password: '',
  }, {
    validateOnChange: false, // Only validate on blur for better UX
    validateOnBlur: true,
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Load saved email and login attempts from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedAttempts = localStorage.getItem('loginAttempts');
    
    if (savedEmail) {
      form.setValue('email', savedEmail);
      setRememberMe(true);
    }
    
    if (savedAttempts) {
      try {
        const attempts = JSON.parse(savedAttempts) as LoginAttempt[];
        setLoginAttempts(attempts);
        checkLockoutStatus(attempts);
      } catch (e) {
        console.error('Error parsing login attempts:', e);
        localStorage.removeItem('loginAttempts');
      }
    }
  }, [form]);

  // Timer for lockout countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLocked && lockoutEnd) {
      timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, lockoutEnd - now);
        
        if (remaining === 0) {
          setIsLocked(false);
          setLockoutEnd(null);
          setLoginAttempts([]);
          localStorage.removeItem('loginAttempts');
        } else {
          setRemainingTime(remaining);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockoutEnd]);

  // Check if user is locked out
  const checkLockoutStatus = useCallback((attempts: LoginAttempt[]) => {
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < ATTEMPT_WINDOW
    );
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const lastAttempt = Math.max(...recentAttempts.map(a => a.timestamp));
      const lockEnd = lastAttempt + LOCKOUT_DURATION;
      
      if (now < lockEnd) {
        setIsLocked(true);
        setLockoutEnd(lockEnd);
        setRemainingTime(lockEnd - now);
        return true;
      }
    }
    
    return false;
  }, []);

  // Add failed login attempt
  const addFailedAttempt = useCallback((email: string) => {
    const attempt: LoginAttempt = {
      timestamp: Date.now(),
      email: email.toLowerCase(),
    };
    
    const updatedAttempts = [...loginAttempts, attempt];
    setLoginAttempts(updatedAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
    
    // Check if this triggers a lockout
    checkLockoutStatus(updatedAttempts);
    
    // Show warning if approaching limit
    const recentAttempts = updatedAttempts.filter(a => 
      Date.now() - a.timestamp < ATTEMPT_WINDOW && 
      a.email === email.toLowerCase()
    );
    
    const remainingAttempts = MAX_ATTEMPTS - recentAttempts.length;
    
    if (remainingAttempts > 0 && remainingAttempts <= 2) {
      showInfo(
        'Login Attempts Warning',
        `${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining before temporary lockout.`,
        { duration: 8000 }
      );
    }
  }, [loginAttempts, checkLockoutStatus, showInfo]);

  // Clear global auth error when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [form.formData, error, clearError]);

  // Handle remember me
  const handleRememberMeChange = useCallback((checked: boolean) => {
    setRememberMe(checked);
    
    if (checked && form.formData.email) {
      localStorage.setItem('rememberedEmail', form.formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }, [form.formData.email]);

  // Handle form submission using new validation system
  const handleSubmit = form.handleSubmit(async (validatedData: LoginFormData) => {
    // Check if locked out
    if (isLocked) {
      showError(
        'Account Temporarily Locked',
        `Too many failed attempts. Please try again in ${Math.ceil(remainingTime / 60000)} minutes.`,
        { persistent: true }
      );
      return;
    }
    
    try {
      console.log('🔐 LoginForm: Starting login process for:', validatedData.email);
      
      await login(validatedData.email, validatedData.password);
      
      // Clear failed attempts on successful login
      setLoginAttempts([]);
      localStorage.removeItem('loginAttempts');
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', validatedData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      showSuccess(
        'Welcome Back!',
        'You have been successfully logged in.'
      );
      
      console.log('✅ LoginForm: Login successful, calling onSuccess');
      onSuccess?.();
      
    } catch (err) {
      console.error('❌ LoginForm: Login failed:', err);
      
      // Add failed attempt for rate limiting
      addFailedAttempt(validatedData.email);
      
      // Get the error message from the caught error or auth context
      const errorMessage = (err instanceof Error ? err.message : String(err)) || error;
      
      // Handle specific error types
      if (errorMessage?.includes('CredentialsSignin') || errorMessage?.includes('Invalid')) {
        showError(
          'Login Failed',
          'Invalid email or password. Please check your credentials and try again.',
          { persistent: true }
        );
      } else if (errorMessage?.includes('Account locked') || errorMessage?.includes('deactivated')) {
        showError(
          'Account Locked',
          'Your account has been temporarily locked or deactivated. Please contact support.',
          { persistent: true }
        );
      } else if (errorMessage?.includes('rate limit') || errorMessage?.includes('Too many')) {
        showError(
          'Too Many Attempts',
          'Please wait before trying again.',
          { persistent: true }
        );
      } else if (errorMessage?.includes('network') || errorMessage?.includes('Network')) {
        showError(
          'Connection Error',
          'Network error occurred. Please check your connection and try again.',
          { persistent: true }
        );
      } else {
        showError(
          'Login Failed',
          errorMessage || 'An unexpected error occurred. Please try again.',
          { persistent: true }
        );
      }
    }
  });

  // Format remaining time for display
  const formatRemainingTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Lockout Warning */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">Account Temporarily Locked</span>
            </div>
            <p className="mt-1 text-sm text-red-700">
              Too many failed login attempts. Please try again in {formatRemainingTime(remainingTime)}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Error Display */}
      <AnimatePresence>
        {error && !isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">Login Error</span>
            </div>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Fields */}
      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          {...form.getFieldProps('email')}
          required
          autoComplete="email"
          disabled={isLocked}
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            {...form.getFieldProps('password')}
            required
            autoComplete="current-password"
            disabled={isLocked}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />
        </div>
      </div>

      {/* Form Options */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => handleRememberMeChange(e.target.checked)}
            className="w-4 h-4 text-hot-pink border-gray-300 rounded focus:ring-hot-pink focus:ring-2"
            disabled={isLocked}
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        
        <button
          type="button"
          className="text-sm text-hot-pink hover:text-deep-pink transition-colors duration-200"
          onClick={() => {
            // TODO: Implement forgot password functionality
            showInfo('Forgot Password', 'This feature will be available soon.');
          }}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full bg-gradient-to-r from-hot-pink to-deep-pink"
        loading={form.isSubmitting}
        disabled={form.isSubmitting || isLocked}
      >
        {isLocked ? `Locked (${formatRemainingTime(remainingTime)})` : 'Sign In'}
      </Button>

      {/* Social Login */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              // TODO: Implement Google OAuth
              showInfo('Google Login', 'Social login coming soon!');
            }}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            disabled={isLocked}
          >
            <span className="mr-2">🌐</span>
            Google
          </button>
          <button
            type="button"
            onClick={() => {
              // TODO: Implement WeChat OAuth
              showInfo('WeChat Login', 'Social login coming soon!');
            }}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            disabled={isLocked}
          >
            <span className="mr-2">💬</span>
            WeChat
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm text-gray-600 hover:text-hot-pink transition-colors duration-200"
          disabled={isLocked}
        >
          Don&apos;t have an account?{' '}
          <span className="font-semibold text-hot-pink">Sign up</span>
        </button>
      </div>
    </motion.form>
  );
};