import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const certificates: Map<string, any> = new Map();
const verificationLogs: Map<string, any> = new Map();

// Helper function to check statistics access
const canViewStatistics = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate overall statistics
const calculateOverallStatistics = (results: any[]): any => {
  if (results.length === 0) {
    return {
      totalResults: 0,
      totalStudents: 0,
      totalSchools: 0,
      averagePerformance: 0,
      passRate: 0,
      excellenceRate: 0
    };
  }

  const totalResults = results.length;
  const totalStudents = new Set(results.map(r => r.studentId)).size;
  const totalSchools = new Set(results.map(r => r.schoolId)).size;
  
  const totalPercentage = results.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0);
  const averagePerformance = Math.round(totalPercentage / totalResults);
  
  const passedStudents = results.filter(r => r.overallPerformance.subjectsPassed > 0).length;
  const passRate = Math.round((passedStudents / totalResults) * 100);
  
  const excellentStudents = results.filter(r => 
    r.overallPerformance.distinction || r.overallPerformance.averagePercentage >= 80
  ).length;
  const excellenceRate = Math.round((excellentStudents / totalResults) * 100);

  return {
    totalResults,
    totalStudents,
    totalSchools,
    averagePerformance,
    passRate,
    excellenceRate
  };
};

// Calculate grade distribution
const calculateGradeDistribution = (results: any[]): any => {
  const distribution: Record<string, number> = {};
  const allSubjects = results.flatMap(r => r.subjects);
  
  allSubjects.forEach(subject => {
    distribution[subject.grade] = (distribution[subject.grade] || 0) + 1;
  });

  const total = allSubjects.length;
  const percentageDistribution: Record<string, number> = {};
  
  Object.entries(distribution).forEach(([grade, count]) => {
    percentageDistribution[grade] = Math.round((count / total) * 100);
  });

  return {
    counts: distribution,
    percentages: percentageDistribution,
    totalSubjects: total
  };
};

// Calculate subject performance
const calculateSubjectPerformance = (results: any[]): any[] => {
  const subjectData = new Map<string, any>();

  results.forEach(result => {
    result.subjects.forEach((subject: any) => {
      if (!subjectData.has(subject.subjectCode)) {
        subjectData.set(subject.subjectCode, {
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          totalCandidates: 0,
          totalMarks: 0,
          passCount: 0,
          gradeDistribution: {},
          averagePercentage: 0,
          passRate: 0,
          excellenceRate: 0
        });
      }

      const data = subjectData.get(subject.subjectCode)!;
      data.totalCandidates++;
      data.totalMarks += subject.percentage;
      
      if (subject.status === 'pass') {
        data.passCount++;
      }

      if (subject.percentage >= 80) {
        data.excellenceCount = (data.excellenceCount || 0) + 1;
      }

      data.gradeDistribution[subject.grade] = (data.gradeDistribution[subject.grade] || 0) + 1;
    });
  });

  return Array.from(subjectData.values()).map(data => {
    data.averagePercentage = Math.round(data.totalMarks / data.totalCandidates);
    data.passRate = Math.round((data.passCount / data.totalCandidates) * 100);
    data.excellenceRate = Math.round(((data.excellenceCount || 0) / data.totalCandidates) * 100);
    
    // Convert grade distribution to percentages
    Object.keys(data.gradeDistribution).forEach(grade => {
      data.gradeDistribution[grade] = Math.round((data.gradeDistribution[grade] / data.totalCandidates) * 100);
    });

    return data;
  }).sort((a, b) => b.averagePerformance - a.averagePerformance);
};

// Calculate regional performance
const calculateRegionalPerformance = (results: any[]): any[] => {
  const regionalData = new Map<string, any>();

  results.forEach(result => {
    // Extract region from school name or center code (simplified)
    const region = extractRegion(result.schoolName || result.centerName);
    
    if (!regionalData.has(region)) {
      regionalData.set(region, {
        region,
        totalStudents: 0,
        totalSchools: new Set(),
        totalPercentage: 0,
        passCount: 0,
        excellenceCount: 0
      });
    }

    const data = regionalData.get(region)!;
    data.totalStudents++;
    data.totalSchools.add(result.schoolId);
    data.totalPercentage += result.overallPerformance.averagePercentage;
    
    if (result.overallPerformance.subjectsPassed > 0) {
      data.passCount++;
    }
    
    if (result.overallPerformance.distinction || result.overallPerformance.averagePercentage >= 80) {
      data.excellenceCount++;
    }
  });

  return Array.from(regionalData.values()).map(data => ({
    region: data.region,
    totalStudents: data.totalStudents,
    totalSchools: data.totalSchools.size,
    averagePercentage: Math.round(data.totalPercentage / data.totalStudents),
    passRate: Math.round((data.passCount / data.totalStudents) * 100),
    excellenceRate: Math.round((data.excellenceCount / data.totalStudents) * 100)
  })).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

// Calculate trends
const calculateTrends = (results: any[]): any => {
  const sessionData = new Map<string, any>();

  results.forEach(result => {
    const session = result.examSession;
    
    if (!sessionData.has(session)) {
      sessionData.set(session, {
        session,
        totalStudents: 0,
        totalPercentage: 0,
        passCount: 0,
        excellenceCount: 0
      });
    }

    const data = sessionData.get(session)!;
    data.totalStudents++;
    data.totalPercentage += result.overallPerformance.averagePercentage;
    
    if (result.overallPerformance.subjectsPassed > 0) {
      data.passCount++;
    }
    
    if (result.overallPerformance.distinction) {
      data.excellenceCount++;
    }
  });

  const trends = Array.from(sessionData.values()).map(data => ({
    session: data.session,
    totalStudents: data.totalStudents,
    averagePercentage: Math.round(data.totalPercentage / data.totalStudents),
    passRate: Math.round((data.passCount / data.totalStudents) * 100),
    excellenceRate: Math.round((data.excellenceCount / data.totalStudents) * 100)
  })).sort((a, b) => a.session.localeCompare(b.session));

  // Calculate trend direction
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    return {
      sessionTrends: trends,
      trendAnalysis: {
        performanceTrend: latest.averagePercentage > previous.averagePercentage ? 'improving' : 
                         latest.averagePercentage < previous.averagePercentage ? 'declining' : 'stable',
        passRateTrend: latest.passRate > previous.passRate ? 'improving' : 
                      latest.passRate < previous.passRate ? 'declining' : 'stable',
        excellenceTrend: latest.excellenceRate > previous.excellenceRate ? 'improving' : 
                        latest.excellenceRate < previous.excellenceRate ? 'declining' : 'stable'
      }
    };
  }

  return { sessionTrends: trends, trendAnalysis: null };
};

// Calculate certificate statistics
const calculateCertificateStatistics = (): any => {
  const allCertificates = Array.from(certificates.values());
  
  return {
    totalCertificates: allCertificates.length,
    byType: {
      original: allCertificates.filter(c => c.certificateType === 'original').length,
      duplicate: allCertificates.filter(c => c.certificateType === 'duplicate').length,
      replacement: allCertificates.filter(c => c.certificateType === 'replacement').length,
      provisional: allCertificates.filter(c => c.certificateType === 'provisional').length
    },
    byStatus: {
      generated: allCertificates.filter(c => c.status === 'generated').length,
      issued: allCertificates.filter(c => c.status === 'issued').length,
      delivered: allCertificates.filter(c => c.status === 'delivered').length,
      revoked: allCertificates.filter(c => c.status === 'revoked').length
    },
    totalDownloads: allCertificates.reduce((sum, cert) => sum + cert.downloads.length, 0),
    totalPrints: allCertificates.reduce((sum, cert) => 
      sum + cert.prints.reduce((printSum: number, print: any) => printSum + print.copies, 0), 0
    )
  };
};

// Calculate verification statistics
const calculateVerificationStatistics = (): any => {
  const allVerifications = Array.from(verificationLogs.values());
  
  const last30Days = allVerifications.filter(v => 
    new Date(v.verificationMetadata.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  return {
    totalVerifications: allVerifications.length,
    last30Days: last30Days.length,
    byType: {
      result: allVerifications.filter(v => v.verificationType === 'result').length,
      certificate: allVerifications.filter(v => v.verificationType === 'certificate').length,
      student: allVerifications.filter(v => v.verificationType === 'student').length
    },
    byStatus: {
      verified: allVerifications.filter(v => v.verificationResult.verificationStatus === 'verified').length,
      invalid: allVerifications.filter(v => v.verificationResult.verificationStatus === 'invalid').length,
      partial: allVerifications.filter(v => v.verificationResult.verificationStatus === 'partial').length,
      suspicious: allVerifications.filter(v => v.verificationResult.verificationStatus === 'suspicious').length
    },
    averageConfidence: allVerifications.length > 0 ? 
      Math.round(allVerifications.reduce((sum, v) => sum + v.verificationResult.confidence, 0) / allVerifications.length) : 0,
    fraudDetected: allVerifications.filter(v => v.fraudIndicators.length > 0).length
  };
};

// GET - Get results statistics
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

    if (!canViewStatistics(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view statistics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examSession = searchParams.get('examSession') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const schoolId = searchParams.get('schoolId') || '';
    const region = searchParams.get('region') || '';
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Get all published results
    let results = Array.from(examResults.values()).filter(
      result => result.publication.isPublished
    );

    // Apply filters
    if (examSession) {
      results = results.filter(result => result.examSession === examSession);
    }

    if (examLevel) {
      results = results.filter(result => result.examLevel === examLevel);
    }

    if (schoolId) {
      results = results.filter(result => result.schoolId === schoolId);
    }

    if (region) {
      results = results.filter(result => extractRegion(result.schoolName) === region);
    }

    // Calculate statistics
    const overallStatistics = calculateOverallStatistics(results);
    const gradeDistribution = calculateGradeDistribution(results);
    const subjectPerformance = calculateSubjectPerformance(results);
    const regionalPerformance = calculateRegionalPerformance(results);
    const trends = calculateTrends(results);
    const certificateStatistics = calculateCertificateStatistics();
    const verificationStatistics = calculateVerificationStatistics();

    // Prepare response data
    let responseData: any = {
      overview: overallStatistics,
      gradeDistribution,
      subjectPerformance: subjectPerformance.slice(0, 10), // Top 10 subjects
      regionalPerformance,
      trends,
      certificates: certificateStatistics,
      verifications: verificationStatistics,
      lastUpdated: new Date().toISOString()
    };

    // Include detailed data if requested
    if (includeDetails) {
      responseData.detailedAnalysis = {
        allSubjectPerformance: subjectPerformance,
        topPerformingSchools: getTopPerformingSchools(results, 10),
        performanceDistribution: getPerformanceDistribution(results),
        comparativeAnalysis: getComparativeAnalysis(results)
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Results statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get results statistics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const extractRegion = (locationName: string): string => {
  // Simplified region extraction - in production would use proper mapping
  if (!locationName) return 'Unknown';
  
  const regions = ['Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 'North', 'Adamawa', 'East', 'South', 'Far North'];
  const foundRegion = regions.find(region => locationName.toLowerCase().includes(region.toLowerCase()));
  return foundRegion || 'Other';
};

const getTopPerformingSchools = (results: any[], limit: number): any[] => {
  const schoolData = new Map<string, any>();

  results.forEach(result => {
    if (!schoolData.has(result.schoolId)) {
      schoolData.set(result.schoolId, {
        schoolId: result.schoolId,
        schoolName: result.schoolName,
        totalStudents: 0,
        totalPercentage: 0,
        passCount: 0
      });
    }

    const data = schoolData.get(result.schoolId)!;
    data.totalStudents++;
    data.totalPercentage += result.overallPerformance.averagePercentage;
    
    if (result.overallPerformance.subjectsPassed > 0) {
      data.passCount++;
    }
  });

  return Array.from(schoolData.values())
    .map(data => ({
      ...data,
      averagePercentage: Math.round(data.totalPercentage / data.totalStudents),
      passRate: Math.round((data.passCount / data.totalStudents) * 100)
    }))
    .sort((a, b) => b.averagePercentage - a.averagePercentage)
    .slice(0, limit);
};

const getPerformanceDistribution = (results: any[]): any => {
  const ranges = [
    { min: 90, max: 100, label: 'Excellent (90-100%)' },
    { min: 80, max: 89, label: 'Very Good (80-89%)' },
    { min: 70, max: 79, label: 'Good (70-79%)' },
    { min: 60, max: 69, label: 'Satisfactory (60-69%)' },
    { min: 50, max: 59, label: 'Fair (50-59%)' },
    { min: 0, max: 49, label: 'Poor (0-49%)' }
  ];

  return ranges.map(range => {
    const count = results.filter(r => 
      r.overallPerformance.averagePercentage >= range.min && 
      r.overallPerformance.averagePercentage <= range.max
    ).length;
    
    return {
      range: range.label,
      count,
      percentage: results.length > 0 ? Math.round((count / results.length) * 100) : 0
    };
  });
};

const getComparativeAnalysis = (results: any[]): any => {
  const currentSession = results.length > 0 ? results[0].examSession : '';
  const previousSession = getPreviousSession(currentSession);
  
  // This would compare with previous session data in production
  return {
    currentSession,
    previousSession,
    comparison: 'Data comparison would be implemented with historical data'
  };
};

const getPreviousSession = (currentSession: string): string => {
  // Simplified previous session calculation
  const year = parseInt(currentSession);
  return (year - 1).toString();
};
