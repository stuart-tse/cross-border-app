'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/inputs';
import { useNotifications } from '@/lib/context/NotificationContext';
import { useAuth } from '@/lib/context/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useEmailUniquenessValidation } from '@/hooks/useAsyncValidation';
import { USER_TYPE_INFO } from '@/lib/constants';
import { UserType } from '@/types';

interface RegistrationFormProps {
  selectedUserType: UserType;
  onBack: () => void;
  onSuccess?: () => void;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  description: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
    description: 'Must be at least 8 characters long'
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
    description: 'Must contain at least one uppercase letter'
  },
  {
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
    description: 'Must contain at least one lowercase letter'
  },
  {
    label: 'One number',
    test: (password) => /\d/.test(password),
    description: 'Must contain at least one number'
  },
  {
    label: 'One special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    description: 'Must contain at least one special character (!@#$%^&*)'
  }
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedUserType,
  onBack,
  onSuccess,
  className,
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const { success: showSuccess, error: showError } = useNotifications();
  
  // Use new form validation hook
  const form = useFormValidation(registerSchema, {
    userType: selectedUserType,
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  }, {
    validateOnChange: true,
    validateOnBlur: true,
  });
  
  // Email uniqueness validation
  const emailValidation = useEmailUniquenessValidation({
    debounceMs: 500,
  });
  
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password strength calculation using new form state
  const passwordStrength = useMemo(() => {
    const password = form.formData.password || '';
    const satisfiedRequirements = PASSWORD_REQUIREMENTS.filter(req => req.test(password));
    const score = satisfiedRequirements.length;
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let color = 'bg-red-500';
    
    if (score >= 5) {
      strength = 'strong';
      color = 'bg-green-500';
    } else if (score >= 4) {
      strength = 'good';
      color = 'bg-yellow-500';
    } else if (score >= 2) {
      strength = 'fair';
      color = 'bg-orange-500';
    }
    
    return {
      score,
      total: PASSWORD_REQUIREMENTS.length,
      strength,
      color,
      percentage: (score / PASSWORD_REQUIREMENTS.length) * 100,
      requirements: PASSWORD_REQUIREMENTS.map(req => ({
        ...req,
        satisfied: req.test(password)
      }))
    };
  }, [form.formData.password]);

  // Handle email changes for uniqueness validation
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    form.setValue('email', email);
    
    // Clear global auth error
    if (error) {
      clearError();
    }
    
    // Trigger email uniqueness validation
    if (email && email.includes('@')) {
      emailValidation.validate(email);
    } else {
      emailValidation.reset();
    }
  }, [form, error, clearError, emailValidation]);

  // Handle form submission using new validation system
  const handleSubmit = form.handleSubmit(async (validatedData: RegisterFormData) => {
    // Check email uniqueness if validation is available
    if (emailValidation.isValid === false) {
      showError(
        'Registration Failed',
        'Please use a different email address.',
        { persistent: true }
      );
      return;
    }
    
    try {
      // Transform data to match API expectations
      const apiData = {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.fullName, // API expects 'name', not 'fullName'
        phone: validatedData.phone,
        role: selectedUserType.toUpperCase(), // API expects uppercase role
      };
      
      await register(apiData as any); // Temporary type assertion while we fix the interface
      showSuccess(
        'Account Created Successfully!',
        `Welcome to CrossBorder, ${validatedData.fullName}!`
      );
      onSuccess?.();
    } catch (err) {
      console.error('Registration failed:', err);
      // Error is handled by auth context and will show via global error state
    }
  });


  const userTypeInfo = USER_TYPE_INFO[selectedUserType];

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* User Type Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-3 px-4 py-3 bg-pink-tint rounded-xl border border-hot-pink/20">
          <span className="text-xl">{userTypeInfo.icon}</span>
          <div>
            <span className="text-sm font-medium text-hot-pink block">
              {userTypeInfo.label} Account
            </span>
            <span className="text-xs text-gray-600">
              {userTypeInfo.description}
            </span>
          </div>
        </div>
      </div>

      {/* Global Error Display */}
      <AnimatePresence>
        {error && (
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
              <span className="text-sm font-medium text-red-800">Registration Error</span>
            </div>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Fields */}
      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          {...form.getFieldProps('fullName')}
          required
          autoComplete="name"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={form.formData.email || ''}
          onChange={handleEmailChange}
          onBlur={() => form.touchField('email')}
          error={form.errors.email || (emailValidation.isValid === false ? emailValidation.message : undefined)}
          success={emailValidation.isValid === true ? emailValidation.message : undefined}
          required
          autoComplete="email"
          rightIcon={
            emailValidation.isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : undefined
          }
        />

        <PhoneInput
          label="Phone Number"
          placeholder="Enter your phone number (optional)"
          {...form.getFieldProps('phone')}
          validateUniqueness={false}
          countryCode="+852"
          autoComplete="tel"
        />

        {/* Password Field with Strength Indicator */}
        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            {...form.getFieldProps('password')}
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={(e) => {
              form.getFieldProps('password').onBlur();
              // Keep requirements visible if password is not strong enough
              if (passwordStrength.score < 4) {
                setShowPasswordRequirements(true);
              } else {
                setShowPasswordRequirements(false);
              }
            }}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Meter */}
          <AnimatePresence>
            {form.formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={cn(
                    'font-medium capitalize',
                    passwordStrength.strength === 'strong' && 'text-green-600',
                    passwordStrength.strength === 'good' && 'text-yellow-600',
                    passwordStrength.strength === 'fair' && 'text-orange-600',
                    passwordStrength.strength === 'weak' && 'text-red-600'
                  )}>
                    {passwordStrength.strength}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={cn('h-2 rounded-full transition-all duration-300', passwordStrength.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength.percentage}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Requirements */}
          <AnimatePresence>
            {showPasswordRequirements && form.formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-gray-50 rounded-lg border"
              >
                <h4 className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <div className="space-y-1">
                  {passwordStrength.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full border flex items-center justify-center',
                        req.satisfied 
                          ? 'bg-green-100 border-green-500' 
                          : 'bg-gray-100 border-gray-300'
                      )}>
                        {req.satisfied && (
                          <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs',
                        req.satisfied ? 'text-green-700' : 'text-gray-600'
                      )}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          {...form.getFieldProps('confirmPassword')}
          required
          autoComplete="new-password"
        />
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="flex-1"
          disabled={form.isSubmitting}
        >
          Back
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          className="flex-1 bg-gradient-to-r from-hot-pink to-deep-pink"
          isLoading={form.isSubmitting}
          disabled={form.isSubmitting || passwordStrength.score < 4 || emailValidation.isValid === false}
        >
          Create Account
        </Button>
      </div>

      {/* Terms Notice */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-600">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-hot-pink hover:underline" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-hot-pink hover:underline" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </div>
    </motion.form>
  );
};