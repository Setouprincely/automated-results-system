import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();
const scriptAllocations: Map<string, any> = new Map();
const doubleMarkingVerifications: Map<string, any> = new Map();
const chiefExaminerReviews: Map<string, any> = new Map();

// Helper function to check analytics access
const canViewAnalytics = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate examiner performance metrics
const calculateExaminerPerformance = (examinerId: string): any => {
  const examinerMarkings = Array.from(markingScores.values()).filter(
    marking => marking.examinerId === examinerId
  );

  if (examinerMarkings.length === 0) {
    return {
      examinerId,
      totalScriptsMarked: 0,
      averageMarkingTime: 0,
      consistencyScore: 0,
      qualityRating: 0,
      productivityScore: 0
    };
  }

  // Calculate metrics
  const totalScriptsMarked = examinerMarkings.length;
  const completedMarkings = examinerMarkings.filter(m => m.status === 'submitted' || m.status === 'verified');
  
  const averageMarkingTime = completedMarkings.length > 0 ? 
    Math.round(completedMarkings.reduce((sum, m) => sum + (m.markingTime.totalMinutes || 30), 0) / completedMarkings.length) : 0;

  // Calculate consistency score based on double marking verifications
  const verifications = Array.from(doubleMarkingVerifications.values()).filter(
    v => v.firstMarker.examinerId === examinerId || v.secondMarker.examinerId === examinerId
  );

  const consistencyScore = verifications.length > 0 ? 
    Math.round(verifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / verifications.length) : 85;

  // Calculate quality rating from chief examiner reviews
  const reviews = Array.from(chiefExaminerReviews.values());
  const examinerReviews = reviews.flatMap(review => 
    review.scriptsReviewed.filter((script: any) => {
      const marking = Array.from(markingScores.values()).find(m => m.scriptId === script.scriptId);
      return marking && marking.examinerId === examinerId;
    })
  );

  const qualityRating = examinerReviews.length > 0 ? 
    Math.round(examinerReviews.reduce((sum, script) => {
      const qualityMap = { excellent: 5, good: 4, acceptable: 3, poor: 2 };
      return sum + (qualityMap[script.markingQuality as keyof typeof qualityMap] || 3);
    }, 0) / examinerReviews.length * 10) / 10 : 4.0;

  // Calculate productivity score
  const expectedScriptsPerDay = 20; // Configurable
  const workingDays = 30; // Configurable period
  const expectedTotal = expectedScriptsPerDay * workingDays;
  const productivityScore = Math.min(100, Math.round((totalScriptsMarked / expectedTotal) * 100));

  return {
    examinerId,
    totalScriptsMarked,
    averageMarkingTime,
    consistencyScore,
    qualityRating,
    productivityScore,
    completionRate: totalScriptsMarked > 0 ? Math.round((completedMarkings.length / totalScriptsMarked) * 100) : 0,
    flaggedScripts: examinerMarkings.filter(m => m.flags && m.flags.length > 0).length
  };
};

// Calculate subject performance analytics
const calculateSubjectPerformance = (subjectCode: string): any => {
  const subjectMarkings = Array.from(markingScores.values()).filter(
    marking => marking.subjectCode === subjectCode
  );

  if (subjectMarkings.length === 0) {
    return {
      subjectCode,
      totalScripts: 0,
      averageMarks: 0,
      standardDeviation: 0,
      gradeDistribution: {},
      markingConsistency: 0
    };
  }

  const marks = subjectMarkings.map(m => m.totalMarks);
  const averageMarks = Math.round(marks.reduce((sum, mark) => sum + mark, 0) / marks.length * 100) / 100;
  
  const variance = marks.reduce((sum, mark) => sum + Math.pow(mark - averageMarks, 2), 0) / marks.length;
  const standardDeviation = Math.round(Math.sqrt(variance) * 100) / 100;

  // Grade distribution
  const gradeDistribution = subjectMarkings.reduce((dist: any, marking) => {
    const grade = marking.grade || 'Unknown';
    dist[grade] = (dist[grade] || 0) + 1;
    return dist;
  }, {});

  // Marking consistency from double marking verifications
  const subjectVerifications = Array.from(doubleMarkingVerifications.values()).filter(
    v => v.subjectCode === subjectCode
  );

  const markingConsistency = subjectVerifications.length > 0 ? 
    Math.round(subjectVerifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / subjectVerifications.length) : 85;

  return {
    subjectCode,
    totalScripts: subjectMarkings.length,
    averageMarks,
    standardDeviation,
    gradeDistribution,
    markingConsistency,
    completedScripts: subjectMarkings.filter(m => m.status === 'submitted' || m.status === 'verified').length
  };
};

// GET - Get marking performance analytics
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

    if (!canViewAnalytics(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view analytics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const examinerId = searchParams.get('examinerId') || '';
    const analyticsType = searchParams.get('type') || 'overview';

    let analyticsData: any = {};

    switch (analyticsType) {
      case 'examiner':
        if (examinerId) {
          analyticsData = {
            examinerPerformance: calculateExaminerPerformance(examinerId),
            examinerDetails: userStorage.findById(examinerId)
          };
        } else {
          // Get all examiners performance
          const allExaminers = Array.from(new Set(
            Array.from(markingScores.values()).map(m => m.examinerId)
          ));
          
          analyticsData = {
            examinersPerformance: allExaminers.map(id => calculateExaminerPerformance(id))
              .sort((a, b) => b.qualityRating - a.qualityRating)
          };
        }
        break;

      case 'subject':
        if (subjectCode) {
          analyticsData = {
            subjectPerformance: calculateSubjectPerformance(subjectCode)
          };
        } else {
          // Get all subjects performance
          const allSubjects = Array.from(new Set(
            Array.from(markingScores.values()).map(m => m.subjectCode)
          ));
          
          analyticsData = {
            subjectsPerformance: allSubjects.map(code => calculateSubjectPerformance(code))
          };
        }
        break;

      case 'quality':
        // Quality assurance analytics
        const allVerifications = Array.from(doubleMarkingVerifications.values());
        const allReviews = Array.from(chiefExaminerReviews.values());
        
        analyticsData = {
          qualityMetrics: {
            totalVerifications: allVerifications.length,
            significantDiscrepancies: allVerifications.filter(v => v.discrepancy.isSignificant).length,
            averageConsistency: allVerifications.length > 0 ? 
              Math.round(allVerifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / allVerifications.length) : 0,
            escalatedCases: allVerifications.filter(v => v.escalation.isEscalated).length,
            chiefExaminerReviews: allReviews.length,
            averageQualityRating: allReviews.length > 0 ? 
              Math.round(allReviews.reduce((sum, r) => sum + r.overallAssessment.overallQuality, 0) / allReviews.length * 10) / 10 : 0
          }
        };
        break;

      case 'productivity':
        // Productivity analytics
        const allAllocations = Array.from(scriptAllocations.values());
        const totalAllocated = allAllocations.reduce((sum, alloc) => sum + alloc.totalScripts, 0);
        const totalMarked = Array.from(markingScores.values()).filter(m => m.status === 'submitted' || m.status === 'verified').length;
        
        analyticsData = {
          productivityMetrics: {
            totalScriptsAllocated: totalAllocated,
            totalScriptsMarked: totalMarked,
            completionRate: totalAllocated > 0 ? Math.round((totalMarked / totalAllocated) * 100) : 0,
            averageMarkingTime: calculateAverageMarkingTime(),
            dailyProductivity: calculateDailyProductivity(),
            bottlenecks: identifyBottlenecks()
          }
        };
        break;

      default: // overview
        analyticsData = {
          overview: {
            totalScripts: Array.from(markingScores.values()).length,
            completedScripts: Array.from(markingScores.values()).filter(m => m.status === 'submitted' || m.status === 'verified').length,
            activeExaminers: Array.from(new Set(Array.from(markingScores.values()).map(m => m.examinerId))).length,
            averageMarks: calculateOverallAverageMarks(),
            qualityScore: calculateOverallQualityScore(),
            productivityScore: calculateOverallProductivityScore()
          },
          recentActivity: getRecentActivity(),
          alerts: generateAlerts()
        };
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      message: 'Performance analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get performance analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const calculateAverageMarkingTime = (): number => {
  const completedMarkings = Array.from(markingScores.values()).filter(
    m => m.status === 'submitted' && m.markingTime.totalMinutes
  );
  
  return completedMarkings.length > 0 ? 
    Math.round(completedMarkings.reduce((sum, m) => sum + m.markingTime.totalMinutes, 0) / completedMarkings.length) : 0;
};

const calculateDailyProductivity = (): any => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  return last7Days.map(date => ({
    date,
    scriptsMarked: Array.from(markingScores.values()).filter(m => 
      m.submittedAt && m.submittedAt.startsWith(date)
    ).length
  }));
};

const identifyBottlenecks = (): string[] => {
  const bottlenecks = [];
  
  // Check for overdue scripts
  const overdueScripts = Array.from(scriptAllocations.values()).flatMap(alloc => 
    alloc.allocations.filter((examinerAlloc: any) => 
      new Date(examinerAlloc.deadline) < new Date() && examinerAlloc.status !== 'completed'
    )
  );
  
  if (overdueScripts.length > 0) {
    bottlenecks.push(`${overdueScripts.length} overdue script allocations`);
  }

  // Check for high discrepancy rates
  const significantDiscrepancies = Array.from(doubleMarkingVerifications.values()).filter(
    v => v.discrepancy.isSignificant
  ).length;
  
  const totalVerifications = Array.from(doubleMarkingVerifications.values()).length;
  
  if (totalVerifications > 0 && (significantDiscrepancies / totalVerifications) > 0.2) {
    bottlenecks.push('High discrepancy rate in double marking');
  }

  return bottlenecks;
};

const calculateOverallAverageMarks = (): number => {
  const allMarkings = Array.from(markingScores.values());
  return allMarkings.length > 0 ? 
    Math.round(allMarkings.reduce((sum, m) => sum + m.totalMarks, 0) / allMarkings.length * 100) / 100 : 0;
};

const calculateOverallQualityScore = (): number => {
  const verifications = Array.from(doubleMarkingVerifications.values());
  return verifications.length > 0 ? 
    Math.round(verifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / verifications.length) : 85;
};

const calculateOverallProductivityScore = (): number => {
  const totalAllocated = Array.from(scriptAllocations.values()).reduce((sum, alloc) => sum + alloc.totalScripts, 0);
  const totalCompleted = Array.from(markingScores.values()).filter(m => m.status === 'submitted' || m.status === 'verified').length;
  
  return totalAllocated > 0 ? Math.round((totalCompleted / totalAllocated) * 100) : 0;
};

const getRecentActivity = (): any[] => {
  const recentMarkings = Array.from(markingScores.values())
    .filter(m => m.submittedAt)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 10);

  return recentMarkings.map(m => ({
    type: 'marking_submitted',
    examiner: m.examinerName,
    script: m.candidateNumber,
    subject: m.subjectCode,
    timestamp: m.submittedAt
  }));
};

const generateAlerts = (): any[] => {
  const alerts = [];
  
  // Check for overdue deadlines
  const overdueCount = Array.from(scriptAllocations.values()).flatMap(alloc => 
    alloc.allocations.filter((examinerAlloc: any) => 
      new Date(examinerAlloc.deadline) < new Date() && examinerAlloc.status !== 'completed'
    )
  ).length;
  
  if (overdueCount > 0) {
    alerts.push({
      type: 'warning',
      message: `${overdueCount} script allocations are overdue`,
      priority: 'high'
    });
  }

  // Check for quality issues
  const poorQualityCount = Array.from(doubleMarkingVerifications.values()).filter(
    v => v.qualityMetrics.markingQuality === 'poor'
  ).length;
  
  if (poorQualityCount > 0) {
    alerts.push({
      type: 'error',
      message: `${poorQualityCount} scripts have poor marking quality`,
      priority: 'urgent'
    });
  }

  return alerts;
};
