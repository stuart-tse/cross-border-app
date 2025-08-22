import { BaseService } from '../base/BaseService';
import { VehicleRepository } from '@/lib/repositories/VehicleRepository';
import { Vehicle, VehicleType, Permit, License } from '@prisma/client';
import { z } from 'zod';

const createVehicleSchema = z.object({
  make: z.string().min(2, 'Make must be at least 2 characters').max(50),
  model: z.string().min(2, 'Model must be at least 2 characters').max(50),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(2, 'Color must be specified').max(30),
  plateNumber: z.string().min(3, 'Plate number must be at least 3 characters').max(20),
  vin: z.string().length(17, 'VIN must be exactly 17 characters').optional(),
  vehicleType: z.nativeEnum(VehicleType),
  capacity: z.number().min(1).max(50),
  features: z.array(z.string()).default([]),
  fuelType: z.enum(['GAS', 'DIESEL', 'ELECTRIC', 'HYBRID']).optional(),
  specialEquipment: z.array(z.string()).default([]),
  insuranceExpiry: z.string().datetime().transform(str => new Date(str)),
  inspectionExpiry: z.string().datetime().transform(str => new Date(str)),
  photos: z.array(z.string().url()).default([])
});

const updateVehicleSchema = createVehicleSchema.partial();

const permitSchema = z.object({
  permitType: z.enum(['COMMERCIAL', 'INTERNATIONAL', 'SPECIAL', 'TEMPORARY']),
  permitNumber: z.string().min(3).max(50),
  issuedBy: z.string().min(2).max(100),
  issuedDate: z.string().datetime().transform(str => new Date(str)),
  expiryDate: z.string().datetime().transform(str => new Date(str)),
  documentUrl: z.string().url().optional()
});

const licenseSchema = z.object({
  licenseType: z.enum(['COMMERCIAL', 'PASSENGER', 'HEAVY_VEHICLE', 'MOTORCYCLE']),
  licenseNumber: z.string().min(5).max(50),
  issuedBy: z.string().min(2).max(100),
  issuedDate: z.string().datetime().transform(str => new Date(str)),
  expiryDate: z.string().datetime().transform(str => new Date(str)),
  restrictions: z.array(z.string()).default([]),
  documentUrl: z.string().url().optional()
});

export class VehicleService extends BaseService {
  private vehicleRepository: VehicleRepository;

  constructor(vehicleRepository: VehicleRepository) {
    super('VehicleService');
    this.vehicleRepository = vehicleRepository;
  }

  async createVehicle(driverId: string, data: z.infer<typeof createVehicleSchema>) {
    const validatedData = this.validateInput(createVehicleSchema, data);

    try {
      // Validate driver exists and is approved
      const driverProfile = await this.db.driverProfile.findUnique({
        where: { id: driverId }
      });

      if (!driverProfile) {
        throw new Error('Driver profile not found');
      }

      if (!driverProfile.isApproved) {
        throw new Error('Driver must be approved before adding vehicles');
      }

      // Check if plate number already exists
      const existingVehicle = await this.vehicleRepository.findByPlateNumber(validatedData.plateNumber);
      if (existingVehicle) {
        throw new Error('Vehicle with this plate number already exists');
      }

      // Validate document expiry dates
      const now = new Date();
      if (validatedData.insuranceExpiry <= now) {
        throw new Error('Insurance expiry date must be in the future');
      }

      if (validatedData.inspectionExpiry <= now) {
        throw new Error('Inspection expiry date must be in the future');
      }

      const vehicle = await this.vehicleRepository.create({
        ...validatedData,
        driverId,
        isActive: true,
        registrationExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
      });

      this.logger.info('Vehicle created', {
        vehicleId: vehicle.id,
        driverId,
        plateNumber: vehicle.plateNumber
      });

      return vehicle;

    } catch (error) {
      return this.handleError(error, 'createVehicle', { driverId });
    }
  }

  async getVehicleById(id: string, includeAlerts = true) {
    return this.withCache(
      `vehicle:${id}:${includeAlerts}`,
      async () => {
        const vehicle = await this.vehicleRepository.findByIdWithDetails(id);
        if (!vehicle) {
          throw new Error('Vehicle not found');
        }

        if (includeAlerts) {
          const alerts = this.checkDocumentExpiry(vehicle);
          return { ...vehicle, alerts };
        }

        return vehicle;
      },
      300 // 5 minutes
    );
  }

  async getDriverVehicles(driverId: string, filters: {
    isActive?: boolean;
    vehicleType?: VehicleType;
    page?: number;
    limit?: number;
  } = {}) {
    const cacheKey = `driver_vehicles:${driverId}:${JSON.stringify(filters)}`;
    
    return this.withCache(
      cacheKey,
      async () => {
        const { page = 1, limit = 10, ...otherFilters } = filters;
        
        const result = await this.vehicleRepository.findByDriverWithPagination(
          driverId,
          otherFilters,
          page,
          limit
        );

        // Add alerts for each vehicle
        const vehiclesWithAlerts = result.data.map(vehicle => ({
          ...vehicle,
          alerts: this.checkDocumentExpiry(vehicle)
        }));

        return {
          vehicles: vehiclesWithAlerts,
          pagination: result.pagination
        };
      },
      180 // 3 minutes
    );
  }

  async updateVehicle(id: string, data: z.infer<typeof updateVehicleSchema>) {
    const validatedData = this.validateInput(updateVehicleSchema, data);

    try {
      // If plate number is being updated, check for duplicates
      if (validatedData.plateNumber) {
        const existingVehicle = await this.vehicleRepository.findByPlateNumber(validatedData.plateNumber);
        if (existingVehicle && existingVehicle.id !== id) {
          throw new Error('Vehicle with this plate number already exists');
        }
      }

      // Validate expiry dates if provided
      const now = new Date();
      if (validatedData.insuranceExpiry && validatedData.insuranceExpiry <= now) {
        throw new Error('Insurance expiry date must be in the future');
      }

      if (validatedData.inspectionExpiry && validatedData.inspectionExpiry <= now) {
        throw new Error('Inspection expiry date must be in the future');
      }

      const vehicle = await this.vehicleRepository.update(id, validatedData);

      // Invalidate cache
      await this.cache.delete(`vehicle:${id}:true`);
      await this.cache.delete(`vehicle:${id}:false`);

      this.logger.info('Vehicle updated', {
        vehicleId: id,
        updatedFields: Object.keys(validatedData)
      });

      return vehicle;

    } catch (error) {
      return this.handleError(error, 'updateVehicle', { id });
    }
  }

  async deactivateVehicle(id: string, reason?: string) {
    try {
      const vehicle = await this.vehicleRepository.update(id, {
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason
      });

      // Invalidate cache
      await this.cache.deletePattern(`vehicle:${id}:*`);
      await this.cache.deletePattern(`driver_vehicles:${vehicle.driverId}:*`);

      this.logger.info('Vehicle deactivated', {
        vehicleId: id,
        reason
      });

      return vehicle;

    } catch (error) {
      return this.handleError(error, 'deactivateVehicle', { id, reason });
    }
  }

  async reactivateVehicle(id: string) {
    try {
      const vehicle = await this.vehicleRepository.update(id, {
        isActive: true,
        deactivatedAt: null,
        deactivationReason: null
      });

      // Invalidate cache
      await this.cache.deletePattern(`vehicle:${id}:*`);
      await this.cache.deletePattern(`driver_vehicles:${vehicle.driverId}:*`);

      this.logger.info('Vehicle reactivated', { vehicleId: id });

      return vehicle;

    } catch (error) {
      return this.handleError(error, 'reactivateVehicle', { id });
    }
  }

  async addVehiclePermit(vehicleId: string, data: z.infer<typeof permitSchema>) {
    const validatedData = this.validateInput(permitSchema, data);

    try {
      // Validate expiry date
      const now = new Date();
      if (validatedData.expiryDate <= now) {
        throw new Error('Permit expiry date must be in the future');
      }

      if (validatedData.expiryDate <= validatedData.issuedDate) {
        throw new Error('Expiry date must be after issued date');
      }

      const permit = await this.db.permit.create({
        data: {
          ...validatedData,
          vehicleId,
          status: 'ACTIVE'
        }
      });

      // Invalidate vehicle cache
      await this.cache.deletePattern(`vehicle:${vehicleId}:*`);

      this.logger.info('Vehicle permit added', {
        vehicleId,
        permitId: permit.id,
        permitType: permit.permitType
      });

      return permit;

    } catch (error) {
      return this.handleError(error, 'addVehiclePermit', { vehicleId });
    }
  }

  async addVehicleLicense(vehicleId: string, data: z.infer<typeof licenseSchema>) {
    const validatedData = this.validateInput(licenseSchema, data);

    try {
      // Validate expiry date
      const now = new Date();
      if (validatedData.expiryDate <= now) {
        throw new Error('License expiry date must be in the future');
      }

      if (validatedData.expiryDate <= validatedData.issuedDate) {
        throw new Error('Expiry date must be after issued date');
      }

      const license = await this.db.license.create({
        data: {
          ...validatedData,
          vehicleId,
          status: 'ACTIVE'
        }
      });

      // Invalidate vehicle cache
      await this.cache.deletePattern(`vehicle:${vehicleId}:*`);

      this.logger.info('Vehicle license added', {
        vehicleId,
        licenseId: license.id,
        licenseType: license.licenseType
      });

      return license;

    } catch (error) {
      return this.handleError(error, 'addVehicleLicense', { vehicleId });
    }
  }

  async getVehiclesByType(vehicleType: VehicleType, filters: {
    isActive?: boolean;
    location?: string;
    capacity?: number;
  } = {}) {
    const cacheKey = `vehicles_by_type:${vehicleType}:${JSON.stringify(filters)}`;
    
    return this.withCache(
      cacheKey,
      async () => {
        return await this.vehicleRepository.findByType(vehicleType, filters);
      },
      600 // 10 minutes
    );
  }

  async searchVehicles(query: string, filters: {
    vehicleType?: VehicleType;
    isActive?: boolean;
    driverId?: string;
    location?: string;
  } = {}) {
    const cacheKey = `vehicle_search:${query}:${JSON.stringify(filters)}`;
    
    return this.withCache(
      cacheKey,
      async () => {
        return await this.vehicleRepository.searchVehicles(query, filters);
      },
      300 // 5 minutes
    );
  }

  async getVehicleStats(vehicleId: string, days = 30) {
    return this.withCache(
      `vehicle_stats:${vehicleId}:${days}`,
      async () => {
        const [bookingStats, earningStats] = await Promise.all([
          this.db.booking.groupBy({
            by: ['status'],
            where: {
              vehicleId,
              createdAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
              }
            },
            _count: { status: true }
          }),

          this.db.booking.aggregate({
            where: {
              vehicleId,
              status: 'COMPLETED',
              createdAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
              }
            },
            _sum: { totalPrice: true },
            _avg: { totalPrice: true },
            _count: { id: true }
          })
        ]);

        return {
          bookings: {
            total: bookingStats.reduce((acc, stat) => acc + stat._count.status, 0),
            completed: bookingStats.find(s => s.status === 'COMPLETED')?._count.status || 0,
            cancelled: bookingStats.find(s => s.status === 'CANCELLED')?._count.status || 0,
            inProgress: bookingStats.find(s => s.status === 'IN_PROGRESS')?._count.status || 0
          },
          earnings: {
            total: earningStats._sum.totalPrice || 0,
            average: earningStats._avg.totalPrice || 0,
            completedTrips: earningStats._count
          },
          period: `${days} days`
        };
      },
      1800 // 30 minutes
    );
  }

  async getExpiringDocuments(daysAhead = 30) {
    return this.withCache(
      `expiring_documents:${daysAhead}`,
      async () => {
        const expiryDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
        
        const [vehicles, permits, licenses] = await Promise.all([
          // Vehicles with expiring insurance/inspection
          this.db.vehicle.findMany({
            where: {
              isActive: true,
              OR: [
                { insuranceExpiry: { lte: expiryDate } },
                { inspectionExpiry: { lte: expiryDate } },
                { registrationExpiry: { lte: expiryDate } }
              ]
            },
            include: {
              driver: {
                include: {
                  user: {
                    select: { name: true, email: true, phone: true }
                  }
                }
              }
            }
          }),

          // Expiring permits
          this.db.permit.findMany({
            where: {
              status: 'ACTIVE',
              expiryDate: { lte: expiryDate }
            },
            include: {
              vehicle: {
                include: {
                  driver: {
                    include: {
                      user: {
                        select: { name: true, email: true, phone: true }
                      }
                    }
                  }
                }
              }
            }
          }),

          // Expiring licenses
          this.db.license.findMany({
            where: {
              status: 'ACTIVE',
              expiryDate: { lte: expiryDate }
            },
            include: {
              vehicle: {
                include: {
                  driver: {
                    include: {
                      user: {
                        select: { name: true, email: true, phone: true }
                      }
                    }
                  }
                }
              }
            }
          })
        ]);

        return {
          vehicles: vehicles.map(v => ({
            vehicleId: v.id,
            plateNumber: v.plateNumber,
            make: v.make,
            model: v.model,
            driver: v.driver?.user,
            expiring: {
              insurance: v.insuranceExpiry <= expiryDate,
              inspection: v.inspectionExpiry <= expiryDate,
              registration: v.registrationExpiry && v.registrationExpiry <= expiryDate
            },
            expiryDates: {
              insurance: v.insuranceExpiry,
              inspection: v.inspectionExpiry,
              registration: v.registrationExpiry
            }
          })),
          permits: permits.map(p => ({
            permitId: p.id,
            permitType: p.permitType,
            permitNumber: p.permitNumber,
            expiryDate: p.expiryDate,
            vehicle: {
              plateNumber: p.vehicle.plateNumber,
              make: p.vehicle.make,
              model: p.vehicle.model
            },
            driver: p.vehicle.driver?.user
          })),
          licenses: licenses.map(l => ({
            licenseId: l.id,
            licenseType: l.licenseType,
            licenseNumber: l.licenseNumber,
            expiryDate: l.expiryDate,
            vehicle: {
              plateNumber: l.vehicle.plateNumber,
              make: l.vehicle.make,
              model: l.vehicle.model
            },
            driver: l.vehicle.driver?.user
          }))
        };
      },
      3600 // 1 hour
    );
  }

  // HELPER METHODS
  private checkDocumentExpiry(vehicle: any) {
    const alerts = {
      insuranceExpiring: false,
      inspectionExpiring: false,
      registrationExpiring: false,
      permitsExpiring: false,
      licensesExpiring: false,
      documentsToRenew: [] as string[]
    };

    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Check vehicle document expiry
    if (vehicle.insuranceExpiry <= thirtyDaysFromNow) {
      alerts.insuranceExpiring = true;
      alerts.documentsToRenew.push('Insurance');
    }

    if (vehicle.inspectionExpiry <= thirtyDaysFromNow) {
      alerts.inspectionExpiring = true;
      alerts.documentsToRenew.push('Inspection');
    }

    if (vehicle.registrationExpiry && vehicle.registrationExpiry <= thirtyDaysFromNow) {
      alerts.registrationExpiring = true;
      alerts.documentsToRenew.push('Registration');
    }

    // Check permits
    if (vehicle.permits?.some((p: any) => p.expiryDate <= thirtyDaysFromNow && p.status === 'ACTIVE')) {
      alerts.permitsExpiring = true;
      alerts.documentsToRenew.push('Permits');
    }

    // Check licenses
    if (vehicle.licenses?.some((l: any) => l.expiryDate <= thirtyDaysFromNow && l.status === 'ACTIVE')) {
      alerts.licensesExpiring = true;
      alerts.documentsToRenew.push('Licenses');
    }

    return alerts;
  }
}