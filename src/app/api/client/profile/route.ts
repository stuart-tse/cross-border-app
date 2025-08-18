import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { prisma } from '@/lib/database/client';

// GET /api/client/profile - Get client profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with client profile
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        clientProfile: {
          include: {
            settings: true,
            paymentMethods: {
              where: { isActive: true },
              orderBy: { isDefault: 'desc' }
            }
          }
        }
      }
    });

    if (!userWithProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create client profile if it doesn't exist
    if (!userWithProfile.clientProfile) {
      const clientProfile = await prisma.clientProfile.create({
        data: {
          userId: userWithProfile.id,
          profileCompletion: calculateProfileCompletion(userWithProfile)
        },
        include: {
          settings: true,
          paymentMethods: true
        }
      });
      
      userWithProfile.clientProfile = clientProfile;
    }

    return NextResponse.json({
      user: {
        id: userWithProfile.id,
        name: userWithProfile.name,
        email: userWithProfile.email,
        phone: userWithProfile.phone,
        avatar: userWithProfile.avatar,
        isVerified: userWithProfile.isVerified,
        profile: userWithProfile.clientProfile
      }
    });

  } catch (error) {
    console.error('Error fetching client profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/client/profile - Update client profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      nationality,
      passportNumber,
      emergencyContact,
      emergencyContactPhone,
      emergencyContactRelation,
      preferredVehicle,
      specialRequests
    } = body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone
      }
    });

    // Update or create client profile
    const clientProfile = await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        nationality,
        passportNumber,
        emergencyContact,
        emergencyContactPhone,
        emergencyContactRelation,
        preferredVehicle,
        specialRequests,
        profileCompletion: calculateProfileCompletion({
          ...updatedUser,
          dateOfBirth,
          gender,
          nationality,
          passportNumber,
          emergencyContact,
          emergencyContactPhone
        })
      },
      create: {
        userId: user.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        nationality,
        passportNumber,
        emergencyContact,
        emergencyContactPhone,
        emergencyContactRelation,
        preferredVehicle,
        specialRequests,
        profileCompletion: calculateProfileCompletion({
          ...updatedUser,
          dateOfBirth,
          gender,
          nationality,
          passportNumber,
          emergencyContact,
          emergencyContactPhone
        })
      },
      include: {
        settings: true,
        paymentMethods: {
          where: { isActive: true }
        }
      }
    });

    return NextResponse.json({
      user: {
        ...updatedUser,
        profile: clientProfile
      }
    });

  } catch (error) {
    console.error('Error updating client profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(userData: any): number {
  const fields = [
    'name',
    'email', 
    'phone',
    'dateOfBirth',
    'gender',
    'nationality',
    'emergencyContact',
    'emergencyContactPhone'
  ];
  
  const completedFields = fields.filter(field => {
    const value = userData[field];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  return Math.round((completedFields / fields.length) * 100);
}