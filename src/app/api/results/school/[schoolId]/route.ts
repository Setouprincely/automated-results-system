import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared results storage (in production, use database)
const examResults: Map<string, any> = new Map();

// Helper function to check school results access
const canAccessSchoolResults = (token: string, schoolId: string): { canAccess: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canAccess: false, userId: null, userType: null };
  
  // Admin and examiners can access all school results
  if (user.userType === 'admin' || user.userType === 'examiner') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Teachers can access results from their school
  if (user.userType === 'teacher') {
    // In production, check if teacher's school matches requested school
    return { canAccess: true, userId, userType: user.userType };
  }
  
  return { canAccess: false, userId, userType: user.userType };
};

// Calculate school performance statistics
const calculateSchoolStatistics = (schoolResults: any[]): any => {
  if (schoolResults.length === 0) {
    return {
      totalStudents: 0,
      totalSubjects: 0,
      overallPassRate: 0,
      averagePercentage: 0,
      gradeDistribution: {},
      classificationDistribution: {},
      subjectPerformance: []
    };
  }

  const totalStudents = schoolResults.length;
  const totalSubjects = schoolResults.reduce((sum, result) => sum + result.subjects.length, 0);
  
  // Calculate overall pass rate
  const studentsWithPasses = schoolResults.filter(result => 
    result.overallPerformance.subjectsPassed > 0
  ).length;
  const overallPassRate = Math.round((studentsWithPasses / totalStudents) * 100);

  // Calculate average percentage
  const totalPercentage = schoolResults.reduce((sum, result) => 
    sum + result.overallPerformance.averagePercentage, 0
  );
  const averagePercentage = Math.round(totalPercentage / totalStudents);

  // Calculate grade distribution
  const gradeDistribution: Record<string, number> = {};
  const allSubjects = schoolResults.flatMap(result => result.subjects);
  
  allSubjects.forEach(subject => {
    gradeDistribution[subject.grade] = (gradeDistribution[subject.grade] || 0) + 1;
  });

  // Convert to percentages
  Object.keys(gradeDistribution).forEach(grade => {
    gradeDistribution[grade] = Math.round((gradeDistribution[grade] / allSubjects.length) * 100);
  });

  // Calculate classification distribution
  const classificationDistribution: Record<string, number> = {};
  schoolResults.forEach(result => {
    const classification = result.overallPerformance.classification;
    classificationDistribution[classification] = (classificationDistribution[classification] || 0) + 1;
  });

  // Convert to percentages
  Object.keys(classificationDistribution).forEach(classification => {
    classificationDistribution[classification] = Math.round((classificationDistribution[classification] / totalStudents) * 100);
  });

  // Calculate subject performance
  const subjectPerformance = calculateSubjectPerformance(schoolResults);

  return {
    totalStudents,
    totalSubjects,
    overallPassRate,
    averagePercentage,
    gradeDistribution,
    classificationDistribution,
    subjectPerformance
  };
};

// Calculate subject-wise performance
const calculateSubjectPerformance = (schoolResults: any[]): any[] => {
  const subjectData = new Map<string, any>();

  schoolResults.forEach(result => {
    result.subjects.forEach((subject: any) => {
      if (!subjectData.has(subject.subjectCode)) {
        subjectData.set(subject.subjectCode, {
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          totalCandidates: 0,
          totalMarks: 0,
          passCount: 0,
          gradeDistribution: {},
          topPerformers: [],
          averagePercentage: 0,
          passRate: 0
        });
      }

      const data = subjectData.get(subject.subjectCode)!;
      data.totalCandidates++;
      data.totalMarks += subject.percentage;
      
      if (subject.status === 'pass') {
        data.passCount++;
      }

      // Grade distribution
      data.gradeDistribution[subject.grade] = (data.gradeDistribution[subject.grade] || 0) + 1;

      // Track top performers
      data.topPerformers.push({
        studentId: result.studentId,
        studentName: result.studentName,
        percentage: subject.percentage,
        grade: subject.grade
      });
    });
  });

  // Process final calculations
  return Array.from(subjectData.values()).map(data => {
    data.averagePercentage = Math.round(data.totalMarks / data.totalCandidates);
    data.passRate = Math.round((data.passCount / data.totalCandidates) * 100);
    
    // Sort and limit top performers
    data.topPerformers.sort((a: any, b: any) => b.percentage - a.percentage);
    data.topPerformers = data.topPerformers.slice(0, 5);

    // Convert grade distribution to percentages
    Object.keys(data.gradeDistribution).forEach(grade => {
      data.gradeDistribution[grade] = Math.round((data.gradeDistribution[grade] / data.totalCandidates) * 100);
    });

    return data;
  }).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate school ranking and comparison
const calculateSchoolRanking = (schoolResults: any[], allSchoolsData: any[]): any => {
  const schoolPerformance = calculateSchoolStatistics(schoolResults);
  
  // In production, this would compare with other schools
  const ranking = {
    position: 1, // Would be calculated from actual comparison
    totalSchools: allSchoolsData.length || 1,
    percentile: 95, // Would be calculated
    comparisonMetrics: {
      averagePercentage: {
        school: schoolPerformance.averagePercentage,
        national: 65, // Would be from national statistics
        difference: schoolPerformance.averagePercentage - 65
      },
      passRate: {
        school: schoolPerformance.overallPassRate,
        national: 75, // Would be from national statistics
        difference: schoolPerformance.overallPassRate - 75
      }
    }
  };

  return ranking;
};

// Identify trends and insights
const generateSchoolInsights = (schoolResults: any[]): any => {
  const insights = [];
  const statistics = calculateSchoolStatistics(schoolResults);

  // Performance insights
  if (statistics.averagePercentage >= 80) {
    insights.push({
      type: 'positive',
      category: 'overall_performance',
      message: 'Excellent overall school performance',
      recommendation: 'Continue current teaching methodologies and share best practices'
    });
  } else if (statistics.averagePercentage >= 60) {
    insights.push({
      type: 'neutral',
      category: 'overall_performance',
      message: 'Good school performance with room for improvement',
      recommendation: 'Focus on strengthening weaker subject areas'
    });
  } else {
    insights.push({
      type: 'negative',
      category: 'overall_performance',
      message: 'School performance needs significant improvement',
      recommendation: 'Implement comprehensive academic improvement plan'
    });
  }

  // Subject-specific insights
  const weakSubjects = statistics.subjectPerformance.filter(s => s.passRate < 50);
  if (weakSubjects.length > 0) {
    insights.push({
      type: 'warning',
      category: 'subject_performance',
      message: `Poor performance in ${weakSubjects.length} subjects`,
      recommendation: `Focus on improving: ${weakSubjects.map(s => s.subjectCode).join(', ')}`
    });
  }

  const strongSubjects = statistics.subjectPerformance.filter(s => s.passRate >= 90);
  if (strongSubjects.length > 0) {
    insights.push({
      type: 'positive',
      category: 'subject_performance',
      message: `Excellent performance in ${strongSubjects.length} subjects`,
      recommendation: `Leverage successful practices from: ${strongSubjects.map(s => s.subjectCode).join(', ')}`
    });
  }

  return insights;
};

// GET - Get school results
export async function GET(
  request: NextRequest,
  { params }: { params: { schoolId: string } }
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

    const { schoolId } = params;
    const { canAccess, userType } = canAccessSchoolResults(token, schoolId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examSession = searchParams.get('examSession') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const includeStudentDetails = searchParams.get('includeStudentDetails') === 'true';
    const includeComparison = searchParams.get('includeComparison') === 'true';
    const includeInsights = searchParams.get('includeInsights') === 'true';

    // Get all results for this school
    let schoolResults = Array.from(examResults.values()).filter(
      result => result.schoolId === schoolId && result.publication.isPublished
    );

    if (schoolResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          results: [],
          statistics: {
            totalStudents: 0,
            totalSubjects: 0,
            overallPassRate: 0,
            averagePercentage: 0
          }
        },
        message: 'No results found for this school'
      });
    }

    // Apply filters
    if (examSession) {
      schoolResults = schoolResults.filter(result => result.examSession === examSession);
    }

    if (examLevel) {
      schoolResults = schoolResults.filter(result => result.examLevel === examLevel);
    }

    // Sort by student performance (best first)
    schoolResults.sort((a, b) => 
      b.overallPerformance.averagePercentage - a.overallPerformance.averagePercentage
    );

    // Calculate statistics
    const statistics = calculateSchoolStatistics(schoolResults);

    // Prepare response data
    let responseData: any = {
      schoolInfo: {
        schoolId,
        schoolName: schoolResults[0]?.schoolName || 'Unknown School',
        totalResults: schoolResults.length
      },
      statistics
    };

    // Include student details if requested (and user has permission)
    if (includeStudentDetails && (userType === 'admin' || userType === 'examiner' || userType === 'teacher')) {
      responseData.results = schoolResults.map(result => ({
        studentId: result.studentId,
        studentName: result.studentName,
        studentNumber: result.studentNumber,
        examSession: result.examSession,
        examLevel: result.examLevel,
        overallPerformance: result.overallPerformance,
        subjects: result.subjects
      }));
    }

    // Include comparison data if requested
    if (includeComparison) {
      const allSchoolsData = []; // Would fetch from database in production
      responseData.ranking = calculateSchoolRanking(schoolResults, allSchoolsData);
    }

    // Include insights if requested
    if (includeInsights) {
      responseData.insights = generateSchoolInsights(schoolResults);
    }

    // Calculate top performers
    responseData.topPerformers = schoolResults.slice(0, 10).map(result => ({
      studentId: result.studentId,
      studentName: result.studentName,
      studentNumber: result.studentNumber,
      averagePercentage: result.overallPerformance.averagePercentage,
      classification: result.overallPerformance.classification,
      totalSubjects: result.overallPerformance.totalSubjects,
      subjectsPassed: result.overallPerformance.subjectsPassed
    }));

    // Calculate exam session summary
    const sessionSummary = schoolResults.reduce((acc: any, result) => {
      const session = result.examSession;
      if (!acc[session]) {
        acc[session] = {
          examSession: session,
          examLevel: result.examLevel,
          totalStudents: 0,
          averagePercentage: 0,
          passRate: 0
        };
      }
      acc[session].totalStudents++;
      return acc;
    }, {});

    // Calculate averages for each session
    Object.values(sessionSummary).forEach((session: any) => {
      const sessionResults = schoolResults.filter(r => r.examSession === session.examSession);
      session.averagePercentage = Math.round(
        sessionResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0) / sessionResults.length
      );
      session.passRate = Math.round(
        (sessionResults.filter(r => r.overallPerformance.subjectsPassed > 0).length / sessionResults.length) * 100
      );
    });

    responseData.sessionSummary = Object.values(sessionSummary);

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'School results retrieved successfully'
    });

  } catch (error) {
    console.error('Get school results error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
