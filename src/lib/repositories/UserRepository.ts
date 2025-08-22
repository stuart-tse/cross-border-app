import { PrismaClient, User, UserRole, UserType, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface UserCreateData {
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface UserUpdateData {
  name?: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface ExtendedUser extends User {
  userRoles: (UserRole & { role: UserType })[];
  clientProfile?: any;
  driverProfile?: any;
  blogEditorProfile?: any;
  _count?: {
    bookings?: number;
    blogPosts?: number;
    reviews?: number;
  };
}

export interface UserFilters {
  email?: string;
  name?: { contains: string; mode?: 'insensitive' };
  isVerified?: boolean;
  isActive?: boolean;
  userType?: UserType;
  createdAfter?: Date;
  createdBefore?: Date;
}

export class UserRepository extends BaseRepository<ExtendedUser, UserCreateData, UserUpdateData> {
  constructor(db: PrismaClient) {
    super(db, 'user');
  }

  async findByEmail(email: string, userId?: string): Promise<ExtendedUser | null> {
    try {
      const result = await this.getModel().findUnique({
        where: { email },
        include: {
          userRoles: true,
          clientProfile: true,
          driverProfile: true,
          blogEditorProfile: true,
          _count: {
            select: {
              bookings: true,
              blogPosts: true,
              reviews: true
            }
          }
        }
      });

      this.logQuery('READ', 0, userId);
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'findByEmail');
      throw error;
    }
  }

  async findByIdWithRoles(id: string, userId?: string): Promise<ExtendedUser | null> {
    try {
      const result = await this.getModel().findUnique({
        where: { id },
        include: {
          userRoles: {
            where: { isActive: true }
          },
          clientProfile: true,
          driverProfile: {
            include: {
              vehicles: {
                where: { isActive: true }
              }
            }
          },
          blogEditorProfile: true,
          _count: {
            select: {
              bookings: true,
              blogPosts: true,
              reviews: true
            }
          }
        }
      });

      this.logQuery('READ', 0, userId);
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'findByIdWithRoles');
      throw error;
    }
  }

  async findUsersByRole(role: UserType, options?: {
    isActive?: boolean;
    limit?: number;
    page?: number;
  }, userId?: string) {
    try {
      const { isActive = true, limit = 10, page = 1 } = options || {};
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.getModel().findMany({
          where: {
            userRoles: {
              some: {
                role,
                isActive
              }
            },
            isActive: true
          },
          include: {
            userRoles: {
              where: { role, isActive }
            },
            clientProfile: role === UserType.CLIENT,
            driverProfile: role === UserType.DRIVER ? {
              include: {
                vehicles: {
                  where: { isActive: true }
                }
              }
            } : false,
            blogEditorProfile: role === UserType.BLOG_EDITOR
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.getModel().count({
          where: {
            userRoles: {
              some: {
                role,
                isActive
              }
            },
            isActive: true
          }
        })
      ]);

      this.logQuery('READ', 0, userId);

      return {
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.handlePrismaError(error, 'findUsersByRole');
      throw error;
    }
  }

  async assignRole(userId: string, role: UserType, assignedBy?: string, currentUserId?: string): Promise<UserRole> {
    try {
      // Check if role already exists
      const existingRole = await this.db.userRole.findFirst({
        where: {
          userId,
          role
        }
      });

      if (existingRole) {
        if (existingRole.isActive) {
          throw new Error(`User already has ${role} role`);
        }
        
        // Reactivate existing role
        const updatedRole = await this.db.userRole.update({
          where: { id: existingRole.id },
          data: {
            isActive: true,
            assignedBy
          }
        });

        this.logQuery('UPDATE', 0, currentUserId);
        return updatedRole;
      }

      // Create new role
      const newRole = await this.db.userRole.create({
        data: {
          userId,
          role,
          assignedBy
        }
      });

      this.logQuery('CREATE', 0, currentUserId);
      return newRole;
    } catch (error) {
      this.handlePrismaError(error, 'assignRole');
      throw error;
    }
  }

  async revokeRole(userId: string, role: UserType, currentUserId?: string): Promise<void> {
    try {
      await this.db.userRole.updateMany({
        where: {
          userId,
          role
        },
        data: {
          isActive: false
        }
      });

      this.logQuery('UPDATE', 0, currentUserId);
    } catch (error) {
      this.handlePrismaError(error, 'revokeRole');
      throw error;
    }
  }

  async getUserRoles(userId: string, currentUserId?: string): Promise<UserType[]> {
    try {
      const roles = await this.db.userRole.findMany({
        where: {
          userId,
          isActive: true
        },
        select: {
          role: true
        }
      });

      this.logQuery('READ', 0, currentUserId);
      return roles.map(r => r.role);
    } catch (error) {
      this.handlePrismaError(error, 'getUserRoles');
      throw error;
    }
  }

  async searchUsers(
    query: string, 
    filters?: UserFilters,
    pagination?: { page: number; limit: number },
    userId?: string
  ) {
    try {
      const { page = 1, limit = 10 } = pagination || {};
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } }
        ],
        ...filters && {
          isActive: filters.isActive,
          isVerified: filters.isVerified,
          createdAt: {
            ...(filters.createdAfter && { gte: filters.createdAfter }),
            ...(filters.createdBefore && { lte: filters.createdBefore })
          },
          ...(filters.userType && {
            userRoles: {
              some: {
                role: filters.userType,
                isActive: true
              }
            }
          })
        }
      };

      const [users, total] = await Promise.all([
        this.getModel().findMany({
          where,
          include: {
            userRoles: {
              where: { isActive: true }
            },
            _count: {
              select: {
                bookings: true,
                blogPosts: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.getModel().count({ where })
      ]);

      this.logQuery('READ', 0, userId);

      return {
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.handlePrismaError(error, 'searchUsers');
      throw error;
    }
  }

  async getUserStats(userId?: string) {
    try {
      const [totalUsers, activeUsers, verifiedUsers, roleStats] = await Promise.all([
        this.getModel().count(),
        this.getModel().count({ where: { isActive: true } }),
        this.getModel().count({ where: { isVerified: true } }),
        this.db.userRole.groupBy({
          by: ['role'],
          where: { isActive: true },
          _count: { role: true }
        })
      ]);

      this.logQuery('READ', 0, userId);

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        roleDistribution: roleStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count.role;
          return acc;
        }, {} as Record<UserType, number>)
      };
    } catch (error) {
      this.handlePrismaError(error, 'getUserStats');
      throw error;
    }
  }

  async getRecentlyActiveUsers(limit: number = 10, userId?: string): Promise<ExtendedUser[]> {
    try {
      const users = await this.getModel().findMany({
        where: { isActive: true },
        include: {
          userRoles: {
            where: { isActive: true }
          },
          _count: {
            select: {
              bookings: true,
              blogPosts: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });

      this.logQuery('READ', 0, userId);
      return users;
    } catch (error) {
      this.handlePrismaError(error, 'getRecentlyActiveUsers');
      throw error;
    }
  }
}