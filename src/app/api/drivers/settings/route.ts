import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAuthUser } from '@/lib/auth/utils';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  notifications: z.object({
    tripRequests: z.boolean().optional(),
    paymentUpdates: z.boolean().optional(),
    maintenanceReminders: z.boolean().optional(),
    permitExpirations: z.boolean().optional(),
    promotionsOffers: z.boolean().optional(),
    systemUpdates: z.boolean().optional(),
    emergencyAlerts: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
  }).optional(),
  workingHours: z.object({
    monday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
    tuesday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
    wednesday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
    thursday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
    friday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
    saturday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
    sunday: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      maxTrips: z.number().min(1).max(15),
    }).optional(),
  }).optional(),
  security: z.object({
    twoFactorAuth: z.boolean().optional(),
    loginAlerts: z.boolean().optional(),
    biometricAuth: z.boolean().optional(),
    sessionTimeout: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    currency: z.enum(['HKD', 'CNY']).optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
    distanceUnit: z.enum(['km', 'miles']).optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    autoAcceptRadius: z.number().min(5).max(50).optional(),
    minimumTripValue: z.number().min(50).max(500).optional(),
    maximumTripDistance: z.number().min(50).max(500).optional(),
    preferredRoutes: z.array(z.string()).optional(),
    vehicleCategories: z.array(z.string()).optional(),
  }).optional(),
});

// Get driver settings
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can access settings' },
        { status: 403 }
      );
    }

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
      include: {
        settings: true,
      },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Get or create settings with defaults
    let settings = driverProfile.settings;
    if (!settings) {
      settings = await prisma.driverSettings.create({
        data: {
          driverId: driverProfile.id,
          // Default notification settings
          tripRequests: true,
          paymentUpdates: true,
          maintenanceReminders: true,
          permitExpirations: true,
          promotionsOffers: false,
          systemUpdates: true,
          emergencyAlerts: true,
          weeklyReports: true,
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          // Default working hours
          workingHours: JSON.stringify({
            monday: { enabled: true, startTime: '07:00', endTime: '19:00', maxTrips: 8 },
            tuesday: { enabled: true, startTime: '07:00', endTime: '19:00', maxTrips: 8 },
            wednesday: { enabled: true, startTime: '07:00', endTime: '19:00', maxTrips: 8 },
            thursday: { enabled: true, startTime: '07:00', endTime: '19:00', maxTrips: 8 },
            friday: { enabled: true, startTime: '07:00', endTime: '19:00', maxTrips: 8 },
            saturday: { enabled: true, startTime: '08:00', endTime: '18:00', maxTrips: 6 },
            sunday: { enabled: false, startTime: '09:00', endTime: '17:00', maxTrips: 4 },
          }),
          // Default security settings
          twoFactorAuth: false,
          loginAlerts: true,
          biometricAuth: false,
          sessionTimeout: 60,
          // Default preferences
          preferences: JSON.stringify({
            language: 'en',
            currency: 'HKD',
            timeFormat: '24h',
            distanceUnit: 'km',
            theme: 'light',
            autoAcceptRadius: 15,
            minimumTripValue: 100,
            maximumTripDistance: 200,
            preferredRoutes: ['Hong Kong ↔ Shenzhen', 'Hong Kong ↔ Guangzhou'],
            vehicleCategories: ['Business', 'Executive'],
          }),
        },
      });
    }

    // Parse JSON fields
    const workingHours = settings.workingHours ? JSON.parse(settings.workingHours) : {};
    const preferences = settings.preferences ? JSON.parse(settings.preferences) : {};

    return NextResponse.json({
      notifications: {
        tripRequests: settings.tripRequests,
        paymentUpdates: settings.paymentUpdates,
        maintenanceReminders: settings.maintenanceReminders,
        permitExpirations: settings.permitExpirations,
        promotionsOffers: settings.promotionsOffers,
        systemUpdates: settings.systemUpdates,
        emergencyAlerts: settings.emergencyAlerts,
        weeklyReports: settings.weeklyReports,
        pushNotifications: settings.pushNotifications,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
      },
      workingHours,
      security: {
        twoFactorAuth: settings.twoFactorAuth,
        loginAlerts: settings.loginAlerts,
        biometricAuth: settings.biometricAuth,
        sessionTimeout: settings.sessionTimeout,
        allowedDevices: ['iPhone 14 Pro', 'MacBook Pro'], // Mock data
        emergencyContacts: [
          { name: 'Emergency Contact 1', phone: '+852-XXXX-XXXX', relationship: 'Family' },
          { name: 'Emergency Contact 2', phone: '+852-YYYY-YYYY', relationship: 'Friend' },
        ],
      },
      preferences,
    });
  } catch (error) {
    console.error('Get driver settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update driver settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can update settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
      include: {
        settings: true,
      },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Update notification settings
    if (validatedData.notifications) {
      Object.assign(updateData, validatedData.notifications);
    }

    // Update security settings
    if (validatedData.security) {
      Object.assign(updateData, validatedData.security);
    }

    // Update working hours
    if (validatedData.workingHours) {
      // Get existing working hours
      const existingWorkingHours = driverProfile.settings?.workingHours 
        ? JSON.parse(driverProfile.settings.workingHours) 
        : {};
      
      // Merge with new working hours
      const updatedWorkingHours = { ...existingWorkingHours, ...validatedData.workingHours };
      updateData.workingHours = JSON.stringify(updatedWorkingHours);
    }

    // Update preferences
    if (validatedData.preferences) {
      // Get existing preferences
      const existingPreferences = driverProfile.settings?.preferences 
        ? JSON.parse(driverProfile.settings.preferences) 
        : {};
      
      // Merge with new preferences
      const updatedPreferences = { ...existingPreferences, ...validatedData.preferences };
      updateData.preferences = JSON.stringify(updatedPreferences);
    }

    // Update or create settings
    let settings;
    if (driverProfile.settings) {
      settings = await prisma.driverSettings.update({
        where: { driverId: driverProfile.id },
        data: updateData,
      });
    } else {
      settings = await prisma.driverSettings.create({
        data: {
          driverId: driverProfile.id,
          ...updateData,
          // Set defaults for required fields if not provided
          tripRequests: updateData.tripRequests ?? true,
          paymentUpdates: updateData.paymentUpdates ?? true,
          maintenanceReminders: updateData.maintenanceReminders ?? true,
          permitExpirations: updateData.permitExpirations ?? true,
          promotionsOffers: updateData.promotionsOffers ?? false,
          systemUpdates: updateData.systemUpdates ?? true,
          emergencyAlerts: updateData.emergencyAlerts ?? true,
          weeklyReports: updateData.weeklyReports ?? true,
          pushNotifications: updateData.pushNotifications ?? true,
          emailNotifications: updateData.emailNotifications ?? true,
          smsNotifications: updateData.smsNotifications ?? false,
          twoFactorAuth: updateData.twoFactorAuth ?? false,
          loginAlerts: updateData.loginAlerts ?? true,
          biometricAuth: updateData.biometricAuth ?? false,
          sessionTimeout: updateData.sessionTimeout ?? 60,
        },
      });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        id: settings.id,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Update driver settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}