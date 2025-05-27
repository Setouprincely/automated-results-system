import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();

// Helper function to check regional analytics access
const canViewRegionalAnalytics = (token: string): boolean => {
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

// Calculate regional metrics
const calculateRegionalMetrics = (regionalResults: any[]): any => {
  if (regionalResults.length === 0) {
    return {
      totalStudents: 0,
      totalSchools: 0,
      averagePerformance: 0,
      passRate: 0,
      excellenceRate: 0,
      subjectCount: 0
    };
  }

  const totalStudents = regionalResults.length;
  const totalSchools = new Set(regionalResults.map(r => r.schoolId)).size;
  
  const totalPerformance = regionalResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0);
  const averagePerformance = Math.round(totalPerformance / totalStudents);
  
  const passedStudents = regionalResults.filter(r => r.overallPerformance.subjectsPassed > 0).length;
  const passRate = Math.round((passedStudents / totalStudents) * 100);
  
  const excellentStudents = regionalResults.filter(r => 
    r.overallPerformance.distinction || r.overallPerformance.averagePercentage >= 80
  ).length;
  const excellenceRate = Math.round((excellentStudents / totalStudents) * 100);
  
  const allSubjects = regionalResults.flatMap(r => r.subjects);
  const subjectCount = new Set(allSubjects.map(s => s.subjectCode)).size;

  return {
    totalStudents,
    totalSchools,
    averagePerformance,
    passRate,
    excellenceRate,
    subjectCount
  };
};

// Calculate school rankings within region
const calculateSchoolRankings = (regionalResults: any[]): any[] => {
  const schoolData = new Map<string, any>();

  regionalResults.forEach(result => {
    if (!schoolData.has(result.schoolId)) {
      schoolData.set(result.schoolId, {
        schoolId: result.schoolId,
        schoolName: result.schoolName,
        centerCode: result.centerCode,
        totalStudents: 0,
        totalPerformance: 0,
        passCount: 0,
        excellenceCount: 0
      });
    }

    const data = schoolData.get(result.schoolId)!;
    data.totalStudents++;
    data.totalPerformance += result.overallPerformance.averagePercentage;
    
    if (result.overallPerformance.subjectsPassed > 0) data.passCount++;
    if (result.overallPerformance.distinction) data.excellenceCount++;
  });

  return Array.from(schoolData.values())
    .map(data => ({
      ...data,
      averagePerformance: Math.round(data.totalPerformance / data.totalStudents),
      passRate: Math.round((data.passCount / data.totalStudents) * 100),
      excellenceRate: Math.round((data.excellenceCount / data.totalStudents) * 100)
    }))
    .sort((a, b) => b.averagePerformance - a.averagePerformance)
    .map((school, index) => ({ ...school, rank: index + 1 }));
};

// Calculate subject performance across region
const calculateRegionalSubjectPerformance = (regionalResults: any[]): any[] => {
  const subjectData = new Map<string, any>();

  regionalResults.forEach(result => {
    result.subjects.forEach((subject: any) => {
      if (!subjectData.has(subject.subjectCode)) {
        subjectData.set(subject.subjectCode, {
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          totalCandidates: 0,
          totalMarks: 0,
          passCount: 0,
          excellenceCount: 0,
          schoolsOffering: new Set(),
          gradeDistribution: {}
        });
      }

      const data = subjectData.get(subject.subjectCode)!;
      data.totalCandidates++;
      data.totalMarks += subject.percentage;
      data.schoolsOffering.add(result.schoolId);
      
      if (subject.status === 'pass') data.passCount++;
      if (subject.percentage >= 80) data.excellenceCount++;
      
      data.gradeDistribution[subject.grade] = (data.gradeDistribution[subject.grade] || 0) + 1;
    });
  });

  return Array.from(subjectData.values()).map(data => ({
    subjectCode: data.subjectCode,
    subjectName: data.subjectName,
    totalCandidates: data.totalCandidates,
    schoolsOffering: data.schoolsOffering.size,
    averagePercentage: Math.round(data.totalMarks / data.totalCandidates),
    passRate: Math.round((data.passCount / data.totalCandidates) * 100),
    excellenceRate: Math.round((data.excellenceCount / data.totalCandidates) * 100),
    gradeDistribution: data.gradeDistribution
  })).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate performance distribution
const calculatePerformanceDistribution = (regionalResults: any[]): any => {
  const ranges = [
    { min: 90, max: 100, label: 'Excellent (90-100%)', count: 0 },
    { min: 80, max: 89, label: 'Very Good (80-89%)', count: 0 },
    { min: 70, max: 79, label: 'Good (70-79%)', count: 0 },
    { min: 60, max: 69, label: 'Satisfactory (60-69%)', count: 0 },
    { min: 50, max: 59, label: 'Fair (50-59%)', count: 0 },
    { min: 0, max: 49, label: 'Poor (0-49%)', count: 0 }
  ];

  regionalResults.forEach(result => {
    const percentage = result.overallPerformance.averagePercentage;
    const range = ranges.find(r => percentage >= r.min && percentage <= r.max);
    if (range) range.count++;
  });

  const total = regionalResults.length;
  return ranges.map(range => ({
    range: range.label,
    count: range.count,
    percentage: total > 0 ? Math.round((range.count / total) * 100) : 0
  }));
};

// Calculate demographic analysis
const calculateDemographicAnalysis = (regionalResults: any[]): any => {
  // Mock demographic data - in production, would have actual demographic information
  const urbanResults = regionalResults.filter(r => 
    r.schoolName.toLowerCase().includes('urban') || 
    r.schoolName.toLowerCase().includes('city')
  );
  const ruralResults = regionalResults.filter(r => !urbanResults.includes(r));

  const calculateMetrics = (results: any[]) => {
    if (results.length === 0) return { count: 0, averagePerformance: 0, passRate: 0 };
    
    const avgPerformance = Math.round(
      results.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0) / results.length
    );
    const passRate = Math.round(
      (results.filter(r => r.overallPerformance.subjectsPassed > 0).length / results.length) * 100
    );
    
    return {
      count: results.length,
      averagePerformance: avgPerformance,
      passRate
    };
  };

  return {
    urban: calculateMetrics(urbanResults),
    rural: calculateMetrics(ruralResults),
    genderAnalysis: {
      // Mock gender data
      male: { count: Math.floor(regionalResults.length * 0.52), averagePerformance: 62, passRate: 75 },
      female: { count: Math.floor(regionalResults.length * 0.48), averagePerformance: 68, passRate: 82 }
    }
  };
};

// Calculate regional trends
const calculateRegionalTrends = (regionalResults: any[]): any => {
  const sessionData = new Map<string, any>();

  regionalResults.forEach(result => {
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

  // Calculate growth rates
  let growthAnalysis = null;
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    growthAnalysis = {
      performanceGrowth: ((latest.averagePerformance - previous.averagePerformance) / previous.averagePerformance) * 100,
      passRateGrowth: ((latest.passRate - previous.passRate) / previous.passRate) * 100,
      studentGrowth: ((latest.totalStudents - previous.totalStudents) / previous.totalStudents) * 100
    };
  }

  return { sessionTrends: trends, growthAnalysis };
};

// Identify regional challenges and opportunities
const identifyRegionalInsights = (metrics: any, schoolRankings: any[], subjectPerformance: any[]): any => {
  const insights = {
    challenges: [] as any[],
    opportunities: [] as any[],
    recommendations: [] as string[]
  };

  // Identify challenges
  if (metrics.passRate < 70) {
    insights.challenges.push({
      type: 'low_pass_rate',
      severity: 'high',
      description: `Regional pass rate of ${metrics.passRate}% is below national target`,
      affectedStudents: Math.round(metrics.totalStudents * (100 - metrics.passRate) / 100)
    });
  }

  const underperformingSchools = schoolRankings.filter(s => s.averagePerformance < 50).length;
  if (underperformingSchools > 0) {
    insights.challenges.push({
      type: 'underperforming_schools',
      severity: 'medium',
      description: `${underperformingSchools} schools performing below average`,
      affectedSchools: underperformingSchools
    });
  }

  const weakSubjects = subjectPerformance.filter(s => s.passRate < 60);
  if (weakSubjects.length > 0) {
    insights.challenges.push({
      type: 'weak_subjects',
      severity: 'medium',
      description: `Poor performance in ${weakSubjects.length} subjects`,
      subjects: weakSubjects.map(s => s.subjectCode)
    });
  }

  // Identify opportunities
  const topPerformingSchools = schoolRankings.filter(s => s.averagePerformance >= 80).length;
  if (topPerformingSchools > 0) {
    insights.opportunities.push({
      type: 'excellence_centers',
      description: `${topPerformingSchools} schools showing excellence - can serve as model schools`,
      schools: topPerformingSchools
    });
  }

  const strongSubjects = subjectPerformance.filter(s => s.passRate >= 90);
  if (strongSubjects.length > 0) {
    insights.opportunities.push({
      type: 'subject_strengths',
      description: `Strong performance in ${strongSubjects.length} subjects can be leveraged`,
      subjects: strongSubjects.map(s => s.subjectCode)
    });
  }

  // Generate recommendations
  if (insights.challenges.length > 0) {
    insights.recommendations.push('Implement targeted intervention programs for underperforming schools');
    insights.recommendations.push('Establish peer learning networks between high and low performing schools');
  }

  if (weakSubjects.length > 0) {
    insights.recommendations.push(`Focus teacher training on weak subjects: ${weakSubjects.map(s => s.subjectCode).join(', ')}`);
  }

  if (topPerformingSchools > 0) {
    insights.recommendations.push('Create regional excellence hubs for knowledge sharing');
  }

  return insights;
};

// GET - Get regional performance analytics
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

    if (!canViewRegionalAnalytics(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view regional analytics' },
        { status: 403 }
      );
    }

    const { id: regionId } = params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const includeSchools = searchParams.get('includeSchools') === 'true';
    const includeDemographics = searchParams.get('includeDemographics') === 'true';
    const includeInsights = searchParams.get('includeInsights') === 'true';

    // Get all published results
    let allResults = Array.from(examResults.values()).filter(
      result => result.publication.isPublished
    );

    // Filter by region
    const regionalResults = allResults.filter(result => {
      const resultRegion = extractRegion(result.schoolName || result.centerName);
      return resultRegion.toLowerCase() === regionId.toLowerCase();
    });

    if (regionalResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          regionInfo: { regionId, hasData: false },
          analytics: null,
          message: 'No results available for this region'
        },
        message: 'No data available for regional analytics'
      });
    }

    // Apply timeframe filter
    let filteredResults = regionalResults;
    if (timeframe !== 'all') {
      const currentYear = new Date().getFullYear();
      if (timeframe === 'year') {
        filteredResults = regionalResults.filter(r => 
          new Date(r.audit.generatedAt).getFullYear() === currentYear
        );
      }
    }

    // Calculate analytics
    const regionalMetrics = calculateRegionalMetrics(filteredResults);
    const subjectPerformance = calculateRegionalSubjectPerformance(filteredResults);
    const performanceDistribution = calculatePerformanceDistribution(filteredResults);
    const regionalTrends = calculateRegionalTrends(filteredResults);

    // Prepare response data
    let responseData: any = {
      regionInfo: {
        regionId,
        regionName: regionId,
        hasData: true,
        totalResults: filteredResults.length,
        dateRange: {
          from: Math.min(...filteredResults.map(r => new Date(r.audit.generatedAt).getTime())),
          to: Math.max(...filteredResults.map(r => new Date(r.audit.generatedAt).getTime()))
        }
      },
      overallMetrics: regionalMetrics,
      subjectPerformance: subjectPerformance.slice(0, 15), // Top 15 subjects
      performanceDistribution,
      trends: regionalTrends
    };

    // Include school rankings if requested
    if (includeSchools) {
      const schoolRankings = calculateSchoolRankings(filteredResults);
      responseData.schoolRankings = schoolRankings.slice(0, 20); // Top 20 schools
      responseData.schoolStatistics = {
        totalSchools: schoolRankings.length,
        topPerformers: schoolRankings.slice(0, 5),
        needsImprovement: schoolRankings.slice(-5).reverse()
      };
    }

    // Include demographic analysis if requested
    if (includeDemographics) {
      responseData.demographicAnalysis = calculateDemographicAnalysis(filteredResults);
    }

    // Include insights if requested
    if (includeInsights) {
      const schoolRankings = calculateSchoolRankings(filteredResults);
      responseData.insights = identifyRegionalInsights(regionalMetrics, schoolRankings, subjectPerformance);
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Regional performance analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Get regional performance analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
