import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { UserType, PermitType, DocumentStatus } from '@prisma/client';

// GET /api/drivers/vehicles/[id]/permits - Get all permits for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a driver
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userRoles: true,
        driverProfile: true,
      },
    });

    if (!user || !user.userRoles.some(role => role.role === UserType.DRIVER)) {
      return NextResponse.json({ error: 'Driver access required' }, { status: 403 });
    }

    if (!user.driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
    }

    // Check if vehicle exists and belongs to driver
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: params.id,
        driverId: user.driverProfile.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Get all permits for the vehicle
    const permits = await prisma.vehiclePermit.findMany({
      where: {
        vehicleId: params.id,
      },
      orderBy: { expiryDate: 'asc' },
    });

    // Check for expiring permits (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const permitsWithAlerts = permits.map(permit => ({
      ...permit,
      isExpiring: permit.expiryDate <= thirtyDaysFromNow && permit.expiryDate > now,
      isExpired: permit.expiryDate <= now,
      daysUntilExpiry: Math.ceil((permit.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return NextResponse.json({
      permits: permitsWithAlerts,
      totalCount: permits.length,
    });
  } catch (error) {
    console.error('Error fetching permits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/drivers/vehicles/[id]/permits - Create a new permit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a driver
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userRoles: true,
        driverProfile: true,
      },
    });

    if (!user || !user.userRoles.some(role => role.role === UserType.DRIVER)) {
      return NextResponse.json({ error: 'Driver access required' }, { status: 403 });
    }

    if (!user.driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
    }

    // Check if vehicle exists and belongs to driver
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: params.id,
        driverId: user.driverProfile.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body = await request.json();
    
    const {
      permitType,
      permitNumber,
      issuingAuthority,
      startDate,
      expiryDate,
      fileUrl,
      fileName,
      notes,
    } = body;

    // Validate required fields
    if (!permitType || !permitNumber || !issuingAuthority || !startDate || !expiryDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: permitType, permitNumber, issuingAuthority, startDate, expiryDate' 
      }, { status: 400 });
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const expiryDateObj = new Date(expiryDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(expiryDateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (expiryDateObj <= startDateObj) {
      return NextResponse.json({ error: 'Expiry date must be after start date' }, { status: 400 });
    }

    // Check for duplicate permit
    const existingPermit = await prisma.vehiclePermit.findUnique({
      where: {
        vehicleId_permitType_permitNumber: {
          vehicleId: params.id,
          permitType: permitType as PermitType,
          permitNumber,
        },
      },
    });

    if (existingPermit) {
      return NextResponse.json({ 
        error: 'Permit with this type and number already exists for this vehicle' 
      }, { status: 409 });
    }

    // Create the permit
    const permit = await prisma.vehiclePermit.create({
      data: {
        vehicleId: params.id,
        permitType: permitType as PermitType,
        permitNumber,
        issuingAuthority,
        startDate: startDateObj,
        expiryDate: expiryDateObj,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        notes: notes || null,
      },
    });

    // Check if permit is expiring soon and create notification
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (expiryDateObj <= thirtyDaysFromNow && expiryDateObj > now) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PERMIT_EXPIRING',
          title: 'Permit Expiring Soon',
          message: `Your ${permitType.replace('_', ' ').toLowerCase()} permit for ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) expires on ${expiryDateObj.toLocaleDateString()}`,
          data: {
            vehicleId: params.id,
            permitId: permit.id,
            permitType,
            expiryDate: expiryDateObj,
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Permit created successfully',
      permit,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating permit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}