import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';
import crypto from 'crypto';

// 2FA secrets storage (in production, store in database)
const twoFASecrets: Map<string, {
  secret: string;
  backupCodes: string[];
  enabled: boolean;
  createdAt: Date;
}> = new Map();

// Generate TOTP secret
const generateTOTPSecret = (): string => {
  return crypto.randomBytes(20).toString('base32');
};

// Generate backup codes
const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Generate QR code URL for authenticator apps
const generateQRCodeURL = (email: string, secret: string): string => {
  const issuer = 'GCE Examination System';
  const label = `${issuer}:${email}`;
  return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
};

// Verify TOTP code (simplified - in production, use proper TOTP library)
const verifyTOTP = (secret: string, token: string): boolean => {
  // This is a simplified verification
  // In production, use libraries like 'otplib' or 'speakeasy'
  const timeStep = Math.floor(Date.now() / 30000);
  const expectedToken = crypto.createHmac('sha1', secret)
    .update(timeStep.toString())
    .digest('hex')
    .slice(-6);
  
  return token === expectedToken;
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { password, verificationCode } = body;

    // Verify current password
    if (!userStorage.verifyPassword(user.email, password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if 2FA is already enabled
    const existing2FA = twoFASecrets.get(userId);
    if (existing2FA && existing2FA.enabled) {
      return NextResponse.json(
        { success: false, message: '2FA is already enabled' },
        { status: 400 }
      );
    }

    if (!verificationCode) {
      // Step 1: Generate secret and return QR code
      const secret = generateTOTPSecret();
      const backupCodes = generateBackupCodes();
      const qrCodeURL = generateQRCodeURL(user.email, secret);

      // Store temporarily (not enabled yet)
      twoFASecrets.set(userId, {
        secret,
        backupCodes,
        enabled: false,
        createdAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: {
          secret,
          qrCodeURL,
          backupCodes,
          manualEntryKey: secret
        },
        message: 'Scan the QR code with your authenticator app and enter the verification code'
      });
    } else {
      // Step 2: Verify code and enable 2FA
      const tempData = twoFASecrets.get(userId);
      if (!tempData) {
        return NextResponse.json(
          { success: false, message: 'No 2FA setup in progress' },
          { status: 400 }
        );
      }

      // Verify the TOTP code
      if (!verifyTOTP(tempData.secret, verificationCode)) {
        return NextResponse.json(
          { success: false, message: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Enable 2FA
      tempData.enabled = true;
      twoFASecrets.set(userId, tempData);

      return NextResponse.json({
        success: true,
        data: {
          backupCodes: tempData.backupCodes
        },
        message: '2FA enabled successfully. Save your backup codes in a secure location.'
      });
    }

  } catch (error) {
    console.error('Enable 2FA error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
