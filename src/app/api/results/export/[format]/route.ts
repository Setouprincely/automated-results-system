import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const certificates: Map<string, any> = new Map();

// Export jobs storage
const exportJobs: Map<string, {
  id: string;
  format: 'csv' | 'excel' | 'pdf' | 'json' | 'xml';
  exportType: 'results' | 'certificates' | 'statistics' | 'analytics';
  filters: {
    examSession?: string;
    examLevel?: string;
    schoolId?: string;
    region?: string;
    dateRange?: { start: string; end: string };
    studentIds?: string[];
    subjectCodes?: string[];
  };
  options: {
    includePersonalData: boolean;
    includeGrades: boolean;
    includeStatistics: boolean;
    includeCharts: boolean;
    template?: string;
    compression?: 'none' | 'zip' | 'gzip';
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    totalRecords: number;
    processedRecords: number;
    percentage: number;
    currentStep: string;
  };
  output: {
    fileName?: string;
    fileSize?: number;
    downloadUrl?: string;
    expiresAt?: string;
    checksum?: string;
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
const canExportData = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Generate CSV content
const generateCSV = (data: any[], type: string): string => {
  if (data.length === 0) return '';

  let headers: string[] = [];
  let rows: string[][] = [];

  if (type === 'results') {
    headers = [
      'Student ID', 'Student Name', 'Student Number', 'School Name', 
      'Exam Session', 'Exam Level', 'Subject Code', 'Subject Name', 
      'Grade', 'Percentage', 'Status', 'Overall Classification'
    ];

    data.forEach(result => {
      result.subjects.forEach((subject: any) => {
        rows.push([
          result.studentId,
          result.studentName,
          result.studentNumber,
          result.schoolName,
          result.examSession,
          result.examLevel,
          subject.subjectCode,
          subject.subjectName,
          subject.grade,
          subject.percentage.toString(),
          subject.status,
          result.overallPerformance.classification
        ]);
      });
    });
  } else if (type === 'certificates') {
    headers = [
      'Certificate ID', 'Certificate Number', 'Student Name', 'Student Number',
      'Exam Session', 'Exam Level', 'Certificate Type', 'Status', 'Issued Date'
    ];

    data.forEach(cert => {
      rows.push([
        cert.id,
        cert.certificateNumber,
        cert.studentName,
        cert.studentNumber,
        cert.examSession,
        cert.examLevel,
        cert.certificateType,
        cert.status,
        cert.issuanceDetails.issuedDate
      ]);
    });
  }

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Generate JSON content
const generateJSON = (data: any[], type: string, options: any): string => {
  let exportData: any = {};

  if (type === 'results') {
    exportData = {
      metadata: {
        exportType: 'results',
        exportDate: new Date().toISOString(),
        totalRecords: data.length,
        includePersonalData: options.includePersonalData
      },
      results: data.map(result => ({
        studentId: options.includePersonalData ? result.studentId : 'REDACTED',
        studentName: options.includePersonalData ? result.studentName : 'REDACTED',
        studentNumber: result.studentNumber,
        schoolName: result.schoolName,
        examSession: result.examSession,
        examLevel: result.examLevel,
        subjects: result.subjects,
        overallPerformance: result.overallPerformance
      }))
    };
  } else if (type === 'certificates') {
    exportData = {
      metadata: {
        exportType: 'certificates',
        exportDate: new Date().toISOString(),
        totalRecords: data.length
      },
      certificates: data
    };
  }

  return JSON.stringify(exportData, null, 2);
};

// Generate XML content
const generateXML = (data: any[], type: string): string => {
  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  
  if (type === 'results') {
    xmlContent += '<results>\n';
    data.forEach(result => {
      xmlContent += '  <result>\n';
      xmlContent += `    <studentId>${result.studentId}</studentId>\n`;
      xmlContent += `    <studentName><![CDATA[${result.studentName}]]></studentName>\n`;
      xmlContent += `    <studentNumber>${result.studentNumber}</studentNumber>\n`;
      xmlContent += `    <schoolName><![CDATA[${result.schoolName}]]></schoolName>\n`;
      xmlContent += `    <examSession>${result.examSession}</examSession>\n`;
      xmlContent += `    <examLevel>${result.examLevel}</examLevel>\n`;
      xmlContent += '    <subjects>\n';
      result.subjects.forEach((subject: any) => {
        xmlContent += '      <subject>\n';
        xmlContent += `        <code>${subject.subjectCode}</code>\n`;
        xmlContent += `        <name><![CDATA[${subject.subjectName}]]></name>\n`;
        xmlContent += `        <grade>${subject.grade}</grade>\n`;
        xmlContent += `        <percentage>${subject.percentage}</percentage>\n`;
        xmlContent += `        <status>${subject.status}</status>\n`;
        xmlContent += '      </subject>\n';
      });
      xmlContent += '    </subjects>\n';
      xmlContent += '  </result>\n';
    });
    xmlContent += '</results>';
  }

  return xmlContent;
};

// Process export job
const processExportJob = async (jobId: string): Promise<void> => {
  const job = exportJobs.get(jobId);
  if (!job) return;

  try {
    // Update status to processing
    job.status = 'processing';
    job.progress.currentStep = 'Fetching data';
    exportJobs.set(jobId, job);

    // Get data based on filters
    let data: any[] = [];
    
    if (job.exportType === 'results') {
      data = Array.from(examResults.values()).filter(result => {
        let matches = true;
        
        if (job.filters.examSession) {
          matches = matches && result.examSession === job.filters.examSession;
        }
        
        if (job.filters.examLevel) {
          matches = matches && result.examLevel === job.filters.examLevel;
        }
        
        if (job.filters.schoolId) {
          matches = matches && result.schoolId === job.filters.schoolId;
        }
        
        if (job.filters.studentIds) {
          matches = matches && job.filters.studentIds.includes(result.studentId);
        }
        
        return matches;
      });
    } else if (job.exportType === 'certificates') {
      data = Array.from(certificates.values()).filter(cert => {
        let matches = true;
        
        if (job.filters.examSession) {
          matches = matches && cert.examSession === job.filters.examSession;
        }
        
        if (job.filters.examLevel) {
          matches = matches && cert.examLevel === job.filters.examLevel;
        }
        
        return matches;
      });
    }

    // Update progress
    job.progress.totalRecords = data.length;
    job.progress.currentStep = 'Generating export file';
    job.progress.percentage = 25;
    exportJobs.set(jobId, job);

    // Generate content based on format
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (job.format) {
      case 'csv':
        content = generateCSV(data, job.exportType);
        fileName = `${job.exportType}_export_${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = generateJSON(data, job.exportType, job.options);
        fileName = `${job.exportType}_export_${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'xml':
        content = generateXML(data, job.exportType);
        fileName = `${job.exportType}_export_${Date.now()}.xml`;
        mimeType = 'application/xml';
        break;
      case 'excel':
        // In production, would generate actual Excel file
        content = generateCSV(data, job.exportType);
        fileName = `${job.exportType}_export_${Date.now()}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'pdf':
        // In production, would generate actual PDF
        content = `PDF Export of ${job.exportType} - ${data.length} records`;
        fileName = `${job.exportType}_export_${Date.now()}.pdf`;
        mimeType = 'application/pdf';
        break;
    }

    // Update progress
    job.progress.percentage = 75;
    job.progress.currentStep = 'Finalizing export';
    exportJobs.set(jobId, job);

    // In production, would save file to storage and generate download URL
    const downloadUrl = `https://gce.cm/api/exports/download/${jobId}`;
    const fileSize = Buffer.byteLength(content, 'utf8');
    const checksum = Buffer.from(content).toString('base64').slice(0, 16);

    // Complete the job
    job.status = 'completed';
    job.progress.processedRecords = data.length;
    job.progress.percentage = 100;
    job.progress.currentStep = 'Completed';
    job.output = {
      fileName,
      fileSize,
      downloadUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      checksum
    };
    job.metadata.completedAt = new Date().toISOString();
    job.metadata.processingTime = Date.now() - new Date(job.metadata.requestedAt).getTime();

    exportJobs.set(jobId, job);

  } catch (error) {
    // Handle error
    job.status = 'failed';
    job.metadata.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    exportJobs.set(jobId, job);
  }
};

// GET - Export data
export async function GET(
  request: NextRequest,
  { params }: { params: { format: string } }
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

    if (!canExportData(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to export data' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const { format } = params;
    const { searchParams } = new URL(request.url);
    
    // Validate format
    const validFormats = ['csv', 'excel', 'pdf', 'json', 'xml'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, message: 'Invalid export format' },
        { status: 400 }
      );
    }

    // Parse filters and options
    const filters = {
      examSession: searchParams.get('examSession') || undefined,
      examLevel: searchParams.get('examLevel') || undefined,
      schoolId: searchParams.get('schoolId') || undefined,
      region: searchParams.get('region') || undefined,
      studentIds: searchParams.get('studentIds')?.split(',') || undefined,
      subjectCodes: searchParams.get('subjectCodes')?.split(',') || undefined
    };

    const options = {
      includePersonalData: searchParams.get('includePersonalData') === 'true',
      includeGrades: searchParams.get('includeGrades') !== 'false',
      includeStatistics: searchParams.get('includeStatistics') === 'true',
      includeCharts: searchParams.get('includeCharts') === 'true',
      template: searchParams.get('template') || undefined,
      compression: (searchParams.get('compression') as 'none' | 'zip' | 'gzip') || 'none'
    };

    const exportType = searchParams.get('type') || 'results';

    // Create export job
    const jobId = `EXPORT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const exportJob = {
      id: jobId,
      format: format as 'csv' | 'excel' | 'pdf' | 'json' | 'xml',
      exportType: exportType as 'results' | 'certificates' | 'statistics' | 'analytics',
      filters,
      options,
      status: 'pending' as const,
      progress: {
        totalRecords: 0,
        processedRecords: 0,
        percentage: 0,
        currentStep: 'Initializing'
      },
      output: {},
      metadata: {
        requestedBy: userId,
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
        estimatedTime: '2-5 minutes',
        pollUrl: `/api/results/export/status/${jobId}`,
        message: 'Export job started successfully'
      },
      message: 'Export initiated successfully'
    });

  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
