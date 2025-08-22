import { BaseService } from '../base/BaseService';
import { z } from 'zod';

const documentVerificationSchema = z.object({
  documentType: z.enum(['DRIVER_LICENSE', 'PASSPORT', 'ID_CARD', 'VEHICLE_REGISTRATION', 'INSURANCE', 'PERMIT']),
  documentNumber: z.string().min(3).max(50),
  documentUrl: z.string().url(),
  additionalData: z.record(z.any()).optional()
});

const verificationDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING_INFO']),
  notes: z.string().max(1000).optional(),
  requiredActions: z.array(z.string()).default([])
});

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  extractedData: Record<string, any>;
  issues: string[];
  documentType: string;
}

export class VerificationService extends BaseService {
  constructor() {
    super('VerificationService');
  }

  async submitDocumentForVerification(
    userId: string, 
    entityType: 'USER' | 'VEHICLE' | 'DRIVER', 
    entityId: string,
    data: z.infer<typeof documentVerificationSchema>
  ) {
    const validatedData = this.validateInput(documentVerificationSchema, data);

    try {
      // Create verification record
      const verification = await this.db.documentVerification.create({
        data: {
          userId,
          entityType,
          entityId,
          documentType: validatedData.documentType,
          documentNumber: validatedData.documentNumber,
          documentUrl: validatedData.documentUrl,
          additionalData: validatedData.additionalData,
          status: 'PENDING',
          submittedAt: new Date()
        }
      });

      // Perform automatic verification checks
      const autoVerificationResult = await this.performAutoVerification(validatedData);

      // Update verification with auto-check results
      const updatedVerification = await this.db.documentVerification.update({
        where: { id: verification.id },
        data: {
          autoVerificationData: autoVerificationResult,
          confidence: autoVerificationResult.confidence,
          status: autoVerificationResult.isValid && autoVerificationResult.confidence > 0.8 
            ? 'AUTO_APPROVED' 
            : 'PENDING_REVIEW'
        }
      });

      this.logger.info('Document submitted for verification', {
        verificationId: verification.id,
        userId,
        documentType: validatedData.documentType,
        autoVerificationResult: autoVerificationResult.isValid,
        confidence: autoVerificationResult.confidence
      });

      // If auto-approved, trigger additional processes
      if (updatedVerification.status === 'AUTO_APPROVED') {
        await this.handleAutoApprovedDocument(updatedVerification);
      }

      return {
        verificationId: updatedVerification.id,
        status: updatedVerification.status,
        confidence: updatedVerification.confidence,
        autoVerificationResult
      };

    } catch (error) {
      return this.handleError(error, 'submitDocumentForVerification', { userId, entityType, entityId });
    }
  }

  async reviewDocument(
    verificationId: string, 
    reviewerId: string, 
    decision: z.infer<typeof verificationDecisionSchema>
  ) {
    const validatedDecision = this.validateInput(verificationDecisionSchema, decision);

    try {
      const verification = await this.db.documentVerification.findUnique({
        where: { id: verificationId }
      });

      if (!verification) {
        throw new Error('Verification record not found');
      }

      if (verification.status === 'APPROVED' || verification.status === 'REJECTED') {
        throw new Error('Document has already been reviewed');
      }

      const updatedVerification = await this.db.documentVerification.update({
        where: { id: verificationId },
        data: {
          status: validatedDecision.status,
          reviewerId,
          reviewedAt: new Date(),
          reviewNotes: validatedDecision.notes,
          requiredActions: validatedDecision.requiredActions
        }
      });

      this.logger.info('Document reviewed', {
        verificationId,
        reviewerId,
        status: validatedDecision.status,
        userId: verification.userId
      });

      // Handle post-review actions
      await this.handleReviewDecision(updatedVerification);

      return updatedVerification;

    } catch (error) {
      return this.handleError(error, 'reviewDocument', { verificationId, reviewerId });
    }
  }

  async getUserVerifications(userId: string, status?: string) {
    return this.withCache(
      `user_verifications:${userId}:${status || 'all'}`,
      async () => {
        const whereClause: any = { userId };
        if (status) {
          whereClause.status = status;
        }

        return await this.db.documentVerification.findMany({
          where: whereClause,
          orderBy: { submittedAt: 'desc' },
          include: {
            reviewer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
      },
      300 // 5 minutes
    );
  }

  async getVerificationStats(timeframe = 30) {
    return this.withCache(
      `verification_stats:${timeframe}`,
      async () => {
        const fromDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

        const [statusStats, documentTypeStats, reviewerStats] = await Promise.all([
          // Status distribution
          this.db.documentVerification.groupBy({
            by: ['status'],
            where: {
              submittedAt: { gte: fromDate }
            },
            _count: { status: true }
          }),

          // Document type distribution
          this.db.documentVerification.groupBy({
            by: ['documentType'],
            where: {
              submittedAt: { gte: fromDate }
            },
            _count: { documentType: true }
          }),

          // Reviewer performance
          this.db.documentVerification.groupBy({
            by: ['reviewerId'],
            where: {
              reviewedAt: { gte: fromDate },
              reviewerId: { not: null }
            },
            _count: { reviewerId: true },
            _avg: { confidence: true }
          })
        ]);

        const totalSubmissions = statusStats.reduce((acc, stat) => acc + stat._count.status, 0);
        const approvedCount = statusStats.find(s => s.status === 'APPROVED')?._count.status || 0;
        const autoApprovedCount = statusStats.find(s => s.status === 'AUTO_APPROVED')?._count.status || 0;

        return {
          summary: {
            totalSubmissions,
            approvalRate: totalSubmissions > 0 ? ((approvedCount + autoApprovedCount) / totalSubmissions) * 100 : 0,
            autoApprovalRate: totalSubmissions > 0 ? (autoApprovedCount / totalSubmissions) * 100 : 0
          },
          statusDistribution: statusStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          }, {} as Record<string, number>),
          documentTypes: documentTypeStats.reduce((acc, stat) => {
            acc[stat.documentType] = stat._count.documentType;
            return acc;
          }, {} as Record<string, number>),
          reviewerPerformance: reviewerStats.map(stat => ({
            reviewerId: stat.reviewerId,
            reviewCount: stat._count.reviewerId,
            averageConfidence: stat._avg.confidence || 0
          })),
          timeframe: `${timeframe} days`
        };
      },
      1800 // 30 minutes
    );
  }

  async getPendingVerifications(reviewerId?: string, limit = 50) {
    return this.withCache(
      `pending_verifications:${reviewerId || 'all'}:${limit}`,
      async () => {
        const whereClause: any = { status: 'PENDING_REVIEW' };
        if (reviewerId) {
          whereClause.OR = [
            { reviewerId },
            { reviewerId: null }
          ];
        }

        return await this.db.documentVerification.findMany({
          where: whereClause,
          orderBy: [
            { confidence: 'asc' }, // Low confidence first
            { submittedAt: 'asc' }  // Older first
          ],
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        });
      },
      180 // 3 minutes
    );
  }

  async bulkApproveDocuments(verificationIds: string[], reviewerId: string, notes?: string) {
    try {
      const results = await Promise.allSettled(
        verificationIds.map(id => 
          this.reviewDocument(id, reviewerId, {
            status: 'APPROVED',
            notes
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.info('Bulk document approval completed', {
        reviewerId,
        totalDocuments: verificationIds.length,
        successful,
        failed
      });

      return {
        success: true,
        message: `Approved ${successful} documents, ${failed} failed`,
        results: { successful, failed }
      };

    } catch (error) {
      return this.handleError(error, 'bulkApproveDocuments', { reviewerId });
    }
  }

  async rejectDocument(
    verificationId: string, 
    reviewerId: string, 
    reason: string, 
    requiredActions: string[] = []
  ) {
    return this.reviewDocument(verificationId, reviewerId, {
      status: 'REJECTED',
      notes: reason,
      requiredActions
    });
  }

  async requestAdditionalInfo(
    verificationId: string, 
    reviewerId: string, 
    requiredActions: string[], 
    notes?: string
  ) {
    return this.reviewDocument(verificationId, reviewerId, {
      status: 'PENDING_INFO',
      notes,
      requiredActions
    });
  }

  async getDocumentHistory(entityType: string, entityId: string) {
    return this.withCache(
      `document_history:${entityType}:${entityId}`,
      async () => {
        return await this.db.documentVerification.findMany({
          where: {
            entityType,
            entityId
          },
          orderBy: { submittedAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            reviewer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        });
      },
      600 // 10 minutes
    );
  }

  // PRIVATE METHODS
  private async performAutoVerification(data: z.infer<typeof documentVerificationSchema>): Promise<VerificationResult> {
    // Simulate document processing and OCR
    // In a real implementation, this would integrate with services like:
    // - AWS Textract, Google Document AI, Azure Form Recognizer
    // - Third-party verification services
    
    const result: VerificationResult = {
      isValid: true,
      confidence: 0.85,
      extractedData: {},
      issues: [],
      documentType: data.documentType
    };

    try {
      // Simulate different verification logic based on document type
      switch (data.documentType) {
        case 'DRIVER_LICENSE':
          result.extractedData = await this.verifyDriverLicense(data);
          break;
        case 'PASSPORT':
          result.extractedData = await this.verifyPassport(data);
          break;
        case 'VEHICLE_REGISTRATION':
          result.extractedData = await this.verifyVehicleRegistration(data);
          break;
        case 'INSURANCE':
          result.extractedData = await this.verifyInsurance(data);
          break;
        default:
          result.extractedData = await this.verifyGenericDocument(data);
      }

      // Perform additional validation checks
      result.issues = this.validateExtractedData(result.extractedData, data.documentType);
      if (result.issues.length > 0) {
        result.confidence *= 0.7; // Reduce confidence if issues found
      }

    } catch (error) {
      result.isValid = false;
      result.confidence = 0.1;
      result.issues.push('Failed to process document');
      
      this.logger.error('Auto verification failed', {
        documentType: data.documentType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return result;
  }

  private async verifyDriverLicense(data: any): Promise<Record<string, any>> {
    // Simulate OCR and validation for driver's license
    return {
      licenseNumber: data.documentNumber,
      holderName: 'Extracted Name',
      expiryDate: new Date(),
      issuingState: 'Extracted State',
      class: 'Class A'
    };
  }

  private async verifyPassport(data: any): Promise<Record<string, any>> {
    // Simulate passport verification
    return {
      passportNumber: data.documentNumber,
      holderName: 'Extracted Name',
      nationality: 'Extracted Country',
      expiryDate: new Date(),
      issuingCountry: 'Extracted Country'
    };
  }

  private async verifyVehicleRegistration(data: any): Promise<Record<string, any>> {
    // Simulate vehicle registration verification
    return {
      registrationNumber: data.documentNumber,
      vehicleMake: 'Extracted Make',
      vehicleModel: 'Extracted Model',
      year: new Date().getFullYear(),
      ownerName: 'Extracted Owner'
    };
  }

  private async verifyInsurance(data: any): Promise<Record<string, any>> {
    // Simulate insurance document verification
    return {
      policyNumber: data.documentNumber,
      insuredName: 'Extracted Name',
      coverageType: 'Comprehensive',
      effectiveDate: new Date(),
      expiryDate: new Date()
    };
  }

  private async verifyGenericDocument(data: any): Promise<Record<string, any>> {
    // Generic document processing
    return {
      documentNumber: data.documentNumber,
      extractedText: 'Simulated extracted text'
    };
  }

  private validateExtractedData(extractedData: Record<string, any>, documentType: string): string[] {
    const issues: string[] = [];

    // Common validations
    if (!extractedData.documentNumber && !extractedData.licenseNumber && !extractedData.passportNumber) {
      issues.push('Document number not found or illegible');
    }

    // Document-specific validations
    switch (documentType) {
      case 'DRIVER_LICENSE':
        if (extractedData.expiryDate && new Date(extractedData.expiryDate) < new Date()) {
          issues.push('Driver license is expired');
        }
        break;
      case 'PASSPORT':
        if (extractedData.expiryDate && new Date(extractedData.expiryDate) < new Date()) {
          issues.push('Passport is expired');
        }
        break;
      case 'INSURANCE':
        if (extractedData.expiryDate && new Date(extractedData.expiryDate) < new Date()) {
          issues.push('Insurance policy is expired');
        }
        break;
    }

    return issues;
  }

  private async handleAutoApprovedDocument(verification: any) {
    try {
      // Handle different entity types
      switch (verification.entityType) {
        case 'USER':
          await this.updateUserVerificationStatus(verification.userId, true);
          break;
        case 'DRIVER':
          await this.updateDriverApprovalStatus(verification.entityId);
          break;
        case 'VEHICLE':
          await this.updateVehicleVerificationStatus(verification.entityId);
          break;
      }

      this.logger.info('Auto-approved document processed', {
        verificationId: verification.id,
        entityType: verification.entityType,
        entityId: verification.entityId
      });

    } catch (error) {
      this.logger.error('Failed to handle auto-approved document', {
        verificationId: verification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleReviewDecision(verification: any) {
    try {
      if (verification.status === 'APPROVED') {
        await this.handleAutoApprovedDocument(verification);
      }

      // Send notification to user
      // In a real implementation, you would integrate with a notification service
      this.logger.info('Verification decision processed', {
        verificationId: verification.id,
        status: verification.status,
        userId: verification.userId
      });

    } catch (error) {
      this.logger.error('Failed to handle review decision', {
        verificationId: verification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async updateUserVerificationStatus(userId: string, isVerified: boolean) {
    await this.db.user.update({
      where: { id: userId },
      data: { 
        isVerified,
        verifiedAt: isVerified ? new Date() : null
      }
    });
  }

  private async updateDriverApprovalStatus(driverProfileId: string) {
    await this.db.driverProfile.update({
      where: { id: driverProfileId },
      data: { 
        isApproved: true,
        approvedAt: new Date()
      }
    });
  }

  private async updateVehicleVerificationStatus(vehicleId: string) {
    await this.db.vehicle.update({
      where: { id: vehicleId },
      data: { isActive: true }
    });
  }
}