'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'default' | 'error' | 'success';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rightIcon?: React.ReactNode;
  error?: string;
  success?: string;
  // Custom props that should not be passed to DOM
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label,
    variant = 'default', 
    icon, 
    iconPosition = 'left', 
    rightIcon,
    error,
    success,
    className,
    isLoading, // Filter out isLoading prop
    ...domProps // Only pass valid DOM props
  }, ref) => {
    const hasError = variant === 'error' || !!error;
    const hasSuccess = variant === 'success' || !!success;
    
    const variantClasses = {
      default: 'border-gray-300 focus:border-electric-blue focus:ring-electric-blue',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    };

    const getBorderStyle = () => {
      if (hasError) return variantClasses.error;
      if (hasSuccess) return variantClasses.success;
      return variantClasses.default;
    };

    const baseClasses = cn(
      'flex h-10 w-full rounded-sm border bg-white px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-gray-400',
      'min-h-[44px]',
      getBorderStyle()
    );

    const renderInput = () => {
      if (icon || rightIcon) {
        return (
          <div className="relative">
            {icon && iconPosition === 'left' && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <input
              ref={ref}
              className={cn(
                baseClasses,
                icon && iconPosition === 'left' && 'pl-10',
                (icon && iconPosition === 'right') || rightIcon ? 'pr-10' : '',
                className
              )}
              {...domProps}
            />
            {((icon && iconPosition === 'right') || rightIcon) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {rightIcon || icon}
              </div>
            )}
          </div>
        );
      }

      return (
        <input
          ref={ref}
          className={cn(baseClasses, className)}
          {...domProps}
        />
      );
    };

    if (label) {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-charcoal">
            {label}
          </label>
          {renderInput()}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600">
              {success}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {renderInput()}
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600">
            {success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Re-export Select components for backward compatibility
export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from './select';

// Re-export Textarea component for backward compatibility
export { Textarea } from './textarea';