'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ToastProvider, useToast } from '@/components/ui/Toast';

// Create a context that wraps the toast functionality for global access
interface NotificationContextType {
  success: (title: string, message?: string, options?: any) => string;
  error: (title: string, message?: string, options?: any) => string;
  warning: (title: string, message?: string, options?: any) => string;
  info: (title: string, message?: string, options?: any) => string;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <NotificationProviderInner>
        {children}
      </NotificationProviderInner>
    </ToastProvider>
  );
}

// Inner provider that has access to toast context
function NotificationProviderInner({ children }: { children: ReactNode }) {
  const toast = useToast();

  const contextValue: NotificationContextType = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    clearAll: toast.clearAll,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// HOC for components that need notifications
export function withNotifications<P extends object>(
  Component: React.ComponentType<P>
) {
  return function NotificationWrappedComponent(props: P) {
    return (
      <NotificationProvider>
        <Component {...props} />
      </NotificationProvider>
    );
  };
}