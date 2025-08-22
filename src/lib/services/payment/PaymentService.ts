import { BaseService } from '../base/BaseService';
import { PaymentRepository } from '@/lib/repositories/PaymentRepository';
import { Payment, PaymentStatus, PaymentMethod, Currency } from '@prisma/client';
import { z } from 'zod';
import Stripe from 'stripe';

const createPaymentSchema = z.object({
  bookingId: z.string().cuid(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.nativeEnum(Currency).default('USD'),
  method: z.nativeEnum(PaymentMethod),
  paymentIntentId: z.string().optional(),
  metadata: z.record(z.any()).default({})
});

const refundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.enum(['REQUESTED_BY_CUSTOMER', 'DUPLICATE', 'FRAUDULENT', 'SUBSCRIPTION_CANCELED', 'OTHER']),
  notes: z.string().max(500).optional()
});

const processPaymentSchema = z.object({
  paymentMethodId: z.string(),
  savePaymentMethod: z.boolean().default(false),
  setupFutureUsage: z.enum(['off_session', 'on_session']).optional()
});

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
}

export class PaymentService extends BaseService {
  private paymentRepository: PaymentRepository;
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(paymentRepository: PaymentRepository, stripeConfig: StripeConfig) {
    super('PaymentService');
    this.paymentRepository = paymentRepository;
    this.stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2023-10-16'
    });
    this.webhookSecret = stripeConfig.webhookSecret;
  }

  async createPaymentIntent(
    userId: string, 
    data: z.infer<typeof createPaymentSchema>
  ) {
    const validatedData = this.validateInput(createPaymentSchema, data);

    try {
      // Get booking details
      const booking = await this.db.booking.findUnique({
        where: { id: validatedData.bookingId },
        include: {
          client: { include: { user: true } },
          driver: { include: { user: true } }
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.clientId !== userId) {
        throw new Error('Unauthorized to create payment for this booking');
      }

      if (booking.paymentStatus === 'COMPLETED') {
        throw new Error('Booking payment already completed');
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(validatedData.amount * 100), // Convert to cents
        currency: validatedData.currency.toLowerCase(),
        customer: booking.client.stripeCustomerId || undefined,
        metadata: {
          bookingId: validatedData.bookingId,
          userId,
          ...validatedData.metadata
        },
        automatic_payment_methods: {
          enabled: true
        },
        capture_method: 'automatic'
      });

      // Create payment record
      const payment = await this.paymentRepository.create({
        ...validatedData,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
        clientSecret: paymentIntent.client_secret
      });

      // Update booking payment status
      await this.db.booking.update({
        where: { id: validatedData.bookingId },
        data: { paymentStatus: 'PROCESSING' }
      });

      this.logger.info('Payment intent created', {
        paymentId: payment.id,
        paymentIntentId: paymentIntent.id,
        bookingId: validatedData.bookingId,
        amount: validatedData.amount,
        userId
      });

      return {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };

    } catch (error) {
      return this.handleError(error, 'createPaymentIntent', { userId, bookingId: validatedData.bookingId });
    }
  }

  async processPayment(
    paymentId: string, 
    data: z.infer<typeof processPaymentSchema>
  ) {
    const validatedData = this.validateInput(processPaymentSchema, data);

    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'PENDING') {
        throw new Error('Payment is not in pending status');
      }

      // Confirm PaymentIntent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        payment.stripePaymentIntentId!,
        {
          payment_method: validatedData.paymentMethodId,
          setup_future_usage: validatedData.setupFutureUsage,
          return_url: process.env.PAYMENT_SUCCESS_URL
        }
      );

      // Update payment status based on PaymentIntent status
      let paymentStatus: PaymentStatus = 'PROCESSING';
      if (paymentIntent.status === 'succeeded') {
        paymentStatus = 'COMPLETED';
      } else if (paymentIntent.status === 'requires_action') {
        paymentStatus = 'REQUIRES_ACTION';
      } else if (paymentIntent.status === 'payment_failed') {
        paymentStatus = 'FAILED';
      }

      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: paymentStatus,
        processedAt: paymentStatus === 'COMPLETED' ? new Date() : undefined,
        stripeChargeId: paymentIntent.charges.data[0]?.id
      });

      // Update booking if payment completed
      if (paymentStatus === 'COMPLETED') {
        await this.handleSuccessfulPayment(updatedPayment);
      }

      this.logger.info('Payment processed', {
        paymentId,
        status: paymentStatus,
        paymentIntentId: payment.stripePaymentIntentId
      });

      return {
        status: paymentStatus,
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action
      };

    } catch (error) {
      // Update payment status to failed
      await this.paymentRepository.update(paymentId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Payment failed'
      });

      return this.handleError(error, 'processPayment', { paymentId });
    }
  }

  async refundPayment(
    paymentId: string, 
    refundData: z.infer<typeof refundSchema>, 
    refundedBy: string
  ) {
    const validatedData = this.validateInput(refundSchema, refundData);

    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'COMPLETED') {
        throw new Error('Only completed payments can be refunded');
      }

      if (payment.refundedAmount && payment.refundedAmount >= payment.amount) {
        throw new Error('Payment already fully refunded');
      }

      const refundAmount = validatedData.amount || (payment.amount - (payment.refundedAmount || 0));
      const maxRefundAmount = payment.amount - (payment.refundedAmount || 0);

      if (refundAmount > maxRefundAmount) {
        throw new Error(`Refund amount cannot exceed ${maxRefundAmount}`);
      }

      // Create Stripe refund
      const refund = await this.stripe.refunds.create({
        charge: payment.stripeChargeId!,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: validatedData.reason.toLowerCase() as any,
        metadata: {
          paymentId,
          refundedBy,
          notes: validatedData.notes || ''
        }
      });

      // Create refund record
      const refundRecord = await this.db.refund.create({
        data: {
          paymentId,
          amount: refundAmount,
          currency: payment.currency,
          reason: validatedData.reason,
          notes: validatedData.notes,
          stripeRefundId: refund.id,
          status: 'PROCESSING',
          requestedBy: refundedBy
        }
      });

      // Update payment refund amount
      const newRefundedAmount = (payment.refundedAmount || 0) + refundAmount;
      const paymentStatus = newRefundedAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await this.paymentRepository.update(paymentId, {
        refundedAmount: newRefundedAmount,
        status: paymentStatus
      });

      // Update booking if fully refunded
      if (paymentStatus === 'REFUNDED') {
        await this.db.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'REFUNDED' }
        });
      }

      this.logger.info('Refund processed', {
        paymentId,
        refundId: refundRecord.id,
        refundAmount,
        refundedBy
      });

      return refundRecord;

    } catch (error) {
      return this.handleError(error, 'refundPayment', { paymentId, refundedBy });
    }
  }

  async getPaymentHistory(
    userId: string, 
    filters: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const cacheKey = `payment_history:${userId}:${JSON.stringify({ ...otherFilters, page, limit })}`;

    return this.withCache(
      cacheKey,
      async () => {
        return await this.paymentRepository.findByUserWithPagination(
          userId,
          otherFilters,
          page,
          limit
        );
      },
      300 // 5 minutes
    );
  }

  async getPaymentStats(userId?: string, timeframe = 30) {
    const cacheKey = `payment_stats:${userId || 'all'}:${timeframe}`;
    
    return this.withCache(
      cacheKey,
      async () => {
        const fromDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
        const whereClause: any = {
          createdAt: { gte: fromDate }
        };

        if (userId) {
          whereClause.userId = userId;
        }

        const [statusStats, methodStats, earningsStats] = await Promise.all([
          this.db.payment.groupBy({
            by: ['status'],
            where: whereClause,
            _count: { status: true },
            _sum: { amount: true }
          }),

          this.db.payment.groupBy({
            by: ['method'],
            where: whereClause,
            _count: { method: true }
          }),

          this.db.payment.aggregate({
            where: { ...whereClause, status: 'COMPLETED' },
            _sum: { amount: true },
            _avg: { amount: true },
            _count: { id: true }
          })
        ]);

        return {
          summary: {
            totalRevenue: earningsStats._sum.amount || 0,
            averagePayment: earningsStats._avg.amount || 0,
            totalTransactions: earningsStats._count
          },
          statusDistribution: statusStats.reduce((acc, stat) => {
            acc[stat.status] = {
              count: stat._count.status,
              amount: stat._sum.amount || 0
            };
            return acc;
          }, {} as Record<string, { count: number; amount: number }>),
          methodDistribution: methodStats.reduce((acc, stat) => {
            acc[stat.method] = stat._count.method;
            return acc;
          }, {} as Record<string, number>),
          timeframe: `${timeframe} days`
        };
      },
      1800 // 30 minutes
    );
  }

  async handleStripeWebhook(signature: string, payload: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      this.logger.info('Stripe webhook received', {
        eventType: event.type,
        eventId: event.id
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute);
          break;
        case 'refund.updated':
          await this.handleRefundUpdated(event.data.object as Stripe.Refund);
          break;
        default:
          this.logger.info('Unhandled webhook event', { eventType: event.type });
      }

      return { received: true };

    } catch (error) {
      this.logger.error('Webhook processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async savePaymentMethod(userId: string, stripePaymentMethodId: string) {
    try {
      // Retrieve payment method details from Stripe
      const paymentMethod = await this.stripe.paymentMethods.retrieve(stripePaymentMethodId);

      // Get or create Stripe customer
      let customer = await this.db.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true }
      });

      if (!customer?.stripeCustomerId) {
        const stripeCustomer = await this.stripe.customers.create({
          metadata: { userId }
        });

        await this.db.user.update({
          where: { id: userId },
          data: { stripeCustomerId: stripeCustomer.id }
        });

        customer = { stripeCustomerId: stripeCustomer.id };
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(stripePaymentMethodId, {
        customer: customer.stripeCustomerId!
      });

      // Save payment method to database
      const savedPaymentMethod = await this.db.savedPaymentMethod.create({
        data: {
          userId,
          stripePaymentMethodId,
          type: paymentMethod.type as PaymentMethod,
          last4: paymentMethod.card?.last4 || '',
          brand: paymentMethod.card?.brand || '',
          expiryMonth: paymentMethod.card?.exp_month,
          expiryYear: paymentMethod.card?.exp_year,
          isDefault: false
        }
      });

      this.logger.info('Payment method saved', {
        userId,
        paymentMethodId: savedPaymentMethod.id,
        type: paymentMethod.type
      });

      return savedPaymentMethod;

    } catch (error) {
      return this.handleError(error, 'savePaymentMethod', { userId });
    }
  }

  async getUserPaymentMethods(userId: string) {
    return this.withCache(
      `payment_methods:${userId}`,
      async () => {
        return await this.db.savedPaymentMethod.findMany({
          where: { 
            userId,
            isActive: true
          },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' }
          ]
        });
      },
      300 // 5 minutes
    );
  }

  // PRIVATE METHODS
  private async handleSuccessfulPayment(payment: Payment) {
    try {
      // Update booking status
      await this.db.booking.update({
        where: { id: payment.bookingId },
        data: { 
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });

      // Create transaction record for accounting
      await this.db.transaction.create({
        data: {
          paymentId: payment.id,
          type: 'PAYMENT',
          amount: payment.amount,
          currency: payment.currency,
          description: `Payment for booking ${payment.bookingId}`
        }
      });

      // Calculate driver earnings (e.g., 80% of total)
      const driverEarnings = payment.amount * 0.8;
      const platformFee = payment.amount * 0.2;

      await this.db.transaction.createMany({
        data: [
          {
            paymentId: payment.id,
            type: 'DRIVER_EARNING',
            amount: driverEarnings,
            currency: payment.currency,
            description: `Driver earnings for booking ${payment.bookingId}`
          },
          {
            paymentId: payment.id,
            type: 'PLATFORM_FEE',
            amount: platformFee,
            currency: payment.currency,
            description: `Platform fee for booking ${payment.bookingId}`
          }
        ]
      });

      this.logger.info('Payment success processing completed', {
        paymentId: payment.id,
        bookingId: payment.bookingId
      });

    } catch (error) {
      this.logger.error('Failed to process successful payment', {
        paymentId: payment.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.db.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (payment && payment.status !== 'COMPLETED') {
      await this.paymentRepository.update(payment.id, {
        status: 'COMPLETED',
        processedAt: new Date(),
        stripeChargeId: paymentIntent.charges.data[0]?.id
      });

      await this.handleSuccessfulPayment({ ...payment, status: 'COMPLETED' });
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.db.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await this.paymentRepository.update(payment.id, {
        status: 'FAILED',
        errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed'
      });

      // Update booking payment status
      await this.db.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'FAILED' }
      });
    }
  }

  private async handleChargeDispute(dispute: Stripe.Dispute) {
    const payment = await this.db.payment.findFirst({
      where: { stripeChargeId: dispute.charge }
    });

    if (payment) {
      await this.db.dispute.create({
        data: {
          paymentId: payment.id,
          stripeDisputeId: dispute.id,
          amount: dispute.amount / 100, // Convert from cents
          currency: dispute.currency.toUpperCase() as Currency,
          reason: dispute.reason,
          status: dispute.status.toUpperCase(),
          createdAt: new Date(dispute.created * 1000)
        }
      });

      this.logger.warn('Payment dispute created', {
        paymentId: payment.id,
        disputeId: dispute.id,
        amount: dispute.amount / 100
      });
    }
  }

  private async handleRefundUpdated(refund: Stripe.Refund) {
    const refundRecord = await this.db.refund.findFirst({
      where: { stripeRefundId: refund.id }
    });

    if (refundRecord) {
      await this.db.refund.update({
        where: { id: refundRecord.id },
        data: {
          status: refund.status.toUpperCase() as any,
          processedAt: refund.status === 'succeeded' ? new Date() : undefined
        }
      });
    }
  }
}