import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { auth } from '@/lib/auth/config';
import { findUserByEmail, sanitizeUserData, hasRole } from '@/lib/auth/utils';
import { UserType } from '@prisma/client';
import { z } from 'zod';

const uploadDocumentSchema = z.object({
  documentType: z.enum([
    'DRIVING_LICENSE',
    'VEHICLE_REGISTRATION', 
    'INSURANCE_HK',
    'INSURANCE_CHINA',
    'PASSPORT',
    'ID_CARD',
    'BUSINESS_LICENSE'
  ]),
  fileUrl: z.string().url('Invalid file URL'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  expiryDate: z.string().datetime().optional(),
});

// Get driver verification documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email!;
    const dbUser = await findUserByEmail(userEmail);
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = sanitizeUserData(dbUser);

    if (!hasRole(user, UserType.DRIVER)) {
      return NextResponse.json(
        { error: 'Only drivers can access verification documents' },
        { status: 403 }
      );
    }

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
      include: {
        verificationDocs: {
          orderBy: { uploadedAt: 'desc' }
        },
        vehicles: true,
      },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Group documents by type for easier frontend handling
    const documentsByType = driverProfile.verificationDocs.reduce((acc, doc) => {
      if (!acc[doc.documentType]) {
        acc[doc.documentType] = [];
      }
      acc[doc.documentType].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate verification status
    const requiredDocs = [
      'DRIVING_LICENSE',
      'VEHICLE_REGISTRATION',
      'INSURANCE_HK',
      'INSURANCE_CHINA',
      'ID_CARD'
    ];

    const verificationStatus = {
      isComplete: false,
      completedDocs: 0,
      totalRequired: requiredDocs.length,
      missingDocs: [] as string[],
      pendingDocs: [] as string[],
      approvedDocs: [] as string[],
      rejectedDocs: [] as string[],
    };

    requiredDocs.forEach(docType => {
      const docs = documentsByType[docType] || [];
      const latestDoc = docs[0]; // Most recent document

      if (!latestDoc) {
        verificationStatus.missingDocs.push(docType);
      } else {
        switch (latestDoc.status) {
          case 'APPROVED':
            verificationStatus.approvedDocs.push(docType);
            verificationStatus.completedDocs++;
            break;
          case 'PENDING':
            verificationStatus.pendingDocs.push(docType);
            break;
          case 'REJECTED':
            verificationStatus.rejectedDocs.push(docType);
            break;
        }
      }
    });

    verificationStatus.isComplete = 
      verificationStatus.completedDocs === verificationStatus.totalRequired;

    return NextResponse.json({
      profile: {
        id: driverProfile.id,
        isApproved: driverProfile.isApproved,
        licenseNumber: driverProfile.licenseNumber,
        licenseExpiry: driverProfile.licenseExpiry,
        rating: driverProfile.rating,
        totalTrips: driverProfile.totalTrips,
      },
      documents: documentsByType,
      verificationStatus,
      vehicles: driverProfile.vehicles,
    });
  } catch (error) {
    console.error('Get verification documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Upload verification document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email!;
    const dbUser = await findUserByEmail(userEmail);
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = sanitizeUserData(dbUser);

    if (!hasRole(user, UserType.DRIVER)) {
      return NextResponse.json(
        { error: 'Only drivers can upload verification documents' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = uploadDocumentSchema.parse(body);

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Check file size (max 10MB)
    if (validatedData.fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(validatedData.mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF files allowed.' },
        { status: 400 }
      );
    }

    const document = await prisma.driverVerificationDoc.create({
      data: {
        driverId: driverProfile.id,
        documentType: validatedData.documentType,
        fileUrl: validatedData.fileUrl,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        status: 'PENDING',
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: user.id, // This should be admin user ID in production
        type: 'DOCUMENT_APPROVED', // Will be updated when reviewed
        title: 'New Verification Document Uploaded',
        message: `Driver ${user.name} uploaded ${validatedData.documentType.replace('_', ' ').toLowerCase()} for verification`,
        data: {
          documentId: document.id,
          driverId: driverProfile.id,
          documentType: validatedData.documentType,
        },
      },
    });

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        documentType: document.documentType,
        fileName: document.fileName,
        status: document.status,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Upload verification document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}