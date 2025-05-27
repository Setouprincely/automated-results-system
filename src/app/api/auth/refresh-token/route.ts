import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';
import { isTokenBlacklisted } from '../logout/route';

// Refresh token storage (in production, use database with expiration)
const refreshTokens: Map<string, {
  userId: string;
  expiresAt: Date;
  issuedAt: Date;
}> = new Map();

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  const token = `refresh-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  refreshTokens.set(token, {
    userId,
    expiresAt,
    issuedAt: new Date()
  });
  
  return token;
};

// Generate access token
const generateAccessToken = (userId: string): string => {
  return `auth-token-${userId}-${Date.now()}`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Check if refresh token exists and is valid
    const tokenData = refreshTokens.get(refreshToken);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if refresh token is expired
    if (tokenData.expiresAt < new Date()) {
      refreshTokens.delete(refreshToken);
      return NextResponse.json(
        { success: false, message: 'Refresh token expired' },
        { status: 401 }
      );
    }

    // Find user
    const user = userStorage.findById(tokenData.userId);
    if (!user) {
      refreshTokens.delete(refreshToken);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    // Check if user account is still active
    if (user.registrationStatus !== 'confirmed') {
      return NextResponse.json(
        { success: false, message: 'Account is not active' },
        { status: 403 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id);
    
    // Optionally generate new refresh token (token rotation)
    const newRefreshToken = generateRefreshToken(user.id);
    
    // Remove old refresh token
    refreshTokens.delete(refreshToken);

    // Update last login
    userStorage.updateLastLogin(user.email);

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600, // 1 hour
        tokenType: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          userType: user.userType
        }
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility function to generate refresh token for login
export const createRefreshToken = (userId: string): string => {
  return generateRefreshToken(userId);
};
