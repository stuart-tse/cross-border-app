'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { UserType } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DriverActionState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

export interface DriverSettingsUpdateState extends DriverActionState {
  settings?: any;
}

export interface OnlineStatusUpdateState extends DriverActionState {
  isOnline?: boolean;
}

export interface DocumentUploadState extends DriverActionState {
  documentId?: string;
  uploadUrl?: string;
}

export interface TripRequestState extends DriverActionState {
  tripId?: string;
  status?: 'accepted' | 'rejected';
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const settingsSchema = z.object({
  notifications: z.object({
    tripRequests: z.boolean().optional(),
    tripUpdates: z.boolean().optional(),
    soundAlerts: z.boolean().optional(),
    paymentConfirmations: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  }).optional(),
  workingHours: z.object({
    isOnline: z.boolean().optional(),
    schedule: z.array(z.object({
      day: z.string(),
      enabled: z.boolean(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })).optional(),
    autoOffline: z.boolean().optional(),
    breakReminders: z.boolean().optional(),
  }).optional(),
  security: z.object({
    twoFactorEnabled: z.boolean().optional(),
    locationTracking: z.boolean().optional(),
    shareProfile: z.boolean().optional(),
  }).optional(),
});

const documentUploadSchema = z.object({
  documentType: z.enum(['driversLicense', 'vehicleRegistration', 'insurance', 'backgroundCheck']),
  file: z.instanceof(File),
});

const tripRequestSchema = z.object({
  tripId: z.string().min(1),
  action: z.enum(['accept', 'reject']),
  reason: z.string().optional(),
});

const onlineStatusSchema = z.object({
  isOnline: z.boolean(),
});

const withdrawalRequestSchema = z.object({
  amount: z.number().min(1).max(50000),
  bankAccount: z.string().min(1),
  reason: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function getAuthenticatedDriver() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: true,
      driverProfile: {
        include: {
          vehicles: true,
        },
      },
    },
  });

  if (!user || !user.userRoles.some(role => role.role === 'DRIVER')) {
    throw new Error('Driver access required');
  }

  if (!user.driverProfile) {
    throw new Error('Driver profile not found');
  }

  return { user, driverProfile: user.driverProfile };
}

// ============================================================================
// SETTINGS ACTIONS
// ============================================================================

export async function updateDriverSettings(
  prevState: DriverSettingsUpdateState | undefined,
  formData: FormData
): Promise<DriverSettingsUpdateState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();

    // Extract form data
    const rawData = {
      notifications: {
        tripRequests: formData.get('notifications.tripRequests') === 'true',
        tripUpdates: formData.get('notifications.tripUpdates') === 'true',
        soundAlerts: formData.get('notifications.soundAlerts') === 'true',
        paymentConfirmations: formData.get('notifications.paymentConfirmations') === 'true',
        weeklySummary: formData.get('notifications.weeklySummary') === 'true',
      },
      workingHours: {
        isOnline: formData.get('workingHours.isOnline') === 'true',
        autoOffline: formData.get('workingHours.autoOffline') === 'true',
        breakReminders: formData.get('workingHours.breakReminders') === 'true',
      },
      security: {
        twoFactorEnabled: formData.get('security.twoFactorEnabled') === 'true',
        locationTracking: formData.get('security.locationTracking') === 'true',
        shareProfile: formData.get('security.shareProfile') === 'true',
      },
    };

    // Validate data
    const validation = settingsSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: 'Invalid settings data',
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // Note: Driver settings functionality would require a separate DriverSettings table
    // For now, we'll return a success response without persisting settings to database
    console.log('Driver settings update attempted:', {
      driverId: driverProfile.id,
      settings: rawData
    });

    const mockSettings = {
      id: 'mock-settings',
      driverId: driverProfile.id,
      tripRequests: rawData.notifications.tripRequests,
      paymentUpdates: rawData.notifications.paymentConfirmations,
      weeklyReports: rawData.notifications.weeklySummary,
      twoFactorAuth: rawData.security.twoFactorEnabled,
      workingHours: JSON.stringify({
        isOnline: rawData.workingHours.isOnline,
        autoOffline: rawData.workingHours.autoOffline,
        breakReminders: rawData.workingHours.breakReminders,
      }),
      updatedAt: new Date(),
    };

    // Revalidate relevant paths
    revalidatePath('/dashboard/driver');
    revalidateTag('driver-settings');

    return {
      success: true,
      message: 'Settings updated successfully',
      settings: mockSettings,
    };

  } catch (error) {
    console.error('Error updating driver settings:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update settings',
    };
  }
}

// ============================================================================
// ONLINE STATUS ACTIONS
// ============================================================================

export async function toggleOnlineStatus(
  prevState: OnlineStatusUpdateState | undefined,
  formData: FormData
): Promise<OnlineStatusUpdateState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();
    const isOnline = formData.get('isOnline') === 'true';

    // Validate data
    const validation = onlineStatusSchema.safeParse({ isOnline });
    if (!validation.success) {
      return {
        success: false,
        message: 'Invalid online status',
      };
    }

    // Update driver profile online status
    await prisma.driverProfile.update({
      where: { id: driverProfile.id },
      data: {
        isAvailable: isOnline,
        updatedAt: new Date(),
      },
    });

    // Note: Settings would be stored in a separate DriverSettings table if it existed
    console.log('Driver online status updated:', { driverId: driverProfile.id, isOnline });

    revalidatePath('/dashboard/driver');
    revalidateTag('driver-status');

    return {
      success: true,
      message: isOnline ? 'You are now online and available for trips' : 'You are now offline',
      isOnline,
    };

  } catch (error) {
    console.error('Error updating online status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update status',
    };
  }
}

// ============================================================================
// TRIP REQUEST ACTIONS
// ============================================================================

export async function handleTripRequest(
  prevState: TripRequestState | undefined,
  formData: FormData
): Promise<TripRequestState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();

    const rawData = {
      tripId: formData.get('tripId') as string,
      action: formData.get('action') as string,
      reason: formData.get('reason') as string || undefined,
    };

    // Validate data
    const validation = tripRequestSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: 'Invalid trip request data',
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { tripId, action, reason } = validation.data;

    // For now, we'll simulate the trip request handling
    // In a real app, this would update trip status in the database
    const trip = {
      id: tripId,
      status: action === 'accept' ? 'accepted' : 'rejected',
      driverId: driverProfile.id,
      updatedAt: new Date(),
    };

    // Log the action (in real app, save to database)
    console.log(`Trip ${tripId} ${action}ed by driver ${driverProfile.id}`, {
      reason,
      timestamp: new Date(),
    });

    revalidatePath('/dashboard/driver');
    revalidateTag('trip-requests');

    return {
      success: true,
      message: action === 'accept' 
        ? 'Trip request accepted successfully' 
        : 'Trip request rejected',
      tripId,
      status: action === 'accept' ? 'accepted' : 'rejected',
    };

  } catch (error) {
    console.error('Error handling trip request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to handle trip request',
    };
  }
}

// ============================================================================
// PAYMENT ACTIONS
// ============================================================================

export async function requestWithdrawal(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();

    const rawData = {
      amount: parseFloat(formData.get('amount') as string),
      bankAccount: formData.get('bankAccount') as string,
      reason: formData.get('reason') as string || undefined,
    };

    // Validate data
    const validation = withdrawalRequestSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: 'Invalid withdrawal request',
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { amount, bankAccount, reason } = validation.data;

    // Check available balance (mock check)
    const availableBalance = 3450; // This would come from database
    if (amount > availableBalance) {
      return {
        success: false,
        message: `Insufficient funds. Available balance: HK$${availableBalance}`,
      };
    }

    // Create withdrawal request (mock implementation)
    const withdrawalRequest = {
      id: `wd_${Date.now()}`,
      driverId: driverProfile.id,
      amount,
      bankAccount,
      reason,
      status: 'pending',
      requestedAt: new Date(),
    };

    console.log('Withdrawal request created:', withdrawalRequest);

    revalidatePath('/dashboard/driver');
    revalidateTag('driver-payments');

    return {
      success: true,
      message: `Withdrawal request for HK$${amount} has been submitted. Processing usually takes 1-3 business days.`,
      data: { withdrawalId: withdrawalRequest.id },
    };

  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to request withdrawal',
    };
  }
}

export async function exportStatement(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();
    const period = formData.get('period') as string || 'monthly';
    const format = formData.get('format') as string || 'pdf';

    // Generate statement (mock implementation)
    const statementUrl = `/exports/driver-statement-${driverProfile.id}-${period}.${format}`;
    
    console.log(`Statement export requested for driver ${driverProfile.id}:`, {
      period,
      format,
      url: statementUrl,
    });

    return {
      success: true,
      message: 'Statement exported successfully. Download will start shortly.',
      data: { downloadUrl: statementUrl },
    };

  } catch (error) {
    console.error('Error exporting statement:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to export statement',
    };
  }
}

export async function downloadTaxSummary(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();
    const year = formData.get('year') as string || new Date().getFullYear().toString();

    // Generate tax summary (mock implementation)
    const summaryUrl = `/exports/tax-summary-${driverProfile.id}-${year}.pdf`;
    
    console.log(`Tax summary requested for driver ${driverProfile.id}:`, {
      year,
      url: summaryUrl,
    });

    return {
      success: true,
      message: 'Tax summary downloaded successfully.',
      data: { downloadUrl: summaryUrl },
    };

  } catch (error) {
    console.error('Error downloading tax summary:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to download tax summary',
    };
  }
}

// ============================================================================
// SECURITY ACTIONS
// ============================================================================

export async function changePassword(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { user } = await getAuthenticatedDriver();

    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate data
    const validation = passwordChangeSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: 'Password validation failed',
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // In a real implementation, you would:
    // 1. Verify current password
    // 2. Hash the new password
    // 3. Update in database
    // 4. Invalidate sessions
    
    console.log(`Password change requested for user ${user.id}`);

    return {
      success: true,
      message: 'Password changed successfully. Please log in again with your new password.',
    };

  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to change password',
    };
  }
}

export async function toggleTwoFactor(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();
    const enable = formData.get('enable') === 'true';

    // Note: Two-factor authentication would be stored in a separate DriverSettings table
    console.log('Two-factor authentication updated:', { 
      driverId: driverProfile.id, 
      enable 
    });

    revalidatePath('/dashboard/driver');
    revalidateTag('driver-security');

    return {
      success: true,
      message: enable 
        ? 'Two-factor authentication enabled successfully' 
        : 'Two-factor authentication disabled',
    };

  } catch (error) {
    console.error('Error toggling two-factor authentication:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update two-factor authentication',
    };
  }
}

// ============================================================================
// DATA MANAGEMENT ACTIONS
// ============================================================================

export async function requestDataDownload(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();
    const dataType = formData.get('dataType') as string || 'all';

    // Generate data export request (mock implementation)
    const requestId = `data_${Date.now()}`;
    
    console.log(`Data download requested for driver ${driverProfile.id}:`, {
      dataType,
      requestId,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Data download request submitted. You will receive an email with the download link within 24 hours.',
      data: { requestId },
    };

  } catch (error) {
    console.error('Error requesting data download:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to request data download',
    };
  }
}

export async function deleteDriverAccount(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { user, driverProfile } = await getAuthenticatedDriver();
    const confirmationText = formData.get('confirmation') as string;
    const password = formData.get('password') as string;

    // Validate confirmation
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return {
        success: false,
        message: 'Please type "DELETE MY ACCOUNT" to confirm account deletion',
      };
    }

    if (!password) {
      return {
        success: false,
        message: 'Password is required to delete your account',
      };
    }

    // In a real implementation:
    // 1. Verify password
    // 2. Check for active bookings/trips
    // 3. Process refunds/payments
    // 4. Soft delete or anonymize data
    // 5. Send confirmation email
    
    console.log(`Account deletion requested for user ${user.id}`);

    // For demo purposes, we'll just log and return success
    // In production, this would be a complex multi-step process
    
    return {
      success: true,
      message: 'Account deletion request submitted. You will receive a confirmation email shortly.',
    };

  } catch (error) {
    console.error('Error deleting driver account:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete account',
    };
  }
}

// ============================================================================
// DOCUMENT UPLOAD ACTIONS
// ============================================================================

export async function uploadDocument(
  prevState: DocumentUploadState | undefined,
  formData: FormData
): Promise<DocumentUploadState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();

    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      return {
        success: false,
        message: 'Please select a file to upload',
      };
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file.size > maxSize) {
      return {
        success: false,
        message: 'File size must be less than 10MB',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'Only PDF, JPEG, and PNG files are allowed',
      };
    }

    // In a real implementation:
    // 1. Upload file to cloud storage (S3, Cloudinary, etc.)
    // 2. Create document record in database
    // 3. Update verification status
    
    // Mock upload
    const uploadUrl = `/uploads/documents/${driverProfile.id}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
    const documentId = `doc_${Date.now()}`;
    
    console.log(`Document uploaded for driver ${driverProfile.id}:`, {
      documentType,
      fileName: file.name,
      fileSize: file.size,
      uploadUrl,
      documentId,
    });

    revalidatePath('/dashboard/driver');
    revalidateTag('driver-documents');

    return {
      success: true,
      message: 'Document uploaded successfully. It will be reviewed within 24-48 hours.',
      documentId,
      uploadUrl,
    };

  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload document',
    };
  }
}

export async function replaceDocument(
  prevState: DocumentUploadState | undefined,
  formData: FormData
): Promise<DocumentUploadState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();

    const documentId = formData.get('documentId') as string;
    const file = formData.get('file') as File;

    if (!documentId) {
      return {
        success: false,
        message: 'Document ID is required',
      };
    }

    if (!file || file.size === 0) {
      return {
        success: false,
        message: 'Please select a file to upload',
      };
    }

    // Validate file (same as upload)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (file.size > maxSize) {
      return {
        success: false,
        message: 'File size must be less than 10MB',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'Only PDF, JPEG, and PNG files are allowed',
      };
    }

    // Mock replacement
    const uploadUrl = `/uploads/documents/${driverProfile.id}/updated_${documentId}_${Date.now()}.${file.name.split('.').pop()}`;
    
    console.log(`Document replaced for driver ${driverProfile.id}:`, {
      documentId,
      fileName: file.name,
      fileSize: file.size,
      uploadUrl,
    });

    revalidatePath('/dashboard/driver');
    revalidateTag('driver-documents');

    return {
      success: true,
      message: 'Document replaced successfully. The new version will be reviewed within 24-48 hours.',
      documentId,
      uploadUrl,
    };

  } catch (error) {
    console.error('Error replacing document:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to replace document',
    };
  }
}

// ============================================================================
// VEHICLE MANAGEMENT ACTIONS (extending existing)
// ============================================================================

export async function toggleVehicleStatus(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { driverProfile } = await getAuthenticatedDriver();

    const vehicleId = formData.get('vehicleId') as string;
    const isActive = formData.get('isActive') === 'true';

    if (!vehicleId) {
      return {
        success: false,
        message: 'Vehicle ID is required',
      };
    }

    // Update vehicle status
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        driverId: driverProfile.id,
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: 'Vehicle not found or access denied',
      };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard/driver');
    revalidateTag('driver-vehicles');

    return {
      success: true,
      message: `Vehicle ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { vehicleId, isActive },
    };

  } catch (error) {
    console.error('Error toggling vehicle status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update vehicle status',
    };
  }
}

// ============================================================================
// CONTACT/SUPPORT ACTIONS
// ============================================================================

export async function contactSupport(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const { user, driverProfile } = await getAuthenticatedDriver();

    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as string || 'medium';
    const category = formData.get('category') as string || 'general';

    if (!subject || !message) {
      return {
        success: false,
        message: 'Subject and message are required',
      };
    }

    // Create support ticket (mock implementation)
    const ticketId = `ticket_${Date.now()}`;
    
    const supportTicket = {
      id: ticketId,
      userId: user.id,
      driverId: driverProfile.id,
      subject,
      message,
      priority,
      category,
      status: 'open',
      createdAt: new Date(),
    };

    console.log('Support ticket created:', supportTicket);

    return {
      success: true,
      message: `Support ticket #${ticketId} has been created. Our team will respond within 24 hours.`,
      data: { ticketId },
    };

  } catch (error) {
    console.error('Error contacting support:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to contact support',
    };
  }
}

// ============================================================================
// TIME PERIOD SELECTION ACTION
// ============================================================================

export async function updateTimePeriod(
  prevState: DriverActionState | undefined,
  formData: FormData
): Promise<DriverActionState> {
  try {
    const period = formData.get('period') as string;
    
    if (!period || !['7d', '30d', '90d'].includes(period)) {
      return {
        success: false,
        message: 'Invalid time period',
      };
    }

    // This would typically update user preferences or trigger data refresh
    console.log(`Time period updated to: ${period}`);

    revalidateTag(`earnings-${period}`);

    return {
      success: true,
      message: 'Time period updated',
      data: { period },
    };

  } catch (error) {
    console.error('Error updating time period:', error);
    return {
      success: false,
      message: 'Failed to update time period',
    };
  }
}
