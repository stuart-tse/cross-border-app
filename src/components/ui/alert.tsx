'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'default', 
  children, 
  className, 
  ...props 
}) => {
  const variantClasses = {
    default: 'border-blue-200 bg-blue-50 text-blue-800',
    destructive: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3',
        variantClasses[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn('text-sm leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  );
};