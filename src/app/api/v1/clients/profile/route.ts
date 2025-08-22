import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  preferredVehicle: z.enum(['BUSINESS', 'EXECUTIVE', 'LUXURY', 'SUV', 'VAN']).optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  specialRequests: z.string().optional(),
  dateOfBirth: z.string().datetime().transform(str => new Date(str)).optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional()
});

// GET CLIENT PROFILE
export async function GET(req: NextRequest) {
  try {
    const services = getServices();

    // Get token and validate authentication
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required'
        }
      }, { status: 401 });
    }

    const authResult = await services.authService.validateToken(token);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      }, { status: 401 });
    }

    const user = authResult.data!;

    // Check if user has CLIENT role
    if (!user.roles.includes('CLIENT')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Client role required'
        }
      }, { status: 403 });
    }

    // Get client profile with extended data
    const clientProfile = await services.db.clientProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true
          }
        },
        paymentMethods: {
          where: { isActive: true },
          select: {
            id: true,
            type: true,
            last4Digits: true,
            cardBrand: true,
            isDefault: true
          }
        },
        settings: true,
        _count: {
          select: {
            supportTickets: true
          }
        }
      }
    });

    if (!clientProfile) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Client profile not found'
        }
      }, { status: 404 });
    }

    // Get booking stats
    const bookingStats = await services.db.booking.groupBy({
      by: ['status'],
      where: { clientId: user.id },
      _count: { status: true }
    });

    const stats = {
      totalBookings: bookingStats.reduce((sum, stat) => sum + stat._count.status, 0),
      completedBookings: bookingStats.find(s => s.status === 'COMPLETED')?._count.status || 0,
      pendingBookings: bookingStats.find(s => s.status === 'PENDING')?._count.status || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: clientProfile.id,
          user: clientProfile.user,
          preferredVehicle: clientProfile.preferredVehicle,
          loyaltyPoints: clientProfile.loyaltyPoints,
          membershipTier: clientProfile.membershipTier,
          emergencyContact: clientProfile.emergencyContact,
          emergencyContactPhone: clientProfile.emergencyContactPhone,
          emergencyContactRelation: clientProfile.emergencyContactRelation,
          specialRequests: clientProfile.specialRequests,
          dateOfBirth: clientProfile.dateOfBirth,
          gender: clientProfile.gender,
          nationality: clientProfile.nationality,
          passportNumber: clientProfile.passportNumber,
          documentVerified: clientProfile.documentVerified,
          profileCompletion: clientProfile.profileCompletion,
          createdAt: clientProfile.createdAt,
          updatedAt: clientProfile.updatedAt
        },
        stats,
        paymentMethods: clientProfile.paymentMethods,
        settings: clientProfile.settings,
        supportTicketsCount: clientProfile._count.supportTickets
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });

  } catch (error) {
    console.error('Get client profile error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// UPDATE CLIENT PROFILE
export async function PUT(req: NextRequest) {
  try {
    const services = getServices();

    // Get token and validate authentication
    const tokenFromCookie = req.cookies.get('auth_token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required'
        }
      }, { status: 401 });
    }

    const authResult = await services.authService.validateToken(token);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        }
      }, { status: 401 });
    }

    const user = authResult.data!;

    // Check if user has CLIENT role
    if (!user.roles.includes('CLIENT')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Client role required'
        }
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationResult.error.errors
        }
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Update profile in transaction
    const result = await services.db.$transaction(async (tx) => {
      // Update user data if provided
      const userUpdates: any = {};
      if (updateData.name) userUpdates.name = updateData.name;
      if (updateData.phone) userUpdates.phone = updateData.phone;
      if (updateData.avatar) userUpdates.avatar = updateData.avatar;

      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: userUpdates
        });
      }

      // Update client profile
      const profileUpdates: any = {};
      if (updateData.preferredVehicle) profileUpdates.preferredVehicle = updateData.preferredVehicle;
      if (updateData.emergencyContact) profileUpdates.emergencyContact = updateData.emergencyContact;
      if (updateData.emergencyContactPhone) profileUpdates.emergencyContactPhone = updateData.emergencyContactPhone;
      if (updateData.emergencyContactRelation) profileUpdates.emergencyContactRelation = updateData.emergencyContactRelation;
      if (updateData.specialRequests) profileUpdates.specialRequests = updateData.specialRequests;
      if (updateData.dateOfBirth) profileUpdates.dateOfBirth = updateData.dateOfBirth;
      if (updateData.gender) profileUpdates.gender = updateData.gender;
      if (updateData.nationality) profileUpdates.nationality = updateData.nationality;
      if (updateData.passportNumber) profileUpdates.passportNumber = updateData.passportNumber;

      // Calculate profile completion percentage
      const completionFields = [
        updateData.name || user.name,
        user.email,
        updateData.phone || user.phone,
        updateData.emergencyContact || profileUpdates.emergencyContact,
        updateData.dateOfBirth || profileUpdates.dateOfBirth,
        updateData.nationality || profileUpdates.nationality
      ];
      
      const completedFields = completionFields.filter(field => field && field.toString().trim().length > 0).length;
      profileUpdates.profileCompletion = Math.round((completedFields / completionFields.length) * 100);

      const updatedProfile = await tx.clientProfile.update({
        where: { userId: user.id },
        data: profileUpdates,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              isVerified: true
            }
          }
        }
      });

      return updatedProfile;
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: result,
        message: 'Profile updated successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });

  } catch (error) {
    console.error('Update client profile error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}