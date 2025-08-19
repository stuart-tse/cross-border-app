import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { findUserByEmail, sanitizeUserData } from '@/lib/auth/utils';
import { prisma } from '@/lib/database/client';

// PUT /api/client/payment-methods/[id] - Update payment method
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const { 
      cardholderName,
      billingAddress,
      isDefault,
      expiryMonth,
      expiryYear
    } = body;

    // Get client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Verify ownership
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        clientId: clientProfile.id,
        isActive: true
      }
    });

    if (!existingMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (isDefault && !existingMethod.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          clientId: clientProfile.id,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    // Update payment method
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        cardholderName,
        billingAddress,
        isDefault,
        expiryMonth,
        expiryYear
      }
    });

    // Return sanitized data
    const sanitizedMethod = {
      id: updatedMethod.id,
      type: updatedMethod.type,
      last4Digits: updatedMethod.last4Digits,
      cardBrand: updatedMethod.cardBrand,
      expiryMonth: updatedMethod.expiryMonth,
      expiryYear: updatedMethod.expiryYear,
      cardholderName: updatedMethod.cardholderName,
      walletType: updatedMethod.walletType,
      billingAddress: updatedMethod.billingAddress,
      isDefault: updatedMethod.isDefault,
      createdAt: updatedMethod.createdAt
    };

    return NextResponse.json({ paymentMethod: sanitizedMethod });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/client/payment-methods/[id] - Delete payment method
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Get client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Verify ownership
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        clientId: clientProfile.id,
        isActive: true
      }
    });

    if (!existingMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Soft delete (mark as inactive)
    await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false }
    });

    // If this was the default method, set another one as default
    if (existingMethod.isDefault) {
      const nextMethod = await prisma.paymentMethod.findFirst({
        where: {
          clientId: clientProfile.id,
          isActive: true,
          id: { not: id }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (nextMethod) {
        await prisma.paymentMethod.update({
          where: { id: nextMethod.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({ message: 'Payment method deleted successfully' });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}