import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { z } from 'zod';

const refreshSchema = z.object({
  refreshToken: z.string().optional() // Can come from cookie or body
});

export async function POST(req: NextRequest) {
  try {
    const services = getServices();

    // Get refresh token from cookie or body
    const refreshTokenFromCookie = req.cookies.get('refresh_token')?.value;
    
    let refreshToken: string;
    
    if (refreshTokenFromCookie) {
      refreshToken = refreshTokenFromCookie;
    } else {
      const body = await req.json();
      const validatedBody = refreshSchema.parse(body);
      
      if (!validatedBody.refreshToken) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Refresh token is required'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1'
          }
        }, { status: 401 });
      }
      
      refreshToken = validatedBody.refreshToken;
    }

    // Refresh token through service
    const refreshResult = await services.authService.refreshToken(refreshToken);

    if (!refreshResult.success) {
      const response = NextResponse.json({
        success: false,
        error: {
          code: refreshResult.error?.code || 'REFRESH_FAILED',
          message: refreshResult.error?.message || 'Token refresh failed'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 401 });

      // Clear cookies if refresh failed
      response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
      response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });

      return response;
    }

    // Create response with new token
    const response = NextResponse.json({
      success: true,
      data: {
        expiresAt: refreshResult.data!.expiresAt
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

    // Set new access token cookie
    response.cookies.set('auth_token', refreshResult.data!.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
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