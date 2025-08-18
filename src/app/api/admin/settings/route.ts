import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { UserType } from '@prisma/client';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  payment: {
    baseFare: number;
    pricePerKm: number;
    pricePerMinute: number;
    surchargeWeekend: number;
    surchargeNight: number;
    cancellationFee: number;
  };
  features: {
    realTimeTracking: boolean;
    scheduleBookings: boolean;
    multipleStops: boolean;
    carSharingMode: boolean;
    loyaltyProgram: boolean;
  };
}

// Default system settings
const defaultSettings: SystemSettings = {
  general: {
    siteName: 'CrossBorder Transportation',
    siteDescription: 'Professional cross-border transportation services between Hong Kong and Shenzhen',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    adminAlerts: true
  },
  security: {
    sessionTimeout: 30, // minutes
    passwordMinLength: 8,
    twoFactorRequired: false,
    ipWhitelist: ['127.0.0.1', '10.0.0.0/8']
  },
  payment: {
    baseFare: 50.00,
    pricePerKm: 8.50,
    pricePerMinute: 2.50,
    surchargeWeekend: 1.25,
    surchargeNight: 1.50,
    cancellationFee: 25.00
  },
  features: {
    realTimeTracking: true,
    scheduleBookings: true,
    multipleStops: true,
    carSharingMode: false,
    loyaltyProgram: true
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const hasAdminRole = session.user?.roles?.includes(UserType.ADMIN);
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // In production, this would fetch from database or configuration store
    // For now, returning default settings
    return NextResponse.json({
      settings: defaultSettings,
      lastUpdated: new Date().toISOString(),
      updatedBy: session.user.name
    });

  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const hasAdminRole = session.user?.roles?.includes(UserType.ADMIN);
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Basic validation for required fields
    const requiredSections = ['general', 'notifications', 'security', 'payment', 'features'];
    for (const section of requiredSections) {
      if (!settings[section]) {
        return NextResponse.json(
          { error: `Missing required section: ${section}` },
          { status: 400 }
        );
      }
    }

    // Validate specific settings
    if (settings.security?.sessionTimeout < 5 || settings.security?.sessionTimeout > 480) {
      return NextResponse.json(
        { error: 'Session timeout must be between 5 and 480 minutes' },
        { status: 400 }
      );
    }

    if (settings.security?.passwordMinLength < 6 || settings.security?.passwordMinLength > 50) {
      return NextResponse.json(
        { error: 'Password minimum length must be between 6 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate payment settings
    if (settings.payment?.baseFare < 0 || settings.payment?.pricePerKm < 0) {
      return NextResponse.json(
        { error: 'Payment rates cannot be negative' },
        { status: 400 }
      );
    }

    // In production, this would save to database or configuration store
    // For now, just logging the update
    console.log('Admin settings updated:', {
      settings,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString()
    });

    // Return updated settings
    return NextResponse.json({
      settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: session.user.name,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    );
  }
}

// Get specific setting section
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const hasAdminRole = session.user?.roles?.includes(UserType.ADMIN);
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      );
    }

    // In production, this would update specific section in database
    console.log(`Admin settings section '${section}' updated:`, {
      section,
      data,
      updatedBy: session.user.email,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      section,
      data,
      lastUpdated: new Date().toISOString(),
      updatedBy: session.user.name,
      message: `${section} settings updated successfully`
    });

  } catch (error) {
    console.error('Error updating admin settings section:', error);
    return NextResponse.json(
      { error: 'Failed to update settings section' },
      { status: 500 }
    );
  }
}