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

// Validate user data
const validateUserData = (userData: any, index: number): string[] => {
  const errors: string[] = [];
  const rowNumber = index + 1;

  // Required fields
  if (!userData.fullName || userData.fullName.trim() === '') {
    errors.push(`Row ${rowNumber}: Full name is required`);
  }

  if (!userData.email || userData.email.trim() === '') {
    errors.push(`Row ${rowNumber}: Email is required`);
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`);
    }
  }

  if (!userData.password || userData.password.trim() === '') {
    errors.push(`Row ${rowNumber}: Password is required`);
  } else if (userData.password.length < 8) {
    errors.push(`Row ${rowNumber}: Password must be at least 8 characters long`);
  }

  if (!userData.userType || !['student', 'teacher', 'examiner', 'admin'].includes(userData.userType)) {
    errors.push(`Row ${rowNumber}: Invalid user type. Must be: student, teacher, examiner, or admin`);
  }

  // Student-specific validation
  if (userData.userType === 'student') {
    if (!userData.candidateNumber || userData.candidateNumber.trim() === '') {
      errors.push(`Row ${rowNumber}: Candidate number is required for students`);
    }
  }

  // Teacher-specific validation
  if (userData.userType === 'teacher') {
    if (!userData.school || userData.school.trim() === '') {
      errors.push(`Row ${rowNumber}: School is required for teachers`);
    }
  }

  return errors;
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
    const { users: usersData, validateOnly = false } = body;

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Users array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (usersData.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Maximum 1000 users allowed per batch' },
        { status: 400 }
      );
    }

    // Validate all user data
    const validationErrors: string[] = [];
    const emailSet = new Set<string>();
    const candidateNumberSet = new Set<string>();

    usersData.forEach((userData, index) => {
      // Basic validation
      const errors = validateUserData(userData, index);
      validationErrors.push(...errors);

      // Check for duplicate emails within the batch
      if (userData.email) {
        const email = userData.email.toLowerCase();
        if (emailSet.has(email)) {
          validationErrors.push(`Row ${index + 1}: Duplicate email in batch`);
        } else {
          emailSet.add(email);
          
          // Check if email already exists in system
          if (userStorage.emailExists(userData.email)) {
            validationErrors.push(`Row ${index + 1}: Email already exists in system`);
          }
        }
      }

      // Check for duplicate candidate numbers within the batch
      if (userData.candidateNumber && userData.userType === 'student') {
        if (candidateNumberSet.has(userData.candidateNumber)) {
          validationErrors.push(`Row ${index + 1}: Duplicate candidate number in batch`);
        } else {
          candidateNumberSet.add(userData.candidateNumber);
          
          // Check if candidate number already exists in system
          const existingUser = userStorage.getAllUsers().find(u => u.candidateNumber === userData.candidateNumber);
          if (existingUser) {
            validationErrors.push(`Row ${index + 1}: Candidate number already exists in system`);
          }
        }
      }
    });

    // If validation only, return validation results
    if (validateOnly) {
      return NextResponse.json({
        success: validationErrors.length === 0,
        data: {
          totalUsers: usersData.length,
          validUsers: usersData.length - validationErrors.length,
          errors: validationErrors
        },
        message: validationErrors.length === 0 ? 'All users are valid' : 'Validation completed with errors'
      });
    }

    // If there are validation errors, don't proceed with creation
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        data: {
          errors: validationErrors
        },
        message: 'Validation failed. Please fix errors before proceeding.'
      }, { status: 400 });
    }

    // Create users
    const createdUsers: any[] = [];
    const creationErrors: string[] = [];

    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const rowNumber = i + 1;

      try {
        const newUser = userStorage.createUser({
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
          userType: userData.userType,
          school: userData.school || undefined,
          dateOfBirth: userData.dateOfBirth || undefined,
          candidateNumber: userData.candidateNumber || undefined,
          registrationStatus: userData.registrationStatus || 'confirmed',
          emailVerified: userData.emailVerified || false,
          examLevel: userData.examLevel || (userData.userType === 'student' ? 'Advanced Level (A Level)' : undefined),
          examCenter: userData.examCenter || (userData.userType === 'student' ? 'Default Examination Center' : undefined),
          centerCode: userData.centerCode || (userData.userType === 'student' ? 'DEC-001' : undefined),
          subjects: userData.userType === 'student' ? [
            { code: 'ALG', name: 'English Literature', status: 'confirmed' },
            { code: 'AFR', name: 'French', status: 'confirmed' },
            { code: 'AMH', name: 'Mathematics', status: 'confirmed' }
          ] : undefined
        });

        // Remove password hash from response
        const { passwordHash, ...safeUser } = newUser;
        createdUsers.push(safeUser);

      } catch (error) {
        creationErrors.push(`Row ${rowNumber}: Failed to create user - ${error}`);
      }
    }

    // Log admin action
    const adminUserId = token.split('-').slice(2, -1).join('-');
    console.log(`Admin ${adminUserId} bulk created ${createdUsers.length} users at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: creationErrors.length === 0,
      data: {
        totalRequested: usersData.length,
        successfullyCreated: createdUsers.length,
        failed: creationErrors.length,
        createdUsers,
        errors: creationErrors
      },
      message: `Bulk creation completed. ${createdUsers.length} users created successfully${creationErrors.length > 0 ? `, ${creationErrors.length} failed` : ''}.`
    });

  } catch (error) {
    console.error('Bulk create users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
