import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const customReports: Map<string, any> = new Map();
const reportExecutions: Map<string, any> = new Map();

// Export jobs storage
const exportJobs: Map<string, {
  id: string;
  reportId: string;
  executionId?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  options: {
    includeCharts: boolean;
    includeMetadata: boolean;
    pageOrientation?: 'portrait' | 'landscape';
    pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
    compression?: boolean;
    password?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    percentage: number;
    currentStep: string;
    estimatedTimeRemaining?: number;
  };
  output?: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    expiresAt: string;
    checksum: string;
  };
  metadata: {
    requestedBy: string;
    requestedAt: string;
    completedAt?: string;
    processingTime?: number;
    errorMessage?: string;
  };
}> = new Map();

// Helper function to check export access
const canExportReport = (token: string, reportId: string): { canExport: boolean; userId: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canExport: false, userId: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canExport: false, userId: null };
  
  // Check if user can access the report
  const report = customReports.get(reportId);
  if (!report) return { canExport: false, userId };
  
  // Check permissions
  if (report.permissions.isPublic) return { canExport: true, userId };
  if (report.permissions.allowedRoles.includes(user.userType)) return { canExport: true, userId };
  if (report.permissions.allowedUsers.includes(userId)) return { canExport: true, userId };
  if (report.metadata.createdBy === userId) return { canExport: true, userId };
  
  return { canExport: false, userId };
};

// Generate export content based on format
const generateExportContent = (data: any[], format: string, options: any, reportMetadata: any): any => {
  switch (format) {
    case 'csv':
      return generateCSVContent(data, options, reportMetadata);
    case 'json':
      return generateJSONContent(data, options, reportMetadata);
    case 'html':
      return generateHTMLContent(data, options, reportMetadata);
    case 'excel':
      return generateExcelContent(data, options, reportMetadata);
    case 'pdf':
      return generatePDFContent(data, options, reportMetadata);
    default:
      throw new Error('Unsupported export format');
  }
};

// Generate CSV content
const generateCSVContent = (data: any[], options: any, reportMetadata: any): string => {
  if (data.length === 0) return '';

  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });

  // Add metadata if requested
  if (options.includeMetadata) {
    csvContent = `# Report: ${reportMetadata.title}\n# Generated: ${new Date().toISOString()}\n# Total Records: ${data.length}\n\n` + csvContent;
  }

  return csvContent;
};

// Generate JSON content
const generateJSONContent = (data: any[], options: any, reportMetadata: any): string => {
  const exportData: any = {
    data,
    summary: {
      totalRecords: data.length,
      exportedAt: new Date().toISOString()
    }
  };

  if (options.includeMetadata) {
    exportData.metadata = {
      reportTitle: reportMetadata.title,
      reportDescription: reportMetadata.description,
      reportType: reportMetadata.reportType,
      dataSource: reportMetadata.dataSource,
      generatedBy: reportMetadata.createdBy
    };
  }

  return JSON.stringify(exportData, null, 2);
};

// Generate HTML content
const generateHTMLContent = (data: any[], options: any, reportMetadata: any): string => {
  if (data.length === 0) return '<html><body><p>No data available</p></body></html>';

  const headers = Object.keys(data[0]);
  
  let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${reportMetadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .description { color: #666; margin-bottom: 20px; }
        .metadata { background: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 20px; padding: 10px; background: #e8f4f8; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${reportMetadata.title}</div>
        <div class="description">${reportMetadata.description || ''}</div>
    </div>
`;

  if (options.includeMetadata) {
    html += `
    <div class="metadata">
        <strong>Report Information:</strong><br>
        Type: ${reportMetadata.reportType}<br>
        Data Source: ${reportMetadata.dataSource}<br>
        Generated: ${new Date().toLocaleString()}<br>
        Total Records: ${data.length}
    </div>
`;
  }

  html += `
    <table>
        <thead>
            <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="summary">
        <strong>Summary:</strong> ${data.length} records exported on ${new Date().toLocaleString()}
    </div>
</body>
</html>`;

  return html;
};

// Generate Excel content (simplified - in production would use proper Excel library)
const generateExcelContent = (data: any[], options: any, reportMetadata: any): string => {
  // For demo purposes, return CSV format with Excel-specific headers
  // In production, would use libraries like ExcelJS or xlsx
  return generateCSVContent(data, options, reportMetadata);
};

// Generate PDF content (simplified - in production would use proper PDF library)
const generatePDFContent = (data: any[], options: any, reportMetadata: any): string => {
  // For demo purposes, return HTML that could be converted to PDF
  // In production, would use libraries like Puppeteer, jsPDF, or PDFKit
  return generateHTMLContent(data, options, reportMetadata);
};

// Process export job
const processExportJob = async (jobId: string): Promise<void> => {
  const job = exportJobs.get(jobId);
  if (!job) return;

  try {
    // Update status to processing
    job.status = 'processing';
    job.progress.percentage = 10;
    job.progress.currentStep = 'Preparing data';
    exportJobs.set(jobId, job);

    // Get report data
    let reportData: any[] = [];
    let reportMetadata: any = {};

    if (job.executionId) {
      // Export from existing execution
      const execution = reportExecutions.get(job.executionId);
      if (execution && execution.results) {
        reportData = execution.results.data;
        const report = customReports.get(job.reportId);
        reportMetadata = report || {};
      }
    } else {
      // Execute report and export
      const report = customReports.get(job.reportId);
      if (report) {
        reportMetadata = report;
        // Would execute report here - for demo, use empty data
        reportData = [];
      }
    }

    // Update progress
    job.progress.percentage = 50;
    job.progress.currentStep = 'Generating export file';
    exportJobs.set(jobId, job);

    // Generate export content
    const content = generateExportContent(reportData, job.format, job.options, reportMetadata);
    
    // Update progress
    job.progress.percentage = 80;
    job.progress.currentStep = 'Finalizing export';
    exportJobs.set(jobId, job);

    // Calculate file properties
    const fileName = `${reportMetadata.title || 'report'}_${Date.now()}.${job.format}`;
    const fileSize = Buffer.byteLength(content, 'utf8');
    const checksum = Buffer.from(content).toString('base64').slice(0, 16);
    const downloadUrl = `https://gce.cm/api/exports/download/${jobId}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Complete the job
    job.status = 'completed';
    job.progress.percentage = 100;
    job.progress.currentStep = 'Completed';
    job.output = {
      fileName,
      fileSize,
      downloadUrl,
      expiresAt,
      checksum
    };
    job.metadata.completedAt = new Date().toISOString();
    job.metadata.processingTime = Date.now() - new Date(job.metadata.requestedAt).getTime();

    exportJobs.set(jobId, job);

  } catch (error) {
    // Handle error
    job.status = 'failed';
    job.metadata.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    job.metadata.completedAt = new Date().toISOString();
    exportJobs.set(jobId, job);
  }
};

// GET - Export report
export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
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

    const { reportId } = params;
    const { canExport, userId } = canExportReport(token, reportId);

    if (!canExport) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'pdf') as 'pdf' | 'excel' | 'csv' | 'json' | 'html';
    const executionId = searchParams.get('executionId') || '';
    const includeCharts = searchParams.get('includeCharts') === 'true';
    const includeMetadata = searchParams.get('includeMetadata') !== 'false';
    const pageOrientation = (searchParams.get('pageOrientation') || 'portrait') as 'portrait' | 'landscape';
    const pageSize = (searchParams.get('pageSize') || 'A4') as 'A4' | 'A3' | 'Letter' | 'Legal';

    // Validate format
    const validFormats = ['pdf', 'excel', 'csv', 'json', 'html'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, message: 'Invalid export format' },
        { status: 400 }
      );
    }

    // Check if report exists
    const report = customReports.get(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if execution exists (if specified)
    if (executionId) {
      const execution = reportExecutions.get(executionId);
      if (!execution || execution.reportId !== reportId) {
        return NextResponse.json(
          { success: false, message: 'Execution not found or does not belong to this report' },
          { status: 404 }
        );
      }
    }

    // Create export job
    const jobId = `EXPORT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const exportJob = {
      id: jobId,
      reportId,
      executionId: executionId || undefined,
      format,
      options: {
        includeCharts,
        includeMetadata,
        pageOrientation,
        pageSize,
        compression: false
      },
      status: 'pending' as const,
      progress: {
        percentage: 0,
        currentStep: 'Initializing'
      },
      metadata: {
        requestedBy: userId!,
        requestedAt: new Date().toISOString()
      }
    };

    // Store export job
    exportJobs.set(jobId, exportJob);

    // Start processing asynchronously
    processExportJob(jobId);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: exportJob.status,
        format,
        estimatedTime: '1-3 minutes',
        pollUrl: `/api/reports/export/status/${jobId}`,
        downloadUrl: `/api/reports/export/download/${jobId}`
      },
      message: 'Export job started successfully'
    });

  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Batch export multiple reports
export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
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

    const { reportId } = params;
    const { canExport, userId } = canExportReport(token, reportId);

    if (!canExport) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      formats = ['pdf'],
      executionIds = [],
      options = {},
      scheduleExport = false,
      scheduleTime
    } = body;

    // Validate formats
    const validFormats = ['pdf', 'excel', 'csv', 'json', 'html'];
    const invalidFormats = formats.filter((f: string) => !validFormats.includes(f));
    if (invalidFormats.length > 0) {
      return NextResponse.json(
        { success: false, message: `Invalid formats: ${invalidFormats.join(', ')}` },
        { status: 400 }
      );
    }

    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const exportJobs = [];

    // Create export jobs for each format
    for (const format of formats) {
      for (const executionId of executionIds.length > 0 ? executionIds : ['']) {
        const jobId = `EXPORT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const exportJob = {
          id: jobId,
          reportId,
          executionId: executionId || undefined,
          format,
          options: {
            includeCharts: options.includeCharts !== false,
            includeMetadata: options.includeMetadata !== false,
            pageOrientation: options.pageOrientation || 'portrait',
            pageSize: options.pageSize || 'A4',
            compression: options.compression || false
          },
          status: scheduleExport ? 'pending' : 'pending' as const,
          progress: {
            percentage: 0,
            currentStep: scheduleExport ? 'Scheduled' : 'Initializing'
          },
          metadata: {
            requestedBy: userId!,
            requestedAt: new Date().toISOString()
          }
        };

        exportJobs.push(exportJob);
        
        // Store export job
        exportJobs.set(jobId, exportJob);

        // Start processing if not scheduled
        if (!scheduleExport) {
          processExportJob(jobId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        totalJobs: exportJobs.length,
        jobs: exportJobs.map(job => ({
          jobId: job.id,
          format: job.format,
          status: job.status
        })),
        scheduled: scheduleExport,
        scheduleTime: scheduleTime || null
      },
      message: scheduleExport ? 
        `${exportJobs.length} export jobs scheduled successfully` :
        `${exportJobs.length} export jobs started successfully`
    });

  } catch (error) {
    console.error('Batch export error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
