'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  required = false, 
  className, 
  ...props 
}) => {
  return (
    <label
      className={cn(
        'block mb-2 text-body-md font-semibold text-charcoal',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-chinese-red ml-1">*</span>}
    </label>
  );
};