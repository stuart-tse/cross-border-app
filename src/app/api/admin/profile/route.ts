import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { UserType } from '@prisma/client';
import { prisma } from '@/lib/database/client';

interface AdminProfileData {
  name: string;
  phone?: string;
  bio?: string;
  department?: string;
  position?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const hasAdminRole = session.user?.roles?.includes(UserType.ADMIN);
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get user from database with admin details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: {
          where: { isActive: true },
          select: { role: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build admin profile response
    const adminProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      // Mock admin-specific fields - in production these would come from an AdminProfile model
      bio: 'Senior system administrator with 5+ years of experience managing cross-border transportation platforms.',
      department: 'Operations',
      position: 'Senior Admin',
      permissions: [
        'USER_MANAGEMENT',
        'ANALYTICS_VIEW',
        'SYSTEM_SETTINGS',
        'CONTENT_MANAGEMENT',
        'FINANCIAL_REPORTS',
        'SUPPORT_MANAGEMENT'
      ],
      lastLogin: user.updatedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(adminProfile);

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const hasAdminRole = session.user?.roles?.includes(UserType.ADMIN);
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, phone, bio, department, position }: AdminProfileData = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        updatedAt: new Date()
      }
    });

    // In production, admin-specific fields (bio, department, position) would be stored 
    // in a separate AdminProfile table linked to the user
    // For now, we'll just return the mock data with updates
    
    const adminProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      bio: bio || 'Senior system administrator with 5+ years of experience managing cross-border transportation platforms.',
      department: department || 'Operations',
      position: position || 'Senior Admin',
      permissions: [
        'USER_MANAGEMENT',
        'ANALYTICS_VIEW',
        'SYSTEM_SETTINGS',
        'CONTENT_MANAGEMENT',
        'FINANCIAL_REPORTS',
        'SUPPORT_MANAGEMENT'
      ],
      lastLogin: updatedUser.updatedAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    // Log the update for audit purposes
    console.log('Admin profile updated:', {
      userId: session.user.id,
      email: session.user.email,
      changes: { name, phone, bio, department, position },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      profile: adminProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A user with this information already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update admin profile' },
      { status: 500 }
    );
  }
}

// Get admin activity/audit log
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const hasAdminRole = session.user?.roles?.includes(UserType.ADMIN);
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // In production, this would fetch recent admin activity from audit log
    const recentActivity = [
      {
        id: '1',
        action: 'USER_UPDATED',
        target: 'user:123',
        description: 'Updated client profile for Michael Chen',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        action: 'SETTINGS_CHANGED',
        target: 'system:payment',
        description: 'Updated payment settings - base fare changed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        action: 'USER_CREATED',
        target: 'user:456',
        description: 'Created new driver account for Li Wei',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({
      activity: recentActivity,
      adminId: session.user.id
    });

  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin activity' },
      { status: 500 }
    );
  }
}