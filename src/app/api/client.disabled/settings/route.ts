import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { PrivacyLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

// GET /api/client/settings - Get client settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    // Get client profile with settings
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      include: {
        settings: true
      }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Create default settings if they don't exist
    if (!clientProfile.settings) {
      const defaultSettings = await prisma.clientSettings.create({
        data: {
          clientId: clientProfile.id
        }
      });
      
      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ settings: clientProfile.settings });

  } catch (error) {
    console.error('Error fetching client settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/client/settings - Update client settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    const body = await request.json();
    const {
      // Notification preferences
      emailNotifications,
      smsNotifications,
      pushNotifications,
      bookingNotifications,
      paymentNotifications,
      promoNotifications,
      tripNotifications,
      
      // Privacy settings
      shareDataForMarketing,
      shareLocationData,
      profileVisibility,
      
      // App preferences
      language,
      timezone,
      currency,
      distanceUnit,
      
      // Security settings
      twoFactorEnabled,
      biometricEnabled,
      autoLogout,
      
      // Password change
      currentPassword,
      newPassword
    } = body;

    // Get client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Handle password change if requested
    if (currentPassword && newPassword) {
      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
        include: { passwords: { orderBy: { id: 'desc' }, take: 1 } }
      });

      if (!userWithPassword || !userWithPassword.passwords[0]) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.passwords[0].hash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
      }

      // Create new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.password.create({
        data: {
          userId: user.id,
          hash: hashedPassword
        }
      });
    }

    // Update or create settings
    const settings = await prisma.clientSettings.upsert({
      where: { clientId: clientProfile.id },
      update: {
        emailNotifications,
        smsNotifications,
        pushNotifications,
        bookingNotifications,
        paymentNotifications,
        promoNotifications,
        tripNotifications,
        shareDataForMarketing,
        shareLocationData,
        profileVisibility: profileVisibility as PrivacyLevel,
        language,
        timezone,
        currency,
        distanceUnit,
        twoFactorEnabled,
        biometricEnabled,
        autoLogout
      },
      create: {
        clientId: clientProfile.id,
        emailNotifications: emailNotifications ?? true,
        smsNotifications: smsNotifications ?? true,
        pushNotifications: pushNotifications ?? true,
        bookingNotifications: bookingNotifications ?? true,
        paymentNotifications: paymentNotifications ?? true,
        promoNotifications: promoNotifications ?? false,
        tripNotifications: tripNotifications ?? true,
        shareDataForMarketing: shareDataForMarketing ?? false,
        shareLocationData: shareLocationData ?? true,
        profileVisibility: (profileVisibility as PrivacyLevel) ?? PrivacyLevel.PRIVATE,
        language: language ?? 'en',
        timezone: timezone ?? 'Asia/Hong_Kong',
        currency: currency ?? 'HKD',
        distanceUnit: distanceUnit ?? 'km',
        twoFactorEnabled: twoFactorEnabled ?? false,
        biometricEnabled: biometricEnabled ?? false,
        autoLogout: autoLogout ?? 30
      }
    });

    return NextResponse.json({ 
      settings,
      message: currentPassword && newPassword ? 'Settings updated and password changed successfully' : 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating client settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}