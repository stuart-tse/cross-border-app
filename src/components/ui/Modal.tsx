'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previous focus and restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal container
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Restore previous focus
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={cn(
              'relative w-full bg-white rounded-lg shadow-lg',
              'max-h-[90vh] overflow-hidden flex flex-col',
              sizeClasses[size],
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    {title && (
                      <h2
                        id="modal-title"
                        className="text-title-lg font-semibold text-charcoal"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id="modal-description"
                        className="mt-1 text-body-md text-gray-600"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className={cn(
                      'ml-4 -mt-2 -mr-2 p-2 rounded-sm text-gray-400',
                      'hover:text-gray-600 hover:bg-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-electric-blue',
                      'transition-colors duration-fast'
                    )}
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
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
      default:
        return 'primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <div className="flex gap-3 mt-6">
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
    </Modal>
  );
};

// Simple close icon
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// Import Button component
import { Button } from './Button';