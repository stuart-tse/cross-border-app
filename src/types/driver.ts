// Driver Dashboard Types and Interfaces
// Based on design specifications from driver-dashboard-design-specifications.html

export interface Driver {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
  };
  driverLicense: {
    number: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    class: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    category: 'BUSINESS' | 'EXECUTIVE' | 'LUXURY';
    capacity: number;
  };
  verification: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    documents: Array<{
      type: DocumentType;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      uploadedAt: string;
      reviewedAt?: string;
      rejectionReason?: string;
    }>;
  };
  settings: DriverSettings;
  stats: {
    totalTrips: number;
    totalEarnings: number;
    avgRating: number;
    acceptanceRate: number;
    completionRate: number;
  };
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 
  | 'DRIVERS_LICENSE' 
  | 'VEHICLE_REGISTRATION' 
  | 'INSURANCE' 
  | 'BACKGROUND_CHECK';

export interface EarningsData {
  period: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR';
  totalEarnings: number;
  totalTrips: number;
  avgEarningsPerTrip: number;
  onlineTime: number; // minutes
  acceptanceRate: number; // percentage
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    tips: number;
    bonuses: number;
    fees: number; // negative value
  };
  tripTypes: Array<{
    type: 'CROSS_BORDER' | 'LONG_DISTANCE' | 'LOCAL';
    count: number;
    earnings: number;
    percentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    earnings: number;
    trips: number;
  }>;
}

export interface PaymentTransaction {
  id: string;
  type: 'earning' | 'payout' | 'fee' | 'adjustment';
  amount: number;
  currency?: 'HKD' | 'CNY';
  description: string;
  tripId?: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  createdAt?: string;
  processedAt?: string;
}

// Type alias for backward compatibility with existing components
export interface Payment {
  id: string;
  date: string;
  type: 'earning' | 'payout' | 'fee';
  description: string;
  amount: number;
  status: string;
}

export interface DriverSettings {
  notifications: {
    tripRequests: boolean;
    tripUpdates: boolean;
    soundAlerts: boolean;
    paymentConfirmations: boolean;
    weeklySummary: boolean;
  };
  workingHours: {
    isOnline: boolean;
    schedule: Array<{
      day: string;
      enabled: boolean;
      startTime: string;
      endTime: string;
    }>;
    autoOffline: boolean;
    breakReminders: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    locationTracking: boolean;
    shareProfile: boolean;
  };
  language: string;
  region: string;
  paymentSchedule: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface DocumentUpload {
  id: string;
  driverId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'UPLOADING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  metadata: {
    originalName: string;
    dimensions?: {
      width: number;
      height: number;
    };
    checksum: string;
  };
}

export interface VerificationTimeline {
  id: string;
  driverId: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    startedAt?: string;
    completedAt?: string;
    order: number;
  }>;
  currentStep: number;
  estimatedCompletion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  dailyEarnings: {
    total: number;
    tripsCompleted: number;
    avgPerTrip: number;
    onlineTime: string;
    acceptRate: number;
  };
  weeklyEarnings: number;
  monthlyEarnings: number;
  performanceScore: number;
  earningsTrend: Array<{
    date: string;
    amount: number;
  }>;
  tripTypes: Array<{
    type: string;
    percentage: number;
    count: number;
  }>;
  paymentHistory: PaymentTransaction[];
}

// Form Types for Settings
export interface NotificationSettingsForm {
  tripRequests: boolean;
  tripUpdates: boolean;
  soundAlerts: boolean;
  paymentConfirmations: boolean;
  weeklySummary: boolean;
}

export interface WorkingHoursForm {
  isOnline: boolean;
  schedule: Array<{
    day: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
  }>;
  autoOffline: boolean;
  breakReminders: boolean;
}

export interface SecuritySettingsForm {
  currentPassword: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled: boolean;
  locationTracking: boolean;
  shareProfile: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

// Upload Progress Types
export interface UploadProgress {
  documentType: DocumentType;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}