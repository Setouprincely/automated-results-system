import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared results storage (in production, use database)
const examResults: Map<string, any> = new Map();

// Helper function to check student results access
const canAccessStudentResults = (token: string, studentId: string): { canAccess: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canAccess: false, userId: null, userType: null };
  
  // Admin and examiners can access all results
  if (user.userType === 'admin' || user.userType === 'examiner') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Students can only access their own results
  if (user.userType === 'student' && userId === studentId) {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Teachers can access results from their school
  if (user.userType === 'teacher') {
    // In production, check if teacher's school matches student's school
    return { canAccess: true, userId, userType: user.userType };
  }
  
  return { canAccess: false, userId, userType: user.userType };
};

// Calculate performance trends
const calculatePerformanceTrends = (studentResults: any[]): any => {
  if (studentResults.length < 2) {
    return {
      trend: 'insufficient_data',
      improvement: 0,
      consistency: 0,
      bestPerformance: null,
      worstPerformance: null
    };
  }

  // Sort by exam year/session
  const sortedResults = studentResults.sort((a, b) => 
    new Date(a.audit.generatedAt).getTime() - new Date(b.audit.generatedAt).getTime()
  );

  const averagePercentages = sortedResults.map(r => r.overallPerformance.averagePercentage);
  const latest = averagePercentages[averagePercentages.length - 1];
  const previous = averagePercentages[averagePercentages.length - 2];
  
  const improvement = latest - previous;
  
  // Calculate consistency (lower standard deviation = higher consistency)
  const mean = averagePercentages.reduce((sum, p) => sum + p, 0) / averagePercentages.length;
  const variance = averagePercentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / averagePercentages.length;
  const consistency = Math.max(0, 100 - Math.sqrt(variance));

  const bestPerformance = sortedResults.reduce((best, current) => 
    current.overallPerformance.averagePercentage > best.overallPerformance.averagePercentage ? current : best
  );

  const worstPerformance = sortedResults.reduce((worst, current) => 
    current.overallPerformance.averagePercentage < worst.overallPerformance.averagePercentage ? current : worst
  );

  return {
    trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
    improvement: Math.round(improvement * 100) / 100,
    consistency: Math.round(consistency),
    bestPerformance: {
      examSession: bestPerformance.examSession,
      averagePercentage: bestPerformance.overallPerformance.averagePercentage,
      classification: bestPerformance.overallPerformance.classification
    },
    worstPerformance: {
      examSession: worstPerformance.examSession,
      averagePercentage: worstPerformance.overallPerformance.averagePercentage,
      classification: worstPerformance.overallPerformance.classification
    }
  };
};

// Calculate subject analysis
const calculateSubjectAnalysis = (studentResults: any[]): any => {
  const subjectPerformance = new Map<string, any[]>();
  
  // Group results by subject
  studentResults.forEach(result => {
    result.subjects.forEach((subject: any) => {
      if (!subjectPerformance.has(subject.subjectCode)) {
        subjectPerformance.set(subject.subjectCode, []);
      }
      subjectPerformance.get(subject.subjectCode)!.push({
        examSession: result.examSession,
        percentage: subject.percentage,
        grade: subject.grade,
        status: subject.status
      });
    });
  });

  const analysis = Array.from(subjectPerformance.entries()).map(([subjectCode, performances]) => {
    const latestPerformance = performances[performances.length - 1];
    const averagePercentage = Math.round(
      performances.reduce((sum, p) => sum + p.percentage, 0) / performances.length
    );
    
    const improvement = performances.length > 1 ? 
      latestPerformance.percentage - performances[performances.length - 2].percentage : 0;

    const passRate = Math.round(
      (performances.filter(p => p.status === 'pass').length / performances.length) * 100
    );

    return {
      subjectCode,
      subjectName: subjectCode, // Would get from subject mapping
      totalAttempts: performances.length,
      averagePercentage,
      latestGrade: latestPerformance.grade,
      latestPercentage: latestPerformance.percentage,
      improvement: Math.round(improvement * 100) / 100,
      passRate,
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
      bestGrade: performances.reduce((best, current) => 
        current.percentage > best.percentage ? current : best
      ).grade,
      performances
    };
  });

  return analysis.sort((a, b) => b.latestPercentage - a.latestPercentage);
};

// GET - Get student results
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
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

    const { studentId } = params;
    const { canAccess, userType } = canAccessStudentResults(token, studentId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examSession = searchParams.get('examSession') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const includeAnalysis = searchParams.get('includeAnalysis') === 'true';

    // Get all results for this student
    let studentResults = Array.from(examResults.values()).filter(
      result => result.studentId === studentId
    );

    if (studentResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          results: [],
          summary: {
            totalExams: 0,
            totalSubjects: 0,
            averagePerformance: 0,
            bestClassification: 'None'
          }
        },
        message: 'No results found for this student'
      });
    }

    // Apply filters
    if (examSession) {
      studentResults = studentResults.filter(result => result.examSession === examSession);
    }

    if (examLevel) {
      studentResults = studentResults.filter(result => result.examLevel === examLevel);
    }

    // Filter by publication status (students can only see published results unless admin/examiner)
    if (userType === 'student' && !includeUnpublished) {
      studentResults = studentResults.filter(result => result.publication.isPublished);
    } else if (!includeUnpublished) {
      studentResults = studentResults.filter(result => result.publication.isPublished);
    }

    // Sort by exam session/year (most recent first)
    studentResults.sort((a, b) => 
      new Date(b.audit.generatedAt).getTime() - new Date(a.audit.generatedAt).getTime()
    );

    // Calculate summary statistics
    const totalExams = studentResults.length;
    const totalSubjects = studentResults.reduce((sum, result) => sum + result.subjects.length, 0);
    const averagePerformance = totalExams > 0 ? 
      Math.round(studentResults.reduce((sum, result) => sum + result.overallPerformance.averagePercentage, 0) / totalExams) : 0;
    
    const classifications = studentResults.map(r => r.overallPerformance.classification);
    const bestClassification = classifications.includes('Distinction') ? 'Distinction' :
                              classifications.includes('Merit') ? 'Merit' :
                              classifications.includes('Credit') ? 'Credit' :
                              classifications.includes('Pass') ? 'Pass' : 'None';

    const summary = {
      totalExams,
      totalSubjects,
      averagePerformance,
      bestClassification,
      latestExam: studentResults.length > 0 ? {
        examSession: studentResults[0].examSession,
        examLevel: studentResults[0].examLevel,
        classification: studentResults[0].overallPerformance.classification,
        averagePercentage: studentResults[0].overallPerformance.averagePercentage
      } : null
    };

    let responseData: any = {
      results: studentResults,
      summary
    };

    // Include detailed analysis if requested
    if (includeAnalysis && studentResults.length > 0) {
      responseData.analysis = {
        performanceTrends: calculatePerformanceTrends(studentResults),
        subjectAnalysis: calculateSubjectAnalysis(studentResults),
        strengthsAndWeaknesses: identifyStrengthsAndWeaknesses(studentResults),
        recommendations: generateRecommendations(studentResults)
      };
    }

    // Include certificates information
    const certificatesInfo = studentResults.map(result => ({
      examId: result.examId,
      examSession: result.examSession,
      examLevel: result.examLevel,
      certificateGenerated: result.certificates.isGenerated,
      certificateNumber: result.certificates.certificateNumber,
      downloadUrl: result.certificates.downloadUrl
    })).filter(cert => cert.certificateGenerated);

    if (certificatesInfo.length > 0) {
      responseData.certificates = certificatesInfo;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Student results retrieved successfully'
    });

  } catch (error) {
    console.error('Get student results error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const identifyStrengthsAndWeaknesses = (studentResults: any[]): any => {
  const allSubjects = studentResults.flatMap(result => result.subjects);
  const subjectAverages = new Map<string, number[]>();

  // Group by subject
  allSubjects.forEach(subject => {
    if (!subjectAverages.has(subject.subjectCode)) {
      subjectAverages.set(subject.subjectCode, []);
    }
    subjectAverages.get(subject.subjectCode)!.push(subject.percentage);
  });

  // Calculate averages
  const subjectPerformances = Array.from(subjectAverages.entries()).map(([subjectCode, percentages]) => ({
    subjectCode,
    averagePercentage: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length)
  }));

  subjectPerformances.sort((a, b) => b.averagePercentage - a.averagePercentage);

  const strengths = subjectPerformances.slice(0, 3).filter(s => s.averagePercentage >= 60);
  const weaknesses = subjectPerformances.slice(-3).filter(s => s.averagePercentage < 50);

  return { strengths, weaknesses };
};

const generateRecommendations = (studentResults: any[]): string[] => {
  const recommendations = [];
  const latestResult = studentResults[0];
  
  if (!latestResult) return recommendations;

  const averagePercentage = latestResult.overallPerformance.averagePercentage;
  const classification = latestResult.overallPerformance.classification;

  if (averagePercentage >= 80) {
    recommendations.push('Excellent performance! Continue maintaining high standards.');
    recommendations.push('Consider taking on leadership roles in academic activities.');
  } else if (averagePercentage >= 60) {
    recommendations.push('Good performance with room for improvement.');
    recommendations.push('Focus on strengthening weaker subjects.');
  } else if (averagePercentage >= 40) {
    recommendations.push('Satisfactory performance but significant improvement needed.');
    recommendations.push('Consider additional study support and tutoring.');
  } else {
    recommendations.push('Performance needs urgent attention.');
    recommendations.push('Seek immediate academic support and counseling.');
  }

  // Subject-specific recommendations
  const weakSubjects = latestResult.subjects.filter((s: any) => s.percentage < 50);
  if (weakSubjects.length > 0) {
    recommendations.push(`Focus on improving performance in: ${weakSubjects.map((s: any) => s.subjectCode).join(', ')}`);
  }

  return recommendations;
};
