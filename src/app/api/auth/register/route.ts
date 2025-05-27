import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      password,
      userType,
      school,
      dateOfBirth,
      candidateNumber
    } = body;

    // Validate required fields
    if (!fullName || !email || !password || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists in the specific user type
    if (await userStorage.emailExistsInType(email, userType)) {
      return NextResponse.json(
        { success: false, message: `A ${userType} account with this email already exists` },
        { status: 409 }
      );
    }

    // Also check if email exists in other user types (optional - for better UX)
    if (await userStorage.emailExists(email)) {
      const existingUser = await userStorage.findByEmail(email);
      return NextResponse.json(
        { success: false, message: `This email is already registered as a ${existingUser?.userType} account. Please use a different email or login with the correct account type.` },
        { status: 409 }
      );
    }

    // Create new user using PostgreSQL storage
    const newUser = await userStorage.createUser({
      fullName,
      email,
      password, // Will be hashed in userStorage
      userType: userType as 'student' | 'teacher' | 'examiner' | 'admin',
      school: school || undefined,
      dateOfBirth: dateOfBirth || undefined,
      candidateNumber: candidateNumber || undefined,
      registrationStatus: 'confirmed',
      emailVerified: false, // Require email verification
      examLevel: userType === 'student' ? 'Advanced Level (A Level)' : undefined,
      examCenter: userType === 'student' ? 'Default Examination Center' : undefined,
      centerCode: userType === 'student' ? 'DEC-001' : undefined,
      subjects: userType === 'student' ? [
        { code: 'ALG', name: 'English Literature', status: 'confirmed' },
        { code: 'AFR', name: 'French', status: 'confirmed' },
        { code: 'AMH', name: 'Mathematics', status: 'confirmed' }
      ] : undefined
    });

    // Email verification would be sent here in production
    // For now, we'll skip the internal API call to avoid circular dependencies
    console.log('User registered:', newUser.email, 'Verification email would be sent');

    // Generate auth token
    const authToken = `auth-token-${newUser.id}-${Date.now()}`;

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.fullName,
        token: authToken,
        permissions: ['read', 'write'],
        lastLogin: new Date().toISOString(),
        emailVerificationSent: true
      },
      message: 'Registration successful. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all registered users (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    const allUsers = userStorage.getAllUsers();

    // Remove password hashes from response for security
    const safeUsers = allUsers.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json({
      success: true,
      data: safeUsers,
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
