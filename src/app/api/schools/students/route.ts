import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * 🏫 School-Student Relationship API
 * Manages the relationship between schools and their registered students
 */

// GET /api/schools/students - Get students for a specific school
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const centerNumber = searchParams.get('centerNumber');
    const examLevel = searchParams.get('examLevel'); // 'O Level' or 'A Level'

    if (!centerNumber) {
      return NextResponse.json(
        { success: false, message: 'Center number is required' },
        { status: 400 }
      );
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { centerNumber }
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: 'School not found with this center number' },
        { status: 404 }
      );
    }

    // Get students for this school
    const whereClause: any = {
      schoolCenterNumber: centerNumber
    };

    if (examLevel) {
      whereClause.examLevel = examLevel;
    }

    const students = await prisma.studentUser.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        examLevel: true,
        candidateNumber: true,
        registrationStatus: true,
        region: true,
        phoneNumber: true,
        createdAt: true,
        // Don't include sensitive data like passwords
      },
      orderBy: [
        { examLevel: 'asc' },
        { fullName: 'asc' }
      ]
    });

    // Group students by exam level
    const oLevelStudents = students.filter(s => s.examLevel === 'O Level');
    const aLevelStudents = students.filter(s => s.examLevel === 'A Level');

    return NextResponse.json({
      success: true,
      data: {
        school: {
          centerNumber: school.centerNumber,
          name: school.name,
          region: school.region,
          totalCapacity: school.studentCapacity
        },
        students: {
          total: students.length,
          oLevel: oLevelStudents.length,
          aLevel: aLevelStudents.length,
          list: students
        },
        breakdown: {
          oLevelStudents,
          aLevelStudents
        }
      }
    });

  } catch (error) {
    console.error('Error fetching school students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch school students' },
      { status: 500 }
    );
  }
}

// POST /api/schools/students - Register a student to a school (called during student registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      schoolCenterNumber, 
      examLevel,
      studentData 
    } = body;

    if (!studentId || !schoolCenterNumber || !examLevel) {
      return NextResponse.json(
        { success: false, message: 'Student ID, school center number, and exam level are required' },
        { status: 400 }
      );
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { centerNumber: schoolCenterNumber }
    });

    if (!school) {
      return NextResponse.json(
        { success: false, message: 'School not found with this center number' },
        { status: 404 }
      );
    }

    // Check school capacity
    const currentStudentCount = await prisma.studentUser.count({
      where: { schoolCenterNumber }
    });

    if (school.studentCapacity && currentStudentCount >= school.studentCapacity) {
      return NextResponse.json(
        { success: false, message: 'School has reached maximum capacity' },
        { status: 400 }
      );
    }

    // Update school statistics
    const updateData: any = {
      totalStudents: { increment: 1 }
    };

    if (examLevel === 'O Level') {
      updateData.oLevelStudents = { increment: 1 };
    } else if (examLevel === 'A Level') {
      updateData.aLevelStudents = { increment: 1 };
    }

    await prisma.school.update({
      where: { centerNumber: schoolCenterNumber },
      data: updateData
    });

    // Log the school-student relationship
    await prisma.auditLog.create({
      data: {
        tableName: 'school_student_relationship',
        recordId: `${schoolCenterNumber}-${studentId}`,
        action: 'STUDENT_REGISTERED',
        newValues: {
          studentId,
          schoolCenterNumber,
          examLevel,
          schoolName: school.name,
          studentName: studentData?.fullName || 'Unknown'
        },
        userType: 'student',
        userId: studentId,
        userEmail: studentData?.email || 'unknown@email.com',
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Student successfully registered to school',
      data: {
        school: {
          centerNumber: school.centerNumber,
          name: school.name,
          region: school.region
        },
        student: {
          id: studentId,
          examLevel
        },
        updatedCounts: {
          totalStudents: currentStudentCount + 1,
          oLevelStudents: examLevel === 'O Level' ? school.oLevelStudents + 1 : school.oLevelStudents,
          aLevelStudents: examLevel === 'A Level' ? school.aLevelStudents + 1 : school.aLevelStudents
        }
      }
    });

  } catch (error) {
    console.error('Error registering student to school:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register student to school' },
      { status: 500 }
    );
  }
}

// PUT /api/schools/students - Update student's school relationship
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      oldSchoolCenterNumber, 
      newSchoolCenterNumber, 
      examLevel 
    } = body;

    if (!studentId || !oldSchoolCenterNumber || !newSchoolCenterNumber) {
      return NextResponse.json(
        { success: false, message: 'Student ID and both school center numbers are required' },
        { status: 400 }
      );
    }

    // Verify both schools exist
    const [oldSchool, newSchool] = await Promise.all([
      prisma.school.findUnique({ where: { centerNumber: oldSchoolCenterNumber } }),
      prisma.school.findUnique({ where: { centerNumber: newSchoolCenterNumber } })
    ]);

    if (!oldSchool || !newSchool) {
      return NextResponse.json(
        { success: false, message: 'One or both schools not found' },
        { status: 404 }
      );
    }

    // Update school statistics
    const decrementData: any = { totalStudents: { decrement: 1 } };
    const incrementData: any = { totalStudents: { increment: 1 } };

    if (examLevel === 'O Level') {
      decrementData.oLevelStudents = { decrement: 1 };
      incrementData.oLevelStudents = { increment: 1 };
    } else if (examLevel === 'A Level') {
      decrementData.aLevelStudents = { decrement: 1 };
      incrementData.aLevelStudents = { increment: 1 };
    }

    // Update both schools in a transaction
    await prisma.$transaction([
      prisma.school.update({
        where: { centerNumber: oldSchoolCenterNumber },
        data: decrementData
      }),
      prisma.school.update({
        where: { centerNumber: newSchoolCenterNumber },
        data: incrementData
      })
    ]);

    // Log the transfer
    await prisma.auditLog.create({
      data: {
        tableName: 'school_student_relationship',
        recordId: `${studentId}`,
        action: 'STUDENT_TRANSFERRED',
        oldValues: {
          schoolCenterNumber: oldSchoolCenterNumber,
          schoolName: oldSchool.name
        },
        newValues: {
          schoolCenterNumber: newSchoolCenterNumber,
          schoolName: newSchool.name
        },
        userType: 'student',
        userId: studentId,
        userEmail: 'system@gce.cm',
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Student successfully transferred between schools',
      data: {
        from: {
          centerNumber: oldSchool.centerNumber,
          name: oldSchool.name
        },
        to: {
          centerNumber: newSchool.centerNumber,
          name: newSchool.name
        }
      }
    });

  } catch (error) {
    console.error('Error transferring student between schools:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to transfer student between schools' },
      { status: 500 }
    );
  }
}
