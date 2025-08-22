import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          where: { isActive: true },
          select: { role: true }
        },
        clientProfile: true,
        driverProfile: {
          include: {
            verificationDocs: true,
            vehicles: true
          }
        },
        blogEditorProfile: true,
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            driver: {
              include: { user: { select: { name: true } } }
            }
          }
        },
        blogPosts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            viewCount: true,
            createdAt: true
          }
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      isActive,
      isVerified,
      clientProfile,
      driverProfile,
      blogEditorProfile
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic user info
      const user = await tx.user.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          isActive,
          isVerified,
          updatedAt: new Date()
        }
      });

      // Update client profile if provided
      if (clientProfile) {
        await tx.clientProfile.upsert({
          where: { userId: id },
          update: {
            membershipTier: clientProfile.membershipTier,
            loyaltyPoints: clientProfile.loyaltyPoints,
            emergencyContact: clientProfile.emergencyContact,
            specialRequests: clientProfile.specialRequests,
            updatedAt: new Date()
          },
          create: {
            userId: id,
            membershipTier: clientProfile.membershipTier || 'BASIC',
            loyaltyPoints: clientProfile.loyaltyPoints || 0,
            emergencyContact: clientProfile.emergencyContact,
            specialRequests: clientProfile.specialRequests
          }
        });
      }

      // Update driver profile if provided
      if (driverProfile) {
        await tx.driverProfile.upsert({
          where: { userId: id },
          update: {
            licenseNumber: driverProfile.licenseNumber,
            licenseExpiry: driverProfile.licenseExpiry,
            isApproved: driverProfile.isApproved,
            languages: driverProfile.languages,
            isAvailable: driverProfile.isAvailable,
            updatedAt: new Date()
          },
          create: {
            userId: id,
            licenseNumber: driverProfile.licenseNumber || '',
            licenseExpiry: driverProfile.licenseExpiry || new Date(),
            isApproved: driverProfile.isApproved || false,
            languages: driverProfile.languages || [],
            isAvailable: driverProfile.isAvailable || true
          }
        });
      }

      // Update blog editor profile if provided
      if (blogEditorProfile) {
        await tx.blogEditorProfile.upsert({
          where: { userId: id },
          update: {
            bio: blogEditorProfile.bio,
            socialLinks: blogEditorProfile.socialLinks,
            isApproved: blogEditorProfile.isApproved,
            permissions: blogEditorProfile.permissions,
            updatedAt: new Date()
          },
          create: {
            userId: id,
            bio: blogEditorProfile.bio,
            socialLinks: blogEditorProfile.socialLinks,
            isApproved: blogEditorProfile.isApproved || false,
            permissions: blogEditorProfile.permissions || []
          }
        });
      }

      return user;
    });

    // Fetch updated user with includes
    const userWithIncludes = await prisma.user.findUnique({
      where: { id },
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

    return NextResponse.json(userWithIncludes);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (hard) {
      // Hard delete - completely remove user and all related data
      await prisma.user.delete({
        where: { id }
      });
    } else {
      // Soft delete - just deactivate the user
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      message: hard ? 'User deleted permanently' : 'User deactivated successfully' 
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}