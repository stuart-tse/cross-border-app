import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic metrics
    const [
      totalUsers,
      activeUsers,
      newUsersThisPeriod,
      totalTrips,
      completedTrips,
      totalRevenue,
      activeDrivers,
      pendingVerifications,
      supportTickets,
      blogPosts
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          isActive: true,
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      
      // New users in time period
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Total trips
      prisma.booking.count(),
      
      // Completed trips
      prisma.booking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Calculate total revenue (mock calculation - would be based on payments)
      prisma.booking.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _sum: { totalPrice: true }
      }),
      
      // Active drivers
      prisma.driverProfile.count({
        where: {
          isApproved: true,
          isAvailable: true
        }
      }),
      
      // Pending driver verifications
      prisma.driverProfile.count({
        where: { isApproved: false }
      }),
      
      // Support tickets (mock - would need separate model)
      Promise.resolve(7),
      
      // Blog posts
      prisma.blogPost.count({
        where: { status: 'PUBLISHED' }
      })
    ]);

    // Get user growth data for charts
    const userGrowthData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*) as count
      FROM "users" 
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    ` as Array<{ date: Date; count: bigint }>;

    // Get user distribution by type
    const userTypeDistribution = await prisma.userRole.groupBy({
      by: ['role'],
      where: {
        isActive: true
      },
      _count: {
        userId: true
      }
    });

    // Get booking status distribution
    const bookingStatusDistribution = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get top performing drivers
    const topDrivers = await prisma.driverProfile.findMany({
      where: {
        isApproved: true,
        totalTrips: { gt: 0 }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalTrips: 'desc' }
      ],
      take: 10
    });

    // Get recent activity (last 10 significant events)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true } },
        driver: { 
          include: { 
            user: { select: { name: true } } 
          } 
        }
      }
    });

    // Calculate growth percentages
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setTime(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const previousPeriodUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const userGrowthPercent = previousPeriodUsers > 0 
      ? ((newUsersThisPeriod - previousPeriodUsers) / previousPeriodUsers) * 100 
      : 100;

    // System health metrics (mock data - would integrate with monitoring)
    const systemHealth = {
      serverStatus: 'healthy',
      dbConnections: 45,
      responseTime: Math.floor(Math.random() * 50) + 70, // 70-120ms
      uptime: '99.8%',
      activeUsers: Math.floor(Math.random() * 100) + 200, // 200-300
      queueLength: Math.floor(Math.random() * 10),
      errorRate: Math.random() * 0.1 // 0-0.1%
    };

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeUsers,
        newUsersThisPeriod,
        totalTrips,
        completedTrips,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        activeDrivers,
        pendingVerifications,
        supportTickets,
        blogPosts,
        userGrowthPercent: Math.round(userGrowthPercent * 100) / 100
      },
      charts: {
        userGrowth: userGrowthData.map(item => ({
          date: item.date,
          count: Number(item.count)
        })),
        userTypeDistribution: userTypeDistribution.map(item => ({
          type: item.role,
          count: item._count.userId
        })),
        bookingStatusDistribution: bookingStatusDistribution.map(item => ({
          status: item.status,
          count: item._count.id
        }))
      },
      topDrivers: topDrivers.map(driver => ({
        id: driver.id,
        name: driver.user.name,
        email: driver.user.email,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
        languages: driver.languages
      })),
      recentActivity: recentBookings.map(booking => ({
        id: booking.id,
        type: 'booking',
        description: `Trip from ${booking.pickupLocation ? JSON.parse(booking.pickupLocation as string).address || 'Unknown' : 'Unknown'} to ${booking.dropoffLocation ? JSON.parse(booking.dropoffLocation as string).address || 'Unknown' : 'Unknown'}`,
        client: booking.client.name,
        driver: booking.driver?.user.name,
        status: booking.status,
        amount: booking.totalPrice,
        timestamp: booking.createdAt
      })),
      systemHealth,
      timeRange,
      period: {
        start: startDate,
        end: now
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}