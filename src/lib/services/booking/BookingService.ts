import { PrismaClient, Booking, BookingStatus, VehicleType, PaymentStatus } from '@prisma/client';
import { BaseService, ServiceResponse, createServiceResponse } from '../base/BaseService';
import { CacheService, CacheKeys, CacheTTL } from '../shared/CacheService';
import { StructuredLogger } from '../shared/LoggingService';
import { z } from 'zod';

export interface BookingCreateData {
  clientId: string;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
    type: string;
  };
  dropoffLocation: {
    address: string;
    lat: number;
    lng: number;
    type: string;
  };
  scheduledDate: Date;
  vehicleType?: VehicleType;
  passengerCount: number;
  luggage?: string;
  specialRequests?: string;
}

export interface BookingUpdateData {
  scheduledDate?: Date;
  passengerCount?: number;
  luggage?: string;
  specialRequests?: string;
  status?: BookingStatus;
}

export interface PriceEstimate {
  basePrice: number;
  surcharges: {
    borderFee?: number;
    peakHour?: number;
    vehicleTypeSurcharge?: number;
    distanceSurcharge?: number;
  };
  totalPrice: number;
  currency: string;
  breakdown: Array<{
    type: string;
    description: string;
    amount: number;
  }>;
}

export interface DriverMatchingCriteria {
  vehicleType: VehicleType;
  location: { lat: number; lng: number };
  scheduledDate: Date;
  maxDistance: number; // km
  requiredLicenses?: string[];
}

export interface ExtendedBooking extends Booking {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
    color: string;
  };
}

const bookingCreateSchema = z.object({
  clientId: z.string().cuid(),
  pickupLocation: z.object({
    address: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    type: z.string()
  }),
  dropoffLocation: z.object({
    address: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    type: z.string()
  }),
  scheduledDate: z.date().min(new Date()),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  passengerCount: z.number().min(1).max(8),
  luggage: z.string().optional(),
  specialRequests: z.string().optional()
});

export class BookingService extends BaseService {
  constructor(db: PrismaClient, cache: CacheService) {
    super(db, cache, 'BookingService');
  }

  async createBooking(data: BookingCreateData): Promise<ServiceResponse<ExtendedBooking>> {
    try {
      // Validate input
      const validatedData = this.validateInput(data, bookingCreateSchema);

      // Calculate distance and estimate price
      const distance = this.calculateDistance(
        validatedData.pickupLocation,
        validatedData.dropoffLocation
      );

      const priceEstimate = await this.calculatePrice({
        distance,
        vehicleType: validatedData.vehicleType || VehicleType.BUSINESS,
        scheduledDate: validatedData.scheduledDate,
        pickupLocation: validatedData.pickupLocation,
        dropoffLocation: validatedData.dropoffLocation
      });

      // Create booking in transaction
      const booking = await this.db.$transaction(async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            clientId: validatedData.clientId,
            pickupLocation: validatedData.pickupLocation,
            dropoffLocation: validatedData.dropoffLocation,
            scheduledDate: validatedData.scheduledDate,
            estimatedDuration: this.calculateEstimatedDuration(distance),
            distance,
            basePrice: priceEstimate.basePrice,
            surcharges: priceEstimate.surcharges,
            totalPrice: priceEstimate.totalPrice,
            currency: priceEstimate.currency,
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            passengerCount: validatedData.passengerCount,
            luggage: validatedData.luggage,
            specialRequests: validatedData.specialRequests
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            }
          }
        });

        // Create initial tracking history
        await tx.trackingHistory.create({
          data: {
            bookingId: newBooking.id,
            location: validatedData.pickupLocation,
            status: 'BOOKING_CREATED',
            notes: 'Booking created and pending driver assignment'
          }
        });

        return newBooking;
      });

      // Cache the booking
      await this.cache.set(CacheKeys.booking(booking.id), booking, CacheTTL.MEDIUM);

      // Log business event
      StructuredLogger.logBusinessEvent('booking_created', {
        bookingId: booking.id,
        clientId: validatedData.clientId,
        totalPrice: priceEstimate.totalPrice,
        distance
      });

      // Trigger driver matching (async)
      this.matchDriversForBooking(booking.id, {
        vehicleType: validatedData.vehicleType || VehicleType.BUSINESS,
        location: validatedData.pickupLocation,
        scheduledDate: validatedData.scheduledDate,
        maxDistance: 50 // 50km radius
      }).catch(error => {
        this.log('error', 'Driver matching failed', { bookingId: booking.id, error });
      });

      return createServiceResponse(true, booking as ExtendedBooking);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async getBookingById(id: string, userId?: string): Promise<ServiceResponse<ExtendedBooking>> {
    try {
      // Try cache first
      const cached = await this.cache.get<ExtendedBooking>(CacheKeys.booking(id));
      if (cached) {
        return createServiceResponse(true, cached, undefined, { cached: true });
      }

      const booking = await this.db.booking.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          driver: {
            select: {
              id: true,
              userId: true
            },
            include: {
              user: {
                select: {
                  name: true,
                  phone: true
                }
              }
            }
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              plateNumber: true,
              color: true
            }
          },
          trackingHistory: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      });

      if (!booking) {
        return createServiceResponse(false, undefined, 
          new Error('Booking not found'), { code: 'BOOKING_NOT_FOUND' });
      }

      // Transform driver data
      const extendedBooking = {
        ...booking,
        driver: booking.driver ? {
          id: booking.driver.id,
          name: booking.driver.user.name,
          phone: booking.driver.user.phone,
          rating: booking.driver.rating
        } : undefined
      } as ExtendedBooking;

      // Cache the result
      await this.cache.set(CacheKeys.booking(id), extendedBooking, CacheTTL.MEDIUM);

      return createServiceResponse(true, extendedBooking);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async updateBooking(id: string, data: BookingUpdateData, userId: string): Promise<ServiceResponse<ExtendedBooking>> {
    try {
      // Get existing booking
      const existingBooking = await this.db.booking.findUnique({
        where: { id },
        select: { status: true, clientId: true }
      });

      if (!existingBooking) {
        return createServiceResponse(false, undefined,
          new Error('Booking not found'), { code: 'BOOKING_NOT_FOUND' });
      }

      // Check if booking can be updated
      if (existingBooking.status === BookingStatus.COMPLETED || 
          existingBooking.status === BookingStatus.CANCELLED) {
        return createServiceResponse(false, undefined,
          new Error('Cannot update completed or cancelled booking'), 
          { code: 'BOOKING_NOT_UPDATABLE' });
      }

      // Update booking
      const updatedBooking = await this.db.booking.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                  phone: true
                }
              }
            }
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              plateNumber: true,
              color: true
            }
          }
        }
      });

      // Invalidate cache
      await this.invalidateCache(`booking:${id}*`);

      // Log status change
      if (data.status && data.status !== existingBooking.status) {
        await this.db.trackingHistory.create({
          data: {
            bookingId: id,
            location: updatedBooking.pickupLocation,
            status: `STATUS_CHANGED_TO_${data.status}`,
            notes: `Booking status changed from ${existingBooking.status} to ${data.status}`
          }
        });

        StructuredLogger.logBusinessEvent('booking_status_changed', {
          bookingId: id,
          fromStatus: existingBooking.status,
          toStatus: data.status,
          userId
        });
      }

      // Transform driver data
      const extendedBooking = {
        ...updatedBooking,
        driver: updatedBooking.driver ? {
          id: updatedBooking.driver.id,
          name: updatedBooking.driver.user.name,
          phone: updatedBooking.driver.user.phone,
          rating: updatedBooking.driver.rating
        } : undefined
      } as ExtendedBooking;

      return createServiceResponse(true, extendedBooking);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async calculatePriceEstimate(data: {
    pickupLocation: { lat: number; lng: number };
    dropoffLocation: { lat: number; lng: number };
    vehicleType: VehicleType;
    scheduledDate: Date;
  }): Promise<ServiceResponse<PriceEstimate>> {
    try {
      const distance = this.calculateDistance(data.pickupLocation, data.dropoffLocation);
      
      const estimate = await this.calculatePrice({
        distance,
        vehicleType: data.vehicleType,
        scheduledDate: data.scheduledDate,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation
      });

      return createServiceResponse(true, estimate);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async assignDriver(bookingId: string, driverId: string, vehicleId: string): Promise<ServiceResponse<ExtendedBooking>> {
    try {
      // Check if booking exists and is assignable
      const booking = await this.db.booking.findUnique({
        where: { id: bookingId },
        select: { status: true }
      });

      if (!booking) {
        return createServiceResponse(false, undefined,
          new Error('Booking not found'), { code: 'BOOKING_NOT_FOUND' });
      }

      if (booking.status !== BookingStatus.PENDING) {
        return createServiceResponse(false, undefined,
          new Error('Booking is not available for assignment'),
          { code: 'BOOKING_NOT_ASSIGNABLE' });
      }

      // Check if driver is available
      const driver = await this.db.driverProfile.findUnique({
        where: { id: driverId },
        select: { isAvailable: true, isApproved: true }
      });

      if (!driver || !driver.isApproved || !driver.isAvailable) {
        return createServiceResponse(false, undefined,
          new Error('Driver is not available'), { code: 'DRIVER_NOT_AVAILABLE' });
      }

      // Assign driver
      const updatedBooking = await this.db.$transaction(async (tx) => {
        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: {
            driverId,
            vehicleId,
            status: BookingStatus.CONFIRMED
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            },
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true
                  }
                }
              }
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                plateNumber: true,
                color: true
              }
            }
          }
        });

        // Add tracking history
        await tx.trackingHistory.create({
          data: {
            bookingId,
            location: updated.pickupLocation,
            status: 'DRIVER_ASSIGNED',
            notes: `Driver ${updated.driver?.user.name} assigned to booking`
          }
        });

        // Set driver as unavailable temporarily
        await tx.driverProfile.update({
          where: { id: driverId },
          data: { isAvailable: false }
        });

        return updated;
      });

      // Invalidate caches
      await Promise.all([
        this.invalidateCache(`booking:${bookingId}*`),
        this.invalidateCache(`driver:${driverId}*`)
      ]);

      // Transform driver data
      const extendedBooking = {
        ...updatedBooking,
        driver: updatedBooking.driver ? {
          id: updatedBooking.driver.id,
          name: updatedBooking.driver.user.name,
          phone: updatedBooking.driver.user.phone,
          rating: updatedBooking.driver.rating
        } : undefined
      } as ExtendedBooking;

      StructuredLogger.logBusinessEvent('driver_assigned', {
        bookingId,
        driverId,
        vehicleId
      });

      return createServiceResponse(true, extendedBooking);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  async cancelBooking(bookingId: string, reason: string, userId: string): Promise<ServiceResponse<ExtendedBooking>> {
    try {
      const booking = await this.db.booking.findUnique({
        where: { id: bookingId },
        select: { status: true, driverId: true }
      });

      if (!booking) {
        return createServiceResponse(false, undefined,
          new Error('Booking not found'), { code: 'BOOKING_NOT_FOUND' });
      }

      if (booking.status === BookingStatus.COMPLETED || 
          booking.status === BookingStatus.CANCELLED) {
        return createServiceResponse(false, undefined,
          new Error('Booking cannot be cancelled'),
          { code: 'BOOKING_NOT_CANCELLABLE' });
      }

      // Cancel booking
      const cancelledBooking = await this.db.$transaction(async (tx) => {
        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CANCELLED,
            cancellationReason: reason
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            },
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true
                  }
                }
              }
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                plateNumber: true,
                color: true
              }
            }
          }
        });

        // Add tracking history
        await tx.trackingHistory.create({
          data: {
            bookingId,
            location: updated.pickupLocation,
            status: 'BOOKING_CANCELLED',
            notes: `Booking cancelled: ${reason}`
          }
        });

        // Make driver available again if assigned
        if (booking.driverId) {
          await tx.driverProfile.update({
            where: { id: booking.driverId },
            data: { isAvailable: true }
          });
        }

        return updated;
      });

      // Invalidate caches
      await this.invalidateCache(`booking:${bookingId}*`);

      // Transform driver data
      const extendedBooking = {
        ...cancelledBooking,
        driver: cancelledBooking.driver ? {
          id: cancelledBooking.driver.id,
          name: cancelledBooking.driver.user.name,
          phone: cancelledBooking.driver.user.phone,
          rating: cancelledBooking.driver.rating
        } : undefined
      } as ExtendedBooking;

      StructuredLogger.logBusinessEvent('booking_cancelled', {
        bookingId,
        reason,
        userId
      });

      return createServiceResponse(true, extendedBooking);

    } catch (error) {
      return createServiceResponse(false, undefined, error);
    }
  }

  private calculateDistance(
    from: { lat: number; lng: number }, 
    to: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private calculateEstimatedDuration(distance: number): number {
    // Base calculation: 60km/h average speed + border crossing time
    const baseMinutes = (distance / 60) * 60;
    const borderCrossingTime = distance > 50 ? 30 : 0; // Add 30 min for cross-border
    return Math.round(baseMinutes + borderCrossingTime);
  }

  private async calculatePrice(params: {
    distance: number;
    vehicleType: VehicleType;
    scheduledDate: Date;
    pickupLocation: { lat: number; lng: number };
    dropoffLocation: { lat: number; lng: number };
  }): Promise<PriceEstimate> {
    const { distance, vehicleType, scheduledDate } = params;
    
    // Get base pricing rules from cache or database
    const pricingRules = await this.withCache(
      CacheKeys.pricingRules(),
      CacheTTL.DAY,
      () => this.db.pricingRule.findMany({ where: { isActive: true } })
    );

    // Base price calculation
    let basePrice = 100; // Base HKD price
    const surcharges: any = {};
    const breakdown: Array<{ type: string; description: string; amount: number }> = [];

    // Distance pricing
    if (distance > 50) {
      surcharges.borderFee = 200;
      breakdown.push({
        type: 'border_fee',
        description: 'Cross-border service fee',
        amount: 200
      });
    }

    // Vehicle type surcharge
    const vehicleMultipliers = {
      [VehicleType.BUSINESS]: 1.0,
      [VehicleType.EXECUTIVE]: 1.3,
      [VehicleType.LUXURY]: 1.8,
      [VehicleType.SUV]: 1.4,
      [VehicleType.VAN]: 1.2
    };

    const vehicleMultiplier = vehicleMultipliers[vehicleType] || 1.0;
    if (vehicleMultiplier > 1.0) {
      const surcharge = Math.round(basePrice * (vehicleMultiplier - 1.0));
      surcharges.vehicleTypeSurcharge = surcharge;
      breakdown.push({
        type: 'vehicle_surcharge',
        description: `${vehicleType} vehicle surcharge`,
        amount: surcharge
      });
    }

    // Distance surcharge for long trips
    if (distance > 100) {
      const distanceSurcharge = Math.round((distance - 100) * 2);
      surcharges.distanceSurcharge = distanceSurcharge;
      breakdown.push({
        type: 'distance_surcharge',
        description: `Long distance surcharge (${Math.round(distance)}km)`,
        amount: distanceSurcharge
      });
    }

    // Peak hour surcharge
    const hour = scheduledDate.getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      surcharges.peakHour = 50;
      breakdown.push({
        type: 'peak_hour',
        description: 'Peak hour surcharge',
        amount: 50
      });
    }

    // Calculate total
    const totalSurcharges = Object.values(surcharges).reduce((sum: number, val: any) => sum + (val || 0), 0);
    const totalPrice = Math.round(basePrice * vehicleMultiplier + totalSurcharges);

    return {
      basePrice,
      surcharges,
      totalPrice,
      currency: 'HKD',
      breakdown: [
        {
          type: 'base_price',
          description: `Base price (${Math.round(distance)}km)`,
          amount: basePrice
        },
        ...breakdown
      ]
    };
  }

  private async matchDriversForBooking(bookingId: string, criteria: DriverMatchingCriteria): Promise<void> {
    try {
      // Find available drivers with matching vehicle type
      const availableDrivers = await this.db.driverProfile.findMany({
        where: {
          isAvailable: true,
          isApproved: true,
          vehicles: {
            some: {
              vehicleType: criteria.vehicleType,
              isActive: true
            }
          }
        },
        include: {
          user: {
            select: {
              name: true,
              phone: true
            }
          },
          vehicles: {
            where: {
              vehicleType: criteria.vehicleType,
              isActive: true
            }
          }
        },
        take: 10 // Limit to 10 potential matches
      });

      // TODO: Add real-time location matching
      // TODO: Send notifications to matched drivers
      // TODO: Implement automatic assignment after timeout

      this.log('info', `Found ${availableDrivers.length} potential drivers for booking`, {
        bookingId,
        criteria
      });

    } catch (error) {
      this.log('error', 'Driver matching failed', { bookingId, error });
    }
  }
}