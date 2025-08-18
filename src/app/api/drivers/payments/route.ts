import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getAuthUser } from '@/lib/auth/utils';
import { z } from 'zod';

const withdrawalRequestSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['bank_transfer', 'paypal', 'digital_wallet']),
  notes: z.string().optional(),
});

// Get driver payment information
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can access payment information' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Get pending earnings (completed trips not yet paid out)
    const pendingTrips = await prisma.trip.findMany({
      where: {
        driverId: driverProfile.id,
        status: 'COMPLETED',
        paymentStatus: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    const totalPending = pendingTrips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);

    // Get payment history if requested
    let paymentHistory = [];
    if (includeHistory) {
      const payments = await prisma.driverPayment.findMany({
        where: { driverId: driverProfile.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      paymentHistory = payments.map(payment => ({
        id: payment.id,
        date: payment.createdAt.toISOString().split('T')[0],
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        method: payment.paymentMethod,
        description: payment.description,
        transactionId: payment.transactionId,
      }));
    }

    // Calculate next payout date (mock calculation)
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // Weekly payouts

    // Calculate year-to-date statistics
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    const yearlyTrips = await prisma.trip.findMany({
      where: {
        driverId: driverProfile.id,
        status: 'COMPLETED',
        completedAt: {
          gte: yearStart,
        },
      },
    });

    const ytdEarnings = yearlyTrips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);
    const ytdExpenses = yearlyTrips.length * 50; // Mock expense calculation
    const netIncome = ytdEarnings - ytdExpenses;
    const taxEstimate = netIncome * 0.15; // 15% tax estimate

    return NextResponse.json({
      balance: {
        totalPending,
        nextPayoutDate: nextPayoutDate.toISOString(),
        paymentMethod: 'Bank Transfer', // Would come from driver settings
        accountDetails: '***-***-**1234 (HSBC)', // Masked account details
      },
      yearToDate: {
        earnings: ytdEarnings,
        expenses: ytdExpenses,
        netIncome,
        taxEstimate,
      },
      paymentHistory: includeHistory ? paymentHistory : undefined,
      paymentMethods: [
        {
          id: 'bank-1',
          type: 'bank_transfer',
          accountName: 'John Wong',
          accountNumber: '***-***-**1234',
          bankName: 'HSBC',
          isDefault: true,
        },
      ],
    });
  } catch (error) {
    console.error('Get payment information error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Request withdrawal
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.userType !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Only drivers can request withdrawals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, paymentMethod, notes } = withdrawalRequestSchema.parse(body);

    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (!driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Check available balance
    const pendingTrips = await prisma.trip.findMany({
      where: {
        driverId: driverProfile.id,
        status: 'COMPLETED',
        paymentStatus: { in: ['PENDING', 'PROCESSING'] },
      },
    });

    const availableBalance = pendingTrips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance for withdrawal' },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount check
    if (amount < 100) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is HK$100' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.driverPayment.create({
      data: {
        driverId: driverProfile.id,
        type: 'WITHDRAWAL',
        amount: -amount, // Negative for withdrawal
        status: 'PENDING',
        paymentMethod,
        description: `Withdrawal request${notes ? `: ${notes}` : ''}`,
        requestedAt: new Date(),
      },
    });

    // Update trip payment statuses to mark them as being processed
    await prisma.trip.updateMany({
      where: {
        driverId: driverProfile.id,
        status: 'COMPLETED',
        paymentStatus: 'PENDING',
      },
      data: {
        paymentStatus: 'PROCESSING',
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: user.id, // This should be admin user ID in production
        type: 'WITHDRAWAL_REQUESTED',
        title: 'Withdrawal Request',
        message: `Driver ${user.name} requested withdrawal of HK$${amount}`,
        data: {
          withdrawalId: withdrawal.id,
          driverId: driverProfile.id,
          amount,
          paymentMethod,
        },
      },
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal.id,
        amount,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        estimatedProcessingTime: '2-3 business days',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Withdrawal request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}