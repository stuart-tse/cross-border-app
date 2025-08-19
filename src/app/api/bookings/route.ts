import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { auth } from '@/lib/auth/config';
import { findUserByEmail, sanitizeUserData, hasRole } from '@/lib/auth/utils';
import { UserType } from '@prisma/client';
import { calculateBookingPrice } from '@/lib/services/pricing';
import { z } from 'zod';

const createBookingSchema = z.object({
  pickupLocation: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    type: z.enum(['HK', 'CHINA']),
  }),
  dropoffLocation: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    type: z.enum(['HK', 'CHINA']),
  }),
  scheduledDate: z.string().datetime(),
  vehicleType: z.enum(['BUSINESS', 'EXECUTIVE', 'LUXURY', 'SUV', 'VAN']),
  passengerCount: z.number().min(1).max(8),
  luggage: z.string().optional(),
  specialRequests: z.string().optional(),
});

// Get all bookings for a user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const where: any = {
      clientId: user.id,
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        vehicle: true,
        payments: true,
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.booking.count({ where });

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new booking
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

    if (!hasRole(user, UserType.CLIENT)) {
      return NextResponse.json(
        { error: 'Only clients can create bookings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const {
      pickupLocation,
      dropoffLocation,
      scheduledDate,
      vehicleType,
      passengerCount,
      luggage,
      specialRequests,
    } = validatedData;

    // Calculate pricing and route details
    const pricingData = await calculateBookingPrice({
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      vehicleType,
      scheduledDate: new Date(scheduledDate),
    });

    // Find available driver/vehicle
    const availableDriver = await findAvailableDriver(
      vehicleType,
      new Date(scheduledDate)
    );

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        driverId: availableDriver?.id,
        vehicleId: availableDriver?.vehicleId,
        pickupLocation,
        dropoffLocation,
        scheduledDate: new Date(scheduledDate),
        estimatedDuration: pricingData.estimatedDuration,
        distance: pricingData.distance,
        basePrice: pricingData.basePrice,
        surcharges: pricingData.surcharges,
        totalPrice: pricingData.totalPrice,
        passengerCount,
        luggage,
        specialRequests,
        status: availableDriver ? 'CONFIRMED' : 'PENDING',
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        vehicle: true,
      },
    });

    // Create notification for driver if assigned
    if (availableDriver) {
      await prisma.notification.create({
        data: {
          userId: availableDriver.userId,
          type: 'BOOKING_CONFIRMED',
          title: 'New Booking Assignment',
          message: `You have been assigned a new booking from ${pickupLocation.address} to ${dropoffLocation.address}`,
          data: { bookingId: booking.id },
        },
      });
    }

    return NextResponse.json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to find available driver
async function findAvailableDriver(vehicleType: string, scheduledDate: Date) {
  const drivers = await prisma.driverProfile.findMany({
    where: {
      isApproved: true,
      isAvailable: true,
      vehicles: {
        some: {
          vehicleType: vehicleType as any,
          isActive: true,
        },
      },
    },
    include: {
      vehicles: {
        where: {
          vehicleType: vehicleType as any,
          isActive: true,
        },
      },
      driverBookings: {
        where: {
          scheduledDate: {
            gte: new Date(scheduledDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
            lte: new Date(scheduledDate.getTime() + 4 * 60 * 60 * 1000), // 4 hours after
          },
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
      },
    },
  });

  // Find driver with no conflicting bookings
  const availableDriver = drivers.find(
    (driver) => driver.driverBookings.length === 0 && driver.vehicles.length > 0
  );

  if (availableDriver && availableDriver.vehicles.length > 0) {
    return {
      id: availableDriver.id,
      userId: availableDriver.userId,
      vehicleId: availableDriver.vehicles[0].id,
    };
  }

  return null;
}