'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useFormValidation, UseFormValidationReturn } from '@/hooks/useFormValidation';

export interface ValidatedFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: (form: UseFormValidationReturn<T>) => ReactNode;
  className?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showGlobalError?: boolean;
  globalError?: string | null;
  onGlobalErrorDismiss?: () => void;
}

/**
 * Wrapper component that provides form validation context to its children
 * Uses render props pattern for maximum flexibility
 */
export function ValidatedForm<T extends Record<string, any>>({
  schema,
  initialData = {},
  onSubmit,
  children,
  className,
  validateOnChange = true,
  validateOnBlur = true,
  showGlobalError = true,
  globalError,
  onGlobalErrorDismiss,
}: ValidatedFormProps<T>) {
  const form = useFormValidation(schema, initialData, {
    validateOnChange,
    validateOnBlur,
    revalidateOnSubmit: true,
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Global Error Display */}
      {showGlobalError && (
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="text-sm font-medium text-red-800">Error</span>
                    <p className="mt-1 text-sm text-red-700">{globalError}</p>
                  </div>
                </div>
                {onGlobalErrorDismiss && (
                  <button
                    type="button"
                    onClick={onGlobalErrorDismiss}
                    className="text-red-400 hover:text-red-600 transition-colors ml-4"
                    aria-label="Dismiss error"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Form validation error summary */}
      <AnimatePresence>
        {Object.keys(form.errors).length > 0 && form.touchedFields.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">
                Please fix the following errors:
              </span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(form.errors).map(([field, error]) => (
                <li key={field} className="flex items-start space-x-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>
                    <strong className="capitalize">{field}:</strong> {error}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render children with form context */}
      {children(form)}
    </motion.form>
  );
}

// Specialized form components for common use cases

export interface LoginFormWrapperProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void> | void;
  children: (form: UseFormValidationReturn<{ email: string; password: string }>) => ReactNode;
  className?: string;
  globalError?: string | null;
  onGlobalErrorDismiss?: () => void;
}

export function LoginFormWrapper({ onSubmit, children, ...props }: LoginFormWrapperProps) {
  const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  return (
    <ValidatedForm
      schema={schema}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={true}
      {...props}
    >
      {children}
    </ValidatedForm>
  );
}

export interface RegisterFormWrapperProps {
  onSubmit: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone?: string;
  }) => Promise<void> | void;
  children: (form: UseFormValidationReturn<{
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone?: string;
  }>) => ReactNode;
  className?: string;
  globalError?: string | null;
  onGlobalErrorDismiss?: () => void;
}

export function RegisterFormWrapper({ onSubmit, children, ...props }: RegisterFormWrapperProps) {
  const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
        'Password must contain uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z.string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    phone: z.string().optional().refine((val) => {
      if (!val) return true;
      return /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s\-\(\)]/g, ''));
    }, 'Please enter a valid phone number'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

  return (
    <ValidatedForm
      schema={schema}
      onSubmit={onSubmit}
      validateOnChange={true}
      validateOnBlur={true}
      {...props}
    >
      {children}
    </ValidatedForm>
  );
}

// Hook for creating custom form wrappers
export function useFormWrapper<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  defaultOptions?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showGlobalError?: boolean;
  }
) {
  return function FormWrapper({
    onSubmit,
    children,
    className,
    globalError,
    onGlobalErrorDismiss,
    ...options
  }: {
    onSubmit: (data: T) => Promise<void> | void;
    children: (form: UseFormValidationReturn<T>) => ReactNode;
    className?: string;
    globalError?: string | null;
    onGlobalErrorDismiss?: () => void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showGlobalError?: boolean;
  }) {
    return (
      <ValidatedForm
        schema={schema}
        onSubmit={onSubmit}
        className={className}
        globalError={globalError}
        onGlobalErrorDismiss={onGlobalErrorDismiss}
        {...defaultOptions}
        {...options}
      >
        {children}
      </ValidatedForm>
    );
  };
}