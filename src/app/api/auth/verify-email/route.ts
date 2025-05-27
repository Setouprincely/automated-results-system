import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock email verification storage (in production, use database)
const verificationTokens: Map<string, {
  email: string;
  userId: string;
  expiresAt: Date;
  verified: boolean;
}> = new Map();

// Mock email service (in production, use SendGrid, AWS SES, etc.)
const sendVerificationEmail = async (email: string, token: string, userName: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  
  console.log(`
    📧 EMAIL VERIFICATION (Mock Service)
    To: ${email}
    Subject: Verify Your GCE Account
    
    Dear ${userName},
    
    Welcome to the Cameroon GCE Examination System!
    
    Please click the link below to verify your email address:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create this account, please ignore this email.
    
    Best regards,
    GCE Board Team
  `);
  
  // In production, replace with actual email service:
  // await emailService.send({
  //   to: email,
  //   subject: 'Verify Your GCE Account',
  //   template: 'email-verification',
  //   data: { userName, verificationUrl }
  // });
};

// Generate verification token
export async function POST(request: NextRequest) {
  try {
    const { email, userId, userName } = await request.json();
    
    if (!email || !userId) {
      return NextResponse.json(
        { success: false, message: 'Email and user ID are required' },
        { status: 400 }
      );
    }
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store verification token
    verificationTokens.set(token, {
      email,
      userId,
      expiresAt,
      verified: false
    });
    
    // Send verification email
    await sendVerificationEmail(email, token, userName);
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

// Verify email token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    const verification = verificationTokens.get(token);
    
    if (!verification) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 400 }
      );
    }
    
    if (verification.expiresAt < new Date()) {
      verificationTokens.delete(token);
      return NextResponse.json(
        { success: false, message: 'Verification token has expired' },
        { status: 400 }
      );
    }
    
    if (verification.verified) {
      return NextResponse.json(
        { success: false, message: 'Email already verified' },
        { status: 400 }
      );
    }
    
    // Mark as verified
    verification.verified = true;
    verificationTokens.set(token, verification);
    
    // In production, update user's email verification status in database
    // await updateUserEmailVerification(verification.userId, true);
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: verification.userId,
        email: verification.email
      }
    });
    
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { success: false, message: 'Email verification failed' },
      { status: 500 }
    );
  }
}
