import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const markingScores: Map<string, any> = new Map();
const certificates: Map<string, any> = new Map();

// Custom reports storage
const customReports: Map<string, {
  id: string;
  title: string;
  description: string;
  reportType: 'performance' | 'statistical' | 'comparative' | 'administrative' | 'custom';
  dataSource: 'results' | 'markings' | 'certificates' | 'analytics' | 'combined';
  filters: {
    examSession?: string;
    examLevel?: string;
    schoolIds?: string[];
    regionIds?: string[];
    subjectCodes?: string[];
    dateRange?: { start: string; end: string };
    performanceRange?: { min: number; max: number };
    customFilters?: Record<string, any>;
  };
  columns: Array<{
    field: string;
    label: string;
    type: 'text' | 'number' | 'percentage' | 'date' | 'grade' | 'status';
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
    format?: string;
    visible: boolean;
  }>;
  groupBy?: string[];
  sortBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  calculations: Array<{
    id: string;
    name: string;
    formula: string;
    type: 'calculated_field' | 'summary' | 'percentage' | 'ratio';
  }>;
  visualizations: Array<{
    type: 'table' | 'chart' | 'graph' | 'summary';
    chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';
    config: Record<string, any>;
  }>;
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time?: string;
    recipients?: string[];
    format?: 'pdf' | 'excel' | 'csv';
  };
  permissions: {
    isPublic: boolean;
    allowedRoles: string[];
    allowedUsers: string[];
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    lastRun?: string;
    runCount: number;
    tags: string[];
  };
  status: 'draft' | 'active' | 'archived';
}> = new Map();

// Report executions storage
const reportExecutions: Map<string, {
  id: string;
  reportId: string;
  executedBy: string;
  executedAt: string;
  parameters: Record<string, any>;
  status: 'running' | 'completed' | 'failed';
  results?: {
    data: any[];
    summary: Record<string, any>;
    totalRecords: number;
    executionTime: number;
  };
  output?: {
    format: string;
    fileName: string;
    downloadUrl: string;
    expiresAt: string;
  };
  error?: string;
}> = new Map();

// Helper function to check reports access
const canManageReports = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Execute report query
const executeReportQuery = (report: any, parameters: Record<string, any> = {}): any => {
  let data: any[] = [];
  
  // Get base data based on data source
  switch (report.dataSource) {
    case 'results':
      data = Array.from(examResults.values()).filter(r => r.publication.isPublished);
      break;
    case 'markings':
      data = Array.from(markingScores.values());
      break;
    case 'certificates':
      data = Array.from(certificates.values());
      break;
    case 'combined':
      // Combine multiple data sources
      const results = Array.from(examResults.values()).filter(r => r.publication.isPublished);
      const markings = Array.from(markingScores.values());
      data = results.map(result => ({
        ...result,
        markingData: markings.filter(m => m.candidateId === result.studentId)
      }));
      break;
    default:
      data = [];
  }

  // Apply filters
  data = applyFilters(data, report.filters, parameters);

  // Apply transformations and calculations
  data = applyCalculations(data, report.calculations);

  // Apply grouping
  if (report.groupBy && report.groupBy.length > 0) {
    data = applyGrouping(data, report.groupBy);
  }

  // Apply sorting
  if (report.sortBy && report.sortBy.length > 0) {
    data = applySorting(data, report.sortBy);
  }

  // Select and format columns
  data = selectColumns(data, report.columns);

  return data;
};

// Apply filters to data
const applyFilters = (data: any[], filters: any, parameters: any): any[] => {
  let filteredData = [...data];

  // Apply exam session filter
  if (filters.examSession || parameters.examSession) {
    const session = filters.examSession || parameters.examSession;
    filteredData = filteredData.filter(item => item.examSession === session);
  }

  // Apply exam level filter
  if (filters.examLevel || parameters.examLevel) {
    const level = filters.examLevel || parameters.examLevel;
    filteredData = filteredData.filter(item => item.examLevel === level);
  }

  // Apply school filter
  if (filters.schoolIds && filters.schoolIds.length > 0) {
    filteredData = filteredData.filter(item => filters.schoolIds.includes(item.schoolId));
  }

  // Apply subject filter
  if (filters.subjectCodes && filters.subjectCodes.length > 0) {
    filteredData = filteredData.filter(item => {
      if (item.subjects) {
        return item.subjects.some((s: any) => filters.subjectCodes.includes(s.subjectCode));
      }
      return filters.subjectCodes.includes(item.subjectCode);
    });
  }

  // Apply date range filter
  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.audit?.generatedAt || item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // Apply performance range filter
  if (filters.performanceRange) {
    filteredData = filteredData.filter(item => {
      const performance = item.overallPerformance?.averagePercentage || item.percentage || 0;
      return performance >= filters.performanceRange.min && performance <= filters.performanceRange.max;
    });
  }

  return filteredData;
};

// Apply calculations
const applyCalculations = (data: any[], calculations: any[]): any[] => {
  return data.map(item => {
    const calculatedItem = { ...item };
    
    calculations.forEach(calc => {
      try {
        // Simple formula evaluation (in production, use a proper expression parser)
        let result = 0;
        
        switch (calc.type) {
          case 'calculated_field':
            // Example: "totalMarks / maxMarks * 100"
            if (calc.formula.includes('totalMarks') && calc.formula.includes('maxMarks')) {
              result = (item.totalMarks / item.maxMarks) * 100;
            }
            break;
          case 'percentage':
            // Example: "passedSubjects / totalSubjects * 100"
            if (item.overallPerformance) {
              result = (item.overallPerformance.subjectsPassed / item.overallPerformance.totalSubjects) * 100;
            }
            break;
          case 'ratio':
            // Custom ratio calculations
            result = 1; // Placeholder
            break;
        }
        
        calculatedItem[calc.id] = Math.round(result * 100) / 100;
      } catch (error) {
        calculatedItem[calc.id] = 0;
      }
    });
    
    return calculatedItem;
  });
};

// Apply grouping
const applyGrouping = (data: any[], groupBy: string[]): any[] => {
  const grouped = new Map<string, any[]>();
  
  data.forEach(item => {
    const key = groupBy.map(field => item[field] || 'Unknown').join('|');
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  
  // Convert grouped data to summary format
  return Array.from(grouped.entries()).map(([key, items]) => {
    const keyParts = key.split('|');
    const summary: any = {};
    
    groupBy.forEach((field, index) => {
      summary[field] = keyParts[index];
    });
    
    // Calculate aggregations
    summary.count = items.length;
    summary.averagePerformance = items.length > 0 ? 
      Math.round(items.reduce((sum, item) => sum + (item.overallPerformance?.averagePercentage || 0), 0) / items.length) : 0;
    summary.passRate = items.length > 0 ? 
      Math.round((items.filter(item => item.overallPerformance?.subjectsPassed > 0).length / items.length) * 100) : 0;
    
    return summary;
  });
};

// Apply sorting
const applySorting = (data: any[], sortBy: any[]): any[] => {
  return data.sort((a, b) => {
    for (const sort of sortBy) {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Select and format columns
const selectColumns = (data: any[], columns: any[]): any[] => {
  const visibleColumns = columns.filter(col => col.visible);
  
  return data.map(item => {
    const formattedItem: any = {};
    
    visibleColumns.forEach(col => {
      let value = item[col.field];
      
      // Apply formatting based on type
      switch (col.type) {
        case 'percentage':
          value = typeof value === 'number' ? `${value}%` : value;
          break;
        case 'date':
          value = value ? new Date(value).toLocaleDateString() : '';
          break;
        case 'number':
          value = typeof value === 'number' ? value.toFixed(2) : value;
          break;
      }
      
      formattedItem[col.field] = value;
    });
    
    return formattedItem;
  });
};

// Generate report summary
const generateReportSummary = (data: any[], report: any): Record<string, any> => {
  const summary: any = {
    totalRecords: data.length,
    generatedAt: new Date().toISOString()
  };

  // Calculate basic statistics if data contains performance metrics
  if (data.length > 0 && data[0].overallPerformance) {
    const performances = data.map(item => item.overallPerformance.averagePercentage).filter(p => p !== undefined);
    
    if (performances.length > 0) {
      summary.averagePerformance = Math.round(performances.reduce((sum, p) => sum + p, 0) / performances.length);
      summary.minPerformance = Math.min(...performances);
      summary.maxPerformance = Math.max(...performances);
      summary.passRate = Math.round((data.filter(item => item.overallPerformance.subjectsPassed > 0).length / data.length) * 100);
    }
  }

  return summary;
};

// POST - Create and execute custom report
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

    if (!canManageReports(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to create reports' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      title,
      description,
      reportType,
      dataSource,
      filters,
      columns,
      groupBy,
      sortBy,
      calculations,
      visualizations,
      schedule,
      permissions,
      executeImmediately = true,
      saveReport = true,
      parameters = {}
    } = body;

    // Validate required fields
    if (!title || !dataSource || !columns || columns.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required report configuration' },
        { status: 400 }
      );
    }

    let reportId: string;
    
    if (saveReport) {
      // Create report definition
      reportId = `REPORT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      const report = {
        id: reportId,
        title,
        description: description || '',
        reportType: reportType || 'custom',
        dataSource,
        filters: filters || {},
        columns,
        groupBy: groupBy || [],
        sortBy: sortBy || [],
        calculations: calculations || [],
        visualizations: visualizations || [],
        schedule,
        permissions: permissions || {
          isPublic: false,
          allowedRoles: ['admin'],
          allowedUsers: [userId]
        },
        metadata: {
          createdBy: userId,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          runCount: 0,
          tags: []
        },
        status: 'active' as const
      };

      customReports.set(reportId, report);
    } else {
      reportId = `TEMP-${Date.now()}`;
    }

    let executionResult = null;

    if (executeImmediately) {
      // Execute the report
      const executionId = `EXEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const startTime = Date.now();

      try {
        const reportConfig = saveReport ? customReports.get(reportId)! : {
          dataSource,
          filters: filters || {},
          columns,
          groupBy: groupBy || [],
          sortBy: sortBy || [],
          calculations: calculations || []
        };

        const data = executeReportQuery(reportConfig, parameters);
        const summary = generateReportSummary(data, reportConfig);
        const executionTime = Date.now() - startTime;

        executionResult = {
          id: executionId,
          reportId,
          executedBy: userId,
          executedAt: new Date().toISOString(),
          parameters,
          status: 'completed' as const,
          results: {
            data,
            summary,
            totalRecords: data.length,
            executionTime
          }
        };

        reportExecutions.set(executionId, executionResult);

        // Update report run count
        if (saveReport) {
          const report = customReports.get(reportId)!;
          report.metadata.runCount++;
          report.metadata.lastRun = new Date().toISOString();
          customReports.set(reportId, report);
        }

      } catch (error) {
        executionResult = {
          id: executionId,
          reportId,
          executedBy: userId,
          executedAt: new Date().toISOString(),
          parameters,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        reportExecutions.set(executionId, executionResult);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reportId: saveReport ? reportId : undefined,
        execution: executionResult,
        saved: saveReport,
        executed: executeImmediately
      },
      message: saveReport ? 
        (executeImmediately ? 'Report created and executed successfully' : 'Report created successfully') :
        'Report executed successfully'
    });

  } catch (error) {
    console.error('Create custom report error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get custom reports
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

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('reportType') || '';
    const status = searchParams.get('status') || '';
    const includeExecutions = searchParams.get('includeExecutions') === 'true';

    // Get all reports accessible to user
    let reports = Array.from(customReports.values()).filter(report => {
      // Check permissions
      if (report.permissions.isPublic) return true;
      if (report.permissions.allowedRoles.includes(user.userType)) return true;
      if (report.permissions.allowedUsers.includes(userId)) return true;
      if (report.metadata.createdBy === userId) return true;
      return false;
    });

    // Apply filters
    if (reportType) {
      reports = reports.filter(report => report.reportType === reportType);
    }

    if (status) {
      reports = reports.filter(report => report.status === status);
    }

    // Sort by last modified
    reports.sort((a, b) => new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime());

    // Include recent executions if requested
    if (includeExecutions) {
      reports = reports.map(report => ({
        ...report,
        recentExecutions: Array.from(reportExecutions.values())
          .filter(exec => exec.reportId === report.id)
          .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
          .slice(0, 5)
      }));
    }

    // Calculate summary statistics
    const summary = {
      totalReports: reports.length,
      byType: {
        performance: reports.filter(r => r.reportType === 'performance').length,
        statistical: reports.filter(r => r.reportType === 'statistical').length,
        comparative: reports.filter(r => r.reportType === 'comparative').length,
        administrative: reports.filter(r => r.reportType === 'administrative').length,
        custom: reports.filter(r => r.reportType === 'custom').length
      },
      byStatus: {
        active: reports.filter(r => r.status === 'active').length,
        draft: reports.filter(r => r.status === 'draft').length,
        archived: reports.filter(r => r.status === 'archived').length
      },
      totalExecutions: Array.from(reportExecutions.values()).length,
      recentActivity: Array.from(reportExecutions.values())
        .filter(exec => new Date(exec.executedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length
    };

    return NextResponse.json({
      success: true,
      data: {
        reports,
        summary
      },
      message: 'Custom reports retrieved successfully'
    });

  } catch (error) {
    console.error('Get custom reports error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
