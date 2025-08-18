import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { auth } from '@/lib/auth/config';
import { 
  AuthUser, 
  JWTPayload, 
  PasswordStrength, 
  ValidationError,
  AuthError 
} from '@/types/auth';

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters');

  return {
    score,
    feedback,
    isValid: score >= 4,
  };
}

// NextAuth v5 session-based authentication (recommended)
export async function getNextAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return null;
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { 
        id: session.user.id,
        isActive: true,
      },
      include: {
        userRoles: {
          where: { isActive: true },
          select: {
            id: true,
            role: true,
            isActive: true,
            assignedAt: true,
            assignedBy: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isVerified: user.isVerified,
      isActive: user.isActive,
      roles: user.userRoles.map(role => ({
        ...role,
        assignedBy: role.assignedBy || undefined
      })),
      userType: user.userRoles[0]?.role || 'CLIENT', // Use first role as default userType
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('NextAuth session error:', error);
    return null;
  }
}

// JWT-based authentication (legacy - for backward compatibility)
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token) as JWTPayload;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.sub,
        isActive: true,
      },
      include: {
        userRoles: {
          where: { isActive: true },
          select: {
            id: true,
            role: true,
            isActive: true,
            assignedAt: true,
            assignedBy: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isVerified: user.isVerified,
      isActive: user.isActive,
      roles: user.userRoles.map(role => ({
        ...role,
        assignedBy: role.assignedBy || undefined
      })),
      userType: user.userRoles[0]?.role || 'CLIENT', // Use first role as default userType
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError' || error.message.includes('jwt malformed')) {
        console.error('Invalid JWT token detected, clearing auth state');
      } else if (error.name === 'TokenExpiredError') {
        console.error('JWT token expired, clearing auth state');
      } else {
        console.error('Auth error:', error.message);
      }
    } else {
      console.error('Auth error:', error);
    }
    return null;
  }
}

// JWT utilities
export function generateToken(payload: JWTPayload): string {
  // Remove exp and iat if present since JWT library will handle these
  const { exp, iat, ...payloadWithoutTimestamps } = payload;
  
  // Calculate expiration based on payload or default to 24h
  const expiresIn = exp ? Math.floor((exp - Date.now() / 1000)) : 24 * 60 * 60;
  
  return jwt.sign(payloadWithoutTimestamps, process.env.JWT_SECRET!, { 
    expiresIn: expiresIn,
    issuer: 'crossborder-vehicles',
    audience: 'crossborder-vehicles-app',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET!, 
    { 
      expiresIn: '30d',
      issuer: 'crossborder-vehicles',
      audience: 'crossborder-vehicles-app',
    }
  );
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    issuer: 'crossborder-vehicles',
    audience: 'crossborder-vehicles-app',
  }) as JWTPayload;
}

export function verifyRefreshToken(token: string): { sub: string; type: string } {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
    issuer: 'crossborder-vehicles',
    audience: 'crossborder-vehicles-app',
  }) as { sub: string; type: string };
}

// User role utilities
export function hasRole(user: AuthUser, role: UserType): boolean {
  return user.roles.some(userRole => userRole.role === role && userRole.isActive);
}

export function hasAnyRole(user: AuthUser, roles: UserType[]): boolean {
  return roles.some(role => hasRole(user, role));
}

export function getActiveRoles(user: AuthUser): UserType[] {
  return user.roles
    .filter(userRole => userRole.isActive)
    .map(userRole => userRole.role);
}

export function getUserPrimaryRole(user: AuthUser): UserType | null {
  const activeRoles = getActiveRoles(user);
  
  // Priority order: ADMIN > DRIVER > BLOG_EDITOR > CLIENT
  const rolePriority = [UserType.ADMIN, UserType.DRIVER, UserType.BLOG_EDITOR, UserType.CLIENT];
  
  for (const role of rolePriority) {
    if (activeRoles.includes(role)) {
      return role;
    }
  }
  
  return activeRoles[0] || null;
}

// Email validation
export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { field: 'email', message: 'Email is required', code: 'REQUIRED' };
  }
  
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT' };
  }
  
  return null;
}

// Phone validation
export function validatePhone(phone: string): ValidationError | null {
  if (!phone) return null; // Phone is optional
  
  // Basic international phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
  
  if (!phoneRegex.test(phone)) {
    return { 
      field: 'phone', 
      message: 'Invalid phone number format', 
      code: 'INVALID_FORMAT' 
    };
  }
  
  return null;
}

// Name validation
export function validateName(name: string): ValidationError | null {
  if (!name) {
    return { field: 'name', message: 'Name is required', code: 'REQUIRED' };
  }
  
  if (name.length < 2) {
    return { 
      field: 'name', 
      message: 'Name must be at least 2 characters long', 
      code: 'TOO_SHORT' 
    };
  }
  
  if (name.length > 100) {
    return { 
      field: 'name', 
      message: 'Name must be less than 100 characters', 
      code: 'TOO_LONG' 
    };
  }
  
  return null;
}

// Error handling
export function createAuthError(code: string, message: string, details?: ValidationError[]): AuthError {
  return { code, message, details };
}

// Rate limiting utilities
export function getRateLimitKey(ip: string, endpoint: string): string {
  return `rate_limit:${ip}:${endpoint}`;
}

// Session utilities
export function generateSessionToken(): string {
  return jwt.sign(
    { type: 'session', random: Math.random() },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

// Database utilities
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        where: { isActive: true },
      },
      passwords: true,
      clientProfile: true,
      driverProfile: true,
      blogEditorProfile: true,
    },
  });
}

export async function createUserWithRole(
  userData: {
    email: string;
    name: string;
    phone?: string;
    passwordHash: string;
  },
  role: UserType
) {
  return prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      isVerified: false,
      userRoles: {
        create: {
          role,
          isActive: true,
        },
      },
      passwords: {
        create: {
          hash: userData.passwordHash,
        },
      },
      // Create role-specific profiles
      ...(role === UserType.CLIENT && {
        clientProfile: {
          create: {
            membershipTier: 'BASIC',
          },
        },
      }),
      ...(role === UserType.DRIVER && {
        driverProfile: {
          create: {
            licenseNumber: '', // Will be updated during verification
            licenseExpiry: new Date(),
            isApproved: false,
          },
        },
      }),
      ...(role === UserType.BLOG_EDITOR && {
        blogEditorProfile: {
          create: {
            isApproved: false,
            permissions: [],
          },
        },
      }),
    },
    include: {
      userRoles: true,
      clientProfile: true,
      driverProfile: true,
      blogEditorProfile: true,
    },
  });
}

// Security utilities
export function sanitizeUserData(user: any): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isActive: user.isActive,
    roles: user.userRoles || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}