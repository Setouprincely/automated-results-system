import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();
const gradeCalculations: Map<string, any> = new Map();

// Results storage (in production, use database)
const examResults: Map<string, {
  id: string;
  examId: string;
  examSession: string;
  examLevel: 'O Level' | 'A Level';
  examYear: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  schoolId: string;
  schoolName: string;
  centerCode: string;
  centerName: string;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    paperNumber: number;
    rawScore: number;
    adjustedScore?: number;
    percentage: number;
    grade: string;
    gradePoints: number;
    remarks: string;
    status: 'pass' | 'fail' | 'absent' | 'malpractice' | 'withheld';
  }>;
  overallPerformance: {
    totalSubjects: number;
    subjectsPassed: number;
    subjectsFailed: number;
    averageGrade: string;
    averagePercentage: number;
    totalGradePoints: number;
    classification: string;
    distinction: boolean;
    credit: boolean;
  };
  specialConsiderations: Array<{
    type: 'medical' | 'technical' | 'administrative' | 'other';
    description: string;
    appliedDate: string;
    approvedBy: string;
  }>;
  verification: {
    isVerified: boolean;
    verificationCode: string;
    verifiedBy?: string;
    verifiedAt?: string;
    digitalSignature?: string;
  };
  publication: {
    isPublished: boolean;
    publishedAt?: string;
    publishedBy?: string;
    releaseDate?: string;
    accessLevel: 'private' | 'school' | 'public';
  };
  certificates: {
    isGenerated: boolean;
    certificateNumber?: string;
    generatedAt?: string;
    downloadUrl?: string;
    printedCopies: number;
  };
  audit: {
    generatedBy: string;
    generatedAt: string;
    lastModifiedBy?: string;
    lastModifiedAt?: string;
    modifications: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      modifiedBy: string;
      modifiedAt: string;
      reason: string;
    }>;
  };
  status: 'draft' | 'generated' | 'verified' | 'published' | 'archived';
}> = new Map();

// Helper function to check results access
const canGenerateResults = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate grade points based on grade and level
const calculateGradePoints = (grade: string, examLevel: string): number => {
  if (examLevel === 'O Level') {
    const gradePoints: Record<string, number> = {
      'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
    };
    return gradePoints[grade] || 9;
  } else { // A Level
    const gradePoints: Record<string, number> = {
      'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
    };
    return gradePoints[grade] || 0;
  }
};

// Determine pass/fail status
const determineStatus = (grade: string, examLevel: string): 'pass' | 'fail' => {
  if (examLevel === 'O Level') {
    return ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(grade) ? 'pass' : 'fail';
  } else { // A Level
    return ['A', 'B', 'C', 'D', 'E'].includes(grade) ? 'pass' : 'fail';
  }
};

// Calculate overall performance
const calculateOverallPerformance = (subjects: any[], examLevel: string): any => {
  const totalSubjects = subjects.length;
  const subjectsPassed = subjects.filter(s => s.status === 'pass').length;
  const subjectsFailed = totalSubjects - subjectsPassed;
  
  const totalPercentage = subjects.reduce((sum, s) => sum + s.percentage, 0);
  const averagePercentage = totalSubjects > 0 ? Math.round(totalPercentage / totalSubjects) : 0;
  
  const totalGradePoints = subjects.reduce((sum, s) => sum + s.gradePoints, 0);
  
  // Determine average grade
  let averageGrade = examLevel === 'O Level' ? 'F9' : 'F';
  if (examLevel === 'O Level') {
    if (averagePercentage >= 80) averageGrade = 'A1';
    else if (averagePercentage >= 70) averageGrade = 'B2';
    else if (averagePercentage >= 60) averageGrade = 'B3';
    else if (averagePercentage >= 50) averageGrade = 'C4';
    else if (averagePercentage >= 45) averageGrade = 'C5';
    else if (averagePercentage >= 40) averageGrade = 'C6';
    else if (averagePercentage >= 30) averageGrade = 'D7';
    else if (averagePercentage >= 20) averageGrade = 'E8';
  } else {
    if (averagePercentage >= 80) averageGrade = 'A';
    else if (averagePercentage >= 70) averageGrade = 'B';
    else if (averagePercentage >= 60) averageGrade = 'C';
    else if (averagePercentage >= 50) averageGrade = 'D';
    else if (averagePercentage >= 40) averageGrade = 'E';
  }
  
  // Determine classification
  let classification = 'Pass';
  let distinction = false;
  let credit = false;
  
  if (examLevel === 'O Level') {
    const creditsCount = subjects.filter(s => ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(s.grade)).length;
    const distinctionsCount = subjects.filter(s => ['A1', 'B2', 'B3'].includes(s.grade)).length;
    
    if (creditsCount >= 5) {
      classification = 'Credit';
      credit = true;
      if (distinctionsCount >= 3) {
        classification = 'Distinction';
        distinction = true;
      }
    } else if (creditsCount >= 1) {
      classification = 'Pass';
    } else {
      classification = 'Fail';
    }
  } else { // A Level
    const passCount = subjects.filter(s => ['A', 'B', 'C', 'D', 'E'].includes(s.grade)).length;
    const excellentCount = subjects.filter(s => ['A', 'B'].includes(s.grade)).length;
    
    if (passCount >= 2) {
      classification = 'Pass';
      if (excellentCount >= 2) {
        classification = 'Merit';
        credit = true;
        if (excellentCount >= 3) {
          classification = 'Distinction';
          distinction = true;
        }
      }
    } else {
      classification = 'Fail';
    }
  }
  
  return {
    totalSubjects,
    subjectsPassed,
    subjectsFailed,
    averageGrade,
    averagePercentage,
    totalGradePoints,
    classification,
    distinction,
    credit
  };
};

// Generate verification code
const generateVerificationCode = (): string => {
  return `VER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

// POST - Generate results
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

    if (!canGenerateResults(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to generate results' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      examId,
      examSession,
      examLevel,
      examYear,
      studentIds,
      schoolIds,
      centerCodes,
      generateAll = false,
      includeUnverified = false
    } = body;

    // Validate required fields
    if (!examId || !examSession || !examLevel) {
      return NextResponse.json(
        { success: false, message: 'Missing required generation parameters' },
        { status: 400 }
      );
    }

    // Get grade calculations for this exam
    const examGradeCalculations = Array.from(gradeCalculations.values()).filter(
      calc => calc.examId === examId && calc.status === 'approved'
    );

    if (examGradeCalculations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No approved grade calculations found for this exam' },
        { status: 404 }
      );
    }

    // Get all markings for this exam
    let examMarkings = Array.from(markingScores.values()).filter(
      marking => marking.examId === examId && 
                (marking.status === 'verified' || marking.status === 'moderated' || 
                 (includeUnverified && marking.status === 'submitted'))
    );

    if (examMarkings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No completed markings found for this exam' },
        { status: 404 }
      );
    }

    // Apply filters
    if (!generateAll) {
      if (studentIds && studentIds.length > 0) {
        examMarkings = examMarkings.filter(marking => 
          studentIds.includes(marking.candidateId || marking.scriptId)
        );
      }
      
      if (schoolIds && schoolIds.length > 0) {
        examMarkings = examMarkings.filter(marking => 
          schoolIds.includes(marking.schoolId)
        );
      }
      
      if (centerCodes && centerCodes.length > 0) {
        examMarkings = examMarkings.filter(marking => 
          centerCodes.includes(marking.centerCode)
        );
      }
    }

    // Group markings by student
    const studentMarkings = new Map<string, any[]>();
    examMarkings.forEach(marking => {
      const studentId = marking.candidateId || marking.scriptId;
      if (!studentMarkings.has(studentId)) {
        studentMarkings.set(studentId, []);
      }
      studentMarkings.get(studentId)!.push(marking);
    });

    const generatedResults = [];
    const errors = [];

    // Generate results for each student
    for (const [studentId, markings] of studentMarkings) {
      try {
        // Get student information from first marking
        const firstMarking = markings[0];
        
        // Process subjects
        const subjects = markings.map(marking => {
          const gradeCalc = examGradeCalculations.find(calc => calc.subjectCode === marking.subjectCode);
          const finalScore = marking.moderation?.finalMarks || marking.totalMarks;
          const percentage = marking.percentage || Math.round((finalScore / marking.totalMaxMarks) * 100);
          const grade = marking.grade || (gradeCalc ? 
            gradeCalc.candidateGrades.find((c: any) => c.candidateId === studentId)?.grade || 'F' : 'F');
          
          return {
            subjectCode: marking.subjectCode,
            subjectName: marking.subjectName || marking.subjectCode,
            paperNumber: marking.paperNumber || 1,
            rawScore: marking.totalMarks,
            adjustedScore: marking.moderation?.finalMarks,
            percentage,
            grade,
            gradePoints: calculateGradePoints(grade, examLevel),
            remarks: determineRemarks(grade, percentage),
            status: determineStatus(grade, examLevel)
          };
        });

        // Calculate overall performance
        const overallPerformance = calculateOverallPerformance(subjects, examLevel);

        // Generate result ID
        const resultId = `RESULT-${examId}-${studentId}-${Date.now()}`;

        // Create result record
        const result = {
          id: resultId,
          examId,
          examSession,
          examLevel: examLevel as 'O Level' | 'A Level',
          examYear: examYear || new Date().getFullYear().toString(),
          studentId,
          studentNumber: firstMarking.candidateNumber,
          studentName: firstMarking.candidateName || 'Unknown Student',
          schoolId: firstMarking.schoolId || 'Unknown',
          schoolName: firstMarking.schoolName || 'Unknown School',
          centerCode: firstMarking.centerCode || 'Unknown',
          centerName: firstMarking.centerName || 'Unknown Center',
          subjects,
          overallPerformance,
          specialConsiderations: [],
          verification: {
            isVerified: false,
            verificationCode: generateVerificationCode()
          },
          publication: {
            isPublished: false,
            accessLevel: 'private' as const
          },
          certificates: {
            isGenerated: false,
            printedCopies: 0
          },
          audit: {
            generatedBy: userId,
            generatedAt: new Date().toISOString(),
            modifications: []
          },
          status: 'generated' as const
        };

        // Store result
        examResults.set(resultId, result);
        generatedResults.push(result);

      } catch (error) {
        errors.push({
          studentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedResults,
        totalGenerated: generatedResults.length,
        errors,
        summary: {
          totalStudents: studentMarkings.size,
          successfulGenerations: generatedResults.length,
          failedGenerations: errors.length
        }
      },
      message: `Results generated successfully for ${generatedResults.length} students`
    });

  } catch (error) {
    console.error('Generate results error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine remarks
const determineRemarks = (grade: string, percentage: number): string => {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 70) return 'Very Good';
  if (percentage >= 60) return 'Good';
  if (percentage >= 50) return 'Satisfactory';
  if (percentage >= 40) return 'Fair';
  return 'Poor';
};

// GET - Get generate data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mock data for generate
    const mockData = {
      message: 'generate data retrieved successfully',
      timestamp: new Date().toISOString(),
      data: []
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'generate retrieved successfully'
    });
  } catch (error) {
    console.error('generate GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

