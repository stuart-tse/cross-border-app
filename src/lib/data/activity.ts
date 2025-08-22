import { cache } from 'react';
import { ActivityItem } from '@/lib/data/user';
import { formatActivityDescription } from '@/lib/services/user-formatting';

/**
 * Mock activity data service
 * In production, this would fetch from your database
 */

/**
 * Get recent activity for a specific user
 */
export const getUserActivity = cache(async (userId: string, limit: number = 10): Promise<ActivityItem[]> => {
  // Mock implementation - replace with actual database query
  const mockActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'trip',
      description: formatActivityDescription('trip', { destination: 'Shenzhen' }),
      timestamp: '2 hours ago',
      status: 'success',
      amount: 'HK$450'
    },
    {
      id: '2',
      type: 'payment',
      description: formatActivityDescription('payment', { amount: 'HK$450' }),
      timestamp: '2 hours ago',
      status: 'success',
      amount: 'HK$450'
    },
    {
      id: '3',
      type: 'review',
      description: formatActivityDescription('review', { rating: 5 }),
      timestamp: '3 hours ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'document',
      description: formatActivityDescription('document', { documentType: 'Driver license' }),
      timestamp: '1 day ago',
      status: 'success'
    }
  ];

  return mockActivity.slice(0, limit);
});

/**
 * Get system-wide recent activity (for admin dashboard)
 */
export const getSystemActivity = cache(async (limit: number = 10): Promise<ActivityItem[]> => {
  // Mock implementation - replace with actual database query
  const mockSystemActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'trip_completed',
      description: formatActivityDescription('trip_completed', { tripId: 'HK-SZ-001234' }),
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'user_registration',
      description: formatActivityDescription('user_registration', { email: 'michael.chen@email.com' }),
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'driver_verification',
      description: formatActivityDescription('driver_verification', { driverName: 'Li Wei' }),
      timestamp: '1 hour ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'support_ticket',
      description: formatActivityDescription('support_ticket', { ticketId: '1234' }),
      timestamp: '2 hours ago',
      status: 'warning'
    }
  ];

  return mockSystemActivity.slice(0, limit);
});

/**
 * Get activity by type and date range
 */
export const getActivityByType = cache(async (
  type: ActivityItem['type'], 
  startDate?: Date, 
  endDate?: Date,
  limit: number = 50
): Promise<ActivityItem[]> => {
  // Mock implementation - in production, this would filter by date range
  const allActivity = await getSystemActivity(100);
  return allActivity.filter(activity => activity.type === type).slice(0, limit);
});

/**
 * Get activity statistics
 */
export const getActivityStats = cache(async (): Promise<{
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  byType: Record<ActivityItem['type'], number>;
}> => {
  // Mock implementation - replace with actual database aggregation
  return {
    totalToday: 45,
    totalWeek: 312,
    totalMonth: 1247,
    byType: {
      trip: 156,
      trip_completed: 156,
      payment: 142,
      review: 89,
      document: 67,
      article: 23,
      user_registration: 34,
      driver_verification: 12,
      support_ticket: 8
    }
  };
});
