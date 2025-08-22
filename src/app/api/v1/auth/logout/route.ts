import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { verify } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const services = getServices();

    // Get token from cookie or Authorization header
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    let sessionId: string | undefined;

    if (token) {
      try {
        // Extract session ID from token to invalidate session
        const payload = verify(token, process.env.JWT_SECRET!) as any;
        sessionId = payload.sessionId;
      } catch (error) {
        // Token invalid, but we still want to clear cookies
        console.warn('Invalid token during logout:', error);
      }
    }

    // Logout through service (handles session invalidation)
    if (sessionId) {
      await services.authService.logout(sessionId);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

    // Clear auth cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'An error occurred during logout'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 500 });
  }
}