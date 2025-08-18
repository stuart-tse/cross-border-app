import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAuthUser } from '@/lib/auth/utils';
import { z } from 'zod';

const earningsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Get driver earnings data
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can access earnings data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = earningsQuerySchema.parse({
      period: searchParams.get('period'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    } else {
      switch (query.period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'weekly':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      }
    }

    // Get completed trips with earnings
    const trips = await prisma.trip.findMany({
      where: {
        driverId: driverProfile.id,
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        route: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate earnings statistics
    const totalEarnings = trips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);
    const totalTrips = trips.length;
    const avgPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;

    // Group by time period for chart data
    const earningsGrouped = groupEarningsByPeriod(trips, query.period);

    // Calculate trip types breakdown
    const tripTypes = calculateTripTypes(trips);

    // Get payment information
    const pendingPayments = await prisma.driverPayment.findMany({
      where: {
        driverId: driverProfile.id,
        status: 'PENDING',
      },
    });

    const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Mock next payout date (would be calculated based on payout schedule)
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);

    return NextResponse.json({
      summary: {
        totalEarnings,
        totalTrips,
        avgPerTrip,
        totalPending,
        nextPayoutDate: nextPayoutDate.toISOString(),
      },
      earnings: earningsGrouped,
      tripTypes,
      trips: trips.map(trip => ({
        id: trip.id,
        date: trip.completedAt?.toISOString().split('T')[0],
        time: trip.completedAt?.toTimeString().slice(0, 5),
        route: {
          from: trip.route?.startLocation || trip.pickupLocation,
          to: trip.route?.endLocation || trip.destination,
        },
        client: trip.client?.name || 'Unknown',
        earnings: trip.totalCost || 0,
        currency: 'HKD',
        paymentStatus: trip.paymentStatus || 'pending',
        paymentMethod: trip.paymentMethod || 'Credit Card',
        distance: trip.distance || '0km',
        duration: trip.estimatedDuration || '0min',
        rating: trip.rating,
        tips: trip.tips || 0,
      })),
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function groupEarningsByPeriod(trips: any[], period: string) {
  const grouped: { [key: string]: { totalEarnings: number; trips: number; onlineHours: number } } = {};

  trips.forEach(trip => {
    if (!trip.completedAt) return;

    let key: string;
    const date = new Date(trip.completedAt);

    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        totalEarnings: 0,
        trips: 0,
        onlineHours: 0, // This would be calculated from driver activity logs
      };
    }

    grouped[key].totalEarnings += trip.totalCost || 0;
    grouped[key].trips += 1;
    // Mock online hours calculation
    grouped[key].onlineHours += Math.random() * 2 + 6; // 6-8 hours per day average
  });

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    ...data,
    avgPerTrip: data.trips > 0 ? data.totalEarnings / data.trips : 0,
  }));
}

function calculateTripTypes(trips: any[]) {
  const types: { [key: string]: { count: number; earnings: number } } = {
    'Cross-border (HK-SZ)': { count: 0, earnings: 0 },
    'Long distance (HK-GZ)': { count: 0, earnings: 0 },
    'Local (HK only)': { count: 0, earnings: 0 },
  };

  trips.forEach(trip => {
    // Mock trip type categorization based on route
    const pickup = trip.pickupLocation || '';
    const destination = trip.destination || '';
    
    let category = 'Local (HK only)';
    if (pickup.includes('Hong Kong') && destination.includes('Shenzhen')) {
      category = 'Cross-border (HK-SZ)';
    } else if (pickup.includes('Hong Kong') && destination.includes('Guangzhou')) {
      category = 'Long distance (HK-GZ)';
    }

    types[category].count += 1;
    types[category].earnings += trip.totalCost || 0;
  });

  const total = Object.values(types).reduce((sum, type) => sum + type.count, 0);

  return Object.entries(types).map(([type, data]) => ({
    type,
    count: data.count,
    earnings: data.earnings,
    percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
  }));
}