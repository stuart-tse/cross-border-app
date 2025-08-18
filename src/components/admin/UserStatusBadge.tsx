'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verified?: boolean;
  className?: string;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  verified = false, 
  className 
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          getStatusStyles(status),
          className
        )}
        role="status"
        aria-label={`Account status: ${status}`}
      >
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" aria-hidden="true" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      
      {verified && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          role="status"
          aria-label="Verified account"
        >
          <svg 
            className="w-3 h-3 mr-1" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          Verified
        </span>
      )}
    </div>
  );
};

export default UserStatusBadge;