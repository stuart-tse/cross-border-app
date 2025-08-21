import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { UserType, VehicleType } from '@prisma/client';

// GET /api/drivers/vehicles/[id] - Get a specific vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id } = await params;

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

    // Get the specific vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: id,
        driverId: user.driverProfile.id, // Ensure driver owns this vehicle
      },
      include: {
        permits: {
          orderBy: { expiryDate: 'asc' },
        },
        licenses: {
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check for expiring documents (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringPermits = vehicle.permits.filter(
      permit => permit.expiryDate <= thirtyDaysFromNow && permit.expiryDate > now
    );
    const expiringLicenses = vehicle.licenses.filter(
      license => license.expiryDate <= thirtyDaysFromNow && license.expiryDate > now
    );

    return NextResponse.json({
      ...vehicle,
      hasExpiringDocuments: expiringPermits.length > 0 || expiringLicenses.length > 0,
      expiringPermits,
      expiringLicenses,
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/drivers/vehicles/[id] - Update a vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id } = await params;

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
    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        id: id,
        driverId: user.driverProfile.id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
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
      features,
      fuelType,
      specialEquipment,
      insuranceExpiry,
      inspectionExpiry,
      photos,
      isActive,
    } = body;

    // Prepare update data
    const updateData: any = {};
    
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = parseInt(year);
    if (color !== undefined) updateData.color = color;
    if (plateNumber !== undefined) updateData.plateNumber = plateNumber;
    if (vin !== undefined) updateData.vin = vin;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType as VehicleType;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (features !== undefined) updateData.features = features;
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (specialEquipment !== undefined) updateData.specialEquipment = specialEquipment;
    if (photos !== undefined) updateData.photos = photos;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle date fields
    if (insuranceExpiry) {
      const insuranceDate = new Date(insuranceExpiry);
      if (isNaN(insuranceDate.getTime())) {
        return NextResponse.json({ error: 'Invalid insurance expiry date' }, { status: 400 });
      }
      updateData.insuranceExpiry = insuranceDate;
    }

    if (inspectionExpiry) {
      const inspectionDate = new Date(inspectionExpiry);
      if (isNaN(inspectionDate.getTime())) {
        return NextResponse.json({ error: 'Invalid inspection expiry date' }, { status: 400 });
      }
      updateData.inspectionExpiry = inspectionDate;
    }

    // Check for duplicate plate number (if changed)
    if (plateNumber && plateNumber !== existingVehicle.plateNumber) {
      const duplicatePlate = await prisma.vehicle.findUnique({
        where: { plateNumber },
      });

      if (duplicatePlate) {
        return NextResponse.json({ error: 'Vehicle with this plate number already exists' }, { status: 409 });
      }
    }

    // Check for duplicate VIN (if changed)
    if (vin && vin !== existingVehicle.vin) {
      const duplicateVin = await prisma.vehicle.findUnique({
        where: { vin },
      });

      if (duplicateVin) {
        return NextResponse.json({ error: 'Vehicle with this VIN already exists' }, { status: 409 });
      }
    }

    // Update the vehicle
    const vehicle = await prisma.vehicle.update({
      where: { id: id },
      data: updateData,
      include: {
        permits: true,
        licenses: true,
      },
    });

    return NextResponse.json({
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/drivers/vehicles/[id] - Delete a vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15
    const { id } = await params;

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
        id: id,
        driverId: user.driverProfile.id,
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
            },
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check if vehicle has active bookings
    if (vehicle.bookings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete vehicle with active bookings. Please complete or cancel all bookings first.' 
      }, { status: 400 });
    }

    // Delete the vehicle (this will cascade delete permits and licenses)
    await prisma.vehicle.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}