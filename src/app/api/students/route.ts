import { NextRequest, NextResponse } from 'next/server';

// Mock student data - replace with database queries
const mockStudents = [
  {
    id: 'GCE2025-ST-003421',
    fullName: 'John Doe',
    email: 'john.doe@student.cm',
    photoUrl: '/images/prince.jpg',
    examLevel: 'Advanced Level (A Level)',
    examCenter: 'Buea Examination Center',
    centerCode: 'BEC-023',
    registrationStatus: 'confirmed',
    subjects: [
      { code: 'AL01', name: 'Mathematics', status: 'confirmed' },
      { code: 'AL02', name: 'Physics', status: 'confirmed' },
      { code: 'AL03', name: 'Chemistry', status: 'confirmed' },
      { code: 'AL04', name: 'Biology', status: 'pending' },
    ],
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-20T14:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (studentId) {
      // Get specific student - first check registered students
      let student = await userStorage.findById(studentId);

      // If not found, check mock data
      if (!student) {
        student = mockStudents.find(s => s.id === studentId);
      }

      if (!student) {
        return NextResponse.json(
          { success: false, message: 'Student not found' },
          { status: 404 }
        );
      }

      // Remove password hash if it exists
      const { passwordHash, ...safeStudent } = student as any;
      return NextResponse.json({ success: true, data: safeStudent });
    }

    // Get all students - combine registered students and mock data
    const registeredStudents = await userStorage.getUsersByType('student');

    // Remove password hashes from registered students
    const safeRegisteredStudents = registeredStudents.map(student => {
      const { passwordHash, ...safeStudent } = student;
      return safeStudent;
    });

    // Combine with mock students
    const allStudents = [...safeRegisteredStudents, ...mockStudents];

    return NextResponse.json({
      success: true,
      data: allStudents,
      message: `Retrieved ${allStudents.length} students (${safeRegisteredStudents.length} registered, ${mockStudents.length} mock)`
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Validate input data
    // TODO: Save to database

    const newStudent = {
      id: `GCE2025-ST-${Date.now()}`,
      ...body,
      registrationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockStudents.push(newStudent);

    return NextResponse.json({
      success: true,
      data: newStudent,
      message: 'Student registered successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
