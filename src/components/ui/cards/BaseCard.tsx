'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'service' | 'feature' | 'testimonial' | 'gradient';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asMotion?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  variant = 'default',
  hover = true,
  padding = 'lg',
  children,
  className,
  asMotion = false,
  ...props
}) => {
  const baseClasses = cn(
    'rounded-lg border transition-all duration-200 ease-primary',
    hover && 'hover:shadow-md hover:-translate-y-1'
  );

  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-md border-gray-200/50 shadow-lg',
    elevated: 'bg-white border-gray-200 shadow-lg',
    service: 'bg-white border border-light-gray shadow-sm',
    feature: 'bg-gray-50 text-center',
    testimonial: 'bg-white shadow-sm border border-gray-100',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-md',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 lg:p-8',
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  );

  const motionProps = hover ? {
    whileHover: { 
      y: -4,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      transition: { duration: 0.2 }
    }
  } : {};

  if (asMotion) {
    return (
      <motion.div
        className={combinedClasses}
        {...(hover ? motionProps : {})}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};