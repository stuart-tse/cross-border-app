'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'hot-pink' | 'success-green' | 'electric-blue';
  label?: string;
  description?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'hot-pink',
  label,
  description,
  className,
}) => {
  const sizeConfig = {
    sm: {
      container: 'w-8 h-5',
      thumb: 'h-3 w-3',
      translate: 'translate-x-3',
    },
    md: {
      container: 'w-11 h-6',
      thumb: 'h-4 w-4',
      translate: 'translate-x-5',
    },
    lg: {
      container: 'w-14 h-7',
      thumb: 'h-5 w-5',
      translate: 'translate-x-7',
    },
  };

  const colorClasses = {
    'hot-pink': checked ? 'bg-hot-pink' : 'bg-gray-200',
    'success-green': checked ? 'bg-success-green' : 'bg-gray-200',
    'electric-blue': checked ? 'bg-electric-blue' : 'bg-gray-200',
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center', className)}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <div className="text-body-md font-medium text-charcoal">
              {label}
            </div>
          )}
          {description && (
            <div className="text-body-sm text-gray-600">
              {description}
            </div>
          )}
        </div>
      )}
      
      <button
        type="button"
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hot-pink',
          config.container,
          colorClasses[color],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'inline-block bg-white rounded-full shadow-lg transform transition-transform duration-200',
            config.thumb,
            checked ? config.translate : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};

export default Toggle;