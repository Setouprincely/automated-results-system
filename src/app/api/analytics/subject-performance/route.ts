import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const markingScores: Map<string, any> = new Map();

// Helper function to check subject analytics access
const canViewSubjectAnalytics = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner' || user?.userType === 'teacher';
};

// Calculate comprehensive subject metrics
const calculateSubjectMetrics = (subjectResults: any[]): any => {
  if (subjectResults.length === 0) {
    return {
      totalCandidates: 0,
      averagePercentage: 0,
      passRate: 0,
      excellenceRate: 0,
      standardDeviation: 0,
      median: 0,
      mode: 0,
      range: { min: 0, max: 0 }
    };
  }

  const percentages = subjectResults.map(s => s.percentage);
  const totalCandidates = subjectResults.length;
  
  // Basic statistics
  const averagePercentage = Math.round(percentages.reduce((sum, p) => sum + p, 0) / totalCandidates);
  const passCount = subjectResults.filter(s => s.status === 'pass').length;
  const passRate = Math.round((passCount / totalCandidates) * 100);
  const excellenceCount = subjectResults.filter(s => s.percentage >= 80).length;
  const excellenceRate = Math.round((excellenceCount / totalCandidates) * 100);
  
  // Advanced statistics
  const sortedPercentages = [...percentages].sort((a, b) => a - b);
  const median = sortedPercentages.length % 2 === 0
    ? (sortedPercentages[sortedPercentages.length / 2 - 1] + sortedPercentages[sortedPercentages.length / 2]) / 2
    : sortedPercentages[Math.floor(sortedPercentages.length / 2)];
  
  // Calculate mode
  const frequency: { [key: number]: number } = {};
  percentages.forEach(p => frequency[p] = (frequency[p] || 0) + 1);
  const mode = parseInt(Object.keys(frequency).reduce((a, b) => frequency[parseInt(a)] > frequency[parseInt(b)] ? a : b));
  
  // Calculate standard deviation
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - averagePercentage, 2), 0) / totalCandidates;
  const standardDeviation = Math.round(Math.sqrt(variance) * 100) / 100;
  
  const range = {
    min: Math.min(...percentages),
    max: Math.max(...percentages)
  };

  return {
    totalCandidates,
    averagePercentage,
    passRate,
    excellenceRate,
    standardDeviation,
    median: Math.round(median),
    mode,
    range
  };
};

// Calculate grade distribution
const calculateGradeDistribution = (subjectResults: any[]): any => {
  const distribution: Record<string, number> = {};
  const total = subjectResults.length;
  
  subjectResults.forEach(result => {
    distribution[result.grade] = (distribution[result.grade] || 0) + 1;
  });

  // Convert to percentages and add cumulative data
  const gradeData = Object.entries(distribution).map(([grade, count]) => ({
    grade,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));

  return {
    distribution: gradeData,
    totalCandidates: total
  };
};

// Calculate difficulty analysis
const calculateDifficultyAnalysis = (subjectResults: any[]): any => {
  const averagePercentage = subjectResults.reduce((sum, s) => sum + s.percentage, 0) / subjectResults.length;
  
  let difficultyLevel = 'moderate';
  let difficultyScore = averagePercentage;
  
  if (averagePercentage >= 80) difficultyLevel = 'easy';
  else if (averagePercentage >= 60) difficultyLevel = 'moderate';
  else if (averagePercentage >= 40) difficultyLevel = 'difficult';
  else difficultyLevel = 'very_difficult';
  
  // Calculate discrimination index (simplified)
  const sortedResults = [...subjectResults].sort((a, b) => b.percentage - a.percentage);
  const topGroup = sortedResults.slice(0, Math.floor(sortedResults.length * 0.27));
  const bottomGroup = sortedResults.slice(-Math.floor(sortedResults.length * 0.27));
  
  const topAverage = topGroup.reduce((sum, s) => sum + s.percentage, 0) / topGroup.length;
  const bottomAverage = bottomGroup.reduce((sum, s) => sum + s.percentage, 0) / bottomGroup.length;
  const discriminationIndex = Math.round(((topAverage - bottomAverage) / 100) * 100) / 100;
  
  return {
    difficultyLevel,
    difficultyScore: Math.round(difficultyScore),
    discriminationIndex,
    reliability: calculateReliability(subjectResults),
    validity: 0.85 // Would be calculated from content analysis
  };
};

// Calculate regional performance
const calculateRegionalPerformance = (subjectResults: any[], allResults: any[]): any[] => {
  const regionData = new Map<string, any>();
  
  // Group results by region
  subjectResults.forEach(subjectResult => {
    const fullResult = allResults.find(r => 
      r.subjects.some((s: any) => s.subjectCode === subjectResult.subjectCode && 
                                 s.percentage === subjectResult.percentage)
    );
    
    if (fullResult) {
      const region = extractRegion(fullResult.schoolName || fullResult.centerName);
      
      if (!regionData.has(region)) {
        regionData.set(region, {
          region,
          candidates: [],
          totalCandidates: 0,
          totalMarks: 0,
          passCount: 0
        });
      }
      
      const data = regionData.get(region)!;
      data.candidates.push(subjectResult);
      data.totalCandidates++;
      data.totalMarks += subjectResult.percentage;
      if (subjectResult.status === 'pass') data.passCount++;
    }
  });
  
  return Array.from(regionData.values()).map(data => ({
    region: data.region,
    totalCandidates: data.totalCandidates,
    averagePercentage: Math.round(data.totalMarks / data.totalCandidates),
    passRate: Math.round((data.passCount / data.totalCandidates) * 100)
  })).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate school performance for subject
const calculateSchoolPerformance = (subjectResults: any[], allResults: any[]): any[] => {
  const schoolData = new Map<string, any>();
  
  subjectResults.forEach(subjectResult => {
    const fullResult = allResults.find(r => 
      r.subjects.some((s: any) => s.subjectCode === subjectResult.subjectCode && 
                                 s.percentage === subjectResult.percentage)
    );
    
    if (fullResult) {
      if (!schoolData.has(fullResult.schoolId)) {
        schoolData.set(fullResult.schoolId, {
          schoolId: fullResult.schoolId,
          schoolName: fullResult.schoolName,
          candidates: [],
          totalCandidates: 0,
          totalMarks: 0,
          passCount: 0
        });
      }
      
      const data = schoolData.get(fullResult.schoolId)!;
      data.candidates.push(subjectResult);
      data.totalCandidates++;
      data.totalMarks += subjectResult.percentage;
      if (subjectResult.status === 'pass') data.passCount++;
    }
  });
  
  return Array.from(schoolData.values()).map(data => ({
    schoolId: data.schoolId,
    schoolName: data.schoolName,
    totalCandidates: data.totalCandidates,
    averagePercentage: Math.round(data.totalMarks / data.totalCandidates),
    passRate: Math.round((data.passCount / data.totalCandidates) * 100),
    topPerformers: data.candidates
      .sort((a: any, b: any) => b.percentage - a.percentage)
      .slice(0, 3)
  })).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate performance trends
const calculatePerformanceTrends = (subjectResults: any[], allResults: any[]): any => {
  const sessionData = new Map<string, any>();
  
  subjectResults.forEach(subjectResult => {
    const fullResult = allResults.find(r => 
      r.subjects.some((s: any) => s.subjectCode === subjectResult.subjectCode)
    );
    
    if (fullResult) {
      const session = fullResult.examSession;
      
      if (!sessionData.has(session)) {
        sessionData.set(session, {
          session,
          totalCandidates: 0,
          totalMarks: 0,
          passCount: 0
        });
      }
      
      const data = sessionData.get(session)!;
      data.totalCandidates++;
      data.totalMarks += subjectResult.percentage;
      if (subjectResult.status === 'pass') data.passCount++;
    }
  });
  
  const trends = Array.from(sessionData.values()).map(data => ({
    session: data.session,
    totalCandidates: data.totalCandidates,
    averagePercentage: Math.round(data.totalMarks / data.totalCandidates),
    passRate: Math.round((data.passCount / data.totalCandidates) * 100)
  })).sort((a, b) => a.session.localeCompare(b.session));
  
  // Calculate trend direction
  let trendAnalysis = null;
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    trendAnalysis = {
      performanceTrend: latest.averagePercentage > previous.averagePercentage ? 'improving' : 
                       latest.averagePercentage < previous.averagePercentage ? 'declining' : 'stable',
      passRateTrend: latest.passRate > previous.passRate ? 'improving' : 
                    latest.passRate < previous.passRate ? 'declining' : 'stable',
      performanceChange: latest.averagePercentage - previous.averagePercentage,
      passRateChange: latest.passRate - previous.passRate
    };
  }
  
  return { sessionTrends: trends, trendAnalysis };
};

// Generate subject insights and recommendations
const generateSubjectInsights = (metrics: any, difficulty: any, trends: any): any => {
  const insights = [];
  const recommendations = [];
  
  // Performance insights
  if (metrics.passRate < 60) {
    insights.push({
      type: 'concern',
      message: `Low pass rate of ${metrics.passRate}% indicates significant challenges`,
      severity: 'high'
    });
    recommendations.push('Review curriculum and teaching methodologies');
    recommendations.push('Provide additional teacher training and resources');
  } else if (metrics.passRate >= 90) {
    insights.push({
      type: 'positive',
      message: `Excellent pass rate of ${metrics.passRate}% shows strong performance`,
      severity: 'low'
    });
    recommendations.push('Maintain current teaching standards');
    recommendations.push('Share best practices with other subjects');
  }
  
  // Difficulty insights
  if (difficulty.difficultyLevel === 'very_difficult') {
    insights.push({
      type: 'concern',
      message: 'Subject appears very difficult for students',
      severity: 'high'
    });
    recommendations.push('Review exam difficulty and content alignment');
    recommendations.push('Consider additional support materials');
  }
  
  // Discrimination insights
  if (difficulty.discriminationIndex < 0.3) {
    insights.push({
      type: 'warning',
      message: 'Low discrimination index suggests assessment may not effectively differentiate student abilities',
      severity: 'medium'
    });
    recommendations.push('Review assessment design and question quality');
  }
  
  // Trend insights
  if (trends.trendAnalysis?.performanceTrend === 'declining') {
    insights.push({
      type: 'concern',
      message: 'Performance is declining over time',
      severity: 'high'
    });
    recommendations.push('Investigate causes of performance decline');
    recommendations.push('Implement intervention strategies');
  }
  
  return { insights, recommendations };
};

// Helper functions
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

const calculateReliability = (subjectResults: any[]): number => {
  // Simplified reliability calculation
  if (subjectResults.length < 10) return 0.7;
  
  const percentages = subjectResults.map(s => s.percentage);
  const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
  
  // Simplified Cronbach's alpha approximation
  return Math.min(0.95, Math.max(0.5, 0.7 + (variance / 1000)));
};

// GET - Get subject performance analytics
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

    if (!canViewSubjectAnalytics(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view subject analytics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subjectCode = searchParams.get('subjectCode') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const examSession = searchParams.get('examSession') || '';
    const includeRegional = searchParams.get('includeRegional') === 'true';
    const includeSchools = searchParams.get('includeSchools') === 'true';
    const includeTrends = searchParams.get('includeTrends') === 'true';

    // Get all published results
    let allResults = Array.from(examResults.values()).filter(
      result => result.publication.isPublished
    );

    // Apply filters
    if (examLevel) {
      allResults = allResults.filter(r => r.examLevel === examLevel);
    }

    if (examSession) {
      allResults = allResults.filter(r => r.examSession === examSession);
    }

    // Get subject-specific data
    let subjectAnalysis: any = {};

    if (subjectCode) {
      // Analyze specific subject
      const subjectResults = allResults.flatMap(r => 
        r.subjects.filter((s: any) => s.subjectCode === subjectCode)
      );

      if (subjectResults.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            subjectCode,
            hasData: false,
            message: 'No data available for this subject'
          },
          message: 'No data available for subject analysis'
        });
      }

      const metrics = calculateSubjectMetrics(subjectResults);
      const gradeDistribution = calculateGradeDistribution(subjectResults);
      const difficultyAnalysis = calculateDifficultyAnalysis(subjectResults);

      subjectAnalysis = {
        subjectCode,
        subjectName: subjectResults[0].subjectName,
        hasData: true,
        metrics,
        gradeDistribution,
        difficultyAnalysis
      };

      // Include additional analyses if requested
      if (includeRegional) {
        subjectAnalysis.regionalPerformance = calculateRegionalPerformance(subjectResults, allResults);
      }

      if (includeSchools) {
        subjectAnalysis.schoolPerformance = calculateSchoolPerformance(subjectResults, allResults).slice(0, 20);
      }

      if (includeTrends) {
        subjectAnalysis.performanceTrends = calculatePerformanceTrends(subjectResults, allResults);
      }

      // Generate insights
      const trends = includeTrends ? calculatePerformanceTrends(subjectResults, allResults) : { trendAnalysis: null };
      subjectAnalysis.insights = generateSubjectInsights(metrics, difficultyAnalysis, trends);

    } else {
      // Analyze all subjects
      const allSubjects = allResults.flatMap(r => r.subjects);
      const subjectCodes = [...new Set(allSubjects.map(s => s.subjectCode))];

      const subjectSummaries = subjectCodes.map(code => {
        const subjectResults = allSubjects.filter(s => s.subjectCode === code);
        const metrics = calculateSubjectMetrics(subjectResults);
        
        return {
          subjectCode: code,
          subjectName: subjectResults[0]?.subjectName || code,
          ...metrics
        };
      }).sort((a, b) => b.averagePercentage - a.averagePercentage);

      subjectAnalysis = {
        allSubjects: true,
        totalSubjects: subjectCodes.length,
        subjectSummaries,
        topPerforming: subjectSummaries.slice(0, 5),
        needsImprovement: subjectSummaries.filter(s => s.passRate < 70),
        overallStatistics: {
          averagePassRate: Math.round(subjectSummaries.reduce((sum, s) => sum + s.passRate, 0) / subjectSummaries.length),
          averagePerformance: Math.round(subjectSummaries.reduce((sum, s) => sum + s.averagePercentage, 0) / subjectSummaries.length),
          totalCandidates: subjectSummaries.reduce((sum, s) => sum + s.totalCandidates, 0)
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: subjectAnalysis,
      message: 'Subject performance analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get subject performance analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
