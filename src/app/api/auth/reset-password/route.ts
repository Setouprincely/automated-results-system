import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock password reset storage (shared with forgot-password)
const resetTokens: Map<string, {
  email: string;
  userId: string;
  expiresAt: Date;
  used: boolean;
}> = new Map();

// Mock user storage (in production, use database)
const mockUsers: Map<string, any> = new Map();

// Hash password (in production, use bcrypt)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Reset password
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json();
    
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 8 characters long with letters, numbers, and special characters' 
        },
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
    
    // Hash the new password
    const hashedPassword = hashPassword(newPassword);
    
    // In production, update user password in database
    // await updateUserPassword(resetData.userId, hashedPassword);
    
    // Mark token as used
    resetData.used = true;
    resetTokens.set(token, resetData);
    
    // Log password reset for security audit
    console.log(`Password reset completed for user: ${resetData.email} at ${new Date().toISOString()}`);
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
