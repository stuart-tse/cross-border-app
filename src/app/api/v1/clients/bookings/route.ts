import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { BookingStatus } from '@prisma/client';
import { z } from 'zod';

const querySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  status: z.nativeEnum(BookingStatus).optional(),
  fromDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  toDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  sortBy: z.enum(['scheduledDate', 'createdAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

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

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryData = Object.fromEntries(searchParams);
    const validatedQuery = querySchema.parse(queryData);

    // Build where clause
    const whereClause: any = {
      clientId: user.id
    };

    if (validatedQuery.status) {
      whereClause.status = validatedQuery.status;
    }

    if (validatedQuery.fromDate || validatedQuery.toDate) {
      whereClause.scheduledDate = {
        ...(validatedQuery.fromDate && { gte: validatedQuery.fromDate }),
        ...(validatedQuery.toDate && { lte: validatedQuery.toDate })
      };
    }

    // Build sort order
    const orderBy = {
      [validatedQuery.sortBy]: validatedQuery.sortOrder
    };

    // Get bookings with pagination
    const [bookings, totalCount] = await Promise.all([
      services.db.booking.findMany({
        where: whereClause,
        include: {
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              color: true,
              plateNumber: true,
              vehicleType: true,
              photos: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              createdAt: true
            }
          },
          reviews: {
            where: { reviewerId: user.id },
            select: {
              id: true,
              rating: true,
              title: true,
              comment: true,
              createdAt: true
            }
          }
        },
        orderBy,
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit
      }),
      services.db.booking.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / validatedQuery.limit);

    // Transform bookings data
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      scheduledDate: booking.scheduledDate,
      estimatedDuration: booking.estimatedDuration,
      distance: booking.distance,
      basePrice: booking.basePrice,
      surcharges: booking.surcharges,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      actualPickupTime: booking.actualPickupTime,
      actualDropoffTime: booking.actualDropoffTime,
      passengerCount: booking.passengerCount,
      luggage: booking.luggage,
      specialRequests: booking.specialRequests,
      notes: booking.notes,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      driver: booking.driver ? {
        id: booking.driver.id,
        name: booking.driver.user.name,
        phone: booking.driver.user.phone,
        avatar: booking.driver.user.avatar,
        rating: booking.driver.rating
      } : null,
      vehicle: booking.vehicle,
      payments: booking.payments,
      review: booking.reviews[0] || null
    }));

    // Get booking stats for dashboard
    const stats = await services.db.booking.groupBy({
      by: ['status'],
      where: { clientId: user.id },
      _count: { status: true }
    });

    const bookingStats = {
      total: totalCount,
      pending: stats.find(s => s.status === 'PENDING')?._count.status || 0,
      confirmed: stats.find(s => s.status === 'CONFIRMED')?._count.status || 0,
      inProgress: stats.find(s => s.status === 'IN_PROGRESS')?._count.status || 0,
      completed: stats.find(s => s.status === 'COMPLETED')?._count.status || 0,
      cancelled: stats.find(s => s.status === 'CANCELLED')?._count.status || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        bookings: transformedBookings,
        stats: bookingStats
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
    });

  } catch (error) {
    console.error('Get client bookings error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}