'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', icon, iconPosition = 'left', className, ...props }, ref) => {
    const variantClasses = {
      default: 'border-gray-300 focus:border-electric-blue focus:ring-electric-blue',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    };

    const baseClasses = cn(
      'flex h-10 w-full rounded-sm border bg-white px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-gray-400',
      'min-h-[44px]',
      variantClasses[variant]
    );

    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              baseClasses,
              iconPosition === 'left' && 'pl-10',
              iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          {iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      />
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