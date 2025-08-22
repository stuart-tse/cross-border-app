import { NextRequest } from 'next/server';

// Force Node.js runtime for this module
export const runtime = 'nodejs';

// WARNING: This module contains Node.js-only dependencies (bcrypt, jwt)
// DO NOT IMPORT this module in middleware or any Edge Runtime code
// Use edge-utils.ts for Edge Runtime compatible functions

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Ensure these modules are only used in Node.js runtime
if (typeof process === 'undefined' || !process.versions?.node) {
  throw new Error('This module requires Node.js runtime and cannot be used in Edge Runtime');
}

import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
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
    // Dynamic import to avoid Edge Runtime issues
    const { auth } = await import('@/lib/auth/config');
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

// Alias for consistency with Server Components pattern
export const getCurrentUser = getNextAuthUser;

// DEPRECATED: Legacy JWT-based authentication
// This function is deprecated and should not be used in new code.
// Use getNextAuthUser() instead for NextAuth v5 session-based authentication.
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  console.warn('⚠️ DEPRECATED: getAuthUser() is deprecated. Use getNextAuthUser() instead.');
  
  // For backward compatibility, redirect to NextAuth session-based auth
  return await getNextAuthUser();
}

// DEPRECATED: Legacy JWT utilities
// These functions are deprecated and should not be used in new code.
// NextAuth v5 handles all token management internally.

export function generateToken(payload: JWTPayload): string {
  console.warn('⚠️ DEPRECATED: generateToken() is deprecated. NextAuth v5 handles token generation.');
  throw new Error('DEPRECATED: Use NextAuth v5 session management instead of custom JWT tokens.');
}

export function generateRefreshToken(userId: string): string {
  console.warn('⚠️ DEPRECATED: generateRefreshToken() is deprecated. NextAuth v5 handles refresh tokens.');
  throw new Error('DEPRECATED: Use NextAuth v5 session management instead of custom refresh tokens.');
}

export function verifyToken(token: string): JWTPayload {
  console.warn('⚠️ DEPRECATED: verifyToken() is deprecated. Use NextAuth v5 session verification.');
  throw new Error('DEPRECATED: Use NextAuth v5 session verification instead of custom JWT verification.');
}

export function verifyRefreshToken(token: string): { sub: string; type: string } {
  console.warn('⚠️ DEPRECATED: verifyRefreshToken() is deprecated. NextAuth v5 handles refresh tokens.');
  throw new Error('DEPRECATED: Use NextAuth v5 session management instead of custom refresh token verification.');
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

// DEPRECATED: Session utilities
export function generateSessionToken(): string {
  console.warn('⚠️ DEPRECATED: generateSessionToken() is deprecated. NextAuth v5 handles session tokens.');
  throw new Error('DEPRECATED: Use NextAuth v5 session management instead of custom session tokens.');
}

// Database utilities - MOVED to node-utils.ts
// These functions are now available in node-utils.ts to avoid Edge Runtime issues
// Import from node-utils.ts instead of this file

// Legacy exports for backward compatibility - these just re-export from node-utils
export async function findUserByEmail(email: string) {
  const { findUserByEmail: nodeUtilsFunction } = await import('./node-utils');
  return nodeUtilsFunction(email);
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
  const { createUserWithRole: nodeUtilsFunction } = await import('./node-utils');
  return nodeUtilsFunction(userData, role);
}

export function sanitizeUserData(user: any): AuthUser {
  const roles = user.userRoles || [];
  const userType = roles.length > 0 ? roles[0].role : 'CLIENT';
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isActive: user.isActive,
    roles: roles,
    userType: userType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}