import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';
import SeparateStudentDatabase from '@/lib/separateStudentDb';
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

    let user = null;
    let examLevel = null;

    // Handle student authentication with separate databases
    if (userType === 'student') {
      console.log(`🔍 Checking student login for email: ${email}`);

      // Check separate student databases
      const studentResult = await SeparateStudentDatabase.findStudentByEmail(email);

      if (studentResult) {
        user = studentResult.student;
        examLevel = studentResult.examLevel;
        console.log(`✅ Found student in ${examLevel} database`);
      } else {
        console.log(`❌ Student not found in separate databases, checking old system...`);
        // Fallback to old system for backward compatibility
        user = await userStorage.findByEmailAndType(email, userType);
      }
    } else {
      // For non-student accounts, use the old system
      user = await userStorage.findByEmailAndType(email, userType);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: `Invalid credentials for ${userType} account. Please check your email, password, and selected account type.` },
        { status: 401 }
      );
    }

    // Additional security: Verify the user type matches (for non-students)
    if (userType !== 'student' && user.userType !== userType) {
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

    // Verify password using appropriate method
    let passwordValid = false;

    if (userType === 'student') {
      console.log(`🔐 Verifying student password...`);

      // Use separate student database password verification
      const verificationResult = await SeparateStudentDatabase.verifyStudentPassword(email, password);
      passwordValid = verificationResult.valid;

      if (passwordValid) {
        console.log(`✅ Student password verified successfully`);
      } else {
        console.log(`❌ Student password verification failed`);
      }
    } else {
      // For non-student accounts, use the old system
      passwordValid = await userStorage.verifyPasswordByType(email, password, userType);
    }

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: `Invalid credentials for ${userType} account. Please check your email, password, and selected account type.` },
        { status: 401 }
      );
    }

    // Check email verification (optional - can be enforced)
    // For development/testing, we'll allow login without email verification
    // In production, you can uncomment this check
    /*
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
    */

    console.log(`📧 Email verification status: ${user.emailVerified ? 'Verified' : 'Not verified (allowing login for development)'}`);


    // Update last login
    userStorage.updateLastLogin(email);

    // Generate authentication token and refresh token
    const authToken = `auth-token-${user.id}-${Date.now()}`;
    const refreshToken = createRefreshToken(user.id);

    // Return successful login response
    const loginResponse = {
      id: user.id,
      email: user.email,
      userType: userType, // Use the verified userType
      name: user.fullName,
      examLevel: examLevel, // Include exam level for students
      token: authToken,
      refreshToken: refreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
      permissions: ['read', 'write'],
      lastLogin: new Date().toISOString(),
      emailVerified: user.emailVerified !== false, // Default to true if not set
      registrationStatus: user.registrationStatus || 'confirmed'
    };

    console.log(`🎉 Login successful for ${userType}: ${user.fullName} (${examLevel || 'N/A'})`);
    console.log(`📋 Login response:`, {
      id: loginResponse.id,
      email: loginResponse.email,
      userType: loginResponse.userType,
      examLevel: loginResponse.examLevel
    });

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
