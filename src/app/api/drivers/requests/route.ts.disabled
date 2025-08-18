import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAuthUser } from '@/lib/auth/utils';
import { z } from 'zod';

const tripActionSchema = z.object({
  action: z.enum(['accept', 'decline', 'start', 'complete']),
  tripId: z.string().uuid(),
  notes: z.string().optional(),
});

// Get driver trip requests
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can access trip requests' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Get trip requests based on status
    let whereClause: any = {};

    switch (status) {
      case 'incoming':
        whereClause = {
          status: 'PENDING',
          driverId: null, // Not yet assigned
          // Only show trips that match driver's vehicle category and location
        };
        break;
      case 'active':
        whereClause = {
          driverId: driverProfile.id,
          status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
        };
        break;
      case 'completed':
        whereClause = {
          driverId: driverProfile.id,
          status: 'COMPLETED',
        };
        break;
      default:
        whereClause = {
          OR: [
            { status: 'PENDING', driverId: null },
            { driverId: driverProfile.id },
          ],
        };
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        route: true,
        vehicle: {
          select: {
            category: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: [
        { urgency: 'desc' },
        { scheduledDate: 'asc' },
      ],
      take: 50, // Limit results
    });

    // Format trips for frontend
    const formattedTrips = trips.map(trip => ({
      id: trip.id,
      type: getTypeFromStatus(trip.status, trip.driverId === driverProfile.id),
      client: {
        name: trip.client?.name || 'Unknown Client',
        phone: '+852-XXXX-XXXX', // Would come from client profile
        rating: 4.8, // Would be calculated from reviews
        profilePhoto: trip.client?.profilePhoto,
      },
      route: {
        from: trip.route?.startLocation || trip.pickupLocation,
        fromAddress: trip.pickupLocation,
        to: trip.route?.endLocation || trip.destination,
        toAddress: trip.destination,
        distance: trip.distance || '0km',
        estimatedDuration: trip.estimatedDuration || '0min',
      },
      schedule: {
        requestedAt: getTimeAgo(trip.createdAt),
        pickupTime: trip.scheduledDate?.toTimeString().slice(0, 5) || '00:00',
        pickupDate: trip.scheduledDate?.toISOString().split('T')[0] || '',
      },
      service: {
        vehicleType: trip.vehicle?.category || trip.vehicleCategory || 'Business',
        passengers: trip.passengerCount || 1,
        luggage: trip.luggageCount || 0,
        specialRequirements: trip.specialRequirements ? JSON.parse(trip.specialRequirements) : undefined,
      },
      pricing: {
        estimatedEarnings: trip.totalCost || 0,
        paymentMethod: trip.paymentMethod || 'Credit Card',
        currency: 'HKD' as const,
      },
      urgency: mapUrgency(trip.urgency),
      status: mapStatus(trip.status),
      notes: trip.notes,
      expiresAt: trip.status === 'PENDING' ? getExpiryTime(trip.createdAt) : undefined,
    }));

    // Group by status for easier frontend handling
    const grouped = {
      incoming: formattedTrips.filter(t => t.type === 'incoming'),
      active: formattedTrips.filter(t => t.type === 'active'),
      completed: formattedTrips.filter(t => t.type === 'completed'),
    };

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Get trip requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle trip actions (accept, decline, start, complete)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can perform trip actions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, tripId, notes } = tripActionSchema.parse(body);

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        client: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let notificationData: any = {};

    switch (action) {
      case 'accept':
        if (trip.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Trip is no longer available' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'ACCEPTED',
          driverId: driverProfile.id,
          acceptedAt: new Date(),
        };
        notificationData = {
          userId: trip.clientId,
          type: 'TRIP_ACCEPTED',
          title: 'Trip Accepted',
          message: `Your trip has been accepted by ${user.name}`,
        };
        break;

      case 'decline':
        if (trip.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Cannot decline this trip' },
            { status: 400 }
          );
        }
        // For decline, we might just log it and not update the trip
        // so other drivers can still accept it
        return NextResponse.json({ message: 'Trip declined successfully' });

      case 'start':
        if (trip.status !== 'ACCEPTED' || trip.driverId !== driverProfile.id) {
          return NextResponse.json(
            { error: 'Cannot start this trip' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        };
        notificationData = {
          userId: trip.clientId,
          type: 'TRIP_STARTED',
          title: 'Trip Started',
          message: 'Your driver is on the way',
        };
        break;

      case 'complete':
        if (trip.status !== 'IN_PROGRESS' || trip.driverId !== driverProfile.id) {
          return NextResponse.json(
            { error: 'Cannot complete this trip' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'COMPLETED',
          completedAt: new Date(),
          driverNotes: notes,
        };
        notificationData = {
          userId: trip.clientId,
          type: 'TRIP_COMPLETED',
          title: 'Trip Completed',
          message: 'Your trip has been completed successfully',
        };
        break;
    }

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: updateData,
    });

    // Create notification
    if (notificationData.userId) {
      await prisma.notification.create({
        data: {
          ...notificationData,
          data: {
            tripId: trip.id,
            driverId: driverProfile.id,
          },
        },
      });
    }

    // Update driver statistics for completed trips
    if (action === 'complete') {
      await prisma.driverProfile.update({
        where: { id: driverProfile.id },
        data: {
          totalTrips: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      message: `Trip ${action}ed successfully`,
      trip: {
        id: updatedTrip.id,
        status: updatedTrip.status,
        updatedAt: updatedTrip.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Trip action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getTypeFromStatus(status: string, isAssignedToDriver: boolean): 'incoming' | 'active' | 'completed' {
  if (status === 'PENDING' && !isAssignedToDriver) return 'incoming';
  if (['ACCEPTED', 'IN_PROGRESS'].includes(status)) return 'active';
  if (status === 'COMPLETED') return 'completed';
  return 'incoming';
}

function getTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function mapUrgency(urgency: string | null): 'low' | 'medium' | 'high' {
  switch (urgency) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    case 'LOW': return 'low';
    default: return 'medium';
  }
}

function mapStatus(status: string): 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' {
  switch (status) {
    case 'PENDING': return 'pending';
    case 'ACCEPTED': return 'accepted';
    case 'IN_PROGRESS': return 'in_progress';
    case 'COMPLETED': return 'completed';
    case 'CANCELLED': return 'cancelled';
    default: return 'pending';
  }
}

function getExpiryTime(createdAt: Date): string {
  const expiryTime = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 minutes from creation
  return expiryTime.toISOString();
}