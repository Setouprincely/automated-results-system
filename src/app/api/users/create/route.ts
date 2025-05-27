import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Helper function to check if user is admin
const isAdmin = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
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

    // Check if user is admin
    if (!isAdmin(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      email,
      password,
      userType,
      school,
      dateOfBirth,
      candidateNumber,
      examLevel,
      examCenter,
      centerCode,
      registrationStatus = 'confirmed',
      emailVerified = false
    } = body;

    // Validate required fields
    if (!fullName || !email || !password || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: fullName, email, password, userType' },
        { status: 400 }
      );
    }

    // Validate user type
    if (!['student', 'teacher', 'examiner', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (userStorage.emailExists(email)) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Validate student-specific fields
    if (userType === 'student') {
      if (!candidateNumber) {
        return NextResponse.json(
          { success: false, message: 'Candidate number is required for students' },
          { status: 400 }
        );
      }

      // Check if candidate number already exists
      const existingCandidate = userStorage.getAllUsers().find(u => u.candidateNumber === candidateNumber);
      if (existingCandidate) {
        return NextResponse.json(
          { success: false, message: 'Candidate number already exists' },
          { status: 409 }
        );
      }
    }

    // Validate teacher-specific fields
    if (userType === 'teacher' && !school) {
      return NextResponse.json(
        { success: false, message: 'School is required for teachers' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = userStorage.createUser({
      fullName,
      email,
      password,
      userType: userType as 'student' | 'teacher' | 'examiner' | 'admin',
      school: school || undefined,
      dateOfBirth: dateOfBirth || undefined,
      candidateNumber: candidateNumber || undefined,
      registrationStatus: registrationStatus as 'pending' | 'confirmed' | 'suspended',
      emailVerified,
      examLevel: examLevel || (userType === 'student' ? 'Advanced Level (A Level)' : undefined),
      examCenter: examCenter || (userType === 'student' ? 'Default Examination Center' : undefined),
      centerCode: centerCode || (userType === 'student' ? 'DEC-001' : undefined),
      subjects: userType === 'student' ? [
        { code: 'ALG', name: 'English Literature', status: 'confirmed' },
        { code: 'AFR', name: 'French', status: 'confirmed' },
        { code: 'AMH', name: 'Mathematics', status: 'confirmed' }
      ] : undefined
    });

    // Remove password hash from response
    const { passwordHash, ...safeUser } = newUser;

    // Log admin action
    const adminUserId = token.split('-').slice(2, -1).join('-');
    console.log(`Admin ${adminUserId} created user ${newUser.id} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
