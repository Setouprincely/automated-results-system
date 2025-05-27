import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import 2FA storage from enable-2fa (in production, use shared database)
// This is a simplified approach - in production, use proper shared storage
const twoFASecrets: Map<string, any> = new Map();

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
    const { password, verificationCode, backupCode } = body;

    // Verify current password
    if (!userStorage.verifyPassword(user.email, password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    const twoFAData = twoFASecrets.get(userId);
    if (!twoFAData || !twoFAData.enabled) {
      return NextResponse.json(
        { success: false, message: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify 2FA code or backup code
    let isValidCode = false;

    if (verificationCode) {
      // Verify TOTP code (simplified)
      const timeStep = Math.floor(Date.now() / 30000);
      const expectedToken = require('crypto').createHmac('sha1', twoFAData.secret)
        .update(timeStep.toString())
        .digest('hex')
        .slice(-6);
      
      isValidCode = verificationCode === expectedToken;
    } else if (backupCode) {
      // Verify backup code
      const codeIndex = twoFAData.backupCodes.indexOf(backupCode.toUpperCase());
      if (codeIndex !== -1) {
        // Remove used backup code
        twoFAData.backupCodes.splice(codeIndex, 1);
        isValidCode = true;
      }
    }

    if (!isValidCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code or backup code' },
        { status: 400 }
      );
    }

    // Disable 2FA
    twoFASecrets.delete(userId);

    // Log security event
    console.log(`2FA disabled for user ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
