import { User, UserType, ClientProfile, DriverProfile, BlogEditorProfile } from '@prisma/client';

export interface ExtendedUser extends User {
  clientProfile?: ClientProfile | null;
  driverProfile?: DriverProfile | null;
  blogEditorProfile?: BlogEditorProfile | null;
  userRoles?: { role: UserType }[];
}

export interface UserFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'suspended';
  userType?: UserType | 'ALL';
  membershipTier?: string;
  verificationStatus?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

export interface UserListResult {
  users: ExtendedUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  totalClients: number;
  totalDrivers: number;
  totalEditors: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  pendingVerification: number;
}

/**
 * Server-side service for user data operations
 */
export class UserService {
  /**
   * Get all users with optional filtering and pagination
   */
  static async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<UserListResult> {
    try {
      // In production, this would connect to your database
      // For now, we'll use mock data that matches the current structure
      
      const mockUsers: ExtendedUser[] = [
        {
          id: '1',
          email: 'michael.chen@email.com',
          name: 'Michael Chen',
          phone: '+852 9876 5432',
          avatar: null,
          isVerified: true,
          isActive: true,
          createdAt: new Date('2023-06-15T00:00:00.000Z'),
          updatedAt: new Date('2024-01-15T00:00:00.000Z'),
          userRoles: [{ role: 'CLIENT' as UserType }],
          clientProfile: {
            id: '1',
            userId: '1',
            preferredVehicle: 'LUXURY' as any,
            loyaltyPoints: 2450,
            membershipTier: 'VIP',
            emergencyContact: 'Jane Chen (+852 8765 4321)',
            emergencyContactPhone: '+852 8765 4321',
            emergencyContactRelation: 'spouse',
            dateOfBirth: new Date('1985-03-15T00:00:00.000Z'),
            gender: 'female',
            nationality: 'Canadian',
            passportNumber: 'CA123456789',
            profileCompletion: 95,
            documentVerified: true,
            specialRequests: 'Prefers luxury vehicles, always requests child seat for 6-year-old daughter',
            createdAt: new Date('2023-06-15T00:00:00.000Z'),
            updatedAt: new Date('2024-01-15T00:00:00.000Z')
          },
        },
        {
          id: '2',
          email: 'li.wei@email.com',
          name: 'Li Wei',
          phone: '+852 6543 2109',
          avatar: null,
          isVerified: true,
          isActive: true,
          createdAt: new Date('2023-08-20T00:00:00.000Z'),
          updatedAt: new Date('2024-01-14T00:00:00.000Z'),
          userRoles: [{ role: 'DRIVER' as UserType }],
          driverProfile: {
            id: '1',
            userId: '2',
            licenseNumber: 'HK123456789',
            licenseExpiry: new Date('2025-08-20T00:00:00.000Z'),
            isApproved: false,
            rating: 4.8,
            totalTrips: 456,
            languages: ['English', 'Cantonese', 'Mandarin'],
            isAvailable: true,
            currentLocation: null,
            createdAt: new Date('2023-08-20T00:00:00.000Z'),
            updatedAt: new Date('2024-01-14T00:00:00.000Z')
          },
        },
        {
          id: '3',
          email: 'sarah.wong@company.com',
          name: 'Sarah Wong',
          phone: '+852 8765 4321',
          avatar: null,
          isVerified: true,
          isActive: true,
          createdAt: new Date('2023-09-10T00:00:00.000Z'),
          updatedAt: new Date('2024-01-13T00:00:00.000Z'),
          userRoles: [{ role: 'CLIENT' as UserType }],
          clientProfile: {
            id: '2',
            userId: '3',
            preferredVehicle: 'BUSINESS' as any,
            loyaltyPoints: 1820,
            membershipTier: 'PREMIUM',
            emergencyContact: null,
            emergencyContactPhone: null,
            emergencyContactRelation: null,
            dateOfBirth: new Date('1978-07-22T00:00:00.000Z'),
            gender: 'male',
            nationality: 'American',
            passportNumber: 'US987654321',
            profileCompletion: 85,
            documentVerified: false,
            specialRequests: null,
            createdAt: new Date('2023-09-10T00:00:00.000Z'),
            updatedAt: new Date('2024-01-13T00:00:00.000Z')
          },
        },
        {
          id: '4',
          email: 'david.lee@crossborder.com',
          name: 'David Lee',
          phone: '+852 7654 3210',
          avatar: null,
          isVerified: true,
          isActive: true,
          createdAt: new Date('2023-07-05T00:00:00.000Z'),
          updatedAt: new Date('2024-01-12T00:00:00.000Z'),
          userRoles: [{ role: 'BLOG_EDITOR' as UserType }],
          blogEditorProfile: {
            id: '1',
            userId: '4',
            bio: 'Senior content editor with 8+ years of experience in travel and transportation content.',
            socialLinks: { linkedin: 'https://linkedin.com/in/davidlee' },
            isApproved: true,
            permissions: ['WRITE', 'EDIT', 'PUBLISH', 'DELETE'],
            createdAt: new Date('2023-07-05T00:00:00.000Z'),
            updatedAt: new Date('2024-01-12T00:00:00.000Z')
          }
        },
        {
          id: '5',
          email: 'admin@crossborder.com',
          name: 'System Admin',
          phone: '+852 9999 0000',
          avatar: null,
          isVerified: true,
          isActive: true,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-18T00:00:00.000Z'),
          userRoles: [{ role: 'ADMIN' as UserType }],
        }
      ];

      // Apply filters
      let filteredUsers = mockUsers;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm) ||
          user.driverProfile?.licenseNumber?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active') {
          filteredUsers = filteredUsers.filter(user => user.isActive);
        } else if (filters.status === 'inactive') {
          filteredUsers = filteredUsers.filter(user => !user.isActive);
        }
      }

      if (filters.userType && filters.userType !== 'ALL') {
        filteredUsers = filteredUsers.filter(user =>
          user.userRoles?.some(role => role.role === filters.userType)
        );
      }

      if (filters.membershipTier && filters.membershipTier !== 'all') {
        filteredUsers = filteredUsers.filter(user =>
          user.clientProfile?.membershipTier === filters.membershipTier
        );
      }

      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        if (filters.verificationStatus === 'verified') {
          filteredUsers = filteredUsers.filter(user => user.isVerified);
        } else if (filters.verificationStatus === 'pending') {
          filteredUsers = filteredUsers.filter(user => !user.isVerified);
        }
      }

      // Apply pagination
      const total = filteredUsers.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(userId: string): Promise<ExtendedUser | null> {
    try {
      const result = await this.getUsers({}, 1, 1000); // Get all users for mock
      return result.users.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Update a user
   */
  static async updateUser(
    userId: string,
    updates: Partial<ExtendedUser>
  ): Promise<ExtendedUser> {
    try {
      // In production, this would update the database
      // For now, we'll just return the updated user object
      const currentUser = await this.getUserById(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const updatedUser = { ...currentUser, ...updates };
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const result = await this.getUsers({}, 1, 1000); // Get all users
      const users = result.users;

      return {
        totalUsers: users.length,
        totalClients: users.filter(u => u.userRoles?.[0]?.role === 'CLIENT').length,
        totalDrivers: users.filter(u => u.userRoles?.[0]?.role === 'DRIVER').length,
        totalEditors: users.filter(u => u.userRoles?.[0]?.role === 'BLOG_EDITOR').length,
        totalAdmins: users.filter(u => u.userRoles?.[0]?.role === 'ADMIN').length,
        activeUsers: users.filter(u => u.isActive).length,
        inactiveUsers: users.filter(u => !u.isActive).length,
        verifiedUsers: users.filter(u => u.isVerified).length,
        pendingVerification: users.filter(u => !u.isVerified).length,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Perform bulk operations on users
   */
  static async bulkUpdateUsers(
    userIds: string[],
    action: 'activate' | 'deactivate' | 'verify' | 'delete',
    updates?: Partial<ExtendedUser>
  ): Promise<void> {
    try {
      // In production, this would perform bulk database operations
      console.log(`Bulk ${action} operation on users:`, userIds, updates);
      
      // Mock implementation - in real app this would update the database
      for (const userId of userIds) {
        switch (action) {
          case 'activate':
            await this.updateUser(userId, { isActive: true });
            break;
          case 'deactivate':
            await this.updateUser(userId, { isActive: false });
            break;
          case 'verify':
            await this.updateUser(userId, { isVerified: true });
            break;
          case 'delete':
            // In production, this would soft delete or hard delete the user
            console.log(`Deleting user ${userId}`);
            break;
        }
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error(`Failed to ${action} users`);
    }
  }

  /**
   * Get user's primary role
   */
  static getPrimaryRole(user: ExtendedUser): UserType {
    if (!user.userRoles || user.userRoles.length === 0) return 'CLIENT';
    return user.userRoles[0].role;
  }

  /**
   * Check if user has specific role
   */
  static hasRole(user: ExtendedUser, role: UserType): boolean {
    return user.userRoles?.some(userRole => userRole.role === role) || false;
  }

  /**
   * Get user's display avatar
   */
  static getUserAvatar(user: ExtendedUser): string {
    return user.name?.charAt(0)?.toUpperCase() || 'U';
  }
}