import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();
const doubleMarkingVerifications: Map<string, any> = new Map();
const scriptAllocations: Map<string, any> = new Map();

// Helper function to check examiner metrics access
const canViewExaminerMetrics = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate examiner performance metrics
const calculateExaminerMetrics = (examinerId: string): any => {
  // Get all markings by this examiner
  const examinerMarkings = Array.from(markingScores.values()).filter(
    marking => marking.examinerId === examinerId
  );

  if (examinerMarkings.length === 0) {
    return {
      examinerId,
      hasData: false,
      totalScripts: 0,
      completedScripts: 0,
      completionRate: 0,
      averageMarkingTime: 0,
      qualityScore: 0,
      consistencyScore: 0
    };
  }

  const totalScripts = examinerMarkings.length;
  const completedScripts = examinerMarkings.filter(m => 
    ['submitted', 'verified', 'moderated'].includes(m.status)
  ).length;
  const completionRate = Math.round((completedScripts / totalScripts) * 100);

  // Calculate average marking time
  const markingsWithTime = examinerMarkings.filter(m => m.markingTime?.totalMinutes);
  const averageMarkingTime = markingsWithTime.length > 0 ? 
    Math.round(markingsWithTime.reduce((sum, m) => sum + m.markingTime.totalMinutes, 0) / markingsWithTime.length) : 0;

  // Get double marking verifications for this examiner
  const examinerVerifications = Array.from(doubleMarkingVerifications.values()).filter(
    v => v.firstMarker.examinerId === examinerId || v.secondMarker.examinerId === examinerId
  );

  // Calculate quality and consistency scores
  const qualityScore = examinerVerifications.length > 0 ? 
    Math.round(examinerVerifications.reduce((sum, v) => sum + v.qualityMetrics.markingQuality === 'excellent' ? 100 : 
                                                           v.qualityMetrics.markingQuality === 'good' ? 80 :
                                                           v.qualityMetrics.markingQuality === 'acceptable' ? 60 : 40, 0) / examinerVerifications.length) : 85;

  const consistencyScore = examinerVerifications.length > 0 ? 
    Math.round(examinerVerifications.reduce((sum, v) => sum + v.qualityMetrics.consistencyScore, 0) / examinerVerifications.length) : 85;

  // Calculate productivity metrics
  const scriptsPerDay = calculateScriptsPerDay(examinerMarkings);
  const peakProductivityHours = calculatePeakHours(examinerMarkings);

  // Calculate accuracy metrics
  const accuracyMetrics = calculateAccuracyMetrics(examinerId, examinerVerifications);

  // Calculate subject expertise
  const subjectExpertise = calculateSubjectExpertise(examinerMarkings);

  return {
    examinerId,
    hasData: true,
    totalScripts,
    completedScripts,
    completionRate,
    averageMarkingTime,
    qualityScore,
    consistencyScore,
    productivity: {
      scriptsPerDay,
      peakProductivityHours,
      efficiency: calculateEfficiency(examinerMarkings)
    },
    accuracy: accuracyMetrics,
    subjectExpertise,
    performanceRating: calculatePerformanceRating(completionRate, qualityScore, consistencyScore)
  };
};

// Calculate scripts per day
const calculateScriptsPerDay = (markings: any[]): number => {
  if (markings.length === 0) return 0;

  const completedMarkings = markings.filter(m => m.status === 'submitted' && m.markingTime?.completedAt);
  if (completedMarkings.length === 0) return 0;

  const dates = completedMarkings.map(m => new Date(m.markingTime.completedAt).toDateString());
  const uniqueDates = [...new Set(dates)];
  
  return Math.round((completedMarkings.length / uniqueDates.length) * 100) / 100;
};

// Calculate peak productivity hours
const calculatePeakHours = (markings: any[]): string[] => {
  const hourCounts: { [hour: number]: number } = {};
  
  markings.forEach(marking => {
    if (marking.markingTime?.completedAt) {
      const hour = new Date(marking.markingTime.completedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00-${parseInt(hour) + 1}:00`);

  return sortedHours;
};

// Calculate efficiency
const calculateEfficiency = (markings: any[]): number => {
  const completedMarkings = markings.filter(m => m.status === 'submitted' && m.markingTime?.totalMinutes);
  if (completedMarkings.length === 0) return 0;

  const averageTime = completedMarkings.reduce((sum, m) => sum + m.markingTime.totalMinutes, 0) / completedMarkings.length;
  const expectedTime = 30; // Expected 30 minutes per script
  
  return Math.round((expectedTime / averageTime) * 100);
};

// Calculate accuracy metrics
const calculateAccuracyMetrics = (examinerId: string, verifications: any[]): any => {
  if (verifications.length === 0) {
    return {
      totalVerifications: 0,
      accuracyRate: 85,
      averageDiscrepancy: 0,
      significantDiscrepancies: 0
    };
  }

  const totalVerifications = verifications.length;
  const significantDiscrepancies = verifications.filter(v => v.discrepancy.isSignificant).length;
  const accuracyRate = Math.round(((totalVerifications - significantDiscrepancies) / totalVerifications) * 100);
  const averageDiscrepancy = Math.round(
    verifications.reduce((sum, v) => sum + v.discrepancy.percentageDifference, 0) / totalVerifications
  );

  return {
    totalVerifications,
    accuracyRate,
    averageDiscrepancy,
    significantDiscrepancies
  };
};

// Calculate subject expertise
const calculateSubjectExpertise = (markings: any[]): any[] => {
  const subjectData = new Map<string, any>();

  markings.forEach(marking => {
    if (!subjectData.has(marking.subjectCode)) {
      subjectData.set(marking.subjectCode, {
        subjectCode: marking.subjectCode,
        subjectName: marking.subjectName || marking.subjectCode,
        totalScripts: 0,
        completedScripts: 0,
        averageTime: 0,
        totalTime: 0
      });
    }

    const data = subjectData.get(marking.subjectCode)!;
    data.totalScripts++;
    
    if (marking.status === 'submitted') {
      data.completedScripts++;
      if (marking.markingTime?.totalMinutes) {
        data.totalTime += marking.markingTime.totalMinutes;
      }
    }
  });

  return Array.from(subjectData.values()).map(data => ({
    ...data,
    completionRate: Math.round((data.completedScripts / data.totalScripts) * 100),
    averageTime: data.completedScripts > 0 ? Math.round(data.totalTime / data.completedScripts) : 0,
    expertiseLevel: determineExpertiseLevel(data.totalScripts, data.completionRate)
  })).sort((a, b) => b.totalScripts - a.totalScripts);
};

// Determine expertise level
const determineExpertiseLevel = (totalScripts: number, completionRate: number): string => {
  if (totalScripts >= 100 && completionRate >= 95) return 'expert';
  if (totalScripts >= 50 && completionRate >= 90) return 'advanced';
  if (totalScripts >= 20 && completionRate >= 80) return 'intermediate';
  return 'beginner';
};

// Calculate performance rating
const calculatePerformanceRating = (completionRate: number, qualityScore: number, consistencyScore: number): string => {
  const overallScore = (completionRate + qualityScore + consistencyScore) / 3;
  
  if (overallScore >= 90) return 'excellent';
  if (overallScore >= 80) return 'good';
  if (overallScore >= 70) return 'satisfactory';
  return 'needs_improvement';
};

// Calculate comparative metrics
const calculateComparativeMetrics = (examinerMetrics: any[], targetExaminerId: string): any => {
  const targetExaminer = examinerMetrics.find(e => e.examinerId === targetExaminerId);
  if (!targetExaminer) return null;

  const otherExaminers = examinerMetrics.filter(e => e.examinerId !== targetExaminerId && e.hasData);
  if (otherExaminers.length === 0) return null;

  const avgCompletionRate = Math.round(otherExaminers.reduce((sum, e) => sum + e.completionRate, 0) / otherExaminers.length);
  const avgQualityScore = Math.round(otherExaminers.reduce((sum, e) => sum + e.qualityScore, 0) / otherExaminers.length);
  const avgConsistencyScore = Math.round(otherExaminers.reduce((sum, e) => sum + e.consistencyScore, 0) / otherExaminers.length);

  // Calculate percentile rankings
  const completionRanking = calculatePercentile(targetExaminer.completionRate, otherExaminers.map(e => e.completionRate));
  const qualityRanking = calculatePercentile(targetExaminer.qualityScore, otherExaminers.map(e => e.qualityScore));
  const consistencyRanking = calculatePercentile(targetExaminer.consistencyScore, otherExaminers.map(e => e.consistencyScore));

  return {
    peerAverages: {
      completionRate: avgCompletionRate,
      qualityScore: avgQualityScore,
      consistencyScore: avgConsistencyScore
    },
    percentileRankings: {
      completion: completionRanking,
      quality: qualityRanking,
      consistency: consistencyRanking
    },
    performanceGaps: {
      completion: targetExaminer.completionRate - avgCompletionRate,
      quality: targetExaminer.qualityScore - avgQualityScore,
      consistency: targetExaminer.consistencyScore - avgConsistencyScore
    }
  };
};

// Calculate percentile
const calculatePercentile = (value: number, dataset: number[]): number => {
  const sorted = dataset.sort((a, b) => a - b);
  const rank = sorted.filter(v => v <= value).length;
  return Math.round((rank / sorted.length) * 100);
};

// GET - Get examiner metrics
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

    if (!canViewExaminerMetrics(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view examiner metrics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examinerId = searchParams.get('examinerId') || '';
    const includeComparative = searchParams.get('includeComparative') === 'true';
    const includeAll = searchParams.get('includeAll') === 'true';

    if (!includeAll && !examinerId) {
      return NextResponse.json(
        { success: false, message: 'Examiner ID is required' },
        { status: 400 }
      );
    }

    if (includeAll) {
      // Get metrics for all examiners
      const allExaminers = Array.from(new Set(
        Array.from(markingScores.values()).map(m => m.examinerId)
      ));

      const allExaminerMetrics = allExaminers.map(id => calculateExaminerMetrics(id));
      const activeExaminers = allExaminerMetrics.filter(e => e.hasData);

      // Calculate summary statistics
      const summary = {
        totalExaminers: allExaminers.length,
        activeExaminers: activeExaminers.length,
        averageCompletionRate: activeExaminers.length > 0 ? 
          Math.round(activeExaminers.reduce((sum, e) => sum + e.completionRate, 0) / activeExaminers.length) : 0,
        averageQualityScore: activeExaminers.length > 0 ? 
          Math.round(activeExaminers.reduce((sum, e) => sum + e.qualityScore, 0) / activeExaminers.length) : 0,
        topPerformers: activeExaminers
          .sort((a, b) => (b.qualityScore + b.consistencyScore + b.completionRate) - (a.qualityScore + a.consistencyScore + a.completionRate))
          .slice(0, 5),
        needsImprovement: activeExaminers.filter(e => e.performanceRating === 'needs_improvement')
      };

      return NextResponse.json({
        success: true,
        data: {
          allExaminers: true,
          summary,
          examiners: activeExaminers.sort((a, b) => b.qualityScore - a.qualityScore)
        },
        message: 'All examiner metrics retrieved successfully'
      });
    } else {
      // Get metrics for specific examiner
      const examinerMetrics = calculateExaminerMetrics(examinerId);

      if (!examinerMetrics.hasData) {
        return NextResponse.json({
          success: true,
          data: {
            examinerId,
            hasData: false,
            message: 'No marking data available for this examiner'
          },
          message: 'No data available for examiner metrics'
        });
      }

      let responseData: any = examinerMetrics;

      // Include comparative analysis if requested
      if (includeComparative) {
        const allExaminers = Array.from(new Set(
          Array.from(markingScores.values()).map(m => m.examinerId)
        ));
        const allMetrics = allExaminers.map(id => calculateExaminerMetrics(id));
        responseData.comparativeMetrics = calculateComparativeMetrics(allMetrics, examinerId);
      }

      return NextResponse.json({
        success: true,
        data: responseData,
        message: 'Examiner metrics retrieved successfully'
      });
    }

  } catch (error) {
    console.error('Get examiner metrics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
