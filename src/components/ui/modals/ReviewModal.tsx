'use client';

import React from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '../Button';

interface ReviewItem {
  label: string;
  value: React.ReactNode;
  highlighted?: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  items: ReviewItem[];
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showConfirmButton?: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  items,
  confirmText = 'Confirm',
  cancelText = 'Close',
  isLoading = false,
  size = 'md',
  showConfirmButton = true,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
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
      <div className="space-y-4">
        {/* Review Items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-start p-3 rounded-lg ${
                item.highlighted ? 'bg-electric-blue/10 border border-electric-blue/20' : 'bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <dt className="text-sm font-medium text-gray-600 mb-1">
                  {item.label}
                </dt>
                <dd className="text-body-md text-charcoal break-words">
                  {item.value}
                </dd>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          {showConfirmButton && onConfirm && (
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isLoading}
              className="flex-1"
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default ReviewModal;