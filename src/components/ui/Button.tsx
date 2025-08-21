'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asMotion?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    asMotion = false,
    children,
    className,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth && 'w-full'
    );

    const variantClasses = {
      primary: 'bg-[#FF69B4] text-white rounded-lg hover:bg-[#FF1493] focus:ring-[#FF69B4] shadow-sm',
      secondary: 'bg-charcoal text-white rounded-sm hover:bg-gray-800 focus:ring-charcoal',
      outline: 'border border-[#FF69B4] text-[#FF69B4] rounded-lg hover:bg-[#FF69B4] hover:text-white focus:ring-[#FF69B4]',
      ghost: 'text-charcoal hover:bg-gray-100 focus:ring-gray-300',
      danger: 'bg-chinese-red text-white rounded-sm hover:bg-red-600 focus:ring-chinese-red',
      success: 'bg-success-green text-white rounded-sm hover:bg-green-600 focus:ring-success-green',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm h-9',
      md: 'px-4 py-2 text-sm font-medium h-10',
      lg: 'px-6 py-3 text-lg h-12',
      xl: 'px-8 py-4 text-xl h-14',
    };

    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    const content = (
      <>
        {(leftIcon && !isLoading) && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {isLoading && (
          <span className="mr-2 flex-shrink-0">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        )}
        
        <span className={cn("flex-1", !fullWidth && "")}>
          {children}
        </span>
        
        {(rightIcon && !isLoading) && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </>
    );

    if (asMotion) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          disabled={disabled || isLoading}
          whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
          whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
          {...props}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';