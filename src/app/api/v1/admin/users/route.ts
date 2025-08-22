import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { UserType } from '@prisma/client';
import { z } from 'zod';

const querySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  search: z.string().optional(),
  userType: z.nativeEnum(UserType).optional(),
  isActive: z.string().optional().transform(str => str === undefined ? undefined : str === 'true'),
  isVerified: z.string().optional().transform(str => str === undefined ? undefined : str === 'true'),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

const userActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'verify', 'assign_role', 'revoke_role']),
  userIds: z.array(z.string().cuid()),
  role: z.nativeEnum(UserType).optional()
}).refine((data) => {
  if ((data.action === 'assign_role' || data.action === 'revoke_role') && !data.role) {
    return false;
  }
  return true;
}, {
  message: "Role is required for assign_role and revoke_role actions",
  path: ["role"]
});

// GET USERS (Admin only)
export async function GET(req: NextRequest) {
  try {
    const services = getServices();

    // Get token and validate authentication
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required'
        }
      }, { status: 401 });
    }

    const authResult = await services.authService.validateToken(token);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      }, { status: 401 });
    }

    const user = authResult.data!;

    // Check if user has ADMIN role
    if (!user.roles.includes('ADMIN')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admin role required'
        }
      }, { status: 403 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryData = Object.fromEntries(searchParams);
    const validatedQuery = querySchema.parse(queryData);

    // Build where clause
    const whereClause: any = {};

    if (validatedQuery.search) {
      whereClause.OR = [
        { name: { contains: validatedQuery.search, mode: 'insensitive' } },
        { email: { contains: validatedQuery.search, mode: 'insensitive' } },
        { phone: { contains: validatedQuery.search, mode: 'insensitive' } }
      ];
    }

    if (validatedQuery.isActive !== undefined) {
      whereClause.isActive = validatedQuery.isActive;
    }

    if (validatedQuery.isVerified !== undefined) {
      whereClause.isVerified = validatedQuery.isVerified;
    }

    if (validatedQuery.userType) {
      whereClause.userRoles = {
        some: {
          role: validatedQuery.userType,
          isActive: true
        }
      };
    }

    // Build sort order
    const orderBy = {
      [validatedQuery.sortBy]: validatedQuery.sortOrder
    };

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      services.db.user.findMany({
        where: whereClause,
        include: {
          userRoles: {
            where: { isActive: true },
            select: {
              role: true,
              assignedAt: true,
              assignedBy: true
            }
          },
          clientProfile: {
            select: {
              membershipTier: true,
              loyaltyPoints: true,
              profileCompletion: true
            }
          },
          driverProfile: {
            select: {
              isApproved: true,
              rating: true,
              totalTrips: true,
              isAvailable: true
            }
          },
          blogEditorProfile: {
            select: {
              isApproved: true
            }
          },
          _count: {
            select: {
              bookings: true,
              blogPosts: true,
              reviews: true
            }
          }
        },
        orderBy,
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit
      }),
      services.db.user.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / validatedQuery.limit);

    // Transform users data
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map(ur => ur.role),
      roleDetails: user.userRoles,
      profiles: {
        client: user.clientProfile,
        driver: user.driverProfile,
        editor: user.blogEditorProfile
      },
      stats: {
        bookings: user._count.bookings,
        blogPosts: user._count.blogPosts,
        reviews: user._count.reviews
      }
    }));

    // Get aggregated stats
    const aggregatedStats = await Promise.all([
      services.db.user.count({ where: { isActive: true } }),
      services.db.user.count({ where: { isVerified: true } }),
      services.db.userRole.groupBy({
        by: ['role'],
        where: { isActive: true },
        _count: { role: true }
      })
    ]);

    const stats = {
      totalUsers: totalCount,
      activeUsers: aggregatedStats[0],
      verifiedUsers: aggregatedStats[1],
      roleDistribution: aggregatedStats[2].reduce((acc, stat) => {
        acc[stat.role] = stat._count.role;
        return acc;
      }, {} as Record<UserType, number>)
    };

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        stats
      },
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: totalCount,
        totalPages,
        hasNext: validatedQuery.page < totalPages,
        hasPrev: validatedQuery.page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// BULK USER ACTIONS (Admin only)
export async function POST(req: NextRequest) {
  try {
    const services = getServices();

    // Get token and validate authentication
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required'
        }
      }, { status: 401 });
    }

    const authResult = await services.authService.validateToken(token);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      }, { status: 401 });
    }

    const adminUser = authResult.data!;

    // Check if user has ADMIN role
    if (!adminUser.roles.includes('ADMIN')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admin role required'
        }
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = userActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

    const { action, userIds, role } = validationResult.data;

    // Prevent admin from modifying their own account
    if (userIds.includes(adminUser.id)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CANNOT_MODIFY_SELF',
          message: 'Cannot perform bulk actions on your own account'
        }
      }, { status: 400 });
    }

    // Verify all users exist
    const existingUsers = await services.db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    if (existingUsers.length !== userIds.length) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USERS_NOT_FOUND',
          message: 'Some users were not found'
        }
      }, { status: 404 });
    }

    let results: any[] = [];

    // Perform bulk action
    switch (action) {
      case 'activate':
        await services.db.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true }
        });
        results = existingUsers.map(u => ({ userId: u.id, status: 'activated' }));
        break;

      case 'deactivate':
        await services.db.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        });
        results = existingUsers.map(u => ({ userId: u.id, status: 'deactivated' }));
        break;

      case 'verify':
        await services.db.user.updateMany({
          where: { id: { in: userIds } },
          data: { isVerified: true }
        });
        results = existingUsers.map(u => ({ userId: u.id, status: 'verified' }));
        break;

      case 'assign_role':
        for (const userId of userIds) {
          try {
            await services.userRepository.assignRole(userId, role!, adminUser.id);
            results.push({ userId, status: 'role_assigned', role });
          } catch (error) {
            results.push({ userId, status: 'error', error: 'Role assignment failed' });
          }
        }
        break;

      case 'revoke_role':
        for (const userId of userIds) {
          try {
            await services.userRepository.revokeRole(userId, role!, adminUser.id);
            results.push({ userId, status: 'role_revoked', role });
          } catch (error) {
            results.push({ userId, status: 'error', error: 'Role revocation failed' });
          }
        }
        break;
    }

    // Log admin action
    console.log(`Admin ${adminUser.id} performed ${action} on users:`, userIds);

    return NextResponse.json({
      success: true,
      data: {
        action,
        results,
        message: `Bulk ${action} completed for ${userIds.length} users`
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });

  } catch (error) {
    console.error('Bulk user action error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}