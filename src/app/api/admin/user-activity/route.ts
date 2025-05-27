import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// User activity storage
const userActivities: Map<string, {
  id: string;
  userId: string;
  userName: string;
  userType: string;
  sessionId: string;
  activity: {
    type: 'login' | 'logout' | 'page_view' | 'action' | 'download' | 'upload' | 'search' | 'api_call';
    action: string;
    resource?: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  duration?: number; // for session-based activities
  location: {
    ipAddress: string;
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  device: {
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
  performance: {
    responseTime?: number;
    pageLoadTime?: number;
    networkLatency?: number;
  };
  security: {
    riskScore: number; // 0-100
    anomalies: string[];
    flags: string[];
  };
}> = new Map();

// User sessions storage
const userSessions: Map<string, {
  sessionId: string;
  userId: string;
  userName: string;
  userType: string;
  startTime: string;
  lastActivity: string;
  endTime?: string;
  duration?: number;
  status: 'active' | 'idle' | 'expired' | 'terminated';
  location: {
    ipAddress: string;
    country?: string;
    city?: string;
  };
  device: {
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
  };
  activities: number;
  pagesVisited: string[];
  actionsPerformed: number;
  dataTransferred: number; // bytes
}> = new Map();

// Generate mock user activities
const generateMockUserActivities = () => {
  const mockActivities = [
    {
      userId: 'admin-001',
      userName: 'System Administrator',
      userType: 'admin',
      activityType: 'login',
      action: 'LOGIN_SUCCESS',
      resource: 'authentication_system',
      ipAddress: '192.168.1.100',
      browser: 'Chrome',
      os: 'Windows 10',
      device: 'Desktop',
      riskScore: 10
    },
    {
      userId: 'student-123',
      userName: 'John Doe',
      userType: 'student',
      activityType: 'page_view',
      action: 'VIEW_RESULTS',
      resource: '/results/student/123',
      ipAddress: '203.45.67.89',
      browser: 'Firefox',
      os: 'Android',
      device: 'Mobile',
      riskScore: 5
    },
    {
      userId: 'teacher-456',
      userName: 'Jane Smith',
      userType: 'teacher',
      activityType: 'download',
      action: 'DOWNLOAD_REPORT',
      resource: 'school_performance_report.pdf',
      ipAddress: '192.168.1.105',
      browser: 'Safari',
      os: 'macOS',
      device: 'Desktop',
      riskScore: 15
    },
    {
      userId: 'examiner-789',
      userName: 'Chief Examiner',
      userType: 'examiner',
      activityType: 'action',
      action: 'PUBLISH_RESULTS',
      resource: 'exam_results_2025',
      ipAddress: '192.168.1.110',
      browser: 'Edge',
      os: 'Windows 11',
      device: 'Desktop',
      riskScore: 25
    }
  ];

  mockActivities.forEach((activity, index) => {
    const activityId = `ACT-${Date.now()}-${index.toString().padStart(3, '0')}`;
    const sessionId = `session-${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString();
    
    userActivities.set(activityId, {
      id: activityId,
      userId: activity.userId,
      userName: activity.userName,
      userType: activity.userType,
      sessionId,
      activity: {
        type: activity.activityType as any,
        action: activity.action,
        resource: activity.resource,
        details: {
          method: 'GET',
          statusCode: 200,
          referrer: 'https://gce.cm/dashboard'
        }
      },
      timestamp,
      duration: activity.activityType === 'page_view' ? Math.floor(Math.random() * 300) + 30 : undefined,
      location: {
        ipAddress: activity.ipAddress,
        country: 'Cameroon',
        city: activity.ipAddress.startsWith('192.168') ? 'Yaoundé' : 'Douala',
        coordinates: { lat: 3.848, lng: 11.502 }
      },
      device: {
        userAgent: `Mozilla/5.0 (${activity.os}) ${activity.browser}`,
        browser: activity.browser,
        os: activity.os,
        device: activity.device,
        isMobile: activity.device === 'Mobile'
      },
      performance: {
        responseTime: Math.floor(Math.random() * 500) + 100,
        pageLoadTime: Math.floor(Math.random() * 2000) + 500,
        networkLatency: Math.floor(Math.random() * 100) + 20
      },
      security: {
        riskScore: activity.riskScore,
        anomalies: activity.riskScore > 20 ? ['unusual_time'] : [],
        flags: activity.riskScore > 30 ? ['high_risk_action'] : []
      }
    });

    // Create or update session
    if (!userSessions.has(sessionId)) {
      userSessions.set(sessionId, {
        sessionId,
        userId: activity.userId,
        userName: activity.userName,
        userType: activity.userType,
        startTime: timestamp,
        lastActivity: timestamp,
        status: 'active',
        location: {
          ipAddress: activity.ipAddress,
          country: 'Cameroon',
          city: activity.ipAddress.startsWith('192.168') ? 'Yaoundé' : 'Douala'
        },
        device: {
          userAgent: `Mozilla/5.0 (${activity.os}) ${activity.browser}`,
          browser: activity.browser,
          os: activity.os,
          device: activity.device,
          isMobile: activity.device === 'Mobile'
        },
        activities: 1,
        pagesVisited: [activity.resource || '/'],
        actionsPerformed: 1,
        dataTransferred: Math.floor(Math.random() * 1000000) + 50000
      });
    }
  });
};

// Initialize mock data
generateMockUserActivities();

// Helper function to check user activity access
const canViewUserActivity = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// Calculate activity statistics
const calculateActivityStatistics = (activities: any[], timeRange: string): any => {
  const now = Date.now();
  const timeRangeMs = timeRange === '1h' ? 60 * 60 * 1000 :
                     timeRange === '24h' ? 24 * 60 * 60 * 1000 :
                     timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                     timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                     24 * 60 * 60 * 1000;

  const filteredActivities = activities.filter(activity => 
    new Date(activity.timestamp).getTime() > (now - timeRangeMs)
  );

  const uniqueUsers = new Set(filteredActivities.map(a => a.userId)).size;
  const totalSessions = new Set(filteredActivities.map(a => a.sessionId)).size;

  return {
    totalActivities: filteredActivities.length,
    uniqueUsers,
    totalSessions,
    averageSessionDuration: calculateAverageSessionDuration(filteredActivities),
    byActivityType: {
      login: filteredActivities.filter(a => a.activity.type === 'login').length,
      logout: filteredActivities.filter(a => a.activity.type === 'logout').length,
      page_view: filteredActivities.filter(a => a.activity.type === 'page_view').length,
      action: filteredActivities.filter(a => a.activity.type === 'action').length,
      download: filteredActivities.filter(a => a.activity.type === 'download').length,
      upload: filteredActivities.filter(a => a.activity.type === 'upload').length,
      search: filteredActivities.filter(a => a.activity.type === 'search').length,
      api_call: filteredActivities.filter(a => a.activity.type === 'api_call').length
    },
    byUserType: {
      admin: filteredActivities.filter(a => a.userType === 'admin').length,
      examiner: filteredActivities.filter(a => a.userType === 'examiner').length,
      teacher: filteredActivities.filter(a => a.userType === 'teacher').length,
      student: filteredActivities.filter(a => a.userType === 'student').length
    },
    byDevice: {
      desktop: filteredActivities.filter(a => !a.device.isMobile).length,
      mobile: filteredActivities.filter(a => a.device.isMobile).length
    },
    security: {
      highRiskActivities: filteredActivities.filter(a => a.security.riskScore > 50).length,
      anomaliesDetected: filteredActivities.filter(a => a.security.anomalies.length > 0).length,
      flaggedActivities: filteredActivities.filter(a => a.security.flags.length > 0).length
    },
    performance: {
      averageResponseTime: Math.round(
        filteredActivities.reduce((sum, a) => sum + (a.performance.responseTime || 0), 0) / filteredActivities.length
      ),
      averagePageLoadTime: Math.round(
        filteredActivities.reduce((sum, a) => sum + (a.performance.pageLoadTime || 0), 0) / filteredActivities.length
      )
    }
  };
};

// Calculate average session duration
const calculateAverageSessionDuration = (activities: any[]): number => {
  const sessions = Array.from(userSessions.values());
  const activeSessions = sessions.filter(s => s.duration);
  
  if (activeSessions.length === 0) return 0;
  
  return Math.round(
    activeSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / activeSessions.length
  );
};

// Get top active users
const getTopActiveUsers = (activities: any[], limit: number = 10): any[] => {
  const userActivityCount = new Map<string, any>();

  activities.forEach(activity => {
    if (!userActivityCount.has(activity.userId)) {
      userActivityCount.set(activity.userId, {
        userId: activity.userId,
        userName: activity.userName,
        userType: activity.userType,
        activityCount: 0,
        lastActivity: activity.timestamp,
        riskScore: 0
      });
    }

    const userData = userActivityCount.get(activity.userId)!;
    userData.activityCount++;
    userData.riskScore = Math.max(userData.riskScore, activity.security.riskScore);
    
    if (new Date(activity.timestamp) > new Date(userData.lastActivity)) {
      userData.lastActivity = activity.timestamp;
    }
  });

  return Array.from(userActivityCount.values())
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, limit);
};

// GET - Get user activities
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

    if (!canViewUserActivity(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view user activity' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const userType = searchParams.get('userType') || '';
    const activityType = searchParams.get('activityType') || '';
    const timeRange = searchParams.get('timeRange') || '24h';
    const includeStatistics = searchParams.get('includeStatistics') === 'true';
    const includeSessions = searchParams.get('includeSessions') === 'true';
    const includeTopUsers = searchParams.get('includeTopUsers') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get all activities
    let activities = Array.from(userActivities.values());

    // Apply time range filter
    const now = Date.now();
    const timeRangeMs = timeRange === '1h' ? 60 * 60 * 1000 :
                       timeRange === '24h' ? 24 * 60 * 60 * 1000 :
                       timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                       timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                       24 * 60 * 60 * 1000;

    activities = activities.filter(activity => 
      new Date(activity.timestamp).getTime() > (now - timeRangeMs)
    );

    // Apply additional filters
    if (userId) {
      activities = activities.filter(activity => activity.userId === userId);
    }

    if (userType) {
      activities = activities.filter(activity => activity.userType === userType);
    }

    if (activityType) {
      activities = activities.filter(activity => activity.activity.type === activityType);
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate pagination
    const totalActivities = activities.length;
    const totalPages = Math.ceil(totalActivities / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    // Prepare response data
    let responseData: any = {
      activities: paginatedActivities,
      pagination: {
        currentPage: page,
        totalPages,
        totalActivities,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      timeRange
    };

    // Include statistics if requested
    if (includeStatistics) {
      responseData.statistics = calculateActivityStatistics(activities, timeRange);
    }

    // Include active sessions if requested
    if (includeSessions) {
      const activeSessions = Array.from(userSessions.values())
        .filter(session => session.status === 'active')
        .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
        .slice(0, 20);

      responseData.activeSessions = activeSessions;
    }

    // Include top active users if requested
    if (includeTopUsers) {
      responseData.topActiveUsers = getTopActiveUsers(activities, 10);
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'User activity data retrieved successfully'
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Track user activity (for internal use)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      userId,
      sessionId,
      activity,
      location,
      device,
      performance
    } = body;

    // Validate required fields
    if (!userId || !activity) {
      return NextResponse.json(
        { success: false, message: 'Missing required activity data' },
        { status: 400 }
      );
    }

    const user = userStorage.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create activity record
    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();

    const userActivity = {
      id: activityId,
      userId,
      userName: user.name,
      userType: user.userType,
      sessionId: sessionId || `session-${Math.random().toString(36).substring(2, 8)}`,
      activity,
      timestamp,
      duration: activity.duration,
      location: location || { ipAddress: '0.0.0.0' },
      device: device || { userAgent: 'Unknown', browser: 'Unknown', os: 'Unknown', device: 'Unknown', isMobile: false },
      performance: performance || {},
      security: {
        riskScore: calculateRiskScore(activity, location, device),
        anomalies: [],
        flags: []
      }
    };

    // Store activity
    userActivities.set(activityId, userActivity);

    return NextResponse.json({
      success: true,
      data: { activityId },
      message: 'User activity tracked successfully'
    });

  } catch (error) {
    console.error('Track user activity error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Calculate risk score for activity
const calculateRiskScore = (activity: any, location: any, device: any): number => {
  let riskScore = 0;

  // Base risk by activity type
  switch (activity.type) {
    case 'login': riskScore += 10; break;
    case 'logout': riskScore += 5; break;
    case 'action': riskScore += 20; break;
    case 'download': riskScore += 15; break;
    case 'upload': riskScore += 25; break;
    default: riskScore += 5;
  }

  // Location-based risk
  if (location?.ipAddress && !location.ipAddress.startsWith('192.168')) {
    riskScore += 10; // External IP
  }

  // Device-based risk
  if (device?.isMobile) {
    riskScore += 5; // Mobile device
  }

  // Time-based risk (outside business hours)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    riskScore += 15; // Outside business hours
  }

  return Math.min(100, riskScore);
}
