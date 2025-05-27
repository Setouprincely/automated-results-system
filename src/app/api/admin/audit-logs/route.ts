import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Audit logs storage
const auditLogs: Map<string, {
  id: string;
  timestamp: string;
  userId: string;
  userType: string;
  userName: string;
  action: string;
  category: 'authentication' | 'user_management' | 'data_access' | 'system_config' | 'security' | 'backup_restore' | 'examination' | 'results' | 'certificates';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
  resource: {
    type: string;
    id?: string;
    name?: string;
  };
  details: {
    description: string;
    changes?: Record<string, { from: any; to: any }>;
    metadata?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
  };
  impact: {
    scope: 'user' | 'system' | 'data' | 'security';
    affectedUsers?: number;
    affectedRecords?: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  compliance: {
    gdprRelevant: boolean;
    retentionPeriod: number; // days
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  };
}> = new Map();

// Generate mock audit logs
const generateMockAuditLogs = () => {
  const mockLogs = [
    {
      userId: 'admin-001',
      userType: 'admin',
      userName: 'System Administrator',
      action: 'LOGIN_SUCCESS',
      category: 'authentication' as const,
      severity: 'low' as const,
      status: 'success' as const,
      resource: { type: 'authentication_system' },
      description: 'Administrator logged in successfully',
      ipAddress: '192.168.1.100',
      scope: 'user' as const,
      riskLevel: 'low' as const
    },
    {
      userId: 'admin-001',
      userType: 'admin',
      userName: 'System Administrator',
      action: 'USER_CREATED',
      category: 'user_management' as const,
      severity: 'medium' as const,
      status: 'success' as const,
      resource: { type: 'user', id: 'user-123', name: 'John Doe' },
      description: 'New user account created',
      ipAddress: '192.168.1.100',
      scope: 'system' as const,
      riskLevel: 'medium' as const,
      changes: {
        userType: { from: null, to: 'student' },
        status: { from: null, to: 'active' }
      }
    },
    {
      userId: 'examiner-001',
      userType: 'examiner',
      userName: 'Chief Examiner',
      action: 'RESULTS_PUBLISHED',
      category: 'results' as const,
      severity: 'high' as const,
      status: 'success' as const,
      resource: { type: 'exam_results', id: 'exam-2025-001' },
      description: 'Examination results published',
      ipAddress: '192.168.1.105',
      scope: 'data' as const,
      riskLevel: 'medium' as const,
      affectedRecords: 1500
    },
    {
      userId: 'user-456',
      userType: 'student',
      userName: 'Jane Smith',
      action: 'LOGIN_FAILED',
      category: 'authentication' as const,
      severity: 'medium' as const,
      status: 'failure' as const,
      resource: { type: 'authentication_system' },
      description: 'Failed login attempt - invalid password',
      ipAddress: '203.45.67.89',
      scope: 'security' as const,
      riskLevel: 'medium' as const
    },
    {
      userId: 'admin-001',
      userType: 'admin',
      userName: 'System Administrator',
      action: 'BACKUP_CREATED',
      category: 'backup_restore' as const,
      severity: 'medium' as const,
      status: 'success' as const,
      resource: { type: 'backup', id: 'backup-001' },
      description: 'System backup created successfully',
      ipAddress: '192.168.1.100',
      scope: 'system' as const,
      riskLevel: 'low' as const
    },
    {
      userId: 'admin-002',
      userType: 'admin',
      userName: 'Security Administrator',
      action: 'CONFIG_CHANGED',
      category: 'system_config' as const,
      severity: 'high' as const,
      status: 'success' as const,
      resource: { type: 'system_configuration' },
      description: 'Security settings modified',
      ipAddress: '192.168.1.101',
      scope: 'security' as const,
      riskLevel: 'high' as const,
      changes: {
        passwordPolicy: { from: 'standard', to: 'strict' },
        sessionTimeout: { from: 30, to: 15 }
      }
    }
  ];

  mockLogs.forEach((log, index) => {
    const logId = `LOG-${Date.now()}-${index.toString().padStart(3, '0')}`;
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    auditLogs.set(logId, {
      id: logId,
      timestamp,
      userId: log.userId,
      userType: log.userType,
      userName: log.userName,
      action: log.action,
      category: log.category,
      severity: log.severity,
      status: log.status,
      resource: log.resource,
      details: {
        description: log.description,
        changes: log.changes,
        metadata: {
          source: 'web_application',
          version: '2.1.0'
        },
        ipAddress: log.ipAddress,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: `session-${Math.random().toString(36).substring(2, 8)}`
      },
      impact: {
        scope: log.scope,
        affectedUsers: log.affectedUsers,
        affectedRecords: log.affectedRecords,
        riskLevel: log.riskLevel
      },
      compliance: {
        gdprRelevant: ['user_management', 'data_access'].includes(log.category),
        retentionPeriod: log.category === 'security' ? 2555 : 1095, // 7 years for security, 3 years for others
        dataClassification: log.riskLevel === 'critical' ? 'restricted' : 
                           log.riskLevel === 'high' ? 'confidential' : 'internal'
      }
    });
  });
};

// Initialize mock data
generateMockAuditLogs();

// Helper function to check audit logs access
const canViewAuditLogs = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// Add audit log entry
export const addAuditLog = (logData: {
  userId: string;
  action: string;
  category: string;
  severity: string;
  status: string;
  resource: any;
  description: string;
  ipAddress: string;
  userAgent?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}): string => {
  const user = userStorage.findById(logData.userId);
  const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const auditLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    userId: logData.userId,
    userType: user?.userType || 'unknown',
    userName: user?.name || 'Unknown User',
    action: logData.action,
    category: logData.category as any,
    severity: logData.severity as any,
    status: logData.status as any,
    resource: logData.resource,
    details: {
      description: logData.description,
      changes: logData.changes,
      metadata: logData.metadata || {},
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent || 'Unknown',
      sessionId: `session-${Math.random().toString(36).substring(2, 8)}`
    },
    impact: {
      scope: determineScope(logData.category),
      riskLevel: logData.severity as any
    },
    compliance: {
      gdprRelevant: ['user_management', 'data_access'].includes(logData.category),
      retentionPeriod: logData.category === 'security' ? 2555 : 1095,
      dataClassification: logData.severity === 'critical' ? 'restricted' : 
                         logData.severity === 'high' ? 'confidential' : 'internal'
    }
  };

  auditLogs.set(logId, auditLog);
  return logId;
};

// Determine impact scope based on category
const determineScope = (category: string): 'user' | 'system' | 'data' | 'security' => {
  switch (category) {
    case 'authentication': return 'security';
    case 'user_management': return 'system';
    case 'data_access': return 'data';
    case 'system_config': return 'system';
    case 'security': return 'security';
    case 'backup_restore': return 'system';
    case 'examination': return 'data';
    case 'results': return 'data';
    case 'certificates': return 'data';
    default: return 'system';
  }
};

// Calculate audit statistics
const calculateAuditStatistics = (logs: any[], timeRange: string): any => {
  const now = Date.now();
  const timeRangeMs = timeRange === '24h' ? 24 * 60 * 60 * 1000 :
                     timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                     timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                     24 * 60 * 60 * 1000;

  const filteredLogs = logs.filter(log => 
    new Date(log.timestamp).getTime() > (now - timeRangeMs)
  );

  return {
    totalEvents: filteredLogs.length,
    byCategory: {
      authentication: filteredLogs.filter(l => l.category === 'authentication').length,
      user_management: filteredLogs.filter(l => l.category === 'user_management').length,
      data_access: filteredLogs.filter(l => l.category === 'data_access').length,
      system_config: filteredLogs.filter(l => l.category === 'system_config').length,
      security: filteredLogs.filter(l => l.category === 'security').length,
      backup_restore: filteredLogs.filter(l => l.category === 'backup_restore').length,
      examination: filteredLogs.filter(l => l.category === 'examination').length,
      results: filteredLogs.filter(l => l.category === 'results').length,
      certificates: filteredLogs.filter(l => l.category === 'certificates').length
    },
    bySeverity: {
      low: filteredLogs.filter(l => l.severity === 'low').length,
      medium: filteredLogs.filter(l => l.severity === 'medium').length,
      high: filteredLogs.filter(l => l.severity === 'high').length,
      critical: filteredLogs.filter(l => l.severity === 'critical').length
    },
    byStatus: {
      success: filteredLogs.filter(l => l.status === 'success').length,
      failure: filteredLogs.filter(l => l.status === 'failure').length,
      warning: filteredLogs.filter(l => l.status === 'warning').length
    },
    uniqueUsers: new Set(filteredLogs.map(l => l.userId)).size,
    failedLogins: filteredLogs.filter(l => l.action === 'LOGIN_FAILED').length,
    securityEvents: filteredLogs.filter(l => l.category === 'security' || l.severity === 'critical').length
  };
};

// GET - Get audit logs
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

    if (!canViewAuditLogs(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view audit logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const severity = searchParams.get('severity') || '';
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('userId') || '';
    const action = searchParams.get('action') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeStatistics = searchParams.get('includeStatistics') === 'true';
    const timeRange = searchParams.get('timeRange') || '24h';

    // Get all audit logs
    let logs = Array.from(auditLogs.values());

    // Apply filters
    if (category) {
      logs = logs.filter(log => log.category === category);
    }

    if (severity) {
      logs = logs.filter(log => log.severity === severity);
    }

    if (status) {
      logs = logs.filter(log => log.status === status);
    }

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    if (action) {
      logs = logs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
    }

    if (startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(endDate));
    }

    // Sort by timestamp (most recent first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate pagination
    const totalLogs = logs.length;
    const totalPages = Math.ceil(totalLogs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    // Prepare response data
    let responseData: any = {
      logs: paginatedLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };

    // Include statistics if requested
    if (includeStatistics) {
      responseData.statistics = calculateAuditStatistics(logs, timeRange);
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Audit logs retrieved successfully'
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Export audit logs
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

    if (!canViewAuditLogs(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to export audit logs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      format = 'csv',
      filters = {},
      includeDetails = true,
      dateRange
    } = body;

    // Validate format
    const validFormats = ['csv', 'json', 'pdf'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, message: 'Invalid export format' },
        { status: 400 }
      );
    }

    // Apply filters and get logs
    let logs = Array.from(auditLogs.values());

    if (dateRange) {
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(dateRange.start) && logDate <= new Date(dateRange.end);
      });
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        logs = logs.filter(log => (log as any)[key] === value);
      }
    });

    // Sort by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Create export job (mock)
    const exportId = `EXPORT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fileName = `audit_logs_${format}_${new Date().toISOString().split('T')[0]}.${format}`;

    return NextResponse.json({
      success: true,
      data: {
        exportId,
        fileName,
        format,
        totalRecords: logs.length,
        status: 'processing',
        downloadUrl: `/api/admin/audit-logs/download/${exportId}`,
        estimatedTime: '2-5 minutes'
      },
      message: 'Audit logs export started successfully'
    });

  } catch (error) {
    console.error('Export audit logs error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
