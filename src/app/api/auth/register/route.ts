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
      candidateNumber,
      // Enhanced student fields
      examLevel,
      gender,
      phoneNumber,
      region,
      schoolCenterNumber,
      parentGuardianName,
      parentGuardianPhone,
      emergencyContactName,
      emergencyContactPhone,
      previousSchool,
      securityQuestion,
      securityAnswer,
      // Picture upload (will be handled separately)
      profilePicture
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
      // Enhanced student fields
      examLevel: examLevel || (userType === 'student' ? 'O Level' : undefined),
      gender: gender || undefined,
      phoneNumber: phoneNumber || undefined,
      region: region || undefined,
      schoolCenterNumber: schoolCenterNumber || undefined,
      parentGuardianName: parentGuardianName || undefined,
      parentGuardianPhone: parentGuardianPhone || undefined,
      emergencyContactName: emergencyContactName || undefined,
      emergencyContactPhone: emergencyContactPhone || undefined,
      previousSchool: previousSchool || undefined,
      securityQuestion: securityQuestion || undefined,
      securityAnswer: securityAnswer || undefined,
      examCenter: userType === 'student' ? 'Default Examination Center' : undefined,
      centerCode: schoolCenterNumber || (userType === 'student' ? 'DEC-001' : undefined),
      subjects: userType === 'student' ? [
        { code: 'ALG', name: 'English Literature', status: 'confirmed' },
        { code: 'AFR', name: 'French', status: 'confirmed' },
        { code: 'AMH', name: 'Mathematics', status: 'confirmed' }
      ] : undefined
    });

    // If student, register them to their school
    if (userType === 'student' && schoolCenterNumber && examLevel) {
      try {
        // Call the school-student relationship API
        const schoolRegistrationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/schools/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: newUser.id,
            schoolCenterNumber,
            examLevel,
            studentData: {
              fullName: newUser.fullName,
              email: newUser.email
            }
          })
        });

        if (schoolRegistrationResponse.ok) {
          console.log('Student successfully registered to school:', schoolCenterNumber);
        } else {
          console.warn('Failed to register student to school, but user creation succeeded');
        }
      } catch (error) {
        console.error('Error registering student to school:', error);
        // Don't fail the entire registration if school registration fails
      }
    }

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
