'use client';

import React, { useState } from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '../Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void> | void;
  title: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  showFooter?: boolean;
  footerAlignment?: 'left' | 'center' | 'right' | 'between';
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  submitText = 'Save',
  cancelText = 'Cancel',
  size = 'md',
  children,
  showFooter = true,
  footerAlignment = 'right',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      // Error is handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const getFooterClasses = () => {
    const baseClasses = 'flex gap-3 mt-6';
    switch (footerAlignment) {
      case 'left':
        return `${baseClasses} justify-start`;
      case 'center':
        return `${baseClasses} justify-center`;
      case 'between':
        return `${baseClasses} justify-between`;
      default:
        return `${baseClasses} justify-end`;
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        
        {showFooter && (
          <div className={getFooterClasses()}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className={footerAlignment === 'between' ? '' : 'min-w-[100px]'}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className={footerAlignment === 'between' ? '' : 'min-w-[100px]'}
            >
              {submitText}
            </Button>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default FormModal;