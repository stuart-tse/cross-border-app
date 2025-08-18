'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { USER_TYPES, USER_TYPE_INFO } from '@/lib/constants';
import { User, UserType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onToggleMode: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onToggleMode,
  onSuccess,
}) => {
  const { login, register, error, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState<UserType>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          userType: selectedUserType,
        });
      }
      
      // Success is handled by the auth context - it will redirect automatically
      resetForm();
      onClose();
    } catch (err) {
      // Error is handled by auth context
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    });
    setErrors({});
    setSelectedUserType('client');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeToggle = () => {
    resetForm();
    onToggleMode();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={mode === 'login' ? 'Welcome Back' : 'Create Account'}
      description={mode === 'login' ? 'Sign in to your account' : 'Join our premium cross-border service'}
    >
      <div className="space-y-6">
        {/* Step Indicator for Registration */}
        {mode === 'register' && (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              step >= 1 ? 'bg-hot-pink text-white' : 'bg-gray-200 text-gray-600'
            )}>
              1
            </div>
            <div className={cn(
              'w-12 h-0.5',
              step >= 2 ? 'bg-hot-pink' : 'bg-gray-200'
            )} />
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              step >= 2 ? 'bg-hot-pink text-white' : 'bg-gray-200 text-gray-600'
            )}>
              2
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && step === 1 ? (
              <motion.div
                key="user-type-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-charcoal text-center">
                  Choose Your Account Type
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(USER_TYPE_INFO).map(([type, info]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedUserType(type as UserType)}
                      className={cn(
                        'p-4 rounded-lg border-2 text-left transition-all duration-200 hover:border-hot-pink',
                        selectedUserType === type
                          ? 'border-hot-pink bg-pink-tint'
                          : 'border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                          <h4 className="font-medium text-charcoal">{info.label}</h4>
                          <p className="text-sm text-gray-600">{info.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="primary"
                  className="w-full"
                >
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-pink-tint rounded-full">
                      <span className="text-lg">
                        {USER_TYPE_INFO[selectedUserType].icon}
                      </span>
                      <span className="text-sm font-medium text-hot-pink">
                        {USER_TYPE_INFO[selectedUserType].label} Account
                      </span>
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                    placeholder="Enter your full name"
                    required
                  />
                )}

                {/* Auth Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />

                {mode === 'register' && (
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                    required
                  />
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-hot-pink hover:text-deep-pink transition-colors duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <div className="flex space-x-3">
                  {mode === 'register' && step === 2 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Social Login Options */}
        {(mode === 'login' || (mode === 'register' && step === 2)) && (
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
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="mr-2">📧</span>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="mr-2">💬</span>
                WeChat
              </button>
            </div>
          </div>
        )}

        {/* Toggle Mode */}
        {(mode === 'login' || (mode === 'register' && step === 2)) && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={handleModeToggle}
                className="text-hot-pink hover:text-deep-pink font-medium transition-colors duration-200"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};