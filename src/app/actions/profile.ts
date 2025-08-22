'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { revalidatePath } from 'next/cache';
import { UniversalProfileData } from '@/types/profile';
import { UserType, VehicleType } from '@prisma/client';

// Profile Update Action
export async function updateProfile(data: Partial<UniversalProfileData>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Update basic user information
    const updateData: any = {};
    if (data.user?.name) updateData.name = data.user.name;
    if (data.user?.email) updateData.email = data.user.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        userRoles: {
          where: { isActive: true },
          select: { role: true }
        }
      }
    });

    // Note: User preferences would require a separate UserPreference table
    if (data.preferences) {
      console.log('User preferences update attempted:', { 
        userId, 
        preferences: data.preferences 
      });
    }

    // Role-specific profile updates
    if (data.clientProfile && updatedUser.userRoles.some(r => r.role === UserType.CLIENT)) {
      // Transform client profile data to match Prisma schema
      const clientProfileData = {
        preferredVehicle: data.clientProfile.preferredVehicle as VehicleType || null,
        loyaltyPoints: data.clientProfile.loyaltyPoints || 0,
        membershipTier: data.clientProfile.membershipTier || 'BASIC',
        // Extract emergency contact fields from nested object
        emergencyContact: data.clientProfile.emergencyContact?.name || null,
        emergencyContactPhone: data.clientProfile.emergencyContact?.phone || null,
        emergencyContactRelation: data.clientProfile.emergencyContact?.relationship || null,
        specialRequests: data.clientProfile.specialRequests || null,
        dateOfBirth: data.clientProfile.dateOfBirth ? new Date(data.clientProfile.dateOfBirth) : null,
        gender: data.clientProfile.gender || null,
        nationality: data.clientProfile.nationality || null,
        passportNumber: data.clientProfile.passportNumber || null,
      };
      
      await prisma.clientProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...clientProfileData
        },
        update: clientProfileData
      });
    }

    if (data.driverProfile && updatedUser.userRoles.some(r => r.role === UserType.DRIVER)) {
      await prisma.driverProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data.driverProfile
        },
        update: data.driverProfile
      });
    }

    if (data.editorProfile && updatedUser.userRoles.some(r => r.role === UserType.BLOG_EDITOR)) {
      await prisma.blogEditorProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data.editorProfile
        },
        update: data.editorProfile
      });
    }

    // Revalidate profile-related paths
    revalidatePath('/profile');
    revalidatePath('/profile/editor');
    revalidatePath('/profile/settings');

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
}

// Avatar Upload Action
export async function uploadAvatar(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload a valid image.' };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File too large. Please upload an image smaller than 5MB.' };
    }

    // In a real application, you would upload to a storage service like AWS S3, Cloudinary, etc.
    // For now, we'll simulate the upload and generate a mock URL
    const mockUrl = `/uploads/avatars/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;

    // Update user avatar in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: mockUrl }
    });

    // Revalidate profile-related paths
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, data: { url: mockUrl } };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload avatar' 
    };
  }
}

// Get Profile Data Action
export async function getProfileData(userId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const targetUserId = userId || session.user.id;

    // Get user with all related profile data
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        userRoles: {
          where: { isActive: true },
          select: { role: true, assignedAt: true }
        },
        clientProfile: {
          include: {
            emergencyContacts: true,
            paymentMethods: true,
            tripHistory: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        driverProfile: {
          include: {
            vehicle: true,
            emergencyContacts: true,
            certifications: true
          }
        },
        blogEditorProfile: true,
        adminProfile: true,
        preferences: true,
        activityLogs: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if requesting user has permission to view this profile
    if (targetUserId !== session.user.id && !user.isPublic) {
      return { success: false, error: 'Profile is private' };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error('Get profile data error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get profile data' 
    };
  }
}

// Update Security Settings Action
export async function updateSecuritySettings(settings: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update security settings in database
    await prisma.userSecuritySettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...settings
      },
      update: settings
    });

    // Log security settings change
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'SECURITY_SETTINGS_UPDATED',
        description: 'User updated security settings',
        metadata: { settingsChanged: Object.keys(settings) }
      }
    });

    revalidatePath('/profile/settings');

    return { success: true };
  } catch (error) {
    console.error('Security settings update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update security settings' 
    };
  }
}

// Update Notification Settings Action
export async function updateNotificationSettings(settings: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update notification settings in database
    await prisma.userNotificationSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...settings
      },
      update: settings
    });

    revalidatePath('/profile/settings');

    return { success: true };
  } catch (error) {
    console.error('Notification settings update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update notification settings' 
    };
  }
}

// Change Password Action
export async function changePassword(oldPassword: string, newPassword: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get current password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        passwords: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!user || !user.passwords.length) {
      return { success: false, error: 'User not found' };
    }

    // Verify old password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwords[0].hash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Deactivate old password
    await prisma.userPassword.update({
      where: { id: user.passwords[0].id },
      data: { isActive: false }
    });

    // Create new password record
    await prisma.userPassword.create({
      data: {
        userId: session.user.id,
        hash: hashedNewPassword,
        isActive: true
      }
    });

    // Log password change
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PASSWORD_CHANGED',
        description: 'User changed their password',
        metadata: { timestamp: new Date().toISOString() }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to change password' 
    };
  }
}

// Delete Account Action
export async function deleteAccount(password: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify password before deletion
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        passwords: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!user || !user.passwords.length) {
      return { success: false, error: 'User not found' };
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.passwords[0].hash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Password is incorrect' };
    }

    // Soft delete: deactivate user instead of hard delete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}` // Anonymize email
      }
    });

    // Log account deletion
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCOUNT_DELETED',
        description: 'User deleted their account',
        metadata: { deletedAt: new Date().toISOString() }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Account deletion error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete account' 
    };
  }
}

// Calculate Profile Completion Action
export async function calculateProfileCompletion(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { where: { isActive: true } },
        clientProfile: true,
        driverProfile: true,
        blogEditorProfile: true
      }
    });

    if (!user) return 0;

    let totalFields = 8; // Base fields: name, email, phone, bio, dateOfBirth, nationality, avatar, languages
    let completedFields = 0;

    // Check base fields
    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.bio) completedFields++;
    if (user.dateOfBirth) completedFields++;
    if (user.nationality) completedFields++;
    if (user.avatar) completedFields++;
    if (user.languages && user.languages.length > 0) completedFields++;

    // Add role-specific completion checks
    const roles = user.userRoles.map(r => r.role);

    if (roles.includes(UserType.CLIENT) && user.clientProfile) {
      totalFields += 3;
      if (user.clientProfile.emergencyContact) completedFields++;
      if (user.clientProfile.travelPreferences) completedFields++;
      if (user.clientProfile.membershipTier) completedFields++;
    }

    if (roles.includes(UserType.DRIVER) && user.driverProfile) {
      totalFields += 4;
      if (user.driverProfile.licenseNumber) completedFields++;
      if (user.driverProfile.vehicleInfo) completedFields++;
      if (user.driverProfile.emergencyContact) completedFields++;
      if (user.driverProfile.workingHours) completedFields++;
    }

    if (roles.includes(UserType.BLOG_EDITOR) && user.blogEditorProfile) {
      totalFields += 2;
      if (user.blogEditorProfile.specializations) completedFields++;
      if (user.blogEditorProfile.bio) completedFields++;
    }

    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    // Update completion in database
    await prisma.user.update({
      where: { id: userId },
      data: { profileCompletion: completionPercentage }
    });

    return completionPercentage;
  } catch (error) {
    console.error('Profile completion calculation error:', error);
    return 0;
  }
}