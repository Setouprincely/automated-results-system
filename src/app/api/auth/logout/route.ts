import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Token blacklist for logout (in production, use Redis or database)
const blacklistedTokens: Set<string> = new Set();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Extract user ID from token (in production, use proper JWT verification)
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const userId = tokenParts.slice(2, -1).join('-'); // Extract user ID from token

    // Find user to validate token
    const user = userStorage.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Add token to blacklist
    blacklistedTokens.add(token);

    // Log logout event
    console.log(`User ${user.email} logged out at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility function to check if token is blacklisted
export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};
