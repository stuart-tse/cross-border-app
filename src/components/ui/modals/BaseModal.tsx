'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventBodyScroll?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
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

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscape);
      }
      
      // Prevent body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscape);
      }
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, onClose, closeOnEscape, preventBodyScroll]);

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
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
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

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
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
            onClick={handleBackdropClick}
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || description || showCloseButton) && (
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
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
                  
                  {showCloseButton && (
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
                  )}
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

export default BaseModal;