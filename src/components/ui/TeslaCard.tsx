'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TeslaCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const TeslaCard: React.FC<TeslaCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'lg',
  onClick,
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-md border-gray-200/50 shadow-lg',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-md',
    elevated: 'bg-white border-gray-200 shadow-lg',
  };

  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' 
    : '';

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 lg:p-8',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default TeslaCard;