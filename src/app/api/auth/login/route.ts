import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';
import { createRefreshToken } from '../refresh-token/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userType } = body;

    // Validate input
    if (!email || !password || !userType) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and user type are required' },
        { status: 400 }
      );
    }

    // Validate userType
    if (!['student', 'teacher', 'examiner', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Find user by email and user type (secure authentication)
    const user = await userStorage.findByEmailAndType(email, userType);

    if (!user) {
      return NextResponse.json(
        { success: false, message: `Invalid credentials for ${userType} account. Please check your email, password, and selected account type.` },
        { status: 401 }
      );
    }

    // Additional security: Verify the user type matches
    if (user.userType !== userType) {
      return NextResponse.json(
        { success: false, message: `This email is not registered as a ${userType} account. Please select the correct account type.` },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (user.registrationStatus === 'suspended') {
      return NextResponse.json(
        { success: false, message: 'Account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    if (user.registrationStatus === 'pending') {
      return NextResponse.json(
        { success: false, message: 'Account is pending approval. Please wait for confirmation.' },
        { status: 403 }
      );
    }

    // Verify password using secure method (checks only the specific user type)
    if (!(await userStorage.verifyPasswordByType(email, password, userType))) {
      return NextResponse.json(
        { success: false, message: `Invalid credentials for ${userType} account. Please check your email, password, and selected account type.` },
        { status: 401 }
      );
    }

    // Check email verification (optional - can be enforced)
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please verify your email address before logging in.',
          requiresEmailVerification: true
        },
        { status: 403 }
      );
    }

    // Update last login
    userStorage.updateLastLogin(email);

    // Generate authentication token and refresh token
    const authToken = `auth-token-${user.id}-${Date.now()}`;
    const refreshToken = createRefreshToken(user.id);

    // Return successful login response
    const loginResponse = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      name: user.fullName,
      token: authToken,
      refreshToken: refreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
      permissions: ['read', 'write'],
      lastLogin: new Date().toISOString(),
      emailVerified: user.emailVerified,
      registrationStatus: user.registrationStatus
    };

    return NextResponse.json({
      success: true,
      data: loginResponse,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
