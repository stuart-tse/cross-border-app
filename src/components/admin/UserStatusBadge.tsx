'use client';

import React from 'react';
import { UserStatus } from '@/components/ui/status';

// Legacy UserStatusBadge component - now uses the unified status system
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
  return (
    <UserStatus
      status={status}
      verified={verified}
      variant="pill"
      size="sm"
      className={className}
    />
  );
};

export default UserStatusBadge;