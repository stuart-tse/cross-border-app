import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { BookingStatus } from '@prisma/client';

// GET /api/client/trips - Get client trip history with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const sortBy = url.searchParams.get('sortBy') || 'scheduledDate';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      clientId: user.id
    };

    if (status && status !== 'all') {
      where.status = status as BookingStatus;
    }

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduledDate.lte = new Date(dateTo);
    }

    // Get trips with related data
    const [trips, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          driver: {
            include: {
              user: {
                select: { name: true, avatar: true }
              }
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true,
              color: true,
              plateNumber: true,
              vehicleType: true
            }
          },
          payments: {
            select: {
              amount: true,
              currency: true,
              status: true,
              method: true
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
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.booking.count({ where })
    ]);

    // Calculate analytics
    const analytics = await calculateTripAnalytics(user.id, dateFrom || undefined, dateTo || undefined);

    return NextResponse.json({
      trips: trips.map(trip => ({
        id: trip.id,
        pickupLocation: trip.pickupLocation,
        dropoffLocation: trip.dropoffLocation,
        scheduledDate: trip.scheduledDate,
        actualPickupTime: trip.actualPickupTime,
        actualDropoffTime: trip.actualDropoffTime,
        estimatedDuration: trip.estimatedDuration,
        distance: trip.distance,
        status: trip.status,
        paymentStatus: trip.paymentStatus,
        totalPrice: trip.totalPrice,
        currency: trip.currency,
        passengerCount: trip.passengerCount,
        specialRequests: trip.specialRequests,
        driver: trip.driver ? {
          name: trip.driver.user.name,
          avatar: trip.driver.user.avatar,
          rating: trip.driver.rating
        } : null,
        vehicle: trip.vehicle,
        payment: trip.payments[0] || null,
        review: trip.reviews[0] || null,
        createdAt: trip.createdAt
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      analytics
    });

  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate trip analytics
async function calculateTripAnalytics(clientId: string, dateFrom?: string, dateTo?: string) {
  const where: any = { clientId };
  
  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
    if (dateTo) where.scheduledDate.lte = new Date(dateTo);
  }

  const [
    totalTrips,
    completedTrips,
    cancelledTrips,
    totalAmount,
    avgRating
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ 
      where: { ...where, status: BookingStatus.COMPLETED } 
    }),
    prisma.booking.count({ 
      where: { ...where, status: BookingStatus.CANCELLED } 
    }),
    prisma.booking.aggregate({
      where: { ...where, status: BookingStatus.COMPLETED },
      _sum: { totalPrice: true }
    }),
    prisma.review.aggregate({
      where: { 
        reviewerId: clientId,
        booking: { ...where }
      },
      _avg: { rating: true }
    })
  ]);

  return {
    totalTrips,
    completedTrips,
    cancelledTrips,
    totalSpent: totalAmount._sum.totalPrice || 0,
    avgRating: avgRating._avg.rating || 0,
    completionRate: totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0,
    cancellationRate: totalTrips > 0 ? (cancelledTrips / totalTrips) * 100 : 0
  };
}