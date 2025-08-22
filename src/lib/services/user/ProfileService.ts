import { BaseService } from '../base/BaseService';
import { User, ClientProfile, DriverProfile, BlogEditorProfile } from '@prisma/client';
import { z } from 'zod';

const clientProfileSchema = z.object({
  preferredVehicle: z.enum(['BUSINESS', 'LUXURY', 'VAN', 'TRUCK']).optional(),
  emergencyContact: z.string().min(2).max(100).optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().max(50).optional(),
  specialRequirements: z.array(z.string()).default([]),
  paymentPreference: z.enum(['CREDIT_CARD', 'CASH', 'DIGITAL_WALLET']).optional(),
  communicationPreferences: z.record(z.boolean()).default({})
});

const driverProfileSchema = z.object({
  licenseNumber: z.string().min(5).max(50),
  licenseExpiry: z.string().datetime().transform(str => new Date(str)),
  insuranceProvider: z.string().min(2).max(100).optional(),
  insurancePolicyNumber: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  languagesSpoken: z.array(z.string()).default(['en']),
  specialCertifications: z.array(z.string()).default([]),
  availabilitySchedule: z.record(z.object({
    start: z.string(),
    end: z.string(),
    isAvailable: z.boolean()
  })).optional(),
  serviceAreas: z.array(z.string()).default([]),
  emergencyContact: z.string().min(2).max(100).optional(),
  emergencyContactPhone: z.string().optional()
});

const editorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  expertise: z.array(z.string()).default([]),
  socialLinks: z.record(z.string().url()).default({}),
  preferredCategories: z.array(z.string()).default([]),
  notificationSettings: z.record(z.boolean()).default({})
});

export class ProfileService extends BaseService {
  constructor() {
    super('ProfileService');
  }

  // CLIENT PROFILE METHODS
  async getClientProfile(userId: string) {
    return this.withCache(
      `client_profile:${userId}`,
      async () => {
        const profile = await this.db.clientProfile.findUnique({
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                isVerified: true
              }
            },
            _count: {
              select: {
                bookings: true,
                reviews: true
              }
            }
          }
        });

        if (!profile) {
          throw new Error('Client profile not found');
        }

        return {
          ...profile,
          user: profile.user,
          stats: {
            totalBookings: profile._count.bookings,
            totalReviews: profile._count.reviews
          }
        };
      },
      300 // 5 minutes
    );
  }

  async updateClientProfile(userId: string, data: z.infer<typeof clientProfileSchema>) {
    const validatedData = this.validateInput(clientProfileSchema, data);

    try {
      const existingProfile = await this.db.clientProfile.findUnique({
        where: { userId }
      });

      let profile;
      if (existingProfile) {
        profile = await this.db.clientProfile.update({
          where: { userId },
          data: {
            ...validatedData,
            profileCompletion: this.calculateClientProfileCompletion({
              ...existingProfile,
              ...validatedData
            })
          }
        });
      } else {
        profile = await this.db.clientProfile.create({
          data: {
            userId,
            ...validatedData,
            profileCompletion: this.calculateClientProfileCompletion(validatedData),
            membershipTier: 'BRONZE',
            loyaltyPoints: 0
          }
        });
      }

      // Invalidate cache
      await this.cache.delete(`client_profile:${userId}`);

      this.logger.info('Client profile updated', {
        userId,
        profileCompletion: profile.profileCompletion
      });

      return profile;

    } catch (error) {
      return this.handleError(error, 'updateClientProfile', { userId });
    }
  }

  async getClientStats(userId: string) {
    return this.withCache(
      `client_stats:${userId}`,
      async () => {
        const [bookingStats, paymentStats, reviewStats] = await Promise.all([
          // Booking statistics
          this.db.booking.groupBy({
            by: ['status'],
            where: { clientId: userId },
            _count: { status: true },
            _sum: { totalPrice: true }
          }),
          
          // Payment statistics
          this.db.payment.aggregate({
            where: {
              booking: { clientId: userId },
              status: 'COMPLETED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),

          // Review statistics
          this.db.review.aggregate({
            where: { reviewerId: userId },
            _avg: { rating: true },
            _count: { id: true }
          })
        ]);

        return {
          bookings: {
            total: bookingStats.reduce((acc, stat) => acc + stat._count.status, 0),
            totalSpent: bookingStats.reduce((acc, stat) => acc + (stat._sum.totalPrice || 0), 0),
            byStatus: bookingStats.reduce((acc, stat) => {
              acc[stat.status] = stat._count.status;
              return acc;
            }, {} as Record<string, number>)
          },
          payments: {
            totalPaid: paymentStats._sum.amount || 0,
            totalTransactions: paymentStats._count
          },
          reviews: {
            averageRating: reviewStats._avg.rating || 0,
            totalReviews: reviewStats._count
          }
        };
      },
      600 // 10 minutes
    );
  }

  // DRIVER PROFILE METHODS
  async getDriverProfile(userId: string) {
    return this.withCache(
      `driver_profile:${userId}`,
      async () => {
        const profile = await this.db.driverProfile.findUnique({
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                isVerified: true
              }
            },
            vehicles: {
              where: { isActive: true },
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                vehicleType: true,
                plateNumber: true
              }
            },
            _count: {
              select: {
                vehicles: { where: { isActive: true } },
                bookings: true
              }
            }
          }
        });

        if (!profile) {
          throw new Error('Driver profile not found');
        }

        // Check document expiry alerts
        const documentAlerts = this.checkDriverDocumentExpiry(profile);

        return {
          ...profile,
          user: profile.user,
          vehicles: profile.vehicles,
          stats: {
            totalVehicles: profile._count.vehicles,
            totalTrips: profile._count.bookings
          },
          alerts: documentAlerts
        };
      },
      300 // 5 minutes
    );
  }

  async updateDriverProfile(userId: string, data: z.infer<typeof driverProfileSchema>) {
    const validatedData = this.validateInput(driverProfileSchema, data);

    try {
      const existingProfile = await this.db.driverProfile.findUnique({
        where: { userId }
      });

      let profile;
      if (existingProfile) {
        profile = await this.db.driverProfile.update({
          where: { userId },
          data: {
            ...validatedData,
            profileCompletion: this.calculateDriverProfileCompletion({
              ...existingProfile,
              ...validatedData
            })
          }
        });
      } else {
        profile = await this.db.driverProfile.create({
          data: {
            userId,
            ...validatedData,
            profileCompletion: this.calculateDriverProfileCompletion(validatedData),
            isApproved: false,
            isAvailable: false,
            rating: 0,
            totalTrips: 0,
            totalEarnings: 0
          }
        });
      }

      // Invalidate cache
      await this.cache.delete(`driver_profile:${userId}`);

      this.logger.info('Driver profile updated', {
        userId,
        profileCompletion: profile.profileCompletion
      });

      return profile;

    } catch (error) {
      return this.handleError(error, 'updateDriverProfile', { userId });
    }
  }

  async approveDriver(userId: string, approvedBy: string) {
    try {
      const profile = await this.db.driverProfile.update({
        where: { userId },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy
        }
      });

      // Invalidate cache
      await this.cache.delete(`driver_profile:${userId}`);

      this.logger.info('Driver approved', {
        userId,
        approvedBy,
        timestamp: new Date().toISOString()
      });

      return profile;

    } catch (error) {
      return this.handleError(error, 'approveDriver', { userId, approvedBy });
    }
  }

  async getDriverStats(userId: string) {
    return this.withCache(
      `driver_stats:${userId}`,
      async () => {
        const [tripStats, earningStats, ratingStats] = await Promise.all([
          // Trip statistics
          this.db.booking.groupBy({
            by: ['status'],
            where: {
              driver: { userId },
              status: { in: ['COMPLETED', 'IN_PROGRESS', 'CANCELLED'] }
            },
            _count: { status: true }
          }),

          // Earnings statistics
          this.db.booking.aggregate({
            where: {
              driver: { userId },
              status: 'COMPLETED'
            },
            _sum: { totalPrice: true },
            _count: { id: true }
          }),

          // Rating statistics
          this.db.review.aggregate({
            where: {
              booking: {
                driver: { userId }
              }
            },
            _avg: { rating: true },
            _count: { id: true }
          })
        ]);

        return {
          trips: {
            total: tripStats.reduce((acc, stat) => acc + stat._count.status, 0),
            completed: tripStats.find(s => s.status === 'COMPLETED')?._count.status || 0,
            cancelled: tripStats.find(s => s.status === 'CANCELLED')?._count.status || 0,
            inProgress: tripStats.find(s => s.status === 'IN_PROGRESS')?._count.status || 0
          },
          earnings: {
            total: earningStats._sum.totalPrice || 0,
            completedTrips: earningStats._count,
            averagePerTrip: earningStats._count > 0 ? 
              (earningStats._sum.totalPrice || 0) / earningStats._count : 0
          },
          rating: {
            average: ratingStats._avg.rating || 0,
            totalReviews: ratingStats._count
          }
        };
      },
      600 // 10 minutes
    );
  }

  // BLOG EDITOR PROFILE METHODS
  async getEditorProfile(userId: string) {
    return this.withCache(
      `editor_profile:${userId}`,
      async () => {
        const profile = await this.db.blogEditorProfile.findUnique({
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isVerified: true
              }
            },
            _count: {
              select: {
                posts: true
              }
            }
          }
        });

        if (!profile) {
          throw new Error('Editor profile not found');
        }

        return {
          ...profile,
          user: profile.user,
          stats: {
            totalPosts: profile._count.posts
          }
        };
      },
      300 // 5 minutes
    );
  }

  async updateEditorProfile(userId: string, data: z.infer<typeof editorProfileSchema>) {
    const validatedData = this.validateInput(editorProfileSchema, data);

    try {
      const existingProfile = await this.db.blogEditorProfile.findUnique({
        where: { userId }
      });

      let profile;
      if (existingProfile) {
        profile = await this.db.blogEditorProfile.update({
          where: { userId },
          data: validatedData
        });
      } else {
        profile = await this.db.blogEditorProfile.create({
          data: {
            userId,
            ...validatedData,
            isApproved: false
          }
        });
      }

      // Invalidate cache
      await this.cache.delete(`editor_profile:${userId}`);

      this.logger.info('Editor profile updated', { userId });

      return profile;

    } catch (error) {
      return this.handleError(error, 'updateEditorProfile', { userId });
    }
  }

  async getEditorStats(userId: string) {
    return this.withCache(
      `editor_stats:${userId}`,
      async () => {
        const [postStats, viewStats] = await Promise.all([
          this.db.blogPost.groupBy({
            by: ['status'],
            where: { authorId: userId },
            _count: { status: true }
          }),

          this.db.blogPost.aggregate({
            where: { authorId: userId },
            _sum: { viewCount: true, shareCount: true },
            _count: { id: true }
          })
        ]);

        return {
          posts: {
            total: postStats.reduce((acc, stat) => acc + stat._count.status, 0),
            published: postStats.find(s => s.status === 'PUBLISHED')?._count.status || 0,
            draft: postStats.find(s => s.status === 'DRAFT')?._count.status || 0,
            scheduled: postStats.find(s => s.status === 'SCHEDULED')?._count.status || 0
          },
          engagement: {
            totalViews: viewStats._sum.viewCount || 0,
            totalShares: viewStats._sum.shareCount || 0,
            averageViewsPerPost: viewStats._count > 0 ? 
              (viewStats._sum.viewCount || 0) / viewStats._count : 0
          }
        };
      },
      600 // 10 minutes
    );
  }

  // HELPER METHODS
  private calculateClientProfileCompletion(profile: Partial<ClientProfile>): number {
    const fields = [
      'preferredVehicle',
      'emergencyContact',
      'emergencyContactPhone',
      'emergencyContactRelation'
    ];

    const completedFields = fields.filter(field => profile[field as keyof ClientProfile]).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private calculateDriverProfileCompletion(profile: Partial<DriverProfile>): number {
    const fields = [
      'licenseNumber',
      'licenseExpiry',
      'yearsOfExperience',
      'serviceAreas',
      'emergencyContact',
      'emergencyContactPhone'
    ];

    const completedFields = fields.filter(field => profile[field as keyof DriverProfile]).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private checkDriverDocumentExpiry(profile: DriverProfile) {
    const alerts = {
      licenseExpiring: false,
      documentsToRenew: [] as string[]
    };

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (profile.licenseExpiry <= thirtyDaysFromNow) {
      alerts.licenseExpiring = true;
      alerts.documentsToRenew.push('Driver License');
    }

    return alerts;
  }
}