'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'hot-pink' | 'success-green' | 'electric-blue' | 'warning-amber' | 'error-red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'hot-pink',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    'hot-pink': 'bg-gradient-to-r from-hot-pink to-deep-pink',
    'success-green': 'bg-gradient-to-r from-success-green to-green-600',
    'electric-blue': 'bg-gradient-to-r from-electric-blue to-blue-600',
    'warning-amber': 'bg-gradient-to-r from-warning-amber to-orange-500',
    'error-red': 'bg-gradient-to-r from-error-red to-red-600',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          <span className="text-body-sm text-gray-600">
            {label || `${Math.round(percentage)}% Complete`}
          </span>
          {showLabel && (
            <span className="text-body-sm font-medium text-charcoal">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;