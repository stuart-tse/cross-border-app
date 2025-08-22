import { UserType, User, ClientProfile, DriverProfile, BlogEditorProfile } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { cache } from 'react';

// Extended User type for detailed user information
export interface ExtendedUser extends User {
  clientProfile?: ClientProfile | null;
  driverProfile?: DriverProfile | null;
  blogEditorProfile?: BlogEditorProfile | null;
  userRoles?: { role: UserType }[];
}

// User statistics interface
export interface UserStatistics {
  label: string;
  value: string | number;
}

// Activity item interface
export interface ActivityItem {
  id: string;
  type: 'trip' | 'payment' | 'review' | 'document' | 'article' | 'user_registration' | 'trip_completed' | 'driver_verification' | 'support_ticket';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
  amount?: string;
}

// Performance metrics interface
export interface PerformanceMetrics {
  [key: string]: string | number;
}

/**
 * Get user by ID with all related profiles
 * Cached for performance
 */
export const getUserById = cache(async (userId: string): Promise<ExtendedUser | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true,
        userRoles: {
          select: { role: true }
        }
      }
    });

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
});

/**
 * Get multiple users with optional filtering
 * Cached for performance
 */
export const getUsers = cache(async (filters?: {
  role?: UserType;
  isActive?: boolean;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ExtendedUser[]> => {
  try {
    const where: any = {};
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }
    
    if (filters?.role) {
      where.userRoles = {
        some: {
          role: filters.role
        }
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true,
        userRoles: {
          select: { role: true }
        }
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
});

/**
 * Update user information
 */
export async function updateUser(userId: string, updates: Partial<ExtendedUser>): Promise<ExtendedUser | null> {
  try {
    const { clientProfile, driverProfile, blogEditorProfile, userRoles, ...userUpdates } = updates;

    const user = await prisma.user.update({
      where: { id: userId },
      data: userUpdates,
      include: {
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true,
        userRoles: {
          select: { role: true }
        }
      }
    });

    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Get user count by role
 */
export const getUserCountByRole = cache(async (): Promise<Record<UserType, number>> => {
  try {
    const counts = await prisma.userRole.groupBy({
      by: ['role'],
      _count: {
        userId: true
      }
    });

    const result: Record<UserType, number> = {
      CLIENT: 0,
      DRIVER: 0,
      ADMIN: 0,
      BLOG_EDITOR: 0
    };

    counts.forEach((count) => {
      result[count.role as UserType] = count._count.userId;
    });

    return result;
  } catch (error) {
    console.error('Error fetching user counts:', error);
    return {
      CLIENT: 0,
      DRIVER: 0,
      ADMIN: 0,
      BLOG_EDITOR: 0
    };
  }
});

/**
 * Get recently active users
 */
export const getRecentlyActiveUsers = cache(async (limit: number = 10): Promise<ExtendedUser[]> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true
      },
      include: {
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true,
        userRoles: {
          select: { role: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit
    });

    return users;
  } catch (error) {
    console.error('Error fetching recently active users:', error);
    return [];
  }
});

/**
 * Get admin dashboard metrics
 */
export const getAdminMetrics = cache(async (): Promise<{
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  revenue: number;
  growth: {
    users: number;
    trips: number;
    revenue: number;
  };
}> => {
  try {
    // In production, these would be actual database queries
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });

    // Mock data for trips and revenue - replace with actual queries
    return {
      totalUsers,
      activeUsers,
      totalTrips: 1247, // This would come from trips table
      revenue: 450000, // This would come from payments/earnings aggregation
      growth: {
        users: 12.5, // Percentage growth
        trips: 8.3,
        revenue: 15.7
      }
    };
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalTrips: 0,
      revenue: 0,
      growth: {
        users: 0,
        trips: 0,
        revenue: 0
      }
    };
  }
});
