import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// System health storage
const systemHealthData: Map<string, {
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number;
  services: {
    database: { status: 'online' | 'offline' | 'degraded'; responseTime: number; lastCheck: string };
    authentication: { status: 'online' | 'offline' | 'degraded'; responseTime: number; lastCheck: string };
    fileStorage: { status: 'online' | 'offline' | 'degraded'; responseTime: number; lastCheck: string };
    emailService: { status: 'online' | 'offline' | 'degraded'; responseTime: number; lastCheck: string };
    smsService: { status: 'online' | 'offline' | 'degraded'; responseTime: number; lastCheck: string };
    backupService: { status: 'online' | 'offline' | 'degraded'; responseTime: number; lastCheck: string };
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    activeConnections: number;
    requestsPerMinute: number;
  };
  security: {
    failedLoginAttempts: number;
    suspiciousActivities: number;
    lastSecurityScan: string;
    vulnerabilities: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      component: string;
    }>;
  };
  errors: Array<{
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    component: string;
    message: string;
    count: number;
  }>;
  maintenance: {
    scheduled: Array<{
      id: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    }>;
    lastMaintenance: string;
    nextMaintenance: string;
  };
}> = new Map();

// Helper function to check admin access
const canAccessSystemHealth = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// Generate mock system health data
const generateSystemHealthData = (): any => {
  const now = new Date();
  const uptime = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days in milliseconds

  // Generate service statuses
  const services = {
    database: {
      status: Math.random() > 0.95 ? 'degraded' : 'online',
      responseTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
      lastCheck: new Date(now.getTime() - Math.random() * 60000).toISOString()
    },
    authentication: {
      status: Math.random() > 0.98 ? 'degraded' : 'online',
      responseTime: Math.floor(Math.random() * 30) + 5, // 5-35ms
      lastCheck: new Date(now.getTime() - Math.random() * 60000).toISOString()
    },
    fileStorage: {
      status: Math.random() > 0.97 ? 'degraded' : 'online',
      responseTime: Math.floor(Math.random() * 100) + 20, // 20-120ms
      lastCheck: new Date(now.getTime() - Math.random() * 60000).toISOString()
    },
    emailService: {
      status: Math.random() > 0.96 ? 'degraded' : 'online',
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      lastCheck: new Date(now.getTime() - Math.random() * 60000).toISOString()
    },
    smsService: {
      status: Math.random() > 0.94 ? 'degraded' : 'online',
      responseTime: Math.floor(Math.random() * 300) + 100, // 100-400ms
      lastCheck: new Date(now.getTime() - Math.random() * 60000).toISOString()
    },
    backupService: {
      status: Math.random() > 0.99 ? 'degraded' : 'online',
      responseTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
      lastCheck: new Date(now.getTime() - Math.random() * 60000).toISOString()
    }
  };

  // Determine overall system status
  const degradedServices = Object.values(services).filter(s => s.status === 'degraded').length;
  const offlineServices = Object.values(services).filter(s => s.status === 'offline').length;
  
  let systemStatus: 'healthy' | 'warning' | 'critical' | 'maintenance' = 'healthy';
  if (offlineServices > 0) systemStatus = 'critical';
  else if (degradedServices > 2) systemStatus = 'critical';
  else if (degradedServices > 0) systemStatus = 'warning';

  // Generate performance metrics
  const performance = {
    cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
    memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
    diskUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
    networkLatency: Math.floor(Math.random() * 50) + 10, // 10-60ms
    activeConnections: Math.floor(Math.random() * 500) + 100, // 100-600
    requestsPerMinute: Math.floor(Math.random() * 1000) + 200 // 200-1200
  };

  // Generate security metrics
  const security = {
    failedLoginAttempts: Math.floor(Math.random() * 20),
    suspiciousActivities: Math.floor(Math.random() * 5),
    lastSecurityScan: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    vulnerabilities: [
      {
        severity: 'low' as const,
        description: 'Outdated dependency detected',
        component: 'Authentication Service'
      },
      {
        severity: 'medium' as const,
        description: 'SSL certificate expires in 30 days',
        component: 'Web Server'
      }
    ].filter(() => Math.random() > 0.7) // Randomly include vulnerabilities
  };

  // Generate recent errors
  const errors = [
    {
      timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString(),
      level: 'warning' as const,
      component: 'Database',
      message: 'Slow query detected',
      count: Math.floor(Math.random() * 5) + 1
    },
    {
      timestamp: new Date(now.getTime() - Math.random() * 30 * 60 * 1000).toISOString(),
      level: 'error' as const,
      component: 'Email Service',
      message: 'Failed to send notification email',
      count: Math.floor(Math.random() * 3) + 1
    },
    {
      timestamp: new Date(now.getTime() - Math.random() * 15 * 60 * 1000).toISOString(),
      level: 'info' as const,
      component: 'Authentication',
      message: 'High login activity detected',
      count: 1
    }
  ].filter(() => Math.random() > 0.5); // Randomly include errors

  // Generate maintenance information
  const maintenance = {
    scheduled: [
      {
        id: 'MAINT-001',
        title: 'Database Optimization',
        description: 'Routine database maintenance and optimization',
        startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled' as const
      }
    ],
    lastMaintenance: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  return {
    timestamp: now.toISOString(),
    status: systemStatus,
    uptime,
    services,
    performance,
    security,
    errors,
    maintenance
  };
};

// Calculate system health score
const calculateHealthScore = (healthData: any): number => {
  let score = 100;

  // Deduct points for service issues
  Object.values(healthData.services).forEach((service: any) => {
    if (service.status === 'offline') score -= 20;
    else if (service.status === 'degraded') score -= 10;
    if (service.responseTime > 100) score -= 5;
  });

  // Deduct points for high resource usage
  if (healthData.performance.cpuUsage > 80) score -= 15;
  if (healthData.performance.memoryUsage > 85) score -= 15;
  if (healthData.performance.diskUsage > 90) score -= 10;

  // Deduct points for security issues
  if (healthData.security.failedLoginAttempts > 50) score -= 10;
  if (healthData.security.suspiciousActivities > 10) score -= 15;
  healthData.security.vulnerabilities.forEach((vuln: any) => {
    if (vuln.severity === 'critical') score -= 20;
    else if (vuln.severity === 'high') score -= 15;
    else if (vuln.severity === 'medium') score -= 10;
    else score -= 5;
  });

  // Deduct points for errors
  healthData.errors.forEach((error: any) => {
    if (error.level === 'error') score -= 5;
    else if (error.level === 'warning') score -= 2;
  });

  return Math.max(0, Math.min(100, score));
};

// Generate health recommendations
const generateHealthRecommendations = (healthData: any): string[] => {
  const recommendations = [];

  // Service recommendations
  Object.entries(healthData.services).forEach(([serviceName, service]: [string, any]) => {
    if (service.status === 'offline') {
      recommendations.push(`Immediate attention required: ${serviceName} is offline`);
    } else if (service.status === 'degraded') {
      recommendations.push(`Monitor ${serviceName} - performance degraded`);
    }
    if (service.responseTime > 200) {
      recommendations.push(`Optimize ${serviceName} - high response time (${service.responseTime}ms)`);
    }
  });

  // Performance recommendations
  if (healthData.performance.cpuUsage > 80) {
    recommendations.push('High CPU usage detected - consider scaling resources');
  }
  if (healthData.performance.memoryUsage > 85) {
    recommendations.push('High memory usage - investigate memory leaks or scale resources');
  }
  if (healthData.performance.diskUsage > 90) {
    recommendations.push('Critical: Disk space running low - immediate cleanup required');
  }

  // Security recommendations
  if (healthData.security.failedLoginAttempts > 50) {
    recommendations.push('High number of failed login attempts - review security logs');
  }
  if (healthData.security.vulnerabilities.length > 0) {
    const criticalVulns = healthData.security.vulnerabilities.filter((v: any) => v.severity === 'critical').length;
    if (criticalVulns > 0) {
      recommendations.push(`Critical: ${criticalVulns} critical vulnerabilities require immediate attention`);
    }
  }

  // Error recommendations
  const errorCount = healthData.errors.filter((e: any) => e.level === 'error').length;
  if (errorCount > 5) {
    recommendations.push('High error rate detected - investigate system logs');
  }

  return recommendations;
};

// GET - Get system health status
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

    if (!canAccessSystemHealth(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to access system health' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const timeRange = searchParams.get('timeRange') || '1h'; // 1h, 6h, 24h, 7d

    // Generate current system health data
    const currentHealthData = generateSystemHealthData();
    const healthScore = calculateHealthScore(currentHealthData);
    const recommendations = generateHealthRecommendations(currentHealthData);

    // Store current health data
    const healthId = `HEALTH-${Date.now()}`;
    systemHealthData.set(healthId, currentHealthData);

    // Prepare response data
    let responseData: any = {
      currentStatus: {
        status: currentHealthData.status,
        healthScore,
        uptime: currentHealthData.uptime,
        lastUpdated: currentHealthData.timestamp
      },
      services: currentHealthData.services,
      performance: currentHealthData.performance,
      summary: {
        totalServices: Object.keys(currentHealthData.services).length,
        onlineServices: Object.values(currentHealthData.services).filter((s: any) => s.status === 'online').length,
        degradedServices: Object.values(currentHealthData.services).filter((s: any) => s.status === 'degraded').length,
        offlineServices: Object.values(currentHealthData.services).filter((s: any) => s.status === 'offline').length,
        averageResponseTime: Math.round(
          Object.values(currentHealthData.services).reduce((sum: number, s: any) => sum + s.responseTime, 0) / 
          Object.keys(currentHealthData.services).length
        )
      },
      recommendations
    };

    // Include detailed information if requested
    if (includeDetails) {
      responseData.security = currentHealthData.security;
      responseData.errors = currentHealthData.errors;
      responseData.maintenance = currentHealthData.maintenance;
    }

    // Include historical data if requested
    if (includeHistory) {
      // Generate mock historical data
      const historyPoints = [];
      const now = Date.now();
      const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : // 5 min intervals
                        timeRange === '6h' ? 30 * 60 * 1000 : // 30 min intervals
                        timeRange === '24h' ? 60 * 60 * 1000 : // 1 hour intervals
                        24 * 60 * 60 * 1000; // 1 day intervals

      const pointCount = timeRange === '1h' ? 12 : timeRange === '6h' ? 12 : timeRange === '24h' ? 24 : 7;

      for (let i = pointCount - 1; i >= 0; i--) {
        const timestamp = new Date(now - (i * intervalMs));
        historyPoints.push({
          timestamp: timestamp.toISOString(),
          healthScore: Math.floor(Math.random() * 20) + 80, // 80-100
          cpuUsage: Math.floor(Math.random() * 40) + 20,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          responseTime: Math.floor(Math.random() * 50) + 20,
          activeConnections: Math.floor(Math.random() * 200) + 100
        });
      }

      responseData.history = {
        timeRange,
        dataPoints: historyPoints,
        trends: {
          healthScore: historyPoints.length > 1 ? 
            (historyPoints[historyPoints.length - 1].healthScore > historyPoints[0].healthScore ? 'improving' : 'declining') : 'stable',
          performance: 'stable',
          availability: '99.9%'
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'System health status retrieved successfully'
    });

  } catch (error) {
    console.error('Get system health error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
