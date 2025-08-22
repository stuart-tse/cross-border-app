import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { z } from 'zod';
import {
  findUserByEmail,
  sanitizeUserData,
  getActiveRoles,
  verifyToken,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from '@/lib/auth/utils';
import { auth } from '@/lib/auth/config';
import { 
  AuthResponse, 
  APIResponse,
  ChangePasswordRequest 
} from '@/types/auth';

// User profile data interface for the /me endpoint
interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  roles: any[];
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
  clientProfile?: any;
  driverProfile?: any;
  blogEditorProfile?: any;
}

// DEPRECATED: Get current user info
// This endpoint is deprecated. Use NextAuth session directly on client-side.
export async function GET(request: NextRequest): Promise<NextResponse<APIResponse<UserProfileResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.warn('⚠️ DEPRECATED: /api/auth/me endpoint is deprecated. Use NextAuth useSession() hook instead.');

  try {
    // Use NextAuth v5 auth function directly
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'No valid NextAuth session found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    // Get fresh user data from database
    const freshUser = await findUserByEmail(session.user.email!);
    if (!freshUser) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in database',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 404 });
    }

    const sanitizedUser = sanitizeUserData(freshUser);
    
    const sanitizedUserWithProfiles = {
      ...sanitizedUser,
      // Include profile data based on roles
      clientProfile: freshUser.clientProfile,
      driverProfile: freshUser.driverProfile,
      blogEditorProfile: freshUser.blogEditorProfile,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedUserWithProfiles,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        deprecated: true,
        message: 'This endpoint is deprecated. Use NextAuth useSession() hook instead.'
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 500 });
  }
}

// Update user profile
export async function PATCH(request: NextRequest): Promise<NextResponse<APIResponse<AuthResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'No valid authentication found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    const userEmail = session.user.email!;
    const dbUser = await findUserByEmail(userEmail);
    
    if (!dbUser) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 404 });
    }

    const user = sanitizeUserData(dbUser);

    const body = await request.json();
    const { name, phone, avatar } = body;

    // Validate input
    if (name && (typeof name !== 'string' || name.length < 2 || name.length > 100)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Name must be between 2 and 100 characters',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    if (phone && (typeof phone !== 'string' || !/^\+?[\d\s\-\(\)]{8,}$/.test(phone))) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Invalid phone number format',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        updatedAt: new Date(),
      },
      include: {
        userRoles: {
          where: { isActive: true },
        },
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true,
      },
    });

    const response: AuthResponse = {
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUserData(updatedUser),
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while updating profile',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 500 });
  }
}

// Change password
export async function PUT(request: NextRequest): Promise<NextResponse<APIResponse<AuthResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'No valid authentication found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Current password and new password are required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Get user with password
    const userWithPassword = await findUserByEmail(session.user.email!);
    if (!userWithPassword || !userWithPassword.passwords.length) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      userWithPassword.passwords[0].hash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Validate new password strength
    const passwordStrength = validatePasswordStrength(newPassword);
    if (!passwordStrength.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'New password does not meet security requirements',
          details: passwordStrength.feedback.map(feedback => ({
            field: 'newPassword',
            message: feedback,
            code: 'INVALID_FORMAT',
          })),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.password.update({
      where: { id: userWithPassword.passwords[0].id },
      data: { hash: newPasswordHash },
    });

    // Update user timestamp
    await prisma.user.update({
      where: { id: session.user.id },
      data: { updatedAt: new Date() },
    });

    const response: AuthResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while changing password',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 500 });
  }
}

// Delete user account (soft delete)
export async function DELETE(request: NextRequest): Promise<NextResponse<APIResponse<AuthResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'No valid authentication found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    const body = await request.json();
    const { password, reason } = body;

    if (!password) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PASSWORD_REQUIRED',
          message: 'Password confirmation is required to delete account',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Get user with password
    const userWithPassword = await findUserByEmail(session.user.email!);
    if (!userWithPassword || !userWithPassword.passwords.length) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userWithPassword.passwords[0].hash);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password is incorrect',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Soft delete user account
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${session.user.email}`, // Prevent email conflicts
        updatedAt: new Date(),
      },
    });

    // Deactivate all user roles
    await prisma.userRole.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });

    const response: AuthResponse = {
      success: true,
      message: 'Account deleted successfully',
    };

    // Clear auth cookies
    const httpResponse = NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 200 });

    httpResponse.cookies.delete('auth-token');
    httpResponse.cookies.delete('refresh-token');
    httpResponse.cookies.delete('selected-role');

    return httpResponse;

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while deleting account',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 500 });
  }
}