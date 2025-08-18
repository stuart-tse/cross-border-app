'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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