'use client';

import React from 'react';
import { ConfirmModal } from './ConfirmModal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  customMessage?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false,
  customMessage,
}) => {
  const title = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
  const description = 
    customMessage || 
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
      size="sm"
    />
  );
};

export default DeleteConfirmModal;