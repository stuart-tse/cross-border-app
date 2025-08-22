import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { UserType } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  phone: z.string().optional(),
  userType: z.nativeEnum(UserType, {
    errorMap: () => ({ message: 'Valid user type is required' })
  })
});

export async function POST(req: NextRequest) {
  try {
    const services = getServices();

    // Check if registration is enabled
    const isRegistrationEnabled = process.env.ENABLE_REGISTRATION !== 'false';
    if (!isRegistrationEnabled) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'REGISTRATION_DISABLED',
          message: 'User registration is currently disabled'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = registerSchema.safeParse(body);

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

    const { email, name, password, phone, userType } = validationResult.data;

    // Get client info for audit logging
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Attempt registration
    const registerResult = await services.authService.register(
      { email, name, password, phone, userType },
      ipAddress,
      userAgent
    );

    if (!registerResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: registerResult.error?.code || 'REGISTRATION_FAILED',
          message: registerResult.error?.message || 'Registration failed'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      }, { status: 400 });
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: registerResult.data!.id,
          email: registerResult.data!.email,
          name: registerResult.data!.name,
          phone: registerResult.data!.phone,
          roles: registerResult.data!.roles,
          isVerified: registerResult.data!.isVerified,
          createdAt: registerResult.data!.createdAt
        },
        message: 'Registration successful. Please check your email for verification instructions.'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during registration'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 500 });
  }
}