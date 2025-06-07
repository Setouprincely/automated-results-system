import { NextRequest, NextResponse } from 'next/server';
import SeparateStudentDatabase from '@/lib/separateStudentDb';

/**
 * 🔄 Subject Registration Sync API
 * Syncs subject registrations from school candidate registrations to student accounts
 */

// Subject mapping for O Level and A Level
const SUBJECTS_O_LEVEL = [
  'English Language', 'French', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Geography', 'History', 'Literature in English',
  'Economics', 'Religious Studies', 'Further Mathematics', 'Physical Education'
];

const SUBJECTS_A_LEVEL = [
  'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Economics', 'Geography', 'History', 'Literature in English',
  'French', 'Religious Studies', 'Physical Education'
];

// POST /api/students/subjects/sync - Sync subjects from school registration to student account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentEmail,
      examLevel,
      subjects,
      schoolCenterNumber,
      candidateNumber
    } = body;

    console.log(`🔄 Syncing subjects for student: ${studentEmail}`);
    console.log(`📚 Exam Level: ${examLevel}`);
    console.log(`📋 Subjects: ${subjects?.join(', ')}`);

    if (!studentEmail || !examLevel || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { success: false, message: 'Student email, exam level, and subjects array are required' },
        { status: 400 }
      );
    }

    // Validate exam level
    if (!['O Level', 'A Level'].includes(examLevel)) {
      return NextResponse.json(
        { success: false, message: 'Exam level must be "O Level" or "A Level"' },
        { status: 400 }
      );
    }

    // Validate subjects against allowed subjects for the exam level
    const allowedSubjects = examLevel === 'O Level' ? SUBJECTS_O_LEVEL : SUBJECTS_A_LEVEL;
    const invalidSubjects = subjects.filter(subject => !allowedSubjects.includes(subject));
    
    if (invalidSubjects.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid subjects for ${examLevel}: ${invalidSubjects.join(', ')}`,
          allowedSubjects
        },
        { status: 400 }
      );
    }

    // Find student by email
    const studentResult = await SeparateStudentDatabase.findStudentByEmail(studentEmail);
    
    if (!studentResult) {
      return NextResponse.json(
        { success: false, message: 'Student not found with this email address' },
        { status: 404 }
      );
    }

    const { student, examLevel: studentExamLevel } = studentResult;

    // Verify exam level matches
    if (studentExamLevel !== examLevel) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Student is registered for ${studentExamLevel} but trying to sync ${examLevel} subjects` 
        },
        { status: 400 }
      );
    }

    // Prepare subject data with additional metadata
    const subjectData = subjects.map(subjectName => ({
      name: subjectName,
      code: subjectName.replace(/\s+/g, '').toUpperCase().substring(0, 6),
      status: 'registered',
      registeredBy: 'school',
      schoolCenterNumber: schoolCenterNumber || student.schoolCenterNumber,
      registrationDate: new Date().toISOString(),
      examSession: '2025'
    }));

    // Update student record with subjects
    const updateData: any = {
      candidateNumber: candidateNumber || student.candidateNumber
    };

    if (examLevel === 'O Level') {
      updateData.oLevelSubjects = subjectData;
    } else {
      updateData.aLevelSubjects = subjectData;
    }

    // Update the student record
    const updatedStudent = await SeparateStudentDatabase.updateStudent(
      student.id,
      examLevel,
      updateData
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: 'Failed to update student subjects' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully synced ${subjects.length} subjects for ${student.fullName}`);

    return NextResponse.json({
      success: true,
      message: 'Subjects successfully synced to student account',
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          examLevel: studentExamLevel
        },
        subjects: subjectData,
        syncedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error syncing student subjects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync student subjects' },
      { status: 500 }
    );
  }
}

// GET /api/students/subjects/sync - Get sync status for all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolCenterNumber = searchParams.get('schoolCenterNumber');
    const examLevel = searchParams.get('examLevel');

    console.log(`📊 Getting subject sync status for school: ${schoolCenterNumber}, level: ${examLevel}`);

    // Get all students for the school
    const students = schoolCenterNumber 
      ? await SeparateStudentDatabase.getStudentsBySchool(schoolCenterNumber)
      : {
          oLevelStudents: await SeparateStudentDatabase.getAllOLevelStudents(),
          aLevelStudents: await SeparateStudentDatabase.getAllALevelStudents()
        };

    const syncStatus = [];

    // Check O Level students
    if (!examLevel || examLevel === 'O Level') {
      for (const student of students.oLevelStudents || []) {
        const hasSubjects = student.oLevelSubjects && Array.isArray(student.oLevelSubjects) && student.oLevelSubjects.length > 0;
        syncStatus.push({
          studentId: student.id,
          fullName: student.fullName,
          email: student.email,
          examLevel: 'O Level',
          schoolCenterNumber: student.schoolCenterNumber,
          candidateNumber: student.candidateNumber,
          hasSubjects,
          subjectCount: hasSubjects ? student.oLevelSubjects.length : 0,
          subjects: hasSubjects ? student.oLevelSubjects : [],
          lastSyncDate: hasSubjects ? student.oLevelSubjects[0]?.registrationDate : null
        });
      }
    }

    // Check A Level students
    if (!examLevel || examLevel === 'A Level') {
      for (const student of students.aLevelStudents || []) {
        const hasSubjects = student.aLevelSubjects && Array.isArray(student.aLevelSubjects) && student.aLevelSubjects.length > 0;
        syncStatus.push({
          studentId: student.id,
          fullName: student.fullName,
          email: student.email,
          examLevel: 'A Level',
          schoolCenterNumber: student.schoolCenterNumber,
          candidateNumber: student.candidateNumber,
          hasSubjects,
          subjectCount: hasSubjects ? student.aLevelSubjects.length : 0,
          subjects: hasSubjects ? student.aLevelSubjects : [],
          lastSyncDate: hasSubjects ? student.aLevelSubjects[0]?.registrationDate : null
        });
      }
    }

    const summary = {
      totalStudents: syncStatus.length,
      studentsWithSubjects: syncStatus.filter(s => s.hasSubjects).length,
      studentsWithoutSubjects: syncStatus.filter(s => !s.hasSubjects).length,
      oLevelStudents: syncStatus.filter(s => s.examLevel === 'O Level').length,
      aLevelStudents: syncStatus.filter(s => s.examLevel === 'A Level').length
    };

    return NextResponse.json({
      success: true,
      data: {
        syncStatus,
        summary
      },
      message: 'Subject sync status retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting subject sync status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get subject sync status' },
      { status: 500 }
    );
  }
}
