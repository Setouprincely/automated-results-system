import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const markingScores: Map<string, any> = new Map();

// Helper function to check school analytics access
const canViewSchoolAnalytics = (token: string, schoolId: string): { canAccess: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canAccess: false, userId: null, userType: null };
  
  // Admin and examiners can access all school analytics
  if (user.userType === 'admin' || user.userType === 'examiner') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Teachers can access their school's analytics
  if (user.userType === 'teacher') {
    // In production, verify teacher belongs to this school
    return { canAccess: true, userId, userType: user.userType };
  }
  
  return { canAccess: false, userId, userType: user.userType };
};

// Calculate school performance metrics
const calculateSchoolMetrics = (schoolResults: any[]): any => {
  if (schoolResults.length === 0) {
    return {
      totalStudents: 0,
      averagePerformance: 0,
      passRate: 0,
      excellenceRate: 0,
      subjectCount: 0,
      gradeDistribution: {}
    };
  }

  const totalStudents = schoolResults.length;
  const totalPerformance = schoolResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0);
  const averagePerformance = Math.round(totalPerformance / totalStudents);
  
  const passedStudents = schoolResults.filter(r => r.overallPerformance.subjectsPassed > 0).length;
  const passRate = Math.round((passedStudents / totalStudents) * 100);
  
  const excellentStudents = schoolResults.filter(r => 
    r.overallPerformance.distinction || r.overallPerformance.averagePercentage >= 80
  ).length;
  const excellenceRate = Math.round((excellentStudents / totalStudents) * 100);
  
  const allSubjects = schoolResults.flatMap(r => r.subjects);
  const subjectCount = new Set(allSubjects.map(s => s.subjectCode)).size;
  
  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  allSubjects.forEach(subject => {
    gradeDistribution[subject.grade] = (gradeDistribution[subject.grade] || 0) + 1;
  });

  return {
    totalStudents,
    averagePerformance,
    passRate,
    excellenceRate,
    subjectCount,
    gradeDistribution
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
          excellenceCount: 0,
          gradeDistribution: {},
          topPerformers: [],
          averagePercentage: 0,
          passRate: 0,
          excellenceRate: 0,
          performanceTrend: 'stable'
        });
      }

      const data = subjectData.get(subject.subjectCode)!;
      data.totalCandidates++;
      data.totalMarks += subject.percentage;
      
      if (subject.status === 'pass') data.passCount++;
      if (subject.percentage >= 80) data.excellenceCount++;
      
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

  return Array.from(subjectData.values()).map(data => {
    data.averagePercentage = Math.round(data.totalMarks / data.totalCandidates);
    data.passRate = Math.round((data.passCount / data.totalCandidates) * 100);
    data.excellenceRate = Math.round((data.excellenceCount / data.totalCandidates) * 100);
    
    // Sort and limit top performers
    data.topPerformers.sort((a: any, b: any) => b.percentage - a.percentage);
    data.topPerformers = data.topPerformers.slice(0, 5);
    
    return data;
  }).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate teacher effectiveness metrics
const calculateTeacherEffectiveness = (schoolResults: any[]): any[] => {
  // Mock teacher data - in production, would link results to teachers
  const teachers = [
    { teacherId: 'T001', teacherName: 'John Doe', subjects: ['MAT', 'PHY'] },
    { teacherId: 'T002', teacherName: 'Jane Smith', subjects: ['ENG', 'LIT'] },
    { teacherId: 'T003', teacherName: 'Bob Johnson', subjects: ['CHE', 'BIO'] }
  ];

  return teachers.map(teacher => {
    // Mock effectiveness metrics
    const effectiveness = Math.floor(Math.random() * 30) + 70; // 70-100%
    const studentCount = Math.floor(Math.random() * 50) + 20; // 20-70 students
    const averageImprovement = Math.floor(Math.random() * 20) - 5; // -5 to +15 points

    return {
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      subjects: teacher.subjects,
      effectiveness,
      studentCount,
      averageImprovement,
      rating: effectiveness >= 90 ? 'excellent' : effectiveness >= 80 ? 'good' : effectiveness >= 70 ? 'satisfactory' : 'needs_improvement'
    };
  }).sort((a, b) => b.effectiveness - a.effectiveness);
};

// Calculate performance trends
const calculatePerformanceTrends = (schoolResults: any[]): any => {
  const sessionData = new Map<string, any>();

  schoolResults.forEach(result => {
    const session = result.examSession;
    
    if (!sessionData.has(session)) {
      sessionData.set(session, {
        session,
        totalStudents: 0,
        totalPerformance: 0,
        passCount: 0,
        excellenceCount: 0
      });
    }

    const data = sessionData.get(session)!;
    data.totalStudents++;
    data.totalPerformance += result.overallPerformance.averagePercentage;
    
    if (result.overallPerformance.subjectsPassed > 0) data.passCount++;
    if (result.overallPerformance.distinction) data.excellenceCount++;
  });

  const trends = Array.from(sessionData.values()).map(data => ({
    session: data.session,
    totalStudents: data.totalStudents,
    averagePerformance: Math.round(data.totalPerformance / data.totalStudents),
    passRate: Math.round((data.passCount / data.totalStudents) * 100),
    excellenceRate: Math.round((data.excellenceCount / data.totalStudents) * 100)
  })).sort((a, b) => a.session.localeCompare(b.session));

  // Calculate trend direction
  let trendAnalysis = null;
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    trendAnalysis = {
      performanceTrend: latest.averagePerformance > previous.averagePerformance ? 'improving' : 
                       latest.averagePerformance < previous.averagePerformance ? 'declining' : 'stable',
      passRateTrend: latest.passRate > previous.passRate ? 'improving' : 
                    latest.passRate < previous.passRate ? 'declining' : 'stable',
      excellenceTrend: latest.excellenceRate > previous.excellenceRate ? 'improving' : 
                      latest.excellenceRate < previous.excellenceRate ? 'declining' : 'stable',
      performanceChange: latest.averagePerformance - previous.averagePerformance,
      passRateChange: latest.passRate - previous.passRate,
      excellenceRateChange: latest.excellenceRate - previous.excellenceRate
    };
  }

  return { sessionTrends: trends, trendAnalysis };
};

// Calculate competitive analysis
const calculateCompetitiveAnalysis = (schoolResults: any[], schoolId: string): any => {
  const schoolMetrics = calculateSchoolMetrics(schoolResults);
  
  // Mock competitive data - in production, fetch from database
  const regionalAverage = 65;
  const nationalAverage = 60;
  const topSchoolAverage = 85;
  
  const schoolAverage = schoolMetrics.averagePerformance;
  
  return {
    schoolPerformance: schoolAverage,
    regionalAverage,
    nationalAverage,
    topSchoolAverage,
    regionalRanking: Math.floor(Math.random() * 50) + 1, // Mock ranking
    nationalRanking: Math.floor(Math.random() * 500) + 1,
    performanceGap: {
      toRegionalAverage: schoolAverage - regionalAverage,
      toNationalAverage: schoolAverage - nationalAverage,
      toTopSchool: schoolAverage - topSchoolAverage
    },
    percentileRanking: {
      regional: calculatePercentile(schoolAverage, regionalAverage),
      national: calculatePercentile(schoolAverage, nationalAverage)
    }
  };
};

// Identify improvement opportunities
const identifyImprovementOpportunities = (subjectPerformance: any[], schoolMetrics: any): any[] => {
  const opportunities = [];

  // Low-performing subjects
  const weakSubjects = subjectPerformance.filter(s => s.passRate < 70);
  if (weakSubjects.length > 0) {
    opportunities.push({
      type: 'subject_improvement',
      priority: 'high',
      title: 'Improve Weak Subject Performance',
      description: `Focus on subjects with low pass rates: ${weakSubjects.map(s => s.subjectCode).join(', ')}`,
      impact: 'high',
      effort: 'medium',
      recommendations: [
        'Provide additional teacher training for weak subjects',
        'Implement peer tutoring programs',
        'Review and update teaching materials'
      ]
    });
  }

  // Low overall pass rate
  if (schoolMetrics.passRate < 80) {
    opportunities.push({
      type: 'overall_performance',
      priority: 'high',
      title: 'Improve Overall Pass Rate',
      description: `Current pass rate of ${schoolMetrics.passRate}% is below target`,
      impact: 'high',
      effort: 'high',
      recommendations: [
        'Implement comprehensive student support programs',
        'Enhance teaching methodologies',
        'Increase study time and resources'
      ]
    });
  }

  // Low excellence rate
  if (schoolMetrics.excellenceRate < 20) {
    opportunities.push({
      type: 'excellence_development',
      priority: 'medium',
      title: 'Develop Academic Excellence',
      description: `Excellence rate of ${schoolMetrics.excellenceRate}% can be improved`,
      impact: 'medium',
      effort: 'medium',
      recommendations: [
        'Create advanced learning programs',
        'Identify and nurture high-potential students',
        'Provide enrichment activities'
      ]
    });
  }

  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });
};

// GET - Get school performance analytics
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

    const { id: schoolId } = params;
    const { canAccess, userType } = canViewSchoolAnalytics(token, schoolId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const includeComparative = searchParams.get('includeComparative') === 'true';
    const includeTeachers = searchParams.get('includeTeachers') === 'true';
    const includeOpportunities = searchParams.get('includeOpportunities') === 'true';

    // Get school results
    let schoolResults = Array.from(examResults.values()).filter(
      result => result.schoolId === schoolId && result.publication.isPublished
    );

    if (schoolResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          schoolInfo: { schoolId, hasData: false },
          analytics: null,
          message: 'No results available for analytics'
        },
        message: 'No data available for school analytics'
      });
    }

    // Apply timeframe filter
    if (timeframe !== 'all') {
      const currentYear = new Date().getFullYear();
      if (timeframe === 'year') {
        schoolResults = schoolResults.filter(r => 
          new Date(r.audit.generatedAt).getFullYear() === currentYear
        );
      }
    }

    // Calculate analytics
    const schoolMetrics = calculateSchoolMetrics(schoolResults);
    const subjectPerformance = calculateSubjectPerformance(schoolResults);
    const performanceTrends = calculatePerformanceTrends(schoolResults);

    // Prepare response data
    let responseData: any = {
      schoolInfo: {
        schoolId,
        schoolName: schoolResults[0].schoolName,
        centerCode: schoolResults[0].centerCode,
        hasData: true,
        totalResults: schoolResults.length,
        dateRange: {
          from: Math.min(...schoolResults.map(r => new Date(r.audit.generatedAt).getTime())),
          to: Math.max(...schoolResults.map(r => new Date(r.audit.generatedAt).getTime()))
        }
      },
      overallMetrics: schoolMetrics,
      subjectPerformance: subjectPerformance.slice(0, 10), // Top 10 subjects
      performanceTrends,
      topPerformers: schoolResults
        .sort((a, b) => b.overallPerformance.averagePercentage - a.overallPerformance.averagePercentage)
        .slice(0, 10)
        .map(r => ({
          studentId: r.studentId,
          studentName: r.studentName,
          studentNumber: r.studentNumber,
          averagePercentage: r.overallPerformance.averagePercentage,
          classification: r.overallPerformance.classification,
          examSession: r.examSession
        }))
    };

    // Include comparative analysis if requested
    if (includeComparative) {
      responseData.competitiveAnalysis = calculateCompetitiveAnalysis(schoolResults, schoolId);
    }

    // Include teacher effectiveness if requested
    if (includeTeachers && userType !== 'student') {
      responseData.teacherEffectiveness = calculateTeacherEffectiveness(schoolResults);
    }

    // Include improvement opportunities if requested
    if (includeOpportunities) {
      responseData.improvementOpportunities = identifyImprovementOpportunities(subjectPerformance, schoolMetrics);
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'School performance analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get school performance analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function
const calculatePercentile = (score: number, average: number): number => {
  const percentile = ((score - average) / average) * 50 + 50;
  return Math.max(1, Math.min(99, Math.round(percentile)));
};
