import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock password reset storage (in production, use database)
const resetTokens: Map<string, {
  email: string;
  userId: string;
  expiresAt: Date;
  used: boolean;
}> = new Map();

// Mock user storage (in production, use database)
const mockUsers: Map<string, any> = new Map();

// Mock email service for password reset
const sendPasswordResetEmail = async (email: string, token: string, userName: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  
  console.log(`
    📧 PASSWORD RESET EMAIL (Mock Service)
    To: ${email}
    Subject: Reset Your GCE Account Password
    
    Dear ${userName},
    
    We received a request to reset your password for your GCE account.
    
    Click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request this password reset, please ignore this email.
    Your password will remain unchanged.
    
    Best regards,
    GCE Board Team
  `);
};

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }
    
    // In production, find user in database
    // For now, simulate user lookup
    const user = Array.from(mockUsers.values()).find(u => u.email === email) || {
      id: 'user-123',
      email,
      fullName: 'User'
    };
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.'
      });
    }
    
    // Generate secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store reset token
    resetTokens.set(token, {
      email: user.email,
      userId: user.id,
      expiresAt,
      used: false
    });
    
    // Send password reset email
    await sendPasswordResetEmail(user.email, token, user.fullName);
    
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link.'
    });
    
  } catch (error) {
    console.error('Error processing password reset request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

// Verify reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Reset token is required' },
        { status: 400 }
      );
    }
    
    const resetData = resetTokens.get(token);
    
    if (!resetData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    if (resetData.expiresAt < new Date()) {
      resetTokens.delete(token);
      return NextResponse.json(
        { success: false, message: 'Reset token has expired' },
        { status: 400 }
      );
    }
    
    if (resetData.used) {
      return NextResponse.json(
        { success: false, message: 'Reset token has already been used' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: resetData.email
      }
    });
    
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { success: false, message: 'Token verification failed' },
      { status: 500 }
    );
  }
}
