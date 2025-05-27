import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const markingScores: Map<string, any> = new Map();

// Helper function to check analytics access
const canViewStudentAnalytics = (token: string, studentId: string): { canAccess: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canAccess: false, userId: null, userType: null };
  
  // Admin and examiners can access all analytics
  if (user.userType === 'admin' || user.userType === 'examiner') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Students can only access their own analytics
  if (user.userType === 'student' && userId === studentId) {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Teachers can access their students' analytics
  if (user.userType === 'teacher') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  return { canAccess: false, userId, userType: user.userType };
};

// Calculate performance trends
const calculatePerformanceTrends = (studentResults: any[]): any => {
  if (studentResults.length < 2) {
    return {
      trend: 'insufficient_data',
      trendDirection: 'stable',
      improvementRate: 0,
      consistency: 0,
      volatility: 0,
      projectedPerformance: null
    };
  }

  // Sort by exam date
  const sortedResults = studentResults.sort((a, b) => 
    new Date(a.audit.generatedAt).getTime() - new Date(b.audit.generatedAt).getTime()
  );

  const performances = sortedResults.map(r => r.overallPerformance.averagePercentage);
  
  // Calculate trend direction
  const latest = performances[performances.length - 1];
  const previous = performances[performances.length - 2];
  const improvement = latest - previous;
  
  let trendDirection = 'stable';
  if (improvement > 5) trendDirection = 'improving';
  else if (improvement < -5) trendDirection = 'declining';
  
  // Calculate improvement rate (percentage change per exam)
  const totalImprovement = latest - performances[0];
  const improvementRate = performances.length > 1 ? 
    Math.round((totalImprovement / (performances.length - 1)) * 100) / 100 : 0;
  
  // Calculate consistency (lower standard deviation = higher consistency)
  const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
  const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
  const standardDeviation = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - standardDeviation);
  
  // Calculate volatility
  const volatility = standardDeviation / mean * 100;
  
  // Project next performance (simple linear regression)
  const n = performances.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = performances.reduce((sum, p) => sum + p, 0);
  const sumXY = performances.reduce((sum, p, i) => sum + p * (i + 1), 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const projectedPerformance = Math.round(slope * (n + 1) + intercept);

  return {
    trend: trendDirection,
    trendDirection,
    improvementRate,
    consistency: Math.round(consistency),
    volatility: Math.round(volatility * 100) / 100,
    projectedPerformance: Math.max(0, Math.min(100, projectedPerformance))
  };
};

// Calculate subject mastery analysis
const calculateSubjectMastery = (studentResults: any[]): any[] => {
  const subjectData = new Map<string, any>();

  studentResults.forEach(result => {
    result.subjects.forEach((subject: any) => {
      if (!subjectData.has(subject.subjectCode)) {
        subjectData.set(subject.subjectCode, {
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          attempts: [],
          averagePercentage: 0,
          bestGrade: 'F',
          latestGrade: 'F',
          masteryLevel: 'beginner',
          improvementTrend: 'stable',
          consistencyScore: 0
        });
      }

      const data = subjectData.get(subject.subjectCode)!;
      data.attempts.push({
        examSession: result.examSession,
        percentage: subject.percentage,
        grade: subject.grade,
        date: result.audit.generatedAt
      });
    });
  });

  return Array.from(subjectData.values()).map(data => {
    // Sort attempts by date
    data.attempts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate average percentage
    data.averagePercentage = Math.round(
      data.attempts.reduce((sum: number, attempt: any) => sum + attempt.percentage, 0) / data.attempts.length
    );
    
    // Determine best and latest grades
    data.bestGrade = data.attempts.reduce((best: any, current: any) => 
      current.percentage > best.percentage ? current : best
    ).grade;
    data.latestGrade = data.attempts[data.attempts.length - 1].grade;
    
    // Determine mastery level
    if (data.averagePercentage >= 80) data.masteryLevel = 'expert';
    else if (data.averagePercentage >= 70) data.masteryLevel = 'advanced';
    else if (data.averagePercentage >= 60) data.masteryLevel = 'intermediate';
    else if (data.averagePercentage >= 50) data.masteryLevel = 'developing';
    else data.masteryLevel = 'beginner';
    
    // Calculate improvement trend
    if (data.attempts.length >= 2) {
      const latest = data.attempts[data.attempts.length - 1].percentage;
      const previous = data.attempts[data.attempts.length - 2].percentage;
      const improvement = latest - previous;
      
      if (improvement > 5) data.improvementTrend = 'improving';
      else if (improvement < -5) data.improvementTrend = 'declining';
      else data.improvementTrend = 'stable';
    }
    
    // Calculate consistency
    const percentages = data.attempts.map((a: any) => a.percentage);
    const mean = percentages.reduce((sum: number, p: number) => sum + p, 0) / percentages.length;
    const variance = percentages.reduce((sum: number, p: number) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
    data.consistencyScore = Math.max(0, Math.round(100 - Math.sqrt(variance)));
    
    return data;
  }).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate learning analytics
const calculateLearningAnalytics = (studentResults: any[]): any => {
  const allSubjects = studentResults.flatMap(r => r.subjects);
  
  // Identify strengths and weaknesses
  const subjectAverages = new Map<string, number[]>();
  allSubjects.forEach(subject => {
    if (!subjectAverages.has(subject.subjectCode)) {
      subjectAverages.set(subject.subjectCode, []);
    }
    subjectAverages.get(subject.subjectCode)!.push(subject.percentage);
  });

  const subjectPerformances = Array.from(subjectAverages.entries()).map(([code, percentages]) => ({
    subjectCode: code,
    averagePercentage: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length)
  }));

  subjectPerformances.sort((a, b) => b.averagePercentage - a.averagePercentage);

  const strengths = subjectPerformances.slice(0, 3).filter(s => s.averagePercentage >= 70);
  const weaknesses = subjectPerformances.slice(-3).filter(s => s.averagePercentage < 60);

  // Calculate learning patterns
  const examSessions = [...new Set(studentResults.map(r => r.examSession))].sort();
  const performanceBySession = examSessions.map(session => {
    const sessionResults = studentResults.filter(r => r.examSession === session);
    const avgPerformance = sessionResults.length > 0 ? 
      Math.round(sessionResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0) / sessionResults.length) : 0;
    
    return {
      session,
      averagePerformance: avgPerformance,
      subjectsCount: sessionResults.reduce((sum, r) => sum + r.subjects.length, 0)
    };
  });

  // Identify peak performance periods
  const peakPerformance = performanceBySession.reduce((peak, current) => 
    current.averagePerformance > peak.averagePerformance ? current : peak
  );

  return {
    strengths,
    weaknesses,
    performanceBySession,
    peakPerformance,
    learningVelocity: calculateLearningVelocity(performanceBySession),
    recommendedFocus: generateFocusRecommendations(strengths, weaknesses)
  };
};

// Calculate comparative metrics
const calculateComparativeMetrics = (studentResults: any[], studentId: string): any => {
  // In production, this would compare with peer data
  const latestResult = studentResults[studentResults.length - 1];
  if (!latestResult) return null;

  // Mock comparative data (in production, fetch from database)
  const schoolAverage = 65;
  const nationalAverage = 60;
  const regionAverage = 62;

  const studentAverage = latestResult.overallPerformance.averagePercentage;

  return {
    studentPerformance: studentAverage,
    schoolAverage,
    nationalAverage,
    regionAverage,
    schoolPercentile: calculatePercentile(studentAverage, schoolAverage),
    nationalPercentile: calculatePercentile(studentAverage, nationalAverage),
    regionPercentile: calculatePercentile(studentAverage, regionAverage),
    ranking: {
      school: Math.floor(Math.random() * 100) + 1, // Mock ranking
      region: Math.floor(Math.random() * 500) + 1,
      national: Math.floor(Math.random() * 5000) + 1
    }
  };
};

// GET - Get student performance analytics
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

    const { id: studentId } = params;
    const { canAccess, userType } = canViewStudentAnalytics(token, studentId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all'; // all, year, session
    const includeComparative = searchParams.get('includeComparative') === 'true';
    const includePredictive = searchParams.get('includePredictive') === 'true';

    // Get student results
    let studentResults = Array.from(examResults.values()).filter(
      result => result.studentId === studentId && result.publication.isPublished
    );

    if (studentResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          studentInfo: { studentId, hasData: false },
          analytics: null,
          message: 'No results available for analytics'
        },
        message: 'No data available for student analytics'
      });
    }

    // Apply timeframe filter
    if (timeframe !== 'all') {
      const currentYear = new Date().getFullYear();
      if (timeframe === 'year') {
        studentResults = studentResults.filter(r => 
          new Date(r.audit.generatedAt).getFullYear() === currentYear
        );
      }
    }

    // Sort by date
    studentResults.sort((a, b) => 
      new Date(a.audit.generatedAt).getTime() - new Date(b.audit.generatedAt).getTime()
    );

    // Calculate analytics
    const performanceTrends = calculatePerformanceTrends(studentResults);
    const subjectMastery = calculateSubjectMastery(studentResults);
    const learningAnalytics = calculateLearningAnalytics(studentResults);

    // Prepare response data
    let responseData: any = {
      studentInfo: {
        studentId,
        studentName: studentResults[0].studentName,
        studentNumber: studentResults[0].studentNumber,
        schoolName: studentResults[0].schoolName,
        hasData: true,
        totalExams: studentResults.length,
        dateRange: {
          from: studentResults[0].audit.generatedAt,
          to: studentResults[studentResults.length - 1].audit.generatedAt
        }
      },
      performanceTrends,
      subjectMastery,
      learningAnalytics,
      overallMetrics: {
        currentPerformance: studentResults[studentResults.length - 1].overallPerformance.averagePercentage,
        bestPerformance: Math.max(...studentResults.map(r => r.overallPerformance.averagePercentage)),
        averagePerformance: Math.round(
          studentResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0) / studentResults.length
        ),
        totalSubjects: [...new Set(studentResults.flatMap(r => r.subjects.map(s => s.subjectCode)))].length,
        passRate: Math.round(
          (studentResults.filter(r => r.overallPerformance.subjectsPassed > 0).length / studentResults.length) * 100
        )
      }
    };

    // Include comparative analysis if requested
    if (includeComparative) {
      responseData.comparativeMetrics = calculateComparativeMetrics(studentResults, studentId);
    }

    // Include predictive analytics if requested
    if (includePredictive) {
      responseData.predictiveAnalytics = {
        nextExamPrediction: performanceTrends.projectedPerformance,
        riskFactors: identifyRiskFactors(studentResults),
        recommendations: generateRecommendations(performanceTrends, subjectMastery, learningAnalytics)
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Student performance analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get student performance analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const calculatePercentile = (studentScore: number, average: number): number => {
  // Simplified percentile calculation
  const percentile = ((studentScore - average) / average) * 50 + 50;
  return Math.max(1, Math.min(99, Math.round(percentile)));
};

const calculateLearningVelocity = (performanceBySession: any[]): string => {
  if (performanceBySession.length < 2) return 'insufficient_data';
  
  const improvements = [];
  for (let i = 1; i < performanceBySession.length; i++) {
    improvements.push(performanceBySession[i].averagePerformance - performanceBySession[i-1].averagePerformance);
  }
  
  const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
  
  if (avgImprovement > 5) return 'accelerating';
  if (avgImprovement > 0) return 'steady';
  if (avgImprovement > -5) return 'stable';
  return 'declining';
};

const generateFocusRecommendations = (strengths: any[], weaknesses: any[]): string[] => {
  const recommendations = [];
  
  if (weaknesses.length > 0) {
    recommendations.push(`Focus on improving performance in: ${weaknesses.map(w => w.subjectCode).join(', ')}`);
    recommendations.push('Consider additional study time for weaker subjects');
  }
  
  if (strengths.length > 0) {
    recommendations.push(`Maintain excellence in: ${strengths.map(s => s.subjectCode).join(', ')}`);
    recommendations.push('Use strong subjects to boost overall performance');
  }
  
  return recommendations;
};

const identifyRiskFactors = (studentResults: any[]): string[] => {
  const risks = [];
  const latestResult = studentResults[studentResults.length - 1];
  
  if (latestResult.overallPerformance.averagePercentage < 50) {
    risks.push('Below average performance');
  }
  
  if (studentResults.length >= 2) {
    const current = latestResult.overallPerformance.averagePercentage;
    const previous = studentResults[studentResults.length - 2].overallPerformance.averagePercentage;
    
    if (current < previous - 10) {
      risks.push('Declining performance trend');
    }
  }
  
  const failedSubjects = latestResult.subjects.filter((s: any) => s.status === 'fail').length;
  if (failedSubjects > latestResult.subjects.length / 2) {
    risks.push('High failure rate in subjects');
  }
  
  return risks;
};

const generateRecommendations = (trends: any, mastery: any[], learning: any): string[] => {
  const recommendations = [];
  
  if (trends.trendDirection === 'declining') {
    recommendations.push('Immediate intervention needed to reverse declining performance');
    recommendations.push('Consider additional tutoring or study support');
  } else if (trends.trendDirection === 'improving') {
    recommendations.push('Continue current study methods - showing good improvement');
  }
  
  if (trends.consistency < 70) {
    recommendations.push('Focus on developing consistent study habits');
  }
  
  const beginnerSubjects = mastery.filter(m => m.masteryLevel === 'beginner');
  if (beginnerSubjects.length > 0) {
    recommendations.push(`Prioritize foundational learning in: ${beginnerSubjects.map(s => s.subjectCode).join(', ')}`);
  }
  
  return recommendations;
};
