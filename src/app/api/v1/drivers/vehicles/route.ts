import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';
import { VehicleType } from '@prisma/client';
import { z } from 'zod';

const createVehicleSchema = z.object({
  make: z.string().min(2, 'Make must be at least 2 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters'),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(2, 'Color must be specified'),
  plateNumber: z.string().min(3, 'Plate number must be at least 3 characters'),
  vin: z.string().optional(),
  vehicleType: z.nativeEnum(VehicleType),
  capacity: z.number().min(1).max(50),
  features: z.array(z.string()).default([]),
  fuelType: z.enum(['GAS', 'DIESEL', 'ELECTRIC', 'HYBRID']).optional(),
  specialEquipment: z.array(z.string()).default([]),
  insuranceExpiry: z.string().datetime().transform(str => new Date(str)),
  inspectionExpiry: z.string().datetime().transform(str => new Date(str)),
  photos: z.array(z.string().url()).default([])
});

const querySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  isActive: z.string().optional().transform(str => str === 'true').default(true)
});

// GET DRIVER VEHICLES
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

    // Check if user has DRIVER role
    if (!user.roles.includes('DRIVER')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Driver role required'
        }
      }, { status: 403 });
    }

    // Get driver profile
    const driverProfile = await services.db.driverProfile.findUnique({
      where: { userId: user.id }
    });

    if (!driverProfile) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DRIVER_PROFILE_NOT_FOUND',
          message: 'Driver profile not found'
        }
      }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryData = Object.fromEntries(searchParams);
    const validatedQuery = querySchema.parse(queryData);

    // Get vehicles with pagination
    const [vehicles, totalCount] = await Promise.all([
      services.db.vehicle.findMany({
        where: {
          driverId: driverProfile.id,
          isActive: validatedQuery.isActive
        },
        include: {
          permits: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              permitType: true,
              permitNumber: true,
              expiryDate: true,
              status: true
            }
          },
          licenses: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              licenseType: true,
              licenseNumber: true,
              expiryDate: true,
              status: true
            }
          },
          _count: {
            select: {
              bookings: {
                where: {
                  status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit
      }),
      services.db.vehicle.count({
        where: {
          driverId: driverProfile.id,
          isActive: validatedQuery.isActive
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / validatedQuery.limit);

    // Transform vehicles data and check document expiry
    const transformedVehicles = vehicles.map(vehicle => {
      const insuranceExpiring = vehicle.insuranceExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const inspectionExpiring = vehicle.inspectionExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      return {
        ...vehicle,
        activeBookingsCount: vehicle._count.bookings,
        documentAlerts: {
          insuranceExpiring,
          inspectionExpiring,
          permitsExpiring: vehicle.permits.filter(p => 
            p.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ).length > 0,
          licensesExpiring: vehicle.licenses.filter(l => 
            l.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ).length > 0
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        vehicles: transformedVehicles
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
    console.error('Get driver vehicles error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}

// CREATE NEW VEHICLE
export async function POST(req: NextRequest) {
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

    // Check if user has DRIVER role
    if (!user.roles.includes('DRIVER')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Driver role required'
        }
      }, { status: 403 });
    }

    // Get driver profile
    const driverProfile = await services.db.driverProfile.findUnique({
      where: { userId: user.id }
    });

    if (!driverProfile) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DRIVER_PROFILE_NOT_FOUND',
          message: 'Driver profile not found'
        }
      }, { status: 404 });
    }

    if (!driverProfile.isApproved) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DRIVER_NOT_APPROVED',
          message: 'Driver must be approved before adding vehicles'
        }
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createVehicleSchema.safeParse(body);

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

    const vehicleData = validationResult.data;

    // Check if plate number already exists
    const existingVehicle = await services.db.vehicle.findUnique({
      where: { plateNumber: vehicleData.plateNumber }
    });

    if (existingVehicle) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PLATE_NUMBER_EXISTS',
          message: 'Vehicle with this plate number already exists'
        }
      }, { status: 409 });
    }

    // Check document expiry dates
    const now = new Date();
    if (vehicleData.insuranceExpiry <= now) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'EXPIRED_INSURANCE',
          message: 'Insurance expiry date must be in the future'
        }
      }, { status: 400 });
    }

    if (vehicleData.inspectionExpiry <= now) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'EXPIRED_INSPECTION',
          message: 'Inspection expiry date must be in the future'
        }
      }, { status: 400 });
    }

    // Create vehicle
    const newVehicle = await services.db.vehicle.create({
      data: {
        ...vehicleData,
        driverId: driverProfile.id,
        isActive: true
      },
      include: {
        permits: true,
        licenses: true
      }
    });

    // Log business event
    console.log(`Vehicle created: ${newVehicle.id} for driver: ${driverProfile.id}`);

    return NextResponse.json({
      success: true,
      data: {
        vehicle: newVehicle,
        message: 'Vehicle created successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create vehicle error:', error);
    
    // Handle specific database errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'Vehicle with this plate number or VIN already exists'
          }
        }, { status: 409 });
      }
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
}