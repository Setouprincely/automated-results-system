import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';
import crypto from 'crypto';

// 2FA verification attempts tracking (prevent brute force)
const verificationAttempts: Map<string, {
  count: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}> = new Map();

// Simplified 2FA storage (in production, use shared database)
const twoFASecrets: Map<string, any> = new Map();

// Verify TOTP code
const verifyTOTP = (secret: string, token: string): boolean => {
  const timeStep = Math.floor(Date.now() / 30000);
  const expectedToken = crypto.createHmac('sha1', secret)
    .update(timeStep.toString())
    .digest('hex')
    .slice(-6);
  
  return token === expectedToken;
};

// Check if user is locked due to too many attempts
const isUserLocked = (userId: string): boolean => {
  const attempts = verificationAttempts.get(userId);
  if (!attempts) return false;
  
  if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
    return true;
  }
  
  return false;
};

// Record failed attempt
const recordFailedAttempt = (userId: string): void => {
  const attempts = verificationAttempts.get(userId) || { count: 0, lastAttempt: new Date() };
  attempts.count += 1;
  attempts.lastAttempt = new Date();
  
  // Lock for 15 minutes after 5 failed attempts
  if (attempts.count >= 5) {
    attempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  verificationAttempts.set(userId, attempts);
};

// Clear failed attempts on successful verification
const clearFailedAttempts = (userId: string): void => {
  verificationAttempts.delete(userId);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, verificationCode, backupCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!verificationCode && !backupCode) {
      return NextResponse.json(
        { success: false, message: 'Verification code or backup code is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = userStorage.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is locked
    if (isUserLocked(user.id)) {
      return NextResponse.json(
        { success: false, message: 'Account temporarily locked due to too many failed attempts. Try again later.' },
        { status: 429 }
      );
    }

    // Verify password
    if (!userStorage.verifyPassword(email, password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    const twoFAData = twoFASecrets.get(user.id);
    if (!twoFAData || !twoFAData.enabled) {
      return NextResponse.json(
        { success: false, message: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    // Verify 2FA code
    let isValidCode = false;

    if (verificationCode) {
      isValidCode = verifyTOTP(twoFAData.secret, verificationCode);
    } else if (backupCode) {
      const codeIndex = twoFAData.backupCodes.indexOf(backupCode.toUpperCase());
      if (codeIndex !== -1) {
        // Remove used backup code
        twoFAData.backupCodes.splice(codeIndex, 1);
        twoFASecrets.set(user.id, twoFAData);
        isValidCode = true;
      }
    }

    if (!isValidCode) {
      recordFailedAttempt(user.id);
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful verification
    clearFailedAttempts(user.id);

    // Update last login
    userStorage.updateLastLogin(email);

    // Generate authentication token
    const authToken = `auth-token-${user.id}-${Date.now()}`;

    // Return successful login response
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        name: user.fullName,
        token: authToken,
        permissions: ['read', 'write'],
        lastLogin: new Date().toISOString(),
        emailVerified: user.emailVerified,
        registrationStatus: user.registrationStatus,
        twoFactorEnabled: true
      },
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
