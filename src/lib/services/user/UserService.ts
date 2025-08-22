import { BaseService } from '../base/BaseService';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { User, UserType } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  notificationPreferences: z.record(z.boolean()).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(50)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, lowercase letter, number, and special character')
});

export class UserService extends BaseService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super('UserService');
    this.userRepository = userRepository;
  }

  async getUserById(id: string) {
    return this.withCache(
      `user:${id}`,
      async () => {
        const user = await this.userRepository.findByIdWithProfiles(id);
        if (!user) {
          throw new Error('User not found');
        }
        
        // Transform user data, excluding sensitive information
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          timezone: user.timezone,
          language: user.language,
          notificationPreferences: user.notificationPreferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          roles: user.userRoles?.filter(ur => ur.isActive).map(ur => ur.role) || [],
          profiles: {
            client: user.clientProfile,
            driver: user.driverProfile,
            editor: user.blogEditorProfile
          }
        };
      },
      300 // 5 minutes
    );
  }

  async updateUserProfile(userId: string, data: z.infer<typeof updateUserSchema>) {
    const validatedData = this.validateInput(updateUserSchema, data);

    try {
      const updatedUser = await this.userRepository.update(userId, validatedData);
      
      // Invalidate user cache
      await this.cache.delete(`user:${userId}`);
      
      this.logger.info('User profile updated', {
        userId,
        updatedFields: Object.keys(validatedData)
      });

      return this.getUserById(userId);

    } catch (error) {
      return this.handleError(error, 'updateUserProfile', { userId });
    }
  }

  async changePassword(userId: string, data: z.infer<typeof changePasswordSchema>) {
    const validatedData = this.validateInput(changePasswordSchema, data);

    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(validatedData.newPassword, user.passwordHash);
      if (isSamePassword) {
        throw new Error('New password must be different from current password');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

      // Update password
      await this.userRepository.updatePassword(userId, newPasswordHash);

      // Log password change
      this.logger.info('User password changed', { userId });

      // Invalidate user sessions (if using session-based auth)
      await this.cache.delete(`user_sessions:${userId}`);

      return { success: true, message: 'Password changed successfully' };

    } catch (error) {
      return this.handleError(error, 'changePassword', { userId });
    }
  }

  async getUsersByType(userType: UserType, page = 1, limit = 10, search?: string) {
    const cacheKey = `users:${userType}:${page}:${limit}:${search || 'all'}`;
    
    return this.withCache(
      cacheKey,
      async () => {
        const users = await this.userRepository.findByTypeWithPagination(
          userType, 
          page, 
          limit, 
          search
        );

        return {
          users: users.data.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            roles: user.userRoles?.filter(ur => ur.isActive).map(ur => ur.role) || []
          })),
          pagination: users.pagination
        };
      },
      180 // 3 minutes
    );
  }

  async deactivateUser(userId: string, adminId: string) {
    try {
      await this.userRepository.update(userId, { isActive: false });
      
      // Invalidate user cache
      await this.cache.delete(`user:${userId}`);
      
      // Log admin action
      this.logger.warn('User deactivated by admin', {
        userId,
        adminId,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: 'User deactivated successfully' };

    } catch (error) {
      return this.handleError(error, 'deactivateUser', { userId, adminId });
    }
  }

  async reactivateUser(userId: string, adminId: string) {
    try {
      await this.userRepository.update(userId, { isActive: true });
      
      // Invalidate user cache
      await this.cache.delete(`user:${userId}`);
      
      this.logger.info('User reactivated by admin', {
        userId,
        adminId,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: 'User reactivated successfully' };

    } catch (error) {
      return this.handleError(error, 'reactivateUser', { userId, adminId });
    }
  }

  async assignRole(userId: string, role: UserType, assignedBy: string) {
    try {
      await this.userRepository.assignRole(userId, role, assignedBy);
      
      // Invalidate user cache
      await this.cache.delete(`user:${userId}`);
      
      this.logger.info('Role assigned to user', {
        userId,
        role,
        assignedBy,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: `${role} role assigned successfully` };

    } catch (error) {
      return this.handleError(error, 'assignRole', { userId, role, assignedBy });
    }
  }

  async revokeRole(userId: string, role: UserType, revokedBy: string) {
    try {
      await this.userRepository.revokeRole(userId, role, revokedBy);
      
      // Invalidate user cache
      await this.cache.delete(`user:${userId}`);
      
      this.logger.warn('Role revoked from user', {
        userId,
        role,
        revokedBy,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: `${role} role revoked successfully` };

    } catch (error) {
      return this.handleError(error, 'revokeRole', { userId, role, revokedBy });
    }
  }

  async getUserStats(userId: string) {
    return this.withCache(
      `user_stats:${userId}`,
      async () => {
        const stats = await this.userRepository.getUserStats(userId);
        return stats;
      },
      600 // 10 minutes
    );
  }

  async searchUsers(query: string, filters: {
    userType?: UserType;
    isActive?: boolean;
    isVerified?: boolean;
  } = {}, page = 1, limit = 10) {
    
    const cacheKey = `user_search:${query}:${JSON.stringify(filters)}:${page}:${limit}`;
    
    return this.withCache(
      cacheKey,
      async () => {
        return await this.userRepository.searchUsers(query, filters, page, limit);
      },
      120 // 2 minutes
    );
  }

  async verifyUser(userId: string, verifiedBy: string) {
    try {
      await this.userRepository.update(userId, { 
        isVerified: true,
        verifiedAt: new Date()
      });
      
      // Invalidate user cache
      await this.cache.delete(`user:${userId}`);
      
      this.logger.info('User verified', {
        userId,
        verifiedBy,
        timestamp: new Date().toISOString()
      });

      return { success: true, message: 'User verified successfully' };

    } catch (error) {
      return this.handleError(error, 'verifyUser', { userId, verifiedBy });
    }
  }

  async getUserActivity(userId: string, days = 30) {
    return this.withCache(
      `user_activity:${userId}:${days}`,
      async () => {
        // Get user activity from various sources
        const [bookings, posts, reviews] = await Promise.all([
          this.db.booking.count({
            where: {
              OR: [
                { clientId: userId },
                { driver: { userId } }
              ],
              createdAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
              }
            }
          }),
          this.db.blogPost.count({
            where: {
              authorId: userId,
              createdAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
              }
            }
          }),
          this.db.review.count({
            where: {
              reviewerId: userId,
              createdAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]);

        return {
          bookings,
          posts,
          reviews,
          period: `${days} days`
        };
      },
      1800 // 30 minutes
    );
  }

  async bulkUpdateUsers(userIds: string[], updates: Partial<User>, updatedBy: string) {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId => this.userRepository.update(userId, updates))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Invalidate caches for updated users
      await Promise.all(userIds.map(userId => this.cache.delete(`user:${userId}`)));

      this.logger.info('Bulk user update completed', {
        updatedBy,
        totalUsers: userIds.length,
        successful,
        failed,
        updates: Object.keys(updates)
      });

      return {
        success: true,
        message: `Updated ${successful} users successfully, ${failed} failed`,
        results: { successful, failed }
      };

    } catch (error) {
      return this.handleError(error, 'bulkUpdateUsers', { userCount: userIds.length, updatedBy });
    }
  }
}