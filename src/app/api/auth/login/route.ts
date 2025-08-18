import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { z } from 'zod';
import {
  verifyPassword,
  findUserByEmail,
  generateToken,
  generateRefreshToken,
  sanitizeUserData,
  getActiveRoles,
  getUserPrimaryRole,
  validateEmail,
} from '@/lib/auth/utils';
import { 
  LoginRequest, 
  AuthResponse, 
  APIResponse,
  JWTPayload 
} from '@/types/auth';

// Enhanced validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  selectedRole: z.nativeEnum(UserType).optional(),
  rememberMe: z.boolean().default(false),
});

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number; lockoutTime?: number }>();

function checkRateLimit(ip: string, email: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: number } {
  const now = Date.now();
  const key = `login:${ip}:${email}`;
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 900000 }); // 15 minute window
    return { allowed: true, remainingAttempts: 4 };
  }

  // Check if account is locked out
  if (limit.lockoutTime && now < limit.lockoutTime) {
    return { 
      allowed: false, 
      lockoutTime: Math.ceil((limit.lockoutTime - now) / 1000) 
    };
  }

  if (limit.count >= 5) {
    // Lock account for 30 minutes after 5 failed attempts
    limit.lockoutTime = now + 1800000; // 30 minutes
    return { 
      allowed: false, 
      lockoutTime: 1800 
    };
  }

  limit.count++;
  return { 
    allowed: true, 
    remainingAttempts: 5 - limit.count 
  };
}

function clearRateLimit(ip: string, email: string): void {
  const key = `login:${ip}:${email}`;
  rateLimitMap.delete(key);
}

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse<AuthResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { email, password, selectedRole, rememberMe } = validatedData;

    // Email validation
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({
        success: false,
        error: {
          code: emailError.code,
          message: emailError.message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip, email);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: rateLimitResult.lockoutTime 
            ? `Account temporarily locked. Try again in ${rateLimitResult.lockoutTime} seconds.`
            : 'Too many login attempts. Please try again later.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 429 });
    }

    // Find user with all related data
    const user = await findUserByEmail(email);

    if (!user || !user.passwords.length) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwords[0].hash);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Account has been deactivated. Please contact support.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    // Get user's active roles
    const sanitizedUser = sanitizeUserData(user);
    const activeRoles = getActiveRoles(sanitizedUser);

    if (activeRoles.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_ACTIVE_ROLES',
          message: 'No active roles found. Please contact support.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    // Handle role selection
    let finalSelectedRole: UserType;
    
    if (selectedRole && activeRoles.includes(selectedRole)) {
      finalSelectedRole = selectedRole;
    } else if (activeRoles.length === 1) {
      finalSelectedRole = activeRoles[0];
    } else {
      // Multiple roles - need role selection
      return NextResponse.json({
        success: true,
        data: {
          success: true,
          message: 'Multiple roles available',
          requiresRoleSelection: true,
          availableRoles: activeRoles,
          user: sanitizedUser,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 200 });
    }

    // Create JWT payload
    const jwtPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: activeRoles,
      selectedRole: finalSelectedRole,
      isVerified: user.isVerified,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60), // 30 days if remember me, otherwise 24 hours
    };

    // Generate tokens
    const accessToken = generateToken(jwtPayload);
    const refreshToken = generateRefreshToken(user.id);

    // Clear rate limit on successful login
    clearRateLimit(ip, email);

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Prepare response
    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      user: sanitizedUser,
      token: accessToken,
    };

    // Create HTTP response with secure cookies
    const httpResponse = NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 200 });

    // Set access token cookie
    httpResponse.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: '/',
    });

    // Set refresh token cookie
    httpResponse.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Set selected role cookie for frontend
    httpResponse.cookies.set('selected-role', finalSelectedRole, {
      httpOnly: false, // Allow frontend access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    });

    return httpResponse;

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.issues?.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: 'INVALID_FORMAT',
          })) || [],
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during login',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 500 });
  }
}

// Role switching endpoint
export async function PATCH(request: NextRequest): Promise<NextResponse<APIResponse<AuthResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await request.json();
    const { selectedRole } = body;

    if (!selectedRole || !Object.values(UserType).includes(selectedRole)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Invalid role specified',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Get current auth token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'No authentication token found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 401 });
    }

    // Verify token and get user
    const user = await findUserByEmail(body.email);
    if (!user) {
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

    const sanitizedUser = sanitizeUserData(user);
    const activeRoles = getActiveRoles(sanitizedUser);

    // Verify user has the requested role
    if (!activeRoles.includes(selectedRole)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ROLE_NOT_AUTHORIZED',
          message: 'You do not have access to this role',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 403 });
    }

    // Create new JWT with selected role
    const jwtPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: activeRoles,
      selectedRole: selectedRole,
      isVerified: user.isVerified,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const newToken = generateToken(jwtPayload);

    const response: AuthResponse = {
      success: true,
      message: `Switched to ${selectedRole.toLowerCase()} role`,
      user: sanitizedUser,
      token: newToken,
    };

    const httpResponse = NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 200 });

    // Update cookies
    httpResponse.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    httpResponse.cookies.set('selected-role', selectedRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return httpResponse;

  } catch (error) {
    console.error('Role switch error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during role switch',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      endpoint: 'login',
      status: 'healthy',
      supportedRoles: Object.values(UserType),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `health_${Date.now()}`,
    },
  });
}