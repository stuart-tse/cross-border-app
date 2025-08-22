// DEPRECATED: This endpoint is deprecated in favor of NextAuth v5
// All authentication should go through NextAuth v5 providers
// This file is kept for backward compatibility but should not be used

import { NextRequest, NextResponse } from 'next/server';

// Legacy code kept for reference - not used in NextAuth v5

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.warn('⚠️ DEPRECATED: Custom login endpoint is deprecated. Use NextAuth v5 signIn() instead.');
  
  return NextResponse.json({
    success: false,
    error: {
      code: 'DEPRECATED_ENDPOINT',
      message: 'This login endpoint is deprecated. Please use NextAuth v5 authentication instead.',
      redirect: '/api/auth/signin'
    }
  }, { status: 410 }); // Gone
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  console.warn('⚠️ DEPRECATED: Custom role switching endpoint is deprecated. Use NextAuth v5 session.update() instead.');
  
  return NextResponse.json({
    success: false,
    error: {
      code: 'DEPRECATED_ENDPOINT',
      message: 'This role switching endpoint is deprecated. Use NextAuth v5 session.update() instead.'
    }
  }, { status: 410 }); // Gone
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: {
      code: 'DEPRECATED_ENDPOINT',
      message: 'This custom login endpoint is deprecated. Use NextAuth v5 authentication.',
      redirect: '/api/auth/signin'
    }
  }, { status: 410 }); // Gone
}