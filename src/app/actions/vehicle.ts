'use server';

import { z } from 'zod';
import { VehicleType } from '@prisma/client';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { revalidatePath } from 'next/cache';

// Validation schema
const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required').max(50, 'Make must be less than 50 characters'),
  model: z.string().min(1, 'Model is required').max(50, 'Model must be less than 50 characters'),
  year: z.string().refine((val) => {
    const year = parseInt(val);
    return year >= 1900 && year <= new Date().getFullYear() + 2;
  }, 'Year must be between 1900 and current year + 2'),
  color: z.string().min(1, 'Color is required'),
  plateNumber: z.string()
    .min(1, 'License plate is required')
    .max(20, 'License plate must be less than 20 characters')
    .regex(/^[A-Z0-9\-]+$/, 'License plate can only contain letters, numbers, and hyphens'),
  vin: z.string()
    .optional()
    .refine((val) => !val || val.length === 17, 'VIN must be exactly 17 characters'),
  vehicleType: z.nativeEnum(VehicleType, { errorMap: () => ({ message: 'Valid vehicle type is required' }) }),
  capacity: z.string().refine((val) => {
    const capacity = parseInt(val);
    return capacity >= 1 && capacity <= 50;
  }, 'Capacity must be between 1 and 50'),
  fuelType: z.string().optional(),
  features: z.array(z.string()).default([]),
  specialEquipment: z.array(z.string()).default([]),
  insuranceExpiry: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    return date > today;
  }, 'Insurance expiry date must be in the future'),
  inspectionExpiry: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    return date > today;
  }, 'Inspection expiry date must be in the future'),
});

export interface AddVehicleState {
  success?: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
  vehicle?: any;
}

export async function addVehicleAction(
  prevState: AddVehicleState | undefined, 
  formData: FormData
): Promise<AddVehicleState> {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You must be logged in to add a vehicle',
      };
    }

    // Check if user has driver role and profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        userRoles: true,
        driverProfile: true
      }
    });

    if (!user || !user.userRoles.some(role => role.role === 'DRIVER')) {
      return {
        success: false,
        message: 'Only drivers can add vehicles',
      };
    }

    if (!user.driverProfile) {
      return {
        success: false,
        message: 'Driver profile is required to add vehicles',
      };
    }

    // Extract and validate form data
    const rawData = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: formData.get('year') as string,
      color: formData.get('color') as string,
      plateNumber: formData.get('plateNumber') as string,
      vin: formData.get('vin') as string || undefined,
      vehicleType: formData.get('vehicleType') as VehicleType,
      capacity: formData.get('capacity') as string,
      fuelType: formData.get('fuelType') as string || undefined,
      features: formData.getAll('features') as string[],
      specialEquipment: formData.getAll('specialEquipment') as string[],
      insuranceExpiry: formData.get('insuranceExpiry') as string,
      inspectionExpiry: formData.get('inspectionExpiry') as string,
    };

    // Validate data
    const validation = vehicleSchema.safeParse(rawData);
    
    if (!validation.success) {
      const errors: { [key: string]: string[] } = {};
      validation.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(error.message);
      });
      
      return {
        success: false,
        message: 'Please check the form for errors',
        errors,
      };
    }

    const validatedData = validation.data;

    // Check for duplicate plate number
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        plateNumber: validatedData.plateNumber,
        isActive: true,
      },
    });

    if (existingVehicle) {
      return {
        success: false,
        message: 'A vehicle with this license plate already exists',
        errors: {
          plateNumber: ['License plate already in use'],
        },
      };
    }

    // Check for duplicate VIN if provided
    if (validatedData.vin) {
      const existingVin = await prisma.vehicle.findFirst({
        where: {
          vin: validatedData.vin,
          isActive: true,
        },
      });

      if (existingVin) {
        return {
          success: false,
          message: 'A vehicle with this VIN already exists',
          errors: {
            vin: ['VIN already in use'],
          },
        };
      }
    }

    // Handle photo uploads (for now, we'll skip actual file upload and store placeholder URLs)
    const photos: string[] = [];
    const photoFiles = formData.getAll('photos') as File[];
    
    // TODO: Implement actual file upload to cloud storage
    // For now, we'll just create placeholder URLs
    for (let i = 0; i < photoFiles.length; i++) {
      if (photoFiles[i].size > 0) {
        photos.push(`/uploads/vehicles/${Date.now()}-${i}.jpg`);
      }
    }

    // Create the vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        make: validatedData.make,
        model: validatedData.model,
        year: parseInt(validatedData.year),
        color: validatedData.color,
        plateNumber: validatedData.plateNumber,
        vin: validatedData.vin,
        vehicleType: validatedData.vehicleType,
        capacity: parseInt(validatedData.capacity),
        fuelType: validatedData.fuelType,
        features: validatedData.features,
        specialEquipment: validatedData.specialEquipment,
        insuranceExpiry: new Date(validatedData.insuranceExpiry),
        inspectionExpiry: new Date(validatedData.inspectionExpiry),
        photos: photos,
        isActive: true,
        driverId: user.driverProfile.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Revalidate the vehicles page
    revalidatePath('/dashboard/driver/vehicle');
    revalidatePath('/api/drivers/vehicles');

    return {
      success: true,
      message: 'Vehicle added successfully! Your vehicle is now available for bookings.',
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
      },
    };

  } catch (error) {
    console.error('Error adding vehicle:', error);
    
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

