'use client';

// Centralized status configuration for consistent status management across the app

export interface StatusConfig {
  label: string;
  icon: string;
  className: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export type StatusType = 'USER' | 'DOCUMENT' | 'TRIP' | 'PAYMENT' | 'VEHICLE' | 'DRIVER' | 'BOOKING';

export const STATUS_CONFIGS: Record<StatusType, Record<string, StatusConfig>> = {
  USER: {
    active: {
      label: 'Active',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    inactive: {
      label: 'Inactive',
      icon: '⭕',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      variant: 'default'
    },
    suspended: {
      label: 'Suspended',
      icon: '🚫',
      className: 'bg-red-100 text-red-800 border-red-200',
      variant: 'error'
    },
    pending: {
      label: 'Pending',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    verified: {
      label: 'Verified',
      icon: '✓',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      variant: 'info'
    }
  },
  DOCUMENT: {
    approved: {
      label: 'Approved',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    pending: {
      label: 'Pending',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    rejected: {
      label: 'Rejected',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-200',
      variant: 'error'
    },
    required: {
      label: 'Required',
      icon: '📄',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      variant: 'info'
    },
    uploading: {
      label: 'Uploading',
      icon: '📤',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      variant: 'info'
    },
    processing: {
      label: 'Processing',
      icon: '⚙️',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      variant: 'info'
    }
  },
  TRIP: {
    completed: {
      label: 'Completed',
      icon: '✓',
      className: 'bg-success-green text-white border-success-green',
      variant: 'success'
    },
    active: {
      label: 'Active',
      icon: '🚗',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      variant: 'info'
    },
    pending: {
      label: 'Pending',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    cancelled: {
      label: 'Cancelled',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-200',
      variant: 'error'
    },
    confirmed: {
      label: 'Confirmed',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    'in-progress': {
      label: 'In Progress',
      icon: '🚌',
      className: 'bg-hot-pink text-white border-hot-pink',
      variant: 'info'
    }
  },
  PAYMENT: {
    completed: {
      label: 'Completed',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    pending: {
      label: 'Pending',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    failed: {
      label: 'Failed',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-200',
      variant: 'error'
    },
    processing: {
      label: 'Processing',
      icon: '⚙️',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      variant: 'info'
    },
    refunded: {
      label: 'Refunded',
      icon: '↩️',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      variant: 'default'
    },
    transferred: {
      label: 'Transferred',
      icon: '💰',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    }
  },
  VEHICLE: {
    active: {
      label: 'Active',
      icon: '🚗',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    maintenance: {
      label: 'Maintenance',
      icon: '🔧',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    inactive: {
      label: 'Inactive',
      icon: '⭕',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      variant: 'default'
    },
    verified: {
      label: 'Verified',
      icon: '✅',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      variant: 'info'
    }
  },
  DRIVER: {
    available: {
      label: 'Available',
      icon: '🟢',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    busy: {
      label: 'Busy',
      icon: '🟡',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    offline: {
      label: 'Offline',
      icon: '🔴',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      variant: 'default'
    },
    'on-trip': {
      label: 'On Trip',
      icon: '🚌',
      className: 'bg-hot-pink text-white border-hot-pink',
      variant: 'info'
    }
  },
  BOOKING: {
    confirmed: {
      label: 'Confirmed',
      icon: '✅',
      className: 'bg-green-100 text-green-800 border-green-200',
      variant: 'success'
    },
    pending: {
      label: 'Pending Confirmation',
      icon: '⏳',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      variant: 'warning'
    },
    cancelled: {
      label: 'Cancelled',
      icon: '❌',
      className: 'bg-red-100 text-red-800 border-red-200',
      variant: 'error'
    },
    'payment-pending': {
      label: 'Payment Pending',
      icon: '💳',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
      variant: 'warning'
    }
  }
};

// Helper function to get status configuration
export const getStatusConfig = (type: StatusType, status: string): StatusConfig | null => {
  return STATUS_CONFIGS[type]?.[status] || null;
};

// Helper function to get all statuses for a type
export const getStatusesForType = (type: StatusType): Record<string, StatusConfig> => {
  return STATUS_CONFIGS[type] || {};
};

// Helper function to check if status exists
export const isValidStatus = (type: StatusType, status: string): boolean => {
  return !!(STATUS_CONFIGS[type] && STATUS_CONFIGS[type][status]);
};