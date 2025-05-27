import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();

// Helper function to check comparative analysis access
const canViewComparativeAnalysis = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Extract region from location data
const extractRegion = (locationName: string): string => {
  if (!locationName) return 'Unknown';
  
  const regions = [
    'Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 
    'North', 'Adamawa', 'East', 'South', 'Far North'
  ];
  
  const foundRegion = regions.find(region => 
    locationName.toLowerCase().includes(region.toLowerCase())
  );
  return foundRegion || 'Other';
};

// Calculate entity metrics
const calculateEntityMetrics = (results: any[]): any => {
  if (results.length === 0) {
    return {
      totalStudents: 0,
      averagePerformance: 0,
      passRate: 0,
      excellenceRate: 0,
      standardDeviation: 0
    };
  }

  const totalStudents = results.length;
  const performances = results.map(r => r.overallPerformance.averagePercentage);
  const averagePerformance = Math.round(performances.reduce((sum, p) => sum + p, 0) / totalStudents);
  
  const passedStudents = results.filter(r => r.overallPerformance.subjectsPassed > 0).length;
  const passRate = Math.round((passedStudents / totalStudents) * 100);
  
  const excellentStudents = results.filter(r => 
    r.overallPerformance.distinction || r.overallPerformance.averagePercentage >= 80
  ).length;
  const excellenceRate = Math.round((excellentStudents / totalStudents) * 100);
  
  // Calculate standard deviation
  const variance = performances.reduce((sum, p) => sum + Math.pow(p - averagePerformance, 2), 0) / totalStudents;
  const standardDeviation = Math.round(Math.sqrt(variance) * 100) / 100;

  return {
    totalStudents,
    averagePerformance,
    passRate,
    excellenceRate,
    standardDeviation
  };
};

// Compare schools
const compareSchools = (allResults: any[], schoolIds: string[]): any => {
  const schoolComparisons = schoolIds.map(schoolId => {
    const schoolResults = allResults.filter(r => r.schoolId === schoolId);
    const metrics = calculateEntityMetrics(schoolResults);
    
    return {
      schoolId,
      schoolName: schoolResults[0]?.schoolName || 'Unknown School',
      region: extractRegion(schoolResults[0]?.schoolName || ''),
      ...metrics
    };
  });

  // Calculate rankings
  const rankedSchools = schoolComparisons
    .sort((a, b) => b.averagePerformance - a.averagePerformance)
    .map((school, index) => ({ ...school, rank: index + 1 }));

  // Calculate comparative metrics
  const averages = {
    averagePerformance: Math.round(schoolComparisons.reduce((sum, s) => sum + s.averagePerformance, 0) / schoolComparisons.length),
    passRate: Math.round(schoolComparisons.reduce((sum, s) => sum + s.passRate, 0) / schoolComparisons.length),
    excellenceRate: Math.round(schoolComparisons.reduce((sum, s) => sum + s.excellenceRate, 0) / schoolComparisons.length)
  };

  return {
    schools: rankedSchools,
    averages,
    bestPerformer: rankedSchools[0],
    mostImproved: calculateMostImproved(rankedSchools), // Mock for now
    insights: generateSchoolInsights(rankedSchools)
  };
};

// Compare regions
const compareRegions = (allResults: any[], regionIds: string[]): any => {
  const regionComparisons = regionIds.map(regionId => {
    const regionResults = allResults.filter(r => 
      extractRegion(r.schoolName || r.centerName).toLowerCase() === regionId.toLowerCase()
    );
    const metrics = calculateEntityMetrics(regionResults);
    
    const totalSchools = new Set(regionResults.map(r => r.schoolId)).size;
    
    return {
      regionId,
      regionName: regionId,
      totalSchools,
      ...metrics
    };
  });

  // Calculate rankings
  const rankedRegions = regionComparisons
    .sort((a, b) => b.averagePerformance - a.averagePerformance)
    .map((region, index) => ({ ...region, rank: index + 1 }));

  // Calculate national averages
  const nationalAverages = {
    averagePerformance: Math.round(regionComparisons.reduce((sum, r) => sum + r.averagePerformance, 0) / regionComparisons.length),
    passRate: Math.round(regionComparisons.reduce((sum, r) => sum + r.passRate, 0) / regionComparisons.length),
    excellenceRate: Math.round(regionComparisons.reduce((sum, r) => sum + r.excellenceRate, 0) / regionComparisons.length)
  };

  return {
    regions: rankedRegions,
    nationalAverages,
    topPerformer: rankedRegions[0],
    insights: generateRegionalInsights(rankedRegions)
  };
};

// Compare exam sessions
const compareExamSessions = (allResults: any[], sessionIds: string[]): any => {
  const sessionComparisons = sessionIds.map(sessionId => {
    const sessionResults = allResults.filter(r => r.examSession === sessionId);
    const metrics = calculateEntityMetrics(sessionResults);
    
    const totalSchools = new Set(sessionResults.map(r => r.schoolId)).size;
    const totalSubjects = new Set(sessionResults.flatMap(r => r.subjects.map(s => s.subjectCode))).size;
    
    return {
      sessionId,
      sessionName: `${sessionId} Session`,
      totalSchools,
      totalSubjects,
      ...metrics
    };
  });

  // Calculate year-over-year changes
  const sessionTrends = sessionComparisons.map((session, index) => {
    if (index === 0) return { ...session, performanceChange: 0, passRateChange: 0 };
    
    const previous = sessionComparisons[index - 1];
    return {
      ...session,
      performanceChange: session.averagePerformance - previous.averagePerformance,
      passRateChange: session.passRate - previous.passRate
    };
  });

  return {
    sessions: sessionTrends,
    trends: {
      overallTrend: calculateOverallTrend(sessionTrends),
      bestSession: sessionComparisons.reduce((best, current) => 
        current.averagePerformance > best.averagePerformance ? current : best
      ),
      growthRate: calculateGrowthRate(sessionComparisons)
    },
    insights: generateSessionInsights(sessionTrends)
  };
};

// Compare subjects
const compareSubjects = (allResults: any[], subjectCodes: string[]): any => {
  const subjectComparisons = subjectCodes.map(subjectCode => {
    const subjectResults = allResults.flatMap(r => 
      r.subjects.filter((s: any) => s.subjectCode === subjectCode)
    );
    
    if (subjectResults.length === 0) {
      return {
        subjectCode,
        subjectName: subjectCode,
        totalCandidates: 0,
        averagePercentage: 0,
        passRate: 0,
        excellenceRate: 0
      };
    }

    const totalCandidates = subjectResults.length;
    const averagePercentage = Math.round(
      subjectResults.reduce((sum, s) => sum + s.percentage, 0) / totalCandidates
    );
    const passCount = subjectResults.filter(s => s.status === 'pass').length;
    const passRate = Math.round((passCount / totalCandidates) * 100);
    const excellenceCount = subjectResults.filter(s => s.percentage >= 80).length;
    const excellenceRate = Math.round((excellenceCount / totalCandidates) * 100);

    return {
      subjectCode,
      subjectName: subjectResults[0].subjectName,
      totalCandidates,
      averagePercentage,
      passRate,
      excellenceRate
    };
  });

  // Calculate rankings
  const rankedSubjects = subjectComparisons
    .sort((a, b) => b.averagePercentage - a.averagePercentage)
    .map((subject, index) => ({ ...subject, rank: index + 1 }));

  return {
    subjects: rankedSubjects,
    topPerforming: rankedSubjects.slice(0, 3),
    needsImprovement: rankedSubjects.slice(-3).reverse(),
    insights: generateSubjectInsights(rankedSubjects)
  };
};

// Generate insights
const generateSchoolInsights = (schools: any[]): string[] => {
  const insights = [];
  
  const performanceGap = schools[0].averagePerformance - schools[schools.length - 1].averagePerformance;
  if (performanceGap > 30) {
    insights.push(`Significant performance gap of ${performanceGap} points between top and bottom schools`);
  }
  
  const highPerformers = schools.filter(s => s.averagePerformance >= 80).length;
  if (highPerformers > 0) {
    insights.push(`${highPerformers} schools achieving excellence (80%+ average)`);
  }
  
  return insights;
};

const generateRegionalInsights = (regions: any[]): string[] => {
  const insights = [];
  
  const topRegion = regions[0];
  const bottomRegion = regions[regions.length - 1];
  
  insights.push(`${topRegion.regionName} leads with ${topRegion.averagePerformance}% average performance`);
  
  if (topRegion.averagePerformance - bottomRegion.averagePerformance > 20) {
    insights.push(`Regional disparity: ${topRegion.averagePerformance - bottomRegion.averagePerformance} point gap between highest and lowest`);
  }
  
  return insights;
};

const generateSessionInsights = (sessions: any[]): string[] => {
  const insights = [];
  
  const latestSession = sessions[sessions.length - 1];
  if (latestSession.performanceChange > 0) {
    insights.push(`Performance improved by ${latestSession.performanceChange} points in latest session`);
  } else if (latestSession.performanceChange < 0) {
    insights.push(`Performance declined by ${Math.abs(latestSession.performanceChange)} points in latest session`);
  }
  
  return insights;
};

const generateSubjectInsights = (subjects: any[]): string[] => {
  const insights = [];
  
  const topSubject = subjects[0];
  const weakestSubject = subjects[subjects.length - 1];
  
  insights.push(`${topSubject.subjectCode} shows strongest performance with ${topSubject.passRate}% pass rate`);
  
  if (weakestSubject.passRate < 60) {
    insights.push(`${weakestSubject.subjectCode} needs attention with only ${weakestSubject.passRate}% pass rate`);
  }
  
  return insights;
};

// Helper functions
const calculateMostImproved = (schools: any[]): any => {
  // Mock implementation - in production, would compare with historical data
  return schools[Math.floor(Math.random() * schools.length)];
};

const calculateOverallTrend = (sessions: any[]): string => {
  if (sessions.length < 2) return 'insufficient_data';
  
  const improvements = sessions.slice(1).map(s => s.performanceChange);
  const avgChange = improvements.reduce((sum, change) => sum + change, 0) / improvements.length;
  
  if (avgChange > 2) return 'improving';
  if (avgChange < -2) return 'declining';
  return 'stable';
};

const calculateGrowthRate = (sessions: any[]): number => {
  if (sessions.length < 2) return 0;
  
  const first = sessions[0].averagePerformance;
  const last = sessions[sessions.length - 1].averagePerformance;
  
  return Math.round(((last - first) / first) * 100 * 100) / 100;
};

// GET - Get comparative analysis
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

    if (!canViewComparativeAnalysis(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view comparative analysis' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const comparisonType = searchParams.get('type') || 'schools'; // schools, regions, sessions, subjects
    const entities = searchParams.get('entities')?.split(',') || [];
    const timeframe = searchParams.get('timeframe') || 'all';
    const examLevel = searchParams.get('examLevel') || '';

    if (entities.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No entities specified for comparison' },
        { status: 400 }
      );
    }

    // Get all published results
    let allResults = Array.from(examResults.values()).filter(
      result => result.publication.isPublished
    );

    // Apply filters
    if (examLevel) {
      allResults = allResults.filter(r => r.examLevel === examLevel);
    }

    if (timeframe !== 'all') {
      const currentYear = new Date().getFullYear();
      if (timeframe === 'year') {
        allResults = allResults.filter(r => 
          new Date(r.audit.generatedAt).getFullYear() === currentYear
        );
      }
    }

    // Perform comparison based on type
    let comparisonData: any = {};

    switch (comparisonType) {
      case 'schools':
        comparisonData = compareSchools(allResults, entities);
        break;
      case 'regions':
        comparisonData = compareRegions(allResults, entities);
        break;
      case 'sessions':
        comparisonData = compareExamSessions(allResults, entities);
        break;
      case 'subjects':
        comparisonData = compareSubjects(allResults, entities);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid comparison type' },
          { status: 400 }
        );
    }

    const responseData = {
      comparisonType,
      entities,
      timeframe,
      examLevel,
      totalResults: allResults.length,
      comparisonData,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataRange: {
          from: allResults.length > 0 ? Math.min(...allResults.map(r => new Date(r.audit.generatedAt).getTime())) : null,
          to: allResults.length > 0 ? Math.max(...allResults.map(r => new Date(r.audit.generatedAt).getTime())) : null
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Comparative analysis retrieved successfully'
    });

  } catch (error) {
    console.error('Get comparative analysis error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
