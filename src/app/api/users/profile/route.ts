import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Helper function to extract user ID from token
const getUserIdFromToken = (token: string): string | null => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return null;
  return tokenParts.slice(2, -1).join('-');
};

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const user = userStorage.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const user = userStorage.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      school,
      dateOfBirth,
      candidateNumber,
      examLevel,
      examCenter,
      centerCode
    } = body;

    // Validate required fields based on user type
    if (user.userType === 'student' && candidateNumber && candidateNumber !== user.candidateNumber) {
      // Check if candidate number is already taken
      const existingUser = userStorage.getAllUsers().find(u => 
        u.candidateNumber === candidateNumber && u.id !== userId
      );
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Candidate number already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<typeof user> = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (school !== undefined) updateData.school = school;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (candidateNumber !== undefined) updateData.candidateNumber = candidateNumber;
    if (examLevel !== undefined) updateData.examLevel = examLevel;
    if (examCenter !== undefined) updateData.examCenter = examCenter;
    if (centerCode !== undefined) updateData.centerCode = centerCode;

    // Update user
    const updatedUser = userStorage.updateUser(user.email, updateData);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Remove sensitive information
    const { passwordHash, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
