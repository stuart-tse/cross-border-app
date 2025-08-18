import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const userType = searchParams.get('userType') as UserType | 'ALL';
    const membershipTier = searchParams.get('membershipTier');
    const verificationStatus = searchParams.get('verificationStatus');

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        {
          driverProfile: {
            licenseNumber: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
      // Note: 'suspended' would need additional field in User model
    }

    // User type filter
    if (userType && userType !== 'ALL') {
      where.userRoles = {
        some: {
          role: userType,
          isActive: true
        }
      };
    }

    // Membership tier filter (for clients)
    if (membershipTier && membershipTier !== 'all') {
      where.clientProfile = {
        membershipTier: membershipTier
      };
    }

    // Verification status filter (for drivers)
    if (verificationStatus && verificationStatus !== 'all') {
      where.driverProfile = {
        isApproved: verificationStatus === 'approved'
      };
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      include: {
        userRoles: {
          where: { isActive: true },
          select: { role: true }
        },
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, userType, profileData } = body;

    // Validate required fields
    if (!name || !email || !userType) {
      return NextResponse.json(
        { error: 'Name, email, and user type are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user with transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          isVerified: false,
          isActive: true
        }
      });

      // Create user role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          role: userType,
          isActive: true
        }
      });

      // Create type-specific profile
      if (userType === 'CLIENT') {
        await tx.clientProfile.create({
          data: {
            userId: newUser.id,
            membershipTier: profileData?.membershipTier || 'BASIC',
            loyaltyPoints: profileData?.loyaltyPoints || 0,
            emergencyContact: profileData?.emergencyContact,
            specialRequests: profileData?.specialRequests
          }
        });
      } else if (userType === 'DRIVER') {
        await tx.driverProfile.create({
          data: {
            userId: newUser.id,
            licenseNumber: profileData?.licenseNumber || '',
            licenseExpiry: profileData?.licenseExpiry || new Date(),
            isApproved: false,
            rating: 0,
            totalTrips: 0,
            languages: profileData?.languages || [],
            isAvailable: true
          }
        });
      } else if (userType === 'BLOG_EDITOR') {
        await tx.blogEditorProfile.create({
          data: {
            userId: newUser.id,
            bio: profileData?.bio,
            socialLinks: profileData?.socialLinks,
            isApproved: false,
            permissions: profileData?.permissions || []
          }
        });
      }

      return newUser;
    });

    // Fetch created user with includes
    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          where: { isActive: true },
          select: { role: true }
        },
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true
      }
    });

    return NextResponse.json(createdUser, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}