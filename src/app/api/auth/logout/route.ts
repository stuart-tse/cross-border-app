import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧹 Logout API endpoint called for additional cleanup...');
    
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear any custom auth token cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    // Clear NextAuth session cookies (backup cleanup)
    // Note: NextAuth signOut should handle this, but we do it here as fallback
    const sessionCookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
    
    response.cookies.set(sessionCookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Clear CSRF token cookie
    const csrfCookieName = process.env.NODE_ENV === 'production'
      ? '__Host-next-auth.csrf-token'
      : 'next-auth.csrf-token';
    
    response.cookies.set(csrfCookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('✅ Logout API cleanup completed');
    return response;
  } catch (error) {
    console.error('❌ Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}