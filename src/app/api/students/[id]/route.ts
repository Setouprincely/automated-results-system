import { NextRequest, NextResponse } from 'next/server';
import SeparateStudentDatabase from '@/lib/separateStudentDb';
import { userStorage } from '@/lib/userStorage';

// Mock student data (fallback for demo)
const mockStudents = {
  'demo-student': {
    id: 'demo-student',
    fullName: 'Demo Student',
    email: 'demo@student.com',
    photoUrl: '/images/prince.jpg',
    examLevel: 'A Level',
    examCenter: 'Demo Center',
    centerCode: 'DEMO-001',
    registrationStatus: 'confirmed',
    createdAt: '2025-01-15T00:00:00Z',
    userType: 'student',
    subjects: [
      { code: 'ALG', name: 'English Literature', status: 'confirmed' },
      { code: 'AFR', name: 'French', status: 'confirmed' },
      { code: 'AMH', name: 'Mathematics', status: 'confirmed' },
      { code: 'APY', name: 'Physics', status: 'confirmed' },
      { code: 'ACY', name: 'Chemistry', status: 'confirmed' }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const examLevel = searchParams.get('examLevel') as 'O Level' | 'A Level' | null;

    console.log(`🔍 Fetching student data for ID: ${id}, examLevel: ${examLevel}`);

    let student = null;
    let studentExamLevel: 'O Level' | 'A Level' | null = null;

    // First try the separate student database
    if (examLevel) {
      // Search specific exam level database
      student = await SeparateStudentDatabase.findStudentById(id, examLevel);
      studentExamLevel = examLevel;
      console.log(`📚 Found in ${examLevel} database:`, !!student);
    } else {
      // Search both databases
      try {
        student = await SeparateStudentDatabase.findStudentById(id, 'O Level');
        if (student) {
          studentExamLevel = 'O Level';
          console.log('📚 Found in O Level database');
        } else {
          student = await SeparateStudentDatabase.findStudentById(id, 'A Level');
          if (student) {
            studentExamLevel = 'A Level';
            console.log('📚 Found in A Level database');
          }
        }
      } catch (error) {
        console.log('⚠️ Error searching separate databases:', error);
      }
    }

    // Fallback to old user storage system
    if (!student) {
      console.log('🔄 Trying old user storage system...');
      student = await userStorage.findById(id);
      if (student && (student as any).examLevel) {
        studentExamLevel = (student as any).examLevel;
      }
    }

    // Fallback to mock data for demo
    if (!student) {
      console.log('🎭 Using mock data for demo...');
      student = mockStudents[id as keyof typeof mockStudents];
      if (student) {
        studentExamLevel = (student as any).examLevel;
      }
    }

    if (!student) {
      console.log('❌ Student not found anywhere');
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { passwordHash, securityAnswerHash, ...safeStudent } = student as any;

    // Ensure we have the required fields
    const responseData = {
      ...safeStudent,
      examLevel: studentExamLevel || safeStudent.examLevel,
      userType: 'student',
      profilePicturePath: safeStudent.profilePicturePath || safeStudent.photoUrl
    };

    console.log('✅ Returning student data:', {
      id: responseData.id,
      fullName: responseData.fullName,
      examLevel: responseData.examLevel,
      profilePicturePath: responseData.profilePicturePath
    });

    console.log(`📸 Profile picture debug for ${responseData.fullName}:`, {
      profilePicturePath: responseData.profilePicturePath,
      photoUrl: safeStudent.photoUrl,
      hasProfilePicture: !!responseData.profilePicturePath
    });

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Student profile retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching student:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // In a real app, update the student in database
    // For now, just return success

    return NextResponse.json({
      success: true,
      data: { id, ...body },
      message: 'Student profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
