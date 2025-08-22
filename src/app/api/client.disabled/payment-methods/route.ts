import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { PaymentMethodType } from '@prisma/client';

// GET /api/client/payment-methods - Get all payment methods
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    // Get client profile ID
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Get payment methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        clientId: clientProfile.id,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Don't return sensitive data
    const sanitizedMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      last4Digits: method.last4Digits,
      cardBrand: method.cardBrand,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      cardholderName: method.cardholderName,
      walletType: method.walletType,
      billingAddress: method.billingAddress,
      isDefault: method.isDefault,
      createdAt: method.createdAt
    }));

    return NextResponse.json({ paymentMethods: sanitizedMethods });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/client/payment-methods - Add new payment method
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    const body = await request.json();
    const {
      type,
      last4Digits,
      cardBrand,
      expiryMonth,
      expiryYear,
      cardholderName,
      walletType,
      walletAccount,
      billingAddress,
      tokenId,
      fingerprint,
      isDefault = false
    } = body;

    // Validate required fields based on type
    if (type === PaymentMethodType.CREDIT_CARD || type === PaymentMethodType.DEBIT_CARD) {
      if (!last4Digits || !cardBrand || !expiryMonth || !expiryYear || !cardholderName) {
        return NextResponse.json(
          { error: 'Missing required card information' },
          { status: 400 }
        );
      }
    } else if (type === PaymentMethodType.DIGITAL_WALLET) {
      if (!walletType) {
        return NextResponse.json(
          { error: 'Wallet type is required for digital wallets' },
          { status: 400 }
        );
      }
    }

    // Get client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          clientId: clientProfile.id,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    // Create new payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        clientId: clientProfile.id,
        type,
        last4Digits,
        cardBrand,
        expiryMonth,
        expiryYear,
        cardholderName,
        walletType,
        walletAccount,
        billingAddress,
        tokenId,
        fingerprint,
        isDefault
      }
    });

    // Return sanitized data
    const sanitizedMethod = {
      id: paymentMethod.id,
      type: paymentMethod.type,
      last4Digits: paymentMethod.last4Digits,
      cardBrand: paymentMethod.cardBrand,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      cardholderName: paymentMethod.cardholderName,
      walletType: paymentMethod.walletType,
      billingAddress: paymentMethod.billingAddress,
      isDefault: paymentMethod.isDefault,
      createdAt: paymentMethod.createdAt
    };

    return NextResponse.json({ paymentMethod: sanitizedMethod }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}