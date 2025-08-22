import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { createStandardMiddleware } from '@/lib/middleware/ApiMiddleware';

export async function GET(req: NextRequest) {
  const services = getServices();
  const middleware = createStandardMiddleware(services.cache, services.authService);

  try {
    // Get token from cookie or Authorization header
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

    // Validate token
    const authResult = await services.authService.validateToken(token);

    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: authResult.error?.code || 'INVALID_TOKEN',
          message: authResult.error?.message || 'Invalid authentication token'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 401 });
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authResult.data!.id,
          email: authResult.data!.email,
          name: authResult.data!.name,
          phone: authResult.data!.phone,
          avatar: authResult.data!.avatar,
          roles: authResult.data!.roles,
          permissions: authResult.data!.permissions,
          isVerified: authResult.data!.isVerified,
          isActive: authResult.data!.isActive,
          createdAt: authResult.data!.createdAt,
          updatedAt: authResult.data!.updatedAt
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get user error:', error);
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