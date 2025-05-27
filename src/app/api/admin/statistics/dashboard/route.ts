import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage from other modules
const examResults: Map<string, any> = new Map();
const markingScores: Map<string, any> = new Map();
const certificates: Map<string, any> = new Map();
const userActivities: Map<string, any> = new Map();
const auditLogs: Map<string, any> = new Map();

// Helper function to check dashboard access
const canViewDashboard = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Generate mock data for demonstration
const generateMockData = () => {
  // Mock exam results
  for (let i = 1; i <= 1000; i++) {
    const resultId = `RESULT-${i.toString().padStart(4, '0')}`;
    examResults.set(resultId, {
      id: resultId,
      studentId: `STU-${i}`,
      studentName: `Student ${i}`,
      examSession: '2025',
      examLevel: Math.random() > 0.5 ? 'O Level' : 'A Level',
      overallPerformance: {
        averagePercentage: Math.floor(Math.random() * 40) + 40, // 40-80%
        subjectsPassed: Math.floor(Math.random() * 8) + 1,
        totalSubjects: 8,
        classification: Math.random() > 0.7 ? 'Distinction' : Math.random() > 0.4 ? 'Credit' : 'Pass'
      },
      publication: {
        isPublished: Math.random() > 0.1 // 90% published
      },
      audit: {
        generatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }

  // Mock certificates
  for (let i = 1; i <= 800; i++) {
    const certId = `CERT-${i.toString().padStart(4, '0')}`;
    certificates.set(certId, {
      id: certId,
      studentId: `STU-${i}`,
      status: Math.random() > 0.8 ? 'generated' : 'issued',
      certificateType: 'original',
      issuanceDetails: {
        issuedDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }

  // Mock user activities
  for (let i = 1; i <= 5000; i++) {
    const activityId = `ACT-${i.toString().padStart(4, '0')}`;
    userActivities.set(activityId, {
      id: activityId,
      userId: `USER-${Math.floor(Math.random() * 200) + 1}`,
      userType: ['admin', 'examiner', 'teacher', 'student'][Math.floor(Math.random() * 4)],
      activity: {
        type: ['login', 'page_view', 'action', 'download'][Math.floor(Math.random() * 4)]
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      security: {
        riskScore: Math.floor(Math.random() * 100)
      }
    });
  }
};

// Initialize mock data
generateMockData();

// Calculate system overview statistics
const calculateSystemOverview = (): any => {
  const totalUsers = userStorage.getAllUsers().length;
  const activeUsers = Array.from(userActivities.values())
    .filter(activity => new Date(activity.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    .map(activity => activity.userId);
  const uniqueActiveUsers = new Set(activeUsers).size;

  const totalResults = examResults.size;
  const publishedResults = Array.from(examResults.values())
    .filter(result => result.publication.isPublished).length;

  const totalCertificates = certificates.size;
  const issuedCertificates = Array.from(certificates.values())
    .filter(cert => cert.status === 'issued').length;

  const recentActivities = Array.from(userActivities.values())
    .filter(activity => new Date(activity.timestamp) > new Date(Date.now() - 60 * 60 * 1000)).length;

  return {
    users: {
      total: totalUsers,
      active24h: uniqueActiveUsers,
      byType: {
        admin: userStorage.getAllUsers().filter(u => u.userType === 'admin').length,
        examiner: userStorage.getAllUsers().filter(u => u.userType === 'examiner').length,
        teacher: userStorage.getAllUsers().filter(u => u.userType === 'teacher').length,
        student: userStorage.getAllUsers().filter(u => u.userType === 'student').length
      }
    },
    examinations: {
      totalResults,
      publishedResults,
      pendingResults: totalResults - publishedResults,
      publishRate: totalResults > 0 ? Math.round((publishedResults / totalResults) * 100) : 0
    },
    certificates: {
      total: totalCertificates,
      issued: issuedCertificates,
      pending: totalCertificates - issuedCertificates,
      issuanceRate: totalCertificates > 0 ? Math.round((issuedCertificates / totalCertificates) * 100) : 0
    },
    activity: {
      recentActivities,
      totalActivities: userActivities.size,
      averageDaily: Math.round(userActivities.size / 7) // Assuming 7 days of data
    }
  };
};

// Calculate performance metrics
const calculatePerformanceMetrics = (): any => {
  const results = Array.from(examResults.values());
  const publishedResults = results.filter(r => r.publication.isPublished);

  if (publishedResults.length === 0) {
    return {
      averagePerformance: 0,
      passRate: 0,
      excellenceRate: 0,
      byLevel: {},
      trends: []
    };
  }

  const totalPerformance = publishedResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0);
  const averagePerformance = Math.round(totalPerformance / publishedResults.length);

  const passedStudents = publishedResults.filter(r => r.overallPerformance.subjectsPassed > 0).length;
  const passRate = Math.round((passedStudents / publishedResults.length) * 100);

  const excellentStudents = publishedResults.filter(r => 
    r.overallPerformance.classification === 'Distinction' || r.overallPerformance.averagePercentage >= 80
  ).length;
  const excellenceRate = Math.round((excellentStudents / publishedResults.length) * 100);

  // Performance by level
  const oLevelResults = publishedResults.filter(r => r.examLevel === 'O Level');
  const aLevelResults = publishedResults.filter(r => r.examLevel === 'A Level');

  const byLevel = {
    'O Level': {
      count: oLevelResults.length,
      averagePerformance: oLevelResults.length > 0 ? 
        Math.round(oLevelResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0) / oLevelResults.length) : 0,
      passRate: oLevelResults.length > 0 ? 
        Math.round((oLevelResults.filter(r => r.overallPerformance.subjectsPassed > 0).length / oLevelResults.length) * 100) : 0
    },
    'A Level': {
      count: aLevelResults.length,
      averagePerformance: aLevelResults.length > 0 ? 
        Math.round(aLevelResults.reduce((sum, r) => sum + r.overallPerformance.averagePercentage, 0) / aLevelResults.length) : 0,
      passRate: aLevelResults.length > 0 ? 
        Math.round((aLevelResults.filter(r => r.overallPerformance.subjectsPassed > 0).length / aLevelResults.length) * 100) : 0
    }
  };

  // Generate trend data (mock)
  const trends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    trends.push({
      date: date.toISOString().split('T')[0],
      averagePerformance: Math.floor(Math.random() * 20) + 60, // 60-80%
      passRate: Math.floor(Math.random() * 20) + 75, // 75-95%
      totalResults: Math.floor(Math.random() * 50) + 20
    });
  }

  return {
    averagePerformance,
    passRate,
    excellenceRate,
    byLevel,
    trends
  };
};

// Calculate security metrics
const calculateSecurityMetrics = (): any => {
  const activities = Array.from(userActivities.values());
  const last24h = activities.filter(a => 
    new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const failedLogins = last24h.filter(a => 
    a.activity.type === 'login' && a.activity.action === 'LOGIN_FAILED'
  ).length;

  const highRiskActivities = last24h.filter(a => a.security.riskScore > 70).length;
  const suspiciousActivities = last24h.filter(a => a.security.riskScore > 50).length;

  const uniqueIPs = new Set(activities.map(a => a.location?.ipAddress).filter(Boolean)).size;

  return {
    failedLogins24h: failedLogins,
    highRiskActivities24h: highRiskActivities,
    suspiciousActivities24h: suspiciousActivities,
    uniqueIPs24h: uniqueIPs,
    securityScore: Math.max(0, 100 - (failedLogins * 2) - (highRiskActivities * 5) - (suspiciousActivities * 2)),
    alerts: [
      ...(failedLogins > 10 ? ['High number of failed login attempts'] : []),
      ...(highRiskActivities > 5 ? ['Multiple high-risk activities detected'] : []),
      ...(uniqueIPs > 50 ? ['Unusual number of unique IP addresses'] : [])
    ]
  };
};

// Calculate system health summary
const calculateSystemHealth = (): any => {
  // Mock system health data
  const services = {
    database: { status: 'online', responseTime: 45 },
    authentication: { status: 'online', responseTime: 32 },
    fileStorage: { status: 'online', responseTime: 78 },
    emailService: { status: 'online', responseTime: 156 },
    backupService: { status: 'online', responseTime: 234 }
  };

  const onlineServices = Object.values(services).filter(s => s.status === 'online').length;
  const totalServices = Object.keys(services).length;
  const healthScore = Math.round((onlineServices / totalServices) * 100);

  const performance = {
    cpuUsage: Math.floor(Math.random() * 30) + 30, // 30-60%
    memoryUsage: Math.floor(Math.random() * 25) + 45, // 45-70%
    diskUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
    networkLatency: Math.floor(Math.random() * 40) + 20 // 20-60ms
  };

  return {
    overallStatus: healthScore >= 95 ? 'healthy' : healthScore >= 80 ? 'warning' : 'critical',
    healthScore,
    services,
    performance,
    uptime: Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Up to 30 days in milliseconds
    lastCheck: new Date().toISOString()
  };
};

// Calculate recent activity summary
const calculateRecentActivity = (): any => {
  const activities = Array.from(userActivities.values());
  const last24h = activities.filter(a => 
    new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const activityByHour = Array.from({ length: 24 }, (_, hour) => {
    const hourStart = new Date();
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date();
    hourEnd.setHours(hour, 59, 59, 999);

    const hourActivities = last24h.filter(a => {
      const activityTime = new Date(a.timestamp);
      return activityTime >= hourStart && activityTime <= hourEnd;
    });

    return {
      hour,
      count: hourActivities.length,
      uniqueUsers: new Set(hourActivities.map(a => a.userId)).size
    };
  });

  const topUsers = last24h.reduce((acc, activity) => {
    if (!acc[activity.userId]) {
      acc[activity.userId] = {
        userId: activity.userId,
        userType: activity.userType,
        activityCount: 0
      };
    }
    acc[activity.userId].activityCount++;
    return acc;
  }, {} as Record<string, any>);

  const sortedTopUsers = Object.values(topUsers)
    .sort((a: any, b: any) => b.activityCount - a.activityCount)
    .slice(0, 10);

  return {
    total24h: last24h.length,
    uniqueUsers24h: new Set(last24h.map(a => a.userId)).size,
    activityByHour,
    topUsers: sortedTopUsers,
    byType: {
      login: last24h.filter(a => a.activity.type === 'login').length,
      page_view: last24h.filter(a => a.activity.type === 'page_view').length,
      action: last24h.filter(a => a.activity.type === 'action').length,
      download: last24h.filter(a => a.activity.type === 'download').length
    }
  };
};

// GET - Get dashboard statistics
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

    if (!canViewDashboard(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view dashboard statistics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includePerformance = searchParams.get('includePerformance') !== 'false';
    const includeSecurity = searchParams.get('includeSecurity') !== 'false';
    const includeHealth = searchParams.get('includeHealth') !== 'false';
    const includeActivity = searchParams.get('includeActivity') !== 'false';
    const timeRange = searchParams.get('timeRange') || '24h';

    // Calculate all statistics
    const systemOverview = calculateSystemOverview();
    
    let responseData: any = {
      overview: systemOverview,
      lastUpdated: new Date().toISOString(),
      timeRange
    };

    // Include performance metrics if requested
    if (includePerformance) {
      responseData.performance = calculatePerformanceMetrics();
    }

    // Include security metrics if requested
    if (includeSecurity) {
      responseData.security = calculateSecurityMetrics();
    }

    // Include system health if requested
    if (includeHealth) {
      responseData.systemHealth = calculateSystemHealth();
    }

    // Include recent activity if requested
    if (includeActivity) {
      responseData.recentActivity = calculateRecentActivity();
    }

    // Add summary alerts
    const alerts = [];
    
    if (responseData.security?.failedLogins24h > 10) {
      alerts.push({
        type: 'security',
        severity: 'high',
        message: `${responseData.security.failedLogins24h} failed login attempts in the last 24 hours`,
        action: 'Review security logs'
      });
    }

    if (responseData.systemHealth?.healthScore < 90) {
      alerts.push({
        type: 'system',
        severity: responseData.systemHealth.healthScore < 70 ? 'critical' : 'warning',
        message: `System health score is ${responseData.systemHealth.healthScore}%`,
        action: 'Check system status'
      });
    }

    if (responseData.performance?.passRate < 70) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Pass rate is ${responseData.performance.passRate}% - below target`,
        action: 'Review examination performance'
      });
    }

    responseData.alerts = alerts;

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
