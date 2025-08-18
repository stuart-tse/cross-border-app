import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserType, VehicleType } from '@prisma/client';
import { getAuthUser } from '@/lib/auth/utils';

// GET /api/drivers/vehicles - Get all vehicles for the authenticated driver
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a driver
    if (!user.roles.includes(UserType.DRIVER)) {
      return NextResponse.json({ error: 'Driver access required' }, { status: 403 });
    }

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
    }

    // Get all vehicles for the driver with permits and licenses
    const vehicles = await prisma.vehicle.findMany({
      where: {
        driverId: driverProfile.id,
      },
      include: {
        permits: {
          orderBy: { expiryDate: 'asc' },
        },
        licenses: {
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check for expiring documents (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const vehiclesWithAlerts = vehicles.map(vehicle => {
      const expiringPermits = vehicle.permits.filter(
        permit => permit.expiryDate <= thirtyDaysFromNow && permit.expiryDate > now
      );
      const expiringLicenses = vehicle.licenses.filter(
        license => license.expiryDate <= thirtyDaysFromNow && license.expiryDate > now
      );

      return {
        ...vehicle,
        hasExpiringDocuments: expiringPermits.length > 0 || expiringLicenses.length > 0,
        expiringPermits,
        expiringLicenses,
      };
    });

    return NextResponse.json({
      vehicles: vehiclesWithAlerts,
      totalCount: vehicles.length,
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/drivers/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a driver
    if (!user.roles.includes(UserType.DRIVER)) {
      return NextResponse.json({ error: 'Driver access required' }, { status: 403 });
    }

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
    }

    const body = await request.json();
    
    const {
      make,
      model,
      year,
      color,
      plateNumber,
      vin,
      vehicleType,
      capacity,
      features = [],
      fuelType,
      specialEquipment = [],
      insuranceExpiry,
      inspectionExpiry,
      photos = [],
    } = body;

    // Validate required fields
    if (!make || !model || !year || !color || !plateNumber || !vehicleType || !capacity) {
      return NextResponse.json({ 
        error: 'Missing required fields: make, model, year, color, plateNumber, vehicleType, capacity' 
      }, { status: 400 });
    }

    // Validate dates
    const insuranceDate = new Date(insuranceExpiry);
    const inspectionDate = new Date(inspectionExpiry);
    
    if (isNaN(insuranceDate.getTime()) || isNaN(inspectionDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Check for duplicate plate number
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber },
    });

    if (existingVehicle) {
      return NextResponse.json({ error: 'Vehicle with this plate number already exists' }, { status: 409 });
    }

    // Check for duplicate VIN if provided
    if (vin) {
      const existingVin = await prisma.vehicle.findUnique({
        where: { vin },
      });

      if (existingVin) {
        return NextResponse.json({ error: 'Vehicle with this VIN already exists' }, { status: 409 });
      }
    }

    // Create the vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        driverId: driverProfile.id,
        make,
        model,
        year: parseInt(year),
        color,
        plateNumber,
        vin: vin || null,
        vehicleType: vehicleType as VehicleType,
        capacity: parseInt(capacity),
        features,
        fuelType,
        specialEquipment,
        insuranceExpiry: insuranceDate,
        inspectionExpiry: inspectionDate,
        photos,
      },
      include: {
        permits: true,
        licenses: true,
      },
    });

    return NextResponse.json({
      message: 'Vehicle created successfully',
      vehicle,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}