// Node.js runtime utilities for authentication
// This file contains functions that require Node.js runtime and should not be imported by Edge Runtime code

import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { AuthUser } from '@/types/auth';

// Database utilities - these are safe to use in auth config
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

export function sanitizeUserData(user: any): AuthUser {
  const roles = user.userRoles || [];
  const userType = roles.length > 0 ? roles[0].role : 'CLIENT'; // Default to CLIENT if no roles
  
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

export function getActiveRoles(user: AuthUser): UserType[] {
  return user.roles
    .filter(userRole => userRole.isActive)
    .map(userRole => userRole.role);
}

// Password utilities using dynamic imports for Edge Runtime compatibility
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
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
