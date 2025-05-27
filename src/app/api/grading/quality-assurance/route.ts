import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();
const doubleMarkingVerifications: Map<string, any> = new Map();
const chiefExaminerReviews: Map<string, any> = new Map();
const gradeCalculations: Map<string, any> = new Map();
const scoreNormalizations: Map<string, any> = new Map();
const scriptAllocations: Map<string, any> = new Map();

// Helper function to check QA access
const canViewQualityAssurance = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate marking quality metrics
const calculateMarkingQuality = (): any => {
  const allMarkings = Array.from(markingScores.values());
  const completedMarkings = allMarkings.filter(m => ['submitted', 'verified', 'moderated'].includes(m.status));
  
  if (completedMarkings.length === 0) {
    return {
      totalScripts: 0,
      completedScripts: 0,
      completionRate: 0,
      averageMarkingTime: 0,
      qualityDistribution: { excellent: 0, good: 0, acceptable: 0, poor: 0 },
      flaggedScripts: 0,
      consistencyScore: 0
    };
  }

  // Calculate completion rate
  const completionRate = Math.round((completedMarkings.length / allMarkings.length) * 100);

  // Calculate average marking time
  const markingsWithTime = completedMarkings.filter(m => m.markingTime?.totalMinutes);
  const averageMarkingTime = markingsWithTime.length > 0 ? 
    Math.round(markingsWithTime.reduce((sum, m) => sum + m.markingTime.totalMinutes, 0) / markingsWithTime.length) : 0;

  // Calculate quality distribution from double marking verifications
  const verifications = Array.from(doubleMarkingVerifications.values());
  const qualityDistribution = {
    excellent: verifications.filter(v => v.qualityMetrics.markingQuality === 'excellent').length,
    good: verifications.filter(v => v.qualityMetrics.markingQuality === 'good').length,
    acceptable: verifications.filter(v => v.qualityMetrics.markingQuality === 'acceptable').length,
    poor: verifications.filter(v => v.qualityMetrics.markingQuality === 'poor').length
  };

  // Count flagged scripts
  const flaggedScripts = completedMarkings.filter(m => m.flags && m.flags.length > 0).length;

  // Calculate consistency score
  const consistencyScore = verifications.length > 0 ? 
    Math.round(verifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / verifications.length) : 85;

  return {
    totalScripts: allMarkings.length,
    completedScripts: completedMarkings.length,
    completionRate,
    averageMarkingTime,
    qualityDistribution,
    flaggedScripts,
    consistencyScore
  };
};

// Calculate double marking metrics
const calculateDoubleMarkingMetrics = (): any => {
  const verifications = Array.from(doubleMarkingVerifications.values());
  
  if (verifications.length === 0) {
    return {
      totalVerifications: 0,
      significantDiscrepancies: 0,
      discrepancyRate: 0,
      averageDiscrepancy: 0,
      escalatedCases: 0,
      resolvedCases: 0,
      averageResolutionTime: 0
    };
  }

  const significantDiscrepancies = verifications.filter(v => v.discrepancy.isSignificant).length;
  const discrepancyRate = Math.round((significantDiscrepancies / verifications.length) * 100);
  
  const averageDiscrepancy = Math.round(
    verifications.reduce((sum, v) => sum + v.discrepancy.percentageDifference, 0) / verifications.length
  );

  const escalatedCases = verifications.filter(v => v.escalation.isEscalated).length;
  const resolvedCases = verifications.filter(v => v.verification.status === 'resolved').length;

  // Calculate average resolution time for resolved cases
  const resolvedVerifications = verifications.filter(v => v.verification.status === 'resolved');
  const averageResolutionTime = resolvedVerifications.length > 0 ? 
    Math.round(resolvedVerifications.reduce((sum, v) => {
      const created = new Date(v.createdAt).getTime();
      const resolved = new Date(v.updatedAt).getTime();
      return sum + (resolved - created);
    }, 0) / (resolvedVerifications.length * 60 * 60 * 1000)) : 0; // in hours

  return {
    totalVerifications: verifications.length,
    significantDiscrepancies,
    discrepancyRate,
    averageDiscrepancy,
    escalatedCases,
    resolvedCases,
    averageResolutionTime
  };
};

// Calculate examiner performance metrics
const calculateExaminerPerformance = (): any => {
  const allExaminers = Array.from(new Set(
    Array.from(markingScores.values()).map(m => m.examinerId)
  ));

  const examinerMetrics = allExaminers.map(examinerId => {
    const examinerMarkings = Array.from(markingScores.values()).filter(m => m.examinerId === examinerId);
    const completedMarkings = examinerMarkings.filter(m => ['submitted', 'verified'].includes(m.status));
    
    // Get examiner verifications
    const examinerVerifications = Array.from(doubleMarkingVerifications.values()).filter(
      v => v.firstMarker.examinerId === examinerId || v.secondMarker.examinerId === examinerId
    );

    const consistencyScore = examinerVerifications.length > 0 ? 
      Math.round(examinerVerifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / examinerVerifications.length) : 85;

    const averageMarkingTime = completedMarkings.length > 0 ? 
      Math.round(completedMarkings.reduce((sum, m) => sum + (m.markingTime?.totalMinutes || 30), 0) / completedMarkings.length) : 0;

    return {
      examinerId,
      totalScripts: examinerMarkings.length,
      completedScripts: completedMarkings.length,
      completionRate: examinerMarkings.length > 0 ? Math.round((completedMarkings.length / examinerMarkings.length) * 100) : 0,
      consistencyScore,
      averageMarkingTime,
      flaggedScripts: examinerMarkings.filter(m => m.flags && m.flags.length > 0).length
    };
  });

  // Calculate overall metrics
  const totalScripts = examinerMetrics.reduce((sum, e) => sum + e.totalScripts, 0);
  const totalCompleted = examinerMetrics.reduce((sum, e) => sum + e.completedScripts, 0);
  const averageConsistency = examinerMetrics.length > 0 ? 
    Math.round(examinerMetrics.reduce((sum, e) => sum + e.consistencyScore, 0) / examinerMetrics.length) : 0;

  return {
    totalExaminers: allExaminers.length,
    totalScripts,
    totalCompleted,
    overallCompletionRate: totalScripts > 0 ? Math.round((totalCompleted / totalScripts) * 100) : 0,
    averageConsistency,
    topPerformers: examinerMetrics.sort((a, b) => b.consistencyScore - a.consistencyScore).slice(0, 5),
    underPerformers: examinerMetrics.filter(e => e.consistencyScore < 70 || e.completionRate < 80)
  };
};

// Calculate grade distribution analysis
const calculateGradeDistributionAnalysis = (): any => {
  const calculations = Array.from(gradeCalculations.values());
  
  if (calculations.length === 0) {
    return {
      totalSubjects: 0,
      averagePassRate: 0,
      gradeDistribution: {},
      outlierSubjects: [],
      qualityIndicators: { reliability: 0, validity: 0, discrimination: 0 }
    };
  }

  // Calculate overall grade distribution
  const overallDistribution: any = {};
  let totalCandidates = 0;
  let totalPassed = 0;

  calculations.forEach(calc => {
    totalCandidates += calc.statistics.totalCandidates;
    
    Object.entries(calc.gradeDistribution).forEach(([grade, data]: [string, any]) => {
      if (!overallDistribution[grade]) {
        overallDistribution[grade] = { count: 0, percentage: 0 };
      }
      overallDistribution[grade].count += data.count;
      
      // Count passes (grades A1-C6 for O Level, A-E for A Level)
      if ((calc.examLevel === 'O Level' && ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(grade)) ||
          (calc.examLevel === 'A Level' && ['A', 'B', 'C', 'D', 'E'].includes(grade))) {
        totalPassed += data.count;
      }
    });
  });

  // Calculate percentages
  Object.keys(overallDistribution).forEach(grade => {
    overallDistribution[grade].percentage = totalCandidates > 0 ? 
      Math.round((overallDistribution[grade].count / totalCandidates) * 100 * 100) / 100 : 0;
  });

  const averagePassRate = totalCandidates > 0 ? Math.round((totalPassed / totalCandidates) * 100) : 0;

  // Identify outlier subjects (those with unusual grade distributions)
  const outlierSubjects = calculations.filter(calc => {
    const passRate = calc.examLevel === 'O Level' ? 
      ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].reduce((sum, grade) => sum + (calc.gradeDistribution[grade]?.percentage || 0), 0) :
      ['A', 'B', 'C', 'D', 'E'].reduce((sum, grade) => sum + (calc.gradeDistribution[grade]?.percentage || 0), 0);
    
    return Math.abs(passRate - averagePassRate) > 20; // More than 20% difference
  }).map(calc => ({
    subjectCode: calc.subjectCode,
    passRate: calc.examLevel === 'O Level' ? 
      ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].reduce((sum, grade) => sum + (calc.gradeDistribution[grade]?.percentage || 0), 0) :
      ['A', 'B', 'C', 'D', 'E'].reduce((sum, grade) => sum + (calc.gradeDistribution[grade]?.percentage || 0), 0),
    deviation: 0
  }));

  // Calculate average quality indicators
  const qualityIndicators = {
    reliability: calculations.length > 0 ? 
      Math.round(calculations.reduce((sum, calc) => sum + calc.qualityIndicators.reliability, 0) / calculations.length * 100) / 100 : 0,
    validity: calculations.length > 0 ? 
      Math.round(calculations.reduce((sum, calc) => sum + calc.qualityIndicators.validity, 0) / calculations.length * 100) / 100 : 0,
    discrimination: calculations.length > 0 ? 
      Math.round(calculations.reduce((sum, calc) => sum + calc.qualityIndicators.discrimination, 0) / calculations.length * 100) / 100 : 0
  };

  return {
    totalSubjects: calculations.length,
    averagePassRate,
    gradeDistribution: overallDistribution,
    outlierSubjects,
    qualityIndicators
  };
};

// Identify quality issues and alerts
const identifyQualityIssues = (): any[] => {
  const issues = [];

  // Check for high discrepancy rates
  const verifications = Array.from(doubleMarkingVerifications.values());
  const significantDiscrepancies = verifications.filter(v => v.discrepancy.isSignificant).length;
  const discrepancyRate = verifications.length > 0 ? (significantDiscrepancies / verifications.length) * 100 : 0;

  if (discrepancyRate > 25) {
    issues.push({
      type: 'high_discrepancy_rate',
      severity: 'high',
      message: `High discrepancy rate: ${Math.round(discrepancyRate)}% of double markings have significant discrepancies`,
      recommendation: 'Review marking guidelines and provide additional examiner training'
    });
  }

  // Check for overdue markings
  const allocations = Array.from(scriptAllocations.values());
  const overdueAllocations = allocations.flatMap(alloc => 
    alloc.allocations.filter((examinerAlloc: any) => 
      new Date(examinerAlloc.deadline) < new Date() && examinerAlloc.status !== 'completed'
    )
  );

  if (overdueAllocations.length > 0) {
    issues.push({
      type: 'overdue_markings',
      severity: 'medium',
      message: `${overdueAllocations.length} marking allocations are overdue`,
      recommendation: 'Contact examiners and consider reassigning scripts if necessary'
    });
  }

  // Check for poor marking quality
  const poorQualityVerifications = verifications.filter(v => v.qualityMetrics.markingQuality === 'poor').length;
  if (poorQualityVerifications > 0) {
    issues.push({
      type: 'poor_marking_quality',
      severity: 'high',
      message: `${poorQualityVerifications} scripts have poor marking quality`,
      recommendation: 'Investigate marking standards and provide immediate feedback to examiners'
    });
  }

  // Check for unusual grade distributions
  const calculations = Array.from(gradeCalculations.values());
  const outliers = calculations.filter(calc => {
    const failRate = calc.examLevel === 'O Level' ? 
      (calc.gradeDistribution['D7']?.percentage || 0) + (calc.gradeDistribution['E8']?.percentage || 0) + (calc.gradeDistribution['F9']?.percentage || 0) :
      (calc.gradeDistribution['F']?.percentage || 0);
    
    return failRate > 50; // More than 50% failure rate
  });

  if (outliers.length > 0) {
    issues.push({
      type: 'unusual_grade_distribution',
      severity: 'medium',
      message: `${outliers.length} subjects have unusually high failure rates`,
      recommendation: 'Review exam difficulty and consider grade boundary adjustments'
    });
  }

  return issues;
};

// GET - Get quality assurance dashboard
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!canViewQualityAssurance(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view quality assurance data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const dashboardType = searchParams.get('type') || 'overview';

    // Calculate various quality metrics
    const markingQuality = calculateMarkingQuality();
    const doubleMarkingMetrics = calculateDoubleMarkingMetrics();
    const examinerPerformance = calculateExaminerPerformance();
    const gradeDistributionAnalysis = calculateGradeDistributionAnalysis();
    const qualityIssues = identifyQualityIssues();

    // Calculate overall quality score
    const overallQualityScore = Math.round(
      (markingQuality.consistencyScore * 0.3 +
       (100 - doubleMarkingMetrics.discrepancyRate) * 0.3 +
       examinerPerformance.averageConsistency * 0.2 +
       gradeDistributionAnalysis.qualityIndicators.reliability * 100 * 0.2)
    );

    const dashboardData = {
      overview: {
        overallQualityScore,
        totalScripts: markingQuality.totalScripts,
        completionRate: markingQuality.completionRate,
        qualityIssuesCount: qualityIssues.length,
        lastUpdated: new Date().toISOString()
      },
      markingQuality,
      doubleMarkingMetrics,
      examinerPerformance,
      gradeDistributionAnalysis,
      qualityIssues,
      recommendations: generateRecommendations(qualityIssues, markingQuality, doubleMarkingMetrics),
      trends: calculateQualityTrends()
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Quality assurance data retrieved successfully'
    });

  } catch (error) {
    console.error('Get quality assurance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const generateRecommendations = (issues: any[], markingQuality: any, doubleMarkingMetrics: any): string[] => {
  const recommendations = [];

  if (issues.some(i => i.type === 'high_discrepancy_rate')) {
    recommendations.push('Conduct additional examiner training sessions');
    recommendations.push('Review and clarify marking schemes');
  }

  if (markingQuality.completionRate < 90) {
    recommendations.push('Monitor marking progress more closely');
    recommendations.push('Consider additional examiner recruitment');
  }

  if (doubleMarkingMetrics.escalatedCases > 0) {
    recommendations.push('Prioritize resolution of escalated marking cases');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current quality assurance practices');
    recommendations.push('Monitor trends for any emerging issues');
  }

  return recommendations;
};

const calculateQualityTrends = (): any => {
  // Simplified trend calculation - in practice would analyze historical data
  return {
    consistencyTrend: 'stable',
    completionTrend: 'improving',
    discrepancyTrend: 'decreasing',
    overallTrend: 'positive'
  };
};
