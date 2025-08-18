'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_ALL' };

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

// Initial state
const initialState: ToastState = {
  toasts: [],
};

// Reducer
function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.payload, ...state.toasts.slice(0, 4)], // Limit to 5 toasts
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.persistent ? 0 : 5000),
    };

    dispatch({ type: 'ADD_TOAST', payload: newToast });

    // Auto-remove after duration (if not persistent)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'error', title, message, persistent: options?.persistent ?? true });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ ...options, type: 'info', title, message });
  }, [addToast]);

  const contextValue: ToastContextType = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Container Component
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Toast Component
interface ToastComponentProps {
  toast: Toast;
  onClose: () => void;
}

function ToastComponent({ toast, onClose }: ToastComponentProps) {
  const getToastStyles = (type: ToastType) => {
    const baseStyles = 'border shadow-lg backdrop-blur-sm';
    
    switch (type) {
      case 'success':
        return cn(baseStyles, 'bg-green-50/95 border-green-200 text-green-800');
      case 'error':
        return cn(baseStyles, 'bg-red-50/95 border-red-200 text-red-800');
      case 'warning':
        return cn(baseStyles, 'bg-yellow-50/95 border-yellow-200 text-yellow-800');
      case 'info':
        return cn(baseStyles, 'bg-blue-50/95 border-blue-200 text-blue-800');
      default:
        return cn(baseStyles, 'bg-white/95 border-gray-200 text-gray-800');
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      className={cn(
        'max-w-sm w-full rounded-xl p-4 pointer-events-auto',
        getToastStyles(toast.type)
      )}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(toast.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-1 text-sm opacity-90">
                  {toast.message}
                </p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-hot-pink focus:ring-offset-2"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-hot-pink rounded"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Utility function for form validation errors
export function createValidationToast(errors: Record<string, string>) {
  const errorMessages = Object.values(errors);
  const title = 'Please fix the following errors:';
  const message = errorMessages.slice(0, 3).join(', ') + (errorMessages.length > 3 ? '...' : '');
  
  return { title, message };
}