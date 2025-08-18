'use client';

import React from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '../Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
  size = 'sm',
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'accent'; // Using red accent for danger
      case 'warning':
        return 'accent';
      case 'success':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '❓';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-2xl">{getIcon()}</span>
        </div>
        
        {description && (
          <p className="text-body-md text-gray-600 mb-6">
            {description}
          </p>
        )}
        
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;