'use client';

import React from 'react';
import { BaseModal } from './modals/BaseModal';

// Legacy Modal component - now uses BaseModal for backward compatibility
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      className={className}
    >
      {children}
    </BaseModal>
  );
};

// Re-export ConfirmModal from modals for backward compatibility
export { ConfirmModal } from './modals/ConfirmModal';

// Export all modal components for easy importing
export * from './modals';

// Import Button component for backward compatibility
import { Button } from './Button';