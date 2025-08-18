'use client';

import React from 'react';
import { DocumentStatus } from './status/StatusIndicator';

// Legacy StatusBadge component - now uses the unified status system
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
  // Map size to unified system
  const unifiedSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  
  return (
    <DocumentStatus
      status={status}
      variant="pill"
      size={unifiedSize}
      showIcon={showIcon}
      showLabel={!children}
      className={className}
    >
      {children}
    </DocumentStatus>
  );
};

// Re-export components from unified status system
export { StatusIndicator, UserStatus, TripStatus, DocumentStatus, PaymentStatus } from './status';
export default StatusBadge;