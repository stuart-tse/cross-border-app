import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

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
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
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
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 401 });
    }

    const user = authResult.data!;

    // Parse and validate request body
    const body = await req.json();
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationResult.error.errors
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 400 });
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'SAME_PASSWORD',
          message: 'New password must be different from current password'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 400 });
    }

    // Change password through service
    const changeResult = await services.authService.changePassword(
      user.id,
      currentPassword,
      newPassword
    );

    if (!changeResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: changeResult.error?.code || 'PASSWORD_CHANGE_FAILED',
          message: changeResult.error?.message || 'Failed to change password'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password changed successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 500 });
  }
}