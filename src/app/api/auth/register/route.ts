import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { z } from 'zod';
import {
  hashPassword,
  validatePasswordStrength,
  validateEmail,
  validateName,
  validatePhone,
  createAuthError,
  sanitizeUserData,
  createUserWithRole,
} from '@/lib/auth/utils';
import { 
  RegisterRequest, 
  AuthResponse, 
  APIResponse,
  DriverRegistrationData 
} from '@/types/auth';

// Enhanced validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserType, { message: 'Invalid user role' }),
  // Driver-specific fields
  driverData: z.object({
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseExpiry: z.string().refine((date) => new Date(date) > new Date(), {
      message: 'License expiry must be in the future',
    }),
    languages: z.array(z.string()).min(1, 'At least one language is required'),
  }).optional(),
  // Blog editor invitation code
  editorInviteCode: z.string().optional(),
});

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `register:${ip}`;
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 5) { // Max 5 attempts per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse<AuthResponse>>> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  try {
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many registration attempts. Please try again later.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 429 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { email, password, name, phone, role, driverData, editorInviteCode } = validatedData;

    // Comprehensive validation
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({
        success: false,
        error: {
          code: emailError.code,
          message: emailError.message,
          details: [emailError],
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    const nameError = validateName(name);
    if (nameError) {
      return NextResponse.json({
        success: false,
        error: {
          code: nameError.code,
          message: nameError.message,
          details: [nameError],
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        return NextResponse.json({
          success: false,
          error: {
            code: phoneError.code,
            message: phoneError.message,
            details: [phoneError],
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        }, { status: 400 });
      }
    }

    // Password strength validation
    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password does not meet security requirements',
          details: passwordStrength.feedback.map(feedback => ({
            field: 'password',
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          where: { isActive: true },
        },
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true,
      },
    });

    if (existingUser) {
      // Check if user already has this role
      const hasRole = existingUser.userRoles.some(userRole => userRole.role === role);
      if (hasRole) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: `User with this email already has the ${role.toLowerCase()} role`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        }, { status: 400 });
      }

      // User exists but doesn't have this role - add the role
      await prisma.userRole.create({
        data: {
          userId: existingUser.id,
          role,
          isActive: true,
        },
      });

      // Create role-specific profile if needed
      if (role === UserType.CLIENT && !existingUser.clientProfile) {
        await prisma.clientProfile.create({
          data: {
            userId: existingUser.id,
            membershipTier: 'BASIC',
          },
        });
      } else if (role === UserType.DRIVER && !existingUser.driverProfile) {
        if (!driverData) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'DRIVER_DATA_REQUIRED',
              message: 'Driver registration data is required for driver role',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
            },
          }, { status: 400 });
        }

        await prisma.driverProfile.create({
          data: {
            userId: existingUser.id,
            licenseNumber: driverData.licenseNumber,
            licenseExpiry: new Date(driverData.licenseExpiry),
            languages: driverData.languages,
            isApproved: false,
          },
        });
      } else if (role === UserType.BLOG_EDITOR && !existingUser.blogEditorProfile) {
        // Validate invitation code for blog editors
        if (!editorInviteCode) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVITATION_REQUIRED',
              message: 'Blog editor role requires an invitation code',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
            },
          }, { status: 400 });
        }

        // TODO: Validate invitation code against database
        // For now, accept any non-empty code

        await prisma.blogEditorProfile.create({
          data: {
            userId: existingUser.id,
            isApproved: false,
            permissions: [],
          },
        });
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: {
          userRoles: {
            where: { isActive: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          success: true,
          message: `${role.toLowerCase()} role added to existing account successfully`,
          user: sanitizeUserData(updatedUser),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 200 });
    }

    // Role-specific validation for new users
    if (role === UserType.DRIVER && !driverData) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DRIVER_DATA_REQUIRED',
          message: 'Driver license information is required for driver registration',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    if (role === UserType.BLOG_EDITOR && !editorInviteCode) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVITATION_REQUIRED',
          message: 'Blog editor registration requires an invitation code',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user with role
    const userData = {
      email,
      name,
      phone,
      passwordHash,
    };

    const newUser = await createUserWithRole(userData, role);

    // Update driver profile with license data if applicable
    if (role === UserType.DRIVER && driverData) {
      await prisma.driverProfile.update({
        where: { userId: newUser.id },
        data: {
          licenseNumber: driverData.licenseNumber,
          licenseExpiry: new Date(driverData.licenseExpiry),
          languages: driverData.languages,
        },
      });
    }

    // Auto-verify clients, others need admin approval
    if (role === UserType.CLIENT) {
      await prisma.user.update({
        where: { id: newUser.id },
        data: { isVerified: true },
      });
    }

    const response: AuthResponse = {
      success: true,
      message: role === UserType.CLIENT 
        ? 'Account created successfully. You can now sign in.'
        : `Registration submitted successfully. Your ${role.toLowerCase()} account is pending approval.`,
      user: sanitizeUserData(newUser),
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

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
        message: 'An unexpected error occurred during registration',
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
      endpoint: 'register',
      status: 'healthy',
      supportedRoles: Object.values(UserType),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: `health_${Date.now()}`,
    },
  });
}