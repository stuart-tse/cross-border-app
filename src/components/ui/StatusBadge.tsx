'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected' | 'required' | 'uploading' | 'processing';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className,
  children,
}) => {
  const statusConfig = {
    approved: {
      label: 'Approved',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    pending: {
      label: 'Pending',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    rejected: {
      label: 'Rejected',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    required: {
      label: 'Required',
      icon: '📄',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    uploading: {
      label: 'Uploading',
      icon: '📤',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    processing: {
      label: 'Processing',
      icon: '⚙️',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium rounded-full border',
      sizeClasses[size],
      config.className,
      className
    )}>
      {showIcon && <span>{config.icon}</span>}
      {children || config.label}
    </span>
  );
};

export default StatusBadge;