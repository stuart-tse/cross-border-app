'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusConfig, StatusType } from '@/lib/constants/statusConfig';

interface StatusIndicatorProps {
  type: StatusType;
  status: string;
  variant?: 'badge' | 'dot' | 'icon' | 'pill';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  status,
  variant = 'badge',
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
  children,
}) => {
  const config = getStatusConfig(type, status);
  
  if (!config) {
    console.warn(`Invalid status configuration: ${type}.${status}`);
    return null;
  }

  const sizeClasses = {
    xs: {
      badge: 'px-1.5 py-0.5 text-xs',
      dot: 'w-2 h-2',
      icon: 'text-xs',
      pill: 'px-2 py-0.5 text-xs',
    },
    sm: {
      badge: 'px-2 py-1 text-xs',
      dot: 'w-2.5 h-2.5',
      icon: 'text-sm',
      pill: 'px-2.5 py-1 text-xs',
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      dot: 'w-3 h-3',
      icon: 'text-base',
      pill: 'px-3 py-1 text-sm',
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      dot: 'w-4 h-4',
      icon: 'text-lg',
      pill: 'px-4 py-2 text-base',
    },
  };

  const renderContent = () => {
    if (children) return children;
    
    return (
      <>
        {showIcon && variant !== 'dot' && (
          <span className={cn('inline-block', variant === 'icon' ? '' : 'mr-1.5')}>
            {config.icon}
          </span>
        )}
        {showLabel && variant !== 'dot' && variant !== 'icon' && config.label}
      </>
    );
  };

  switch (variant) {
    case 'dot':
      return (
        <span
          className={cn(
            'inline-block rounded-full border-2 border-white',
            sizeClasses[size][variant],
            config.className.replace('text-', 'bg-').replace('border-', ''),
            className
          )}
          title={config.label}
          role="status"
          aria-label={`Status: ${config.label}`}
        />
      );

    case 'icon':
      return (
        <span
          className={cn(
            'inline-block',
            sizeClasses[size][variant],
            config.className.split(' ').filter(cls => cls.startsWith('text-')).join(' '),
            className
          )}
          title={config.label}
          role="status"
          aria-label={`Status: ${config.label}`}
        >
          {renderContent()}
        </span>
      );

    case 'pill':
      return (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-full border',
            sizeClasses[size][variant],
            config.className,
            className
          )}
          role="status"
          aria-label={`Status: ${config.label}`}
        >
          {renderContent()}
        </span>
      );

    case 'badge':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-md border',
            sizeClasses[size].badge,
            config.className,
            className
          )}
          role="status"
          aria-label={`Status: ${config.label}`}
        >
          {renderContent()}
        </span>
      );
  }
};

// Specialized status components for common use cases
interface UserStatusProps {
  status: string;
  verified?: boolean;
  variant?: 'badge' | 'dot' | 'icon' | 'pill';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  status,
  verified = false,
  variant = 'badge',
  size = 'md',
  className,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <StatusIndicator
        type="USER"
        status={status}
        variant={variant}
        size={size}
        className={className}
      />
      {verified && (
        <StatusIndicator
          type="USER"
          status="verified"
          variant="pill"
          size="sm"
          showIcon={true}
          showLabel={true}
        />
      )}
    </div>
  );
};

interface TripStatusProps {
  status: string;
  variant?: 'badge' | 'dot' | 'icon' | 'pill';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const TripStatus: React.FC<TripStatusProps> = ({
  status,
  variant = 'badge',
  size = 'md',
  className,
}) => {
  return (
    <StatusIndicator
      type="TRIP"
      status={status}
      variant={variant}
      size={size}
      className={className}
    />
  );
};

interface DocumentStatusProps {
  status: string;
  variant?: 'badge' | 'dot' | 'icon' | 'pill';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const DocumentStatus: React.FC<DocumentStatusProps> = ({
  status,
  variant = 'badge',
  size = 'md',
  className,
}) => {
  return (
    <StatusIndicator
      type="DOCUMENT"
      status={status}
      variant={variant}
      size={size}
      className={className}
    />
  );
};

interface PaymentStatusProps {
  status: string;
  variant?: 'badge' | 'dot' | 'icon' | 'pill';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  variant = 'badge',
  size = 'md',
  className,
}) => {
  return (
    <StatusIndicator
      type="PAYMENT"
      status={status}
      variant={variant}
      size={size}
      className={className}
    />
  );
};

export default StatusIndicator;