import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { createStandardMiddleware } from '@/lib/middleware/ApiMiddleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional().default(false)
});

export async function POST(req: NextRequest) {
  const services = getServices();
  const middleware = createStandardMiddleware(services.cache, services.authService);

  // Apply public middleware
  const middlewareResult = await middleware.public(req);
  
  // If middleware returned a response (error), return it
  if (middlewareResult.status !== 200) {
    return middlewareResult;
  }

  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
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

    const { email, password, remember } = validationResult.data;

    // Get client info
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Attempt login
    const loginResult = await services.authService.login(
      { email, password, remember },
      ipAddress,
      userAgent
    );

    if (!loginResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: loginResult.error?.code || 'LOGIN_FAILED',
          message: loginResult.error?.message || 'Login failed'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 401 });
    }

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: loginResult.data!.user.id,
          email: loginResult.data!.user.email,
          name: loginResult.data!.user.name,
          roles: loginResult.data!.user.roles,
          isVerified: loginResult.data!.user.isVerified
        },
        expiresAt: loginResult.data!.expiresAt
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

    // Set secure HTTP-only cookie
    response.cookies.set('auth_token', loginResult.data!.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 1 day
      path: '/'
    });

    response.cookies.set('refresh_token', loginResult.data!.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
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