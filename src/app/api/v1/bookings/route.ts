import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { createStandardMiddleware } from '@/lib/middleware/ApiMiddleware';
import { VehicleType } from '@prisma/client';
import { z } from 'zod';

const createBookingSchema = z.object({
  pickupLocation: z.object({
    address: z.string().min(1, 'Pickup address is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    type: z.string().default('address')
  }),
  dropoffLocation: z.object({
    address: z.string().min(1, 'Dropoff address is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    type: z.string().default('address')
  }),
  scheduledDate: z.string().datetime().transform((str) => new Date(str)),
  vehicleType: z.nativeEnum(VehicleType).optional().default(VehicleType.BUSINESS),
  passengerCount: z.number().min(1).max(8),
  luggage: z.string().optional(),
  specialRequests: z.string().optional()
});

const querySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  status: z.string().optional(),
  clientId: z.string().optional(),
  driverId: z.string().optional(),
  fromDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  toDate: z.string().optional().transform((str) => str ? new Date(str) : undefined)
});

// CREATE BOOKING
export async function POST(req: NextRequest) {
  const services = getServices();
  const middleware = createStandardMiddleware(services.cache, services.authService);

  try {
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

    // Only clients can create bookings
    if (!user.roles.includes('CLIENT')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only clients can create bookings'
        }
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createBookingSchema.safeParse(body);

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

    const bookingData = {
      ...validationResult.data,
      clientId: user.id
    };

    // Create booking
    const bookingResult = await services.bookingService.createBooking(bookingData);

    if (!bookingResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: bookingResult.error?.code || 'BOOKING_CREATION_FAILED',
          message: bookingResult.error?.message || 'Failed to create booking'
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        booking: bookingResult.data
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// GET BOOKINGS (with pagination and filtering)
export async function GET(req: NextRequest) {
  const services = getServices();

  try {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryData = Object.fromEntries(searchParams);
    const validatedQuery = querySchema.parse(queryData);

    // Build where clause based on user role
    let whereClause: any = {};

    if (user.roles.includes('ADMIN')) {
      // Admins can see all bookings
      if (validatedQuery.clientId) whereClause.clientId = validatedQuery.clientId;
      if (validatedQuery.driverId) whereClause.driverId = validatedQuery.driverId;
    } else if (user.roles.includes('DRIVER')) {
      // Drivers can only see their assigned bookings
      whereClause.driverId = user.id;
    } else if (user.roles.includes('CLIENT')) {
      // Clients can only see their own bookings
      whereClause.clientId = user.id;
    } else {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions to view bookings'
        }
      }, { status: 403 });
    }

    // Add additional filters
    if (validatedQuery.status) {
      whereClause.status = validatedQuery.status;
    }

    if (validatedQuery.fromDate || validatedQuery.toDate) {
      whereClause.scheduledDate = {
        ...(validatedQuery.fromDate && { gte: validatedQuery.fromDate }),
        ...(validatedQuery.toDate && { lte: validatedQuery.toDate })
      };
    }

    // Fetch bookings with pagination
    const bookings = await services.db.booking.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        driver: {
          include: {
            user: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            plateNumber: true,
            color: true,
            vehicleType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit
    });

    // Get total count for pagination
    const totalCount = await services.db.booking.count({
      where: whereClause
    });

    const totalPages = Math.ceil(totalCount / validatedQuery.limit);

    // Transform bookings data
    const transformedBookings = bookings.map(booking => ({
      ...booking,
      driver: booking.driver ? {
        id: booking.driver.id,
        name: booking.driver.user.name,
        phone: booking.driver.user.phone,
        rating: booking.driver.rating
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookings: transformedBookings
      },
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: totalCount,
        totalPages,
        hasNext: validatedQuery.page < totalPages,
        hasPrev: validatedQuery.page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}