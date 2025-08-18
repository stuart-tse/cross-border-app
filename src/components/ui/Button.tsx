'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-sm',
    'transition-all duration-fast ease-primary',
    'focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'relative overflow-hidden',
    // Minimum touch target for accessibility
    'min-h-[44px]'
  );

  const variantClasses = {
    primary: cn(
      'bg-primary text-white border-0',
      'hover:bg-gray-800 hover:translate-y-[-1px] hover:shadow-md',
      'active:bg-gray-900 active:translate-y-0',
      'disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:translate-y-0 disabled:hover:shadow-none'
    ),
    secondary: cn(
      'bg-transparent text-primary border border-primary',
      'hover:bg-light-gray',
      'active:bg-gray-200',
      'disabled:border-gray-300 disabled:text-gray-400'
    ),
    accent: cn(
      'bg-hot-pink text-white border-0',
      'hover:bg-deep-pink hover:translate-y-[-1px] hover:shadow-md',
      'active:bg-deep-pink active:translate-y-0',
      'disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:translate-y-0 disabled:hover:shadow-none'
    ),
    destructive: cn(
      'bg-error-red text-white border-0',
      'hover:bg-red-700 hover:translate-y-[-1px] hover:shadow-md',
      'active:bg-red-800 active:translate-y-0',
      'disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:translate-y-0 disabled:hover:shadow-none'
    ),
    ghost: cn(
      'bg-transparent text-charcoal border-0',
      'hover:bg-light-gray',
      'active:bg-gray-200'
    ),
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isLoading && 'text-transparent',
        className
      )}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      {...(props as any)}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
        </div>
      )}

      {/* Button content */}
      {!isLoading && (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};