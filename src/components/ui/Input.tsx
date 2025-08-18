'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    
    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-body-md font-semibold text-charcoal"
          >
            {label}
            {props.required && <span className="text-chinese-red ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 border rounded-sm transition-all duration-fast ease-primary',
              'bg-white text-body-md placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              'min-h-[44px]', // Accessibility: minimum touch target
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              hasError && 'border-error-red focus:ring-error-red focus:border-error-red',
              hasSuccess && 'border-success-green focus:ring-success-green focus:border-success-green',
              !hasError && !hasSuccess && 'border-gray-300',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hasSuccess ? `${inputId}-success` : undefined
            }
            whileFocus={{ scale: 1.02 }}
            {...(props as any)}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
          
          {hasSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success-green"
            >
              <CheckIcon />
            </motion.div>
          )}
        </div>
        
        {error && (
          <motion.div
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-body-sm text-error-red"
          >
            <span className="mr-1">⚠</span>
            {error}
          </motion.div>
        )}
        
        {success && !error && (
          <motion.div
            id={`${inputId}-success`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-body-sm text-success-green"
          >
            <span className="mr-1">✓</span>
            {success}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, success, className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    
    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={textareaId}
            className="block mb-2 text-body-md font-semibold text-charcoal"
          >
            {label}
            {props.required && <span className="text-chinese-red ml-1">*</span>}
          </label>
        )}
        
        <motion.textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 border rounded-sm transition-all duration-fast ease-primary',
            'bg-white text-body-md placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue',
            'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
            'resize-vertical min-h-[100px]',
            hasError && 'border-error-red focus:ring-error-red focus:border-error-red',
            hasSuccess && 'border-success-green focus:ring-success-green focus:border-success-green',
            !hasError && !hasSuccess && 'border-gray-300',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${textareaId}-error` : hasSuccess ? `${textareaId}-success` : undefined
          }
          whileFocus={{ scale: 1.02 }}
          {...(props as any)}
        />
        
        {error && (
          <motion.div
            id={`${textareaId}-error`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-body-sm text-error-red"
          >
            <span className="mr-1">⚠</span>
            {error}
          </motion.div>
        )}
        
        {success && !error && (
          <motion.div
            id={`${textareaId}-success`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-body-sm text-success-green"
          >
            <span className="mr-1">✓</span>
            {success}
          </motion.div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, success, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    
    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-2 text-body-md font-semibold text-charcoal"
          >
            {label}
            {props.required && <span className="text-chinese-red ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-3 border rounded-sm transition-all duration-fast ease-primary',
              'bg-white text-body-md appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              'min-h-[44px]', // Accessibility: minimum touch target
              hasError && 'border-error-red focus:ring-error-red focus:border-error-red',
              hasSuccess && 'border-success-green focus:ring-success-green focus:border-success-green',
              !hasError && !hasSuccess && 'border-gray-300',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${selectId}-error` : hasSuccess ? `${selectId}-success` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>
        
        {error && (
          <motion.div
            id={`${selectId}-error`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-body-sm text-error-red"
          >
            <span className="mr-1">⚠</span>
            {error}
          </motion.div>
        )}
        
        {success && !error && (
          <motion.div
            id={`${selectId}-success`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center text-body-sm text-success-green"
          >
            <span className="mr-1">✓</span>
            {success}
          </motion.div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Simple icons
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);