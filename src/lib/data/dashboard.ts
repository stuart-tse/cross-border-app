import { cache } from 'react';
import { UserType } from '@prisma/client';

/**
 * Dashboard-specific data and statistics
 */

export interface DashboardStats {
  totalTrips: number;
  totalSpent: number;
  onTimeRate: number;
  avgRating: number;
}

export interface TripData {
  id: string;
  from: string;
  to: string;
  date: string;
  status: 'completed' | 'in_progress' | 'cancelled';
  amount: number;
  vehicle: string;
  duration: string;
  driver: string;
  rating: number;
}

export interface DriverData {
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
  verification: {
    overall: 'verified' | 'pending' | 'rejected';
    documents: Record<string, 'verified' | 'pending' | 'rejected'>;
  };
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
    capacity: number;
    category: string;
  };
  earningsTrend: Array<{ date: string; amount: number }>;
  tripTypes: Array<{
    type: string;
    percentage: number;
    count: number;
    earnings: number;
  }>;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  revenue: number;
  growth: {
    users: number;
    trips: number;
    revenue: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

/**
 * Get client dashboard statistics
 */
export const getClientStats = cache(async (userId: string): Promise<DashboardStats> => {
  // Mock implementation - replace with actual database queries
  return {
    totalTrips: 12,
    totalSpent: 12450,
    onTimeRate: 98.5,
    avgRating: 4.9
  };
});

/**
 * Get client recent trips
 */
export const getClientTrips = cache(async (userId: string, limit: number = 5): Promise<TripData[]> => {
  // Mock implementation - replace with actual database queries
  return [
    {
      id: '1',
      from: 'Hong Kong',
      to: 'Shenzhen',
      date: 'March 15, 2024',
      status: 'completed',
      amount: 850,
      vehicle: 'Business Class',
      duration: '45 min',
      driver: 'Wong Chi-Ming',
      rating: 5.0
    },
    {
      id: '2',
      from: 'Hong Kong',
      to: 'Guangzhou',
      date: 'March 10, 2024',
      status: 'completed',
      amount: 1200,
      vehicle: 'Executive SUV',
      duration: '2.5 hours',
      driver: 'Li Wei',
      rating: 4.8
    }
  ].slice(0, limit);
});

/**
 * Get driver dashboard data
 */
export const getDriverData = cache(async (userId: string): Promise<DriverData> => {
  // Mock implementation - replace with actual database queries
  return {
    dailyEarnings: {
      total: 1240,
      tripsCompleted: 8,
      avgPerTrip: 155,
      onlineTime: '6.5h',
      acceptRate: 95
    },
    weeklyEarnings: 8750,
    monthlyEarnings: 28950,
    performanceScore: 4.9,
    verification: {
      overall: 'pending',
      documents: {
        driversLicense: 'verified',
        vehicleRegistration: 'verified',
        insurance: 'pending',
        backgroundCheck: 'verified'
      }
    },
    vehicle: {
      make: 'BMW',
      model: 'X5 2023',
      licensePlate: 'ABC-1234',
      capacity: 6,
      category: 'Executive SUV'
    },
    earningsTrend: [
      { date: '2024-01-08', amount: 800 },
      { date: '2024-01-09', amount: 1100 },
      { date: '2024-01-10', amount: 1500 },
      { date: '2024-01-11', amount: 900 },
      { date: '2024-01-12', amount: 1200 },
      { date: '2024-01-13', amount: 1800 },
      { date: '2024-01-14', amount: 1240 }
    ],
    tripTypes: [
      { type: 'Cross-border (HK-SZ)', percentage: 68, count: 89, earnings: 19692 },
      { type: 'Long distance (HK-GZ)', percentage: 22, count: 29, earnings: 6409 },
      { type: 'Local (HK only)', percentage: 10, count: 13, earnings: 2849 }
    ]
  };
});

/**
 * Get admin dashboard metrics
 */
export const getAdminMetrics = cache(async (): Promise<AdminMetrics> => {
  // Mock implementation - replace with actual database aggregations
  return {
    totalUsers: 267,
    activeUsers: 189,
    totalTrips: 1247,
    revenue: 450000,
    growth: {
      users: 12.5,
      trips: 8.3,
      revenue: 15.7
    }
  };
});

/**
 * Get user notifications
 */
export const getUserNotifications = cache(async (userId: string, limit: number = 10): Promise<Notification[]> => {
  // Mock implementation - replace with actual database queries
  return [
    {
      id: '1',
      title: 'Trip Completed',
      message: 'Your trip to Shenzhen has been completed successfully.',
      type: 'success',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '2',
      title: 'New Promotion',
      message: '20% off on your next executive booking this month!',
      type: 'info',
      timestamp: '1 day ago',
      read: false
    },
    {
      id: '3',
      title: 'Payment Processed',
      message: 'Your payment for trip #TR001234 has been processed.',
      type: 'success',
      timestamp: '2 days ago',
      read: true
    }
  ].slice(0, limit);
});

/**
 * Get trip requests for drivers
 */
export const getTripRequests = cache(async (driverId: string): Promise<Array<{
  id: string;
  from: string;
  fromAddress: string;
  to: string;
  toAddress: string;
  requestedAt: string;
  estimatedEarnings: number;
  passengers: number;
  vehicle: string;
  distance: string;
  duration: string;
  clientName: string;
  urgency: 'low' | 'medium' | 'high';
}>> => {
  // Mock implementation - replace with actual database queries
  return [
    {
      id: '1',
      from: 'Hong Kong',
      fromAddress: 'Central, Hong Kong',
      to: 'Guangzhou',
      toAddress: 'Tianhe District',
      requestedAt: '2 minutes ago',
      estimatedEarnings: 1200,
      passengers: 2,
      vehicle: 'Executive SUV',
      distance: '140km',
      duration: '2.5h',
      clientName: 'Sarah Chen',
      urgency: 'high'
    },
    {
      id: '2',
      from: 'Hong Kong Airport',
      fromAddress: 'Terminal 1 Arrival',
      to: 'Shenzhen',
      toAddress: 'Futian CBD',
      requestedAt: '5 minutes ago',
      estimatedEarnings: 650,
      passengers: 1,
      vehicle: 'Business Class',
      distance: '50km',
      duration: '1h',
      clientName: 'Michael Wong',
      urgency: 'medium'
    }
  ];
});

/**
 * Get location options for quick booking
 */
export const getLocationOptions = cache(async (): Promise<Array<{ value: string; label: string }>> => {
  return [
    { value: '', label: 'Select location' },
    { value: 'hong-kong-central', label: 'Hong Kong - Central' },
    { value: 'hong-kong-airport', label: 'Hong Kong - Airport' },
    { value: 'shenzhen-futian', label: 'Shenzhen - Futian' },
    { value: 'shenzhen-luohu', label: 'Shenzhen - Luohu' },
    { value: 'guangzhou-tianhe', label: 'Guangzhou - Tianhe' }
  ];
});
