import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';
import { auth } from '@/lib/auth/config';
import { findUserByEmail, sanitizeUserData } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email!;
    const dbUser = await findUserByEmail(userEmail);
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = sanitizeUserData(dbUser);

    const body = await request.json();
    const { userId, role } = body;

    // For development purposes, allow any authenticated user to assign roles
    // In production, this should be restricted to admins only
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!Object.values(UserType).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { isActive: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has this role
    const hasRole = targetUser.userRoles.some(userRole => userRole.role === role);
    if (hasRole) {
      return NextResponse.json(
        { error: 'User already has this role' },
        { status: 400 }
      );
    }

    // Add the role
    await prisma.userRole.create({
      data: {
        userId: targetUser.id,
        role,
        isActive: true,
      },
    });

    // Create role-specific profile if needed
    if (role === UserType.CLIENT) {
      const hasClientProfile = await prisma.clientProfile.findUnique({
        where: { userId: targetUser.id },
      });
      
      if (!hasClientProfile) {
        await prisma.clientProfile.create({
          data: {
            userId: targetUser.id,
            membershipTier: 'BASIC',
          },
        });
      }
    } else if (role === UserType.DRIVER) {
      const hasDriverProfile = await prisma.driverProfile.findUnique({
        where: { userId: targetUser.id },
      });
      
      if (!hasDriverProfile) {
        await prisma.driverProfile.create({
          data: {
            userId: targetUser.id,
            licenseNumber: 'TEMP-LICENSE-001',
            licenseExpiry: new Date('2026-12-31'),
            languages: ['English'],
            isApproved: true, // Auto-approve for development
          },
        });
      }
    } else if (role === UserType.BLOG_EDITOR) {
      const hasEditorProfile = await prisma.blogEditorProfile.findUnique({
        where: { userId: targetUser.id },
      });
      
      if (!hasEditorProfile) {
        await prisma.blogEditorProfile.create({
          data: {
            userId: targetUser.id,
            isApproved: true,
            permissions: [],
          },
        });
      }
    } else if (role === UserType.ADMIN) {
      const hasAdminProfile = await prisma.adminProfile.findUnique({
        where: { userId: targetUser.id },
      });
      
      if (!hasAdminProfile) {
        await prisma.adminProfile.create({
          data: {
            userId: targetUser.id,
            permissions: ['FULL_ACCESS'],
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${role} role assigned successfully`,
    });

  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}