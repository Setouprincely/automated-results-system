import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Mock student data (fallback)
const mockStudents = {
  'GCE2025-ST-003421': {
    id: 'GCE2025-ST-003421',
    fullName: 'Jean-Michel Fopa',
    photoUrl: '/images/prince.jpg',
    examLevel: 'Advanced Level (A Level)',
    examCenter: 'GBHS Limbe',
    centerCode: 'GBHS-001',
    registrationStatus: 'confirmed',
    createdAt: '2025-01-15T00:00:00Z',
    subjects: [
      { code: 'ALG', name: 'English Literature', status: 'confirmed' },
      { code: 'AFR', name: 'French', status: 'confirmed' },
      { code: 'AMH', name: 'Mathematics', status: 'confirmed' },
      { code: 'APY', name: 'Physics', status: 'confirmed' },
      { code: 'ACY', name: 'Chemistry', status: 'confirmed' }
    ]
  },
  'admin': {
    id: 'admin',
    fullName: 'Administrator',
    photoUrl: '/images/prince.jpg',
    examLevel: 'N/A',
    examCenter: 'Admin Center',
    centerCode: 'ADM-001',
    registrationStatus: 'confirmed',
    createdAt: '2025-01-01T00:00:00Z',
    subjects: []
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Find student by ID in student database first
    let student = await userStorage.findById(id);

    // If not found in registered users, check mock data
    if (!student) {
      student = mockStudents[id as keyof typeof mockStudents];
    }

    // If still not found, try to find a default student for demo purposes
    if (!student) {
      // Get all students from student database
      const allStudents = await userStorage.getUsersByType('student');
      if (allStudents.length > 0) {
        // Return the first student as a fallback for demo
        student = allStudents[0];
        console.log(`Student ${id} not found, returning demo student:`, student.id);
      }
    }

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Remove password hash from response
    const { passwordHash, ...safeStudent } = student as any;

    return NextResponse.json({
      success: true,
      data: safeStudent,
      message: 'Student profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching student:', error);
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
