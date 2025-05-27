import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Helper function to check if user is admin or accessing own profile
const canAccessUser = (token: string, targetUserId: string): { canAccess: boolean; isAdmin: boolean; currentUserId: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const currentUserId = tokenParts.slice(2, -1).join('-');
  const currentUser = userStorage.findById(currentUserId);
  
  if (!currentUser) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const isAdmin = currentUser.userType === 'admin';
  const isOwnProfile = currentUserId === targetUserId;
  
  return {
    canAccess: isAdmin || isOwnProfile,
    isAdmin,
    currentUserId
  };
};

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { canAccess } = canAccessUser(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const user = userStorage.findById(id);
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
      message: 'User retrieved successfully'
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { canAccess, isAdmin, currentUserId } = canAccessUser(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const user = userStorage.findById(id);
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
      centerCode,
      registrationStatus,
      emailVerified
    } = body;

    // Prepare update data
    const updateData: any = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (school !== undefined) updateData.school = school;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (candidateNumber !== undefined) updateData.candidateNumber = candidateNumber;
    if (examLevel !== undefined) updateData.examLevel = examLevel;
    if (examCenter !== undefined) updateData.examCenter = examCenter;
    if (centerCode !== undefined) updateData.centerCode = centerCode;

    // Only admins can update these fields
    if (isAdmin) {
      if (registrationStatus !== undefined) updateData.registrationStatus = registrationStatus;
      if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    }

    // Validate candidate number uniqueness for students
    if (candidateNumber && user.userType === 'student' && candidateNumber !== user.candidateNumber) {
      const existingUser = userStorage.getAllUsers().find(u => 
        u.candidateNumber === candidateNumber && u.id !== id
      );
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Candidate number already exists' },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = userStorage.updateUser(user.email, updateData);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Remove sensitive information
    const { passwordHash, ...safeUser } = updatedUser;

    // Log admin action
    if (isAdmin && currentUserId !== id) {
      console.log(`Admin ${currentUserId} updated user ${id} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { isAdmin, currentUserId } = canAccessUser(token, id);

    // Only admins can delete users, and they can't delete themselves
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    if (currentUserId === id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = userStorage.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    const deleted = userStorage.deleteUser(user.email);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Log admin action
    console.log(`Admin ${currentUserId} deleted user ${id} (${user.email}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
