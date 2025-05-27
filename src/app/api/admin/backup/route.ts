import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Backup storage
const backupJobs: Map<string, {
  id: string;
  type: 'full' | 'incremental' | 'differential' | 'database' | 'files' | 'configuration';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  schedule?: {
    frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    enabled: boolean;
  };
  configuration: {
    includeUserData: boolean;
    includeSystemData: boolean;
    includeFiles: boolean;
    includeDatabase: boolean;
    includeLogs: boolean;
    compression: 'none' | 'gzip' | 'bzip2' | 'lzma';
    encryption: boolean;
    retentionDays: number;
    excludePatterns?: string[];
  };
  progress: {
    percentage: number;
    currentStep: string;
    processedItems: number;
    totalItems: number;
    bytesProcessed: number;
    totalBytes: number;
    estimatedTimeRemaining?: number;
  };
  result?: {
    backupId: string;
    fileName: string;
    fileSize: number;
    checksum: string;
    location: string;
    downloadUrl?: string;
    expiresAt?: string;
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    errorMessage?: string;
    warnings: string[];
  };
}> = new Map();

// Backup history storage
const backupHistory: Map<string, {
  id: string;
  jobId: string;
  backupType: string;
  status: 'success' | 'failed' | 'partial';
  createdAt: string;
  fileSize: number;
  duration: number;
  location: string;
  checksum: string;
  metadata: Record<string, any>;
}> = new Map();

// Helper function to check backup access
const canManageBackups = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// Simulate backup process
const processBackup = async (jobId: string): Promise<void> => {
  const job = backupJobs.get(jobId);
  if (!job) return;

  try {
    // Update status to running
    job.status = 'running';
    job.metadata.startedAt = new Date().toISOString();
    job.progress.currentStep = 'Initializing backup';
    job.progress.percentage = 0;
    backupJobs.set(jobId, job);

    // Simulate backup steps
    const steps = [
      { step: 'Preparing backup environment', percentage: 10, duration: 2000 },
      { step: 'Backing up database', percentage: 30, duration: 5000 },
      { step: 'Backing up user files', percentage: 60, duration: 8000 },
      { step: 'Backing up system configuration', percentage: 80, duration: 3000 },
      { step: 'Compressing and encrypting', percentage: 95, duration: 4000 },
      { step: 'Finalizing backup', percentage: 100, duration: 1000 }
    ];

    for (const stepInfo of steps) {
      job.progress.currentStep = stepInfo.step;
      job.progress.percentage = stepInfo.percentage;
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, stepInfo.duration));
      
      // Update progress
      job.progress.processedItems = Math.floor((stepInfo.percentage / 100) * job.progress.totalItems);
      job.progress.bytesProcessed = Math.floor((stepInfo.percentage / 100) * job.progress.totalBytes);
      
      backupJobs.set(jobId, job);
    }

    // Complete the backup
    const backupId = `BACKUP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fileName = `gce_backup_${job.type}_${new Date().toISOString().split('T')[0]}.tar.gz`;
    const fileSize = Math.floor(Math.random() * 1000000000) + 100000000; // 100MB - 1GB
    const checksum = Math.random().toString(36).substring(2, 18);
    const location = `/backups/${fileName}`;

    job.status = 'completed';
    job.progress.percentage = 100;
    job.progress.currentStep = 'Completed';
    job.metadata.completedAt = new Date().toISOString();
    job.metadata.duration = Date.now() - new Date(job.metadata.startedAt!).getTime();
    job.result = {
      backupId,
      fileName,
      fileSize,
      checksum,
      location,
      downloadUrl: `https://gce.cm/api/admin/backup/download/${backupId}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    backupJobs.set(jobId, job);

    // Add to backup history
    backupHistory.set(backupId, {
      id: backupId,
      jobId,
      backupType: job.type,
      status: 'success',
      createdAt: job.metadata.completedAt!,
      fileSize,
      duration: job.metadata.duration!,
      location,
      checksum,
      metadata: {
        configuration: job.configuration,
        warnings: job.metadata.warnings
      }
    });

  } catch (error) {
    // Handle backup failure
    job.status = 'failed';
    job.metadata.completedAt = new Date().toISOString();
    job.metadata.errorMessage = error instanceof Error ? error.message : 'Unknown backup error';
    backupJobs.set(jobId, job);
  }
};

// Calculate backup statistics
const calculateBackupStatistics = (): any => {
  const allJobs = Array.from(backupJobs.values());
  const allHistory = Array.from(backupHistory.values());

  const last30Days = allHistory.filter(h => 
    new Date(h.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  return {
    totalBackups: allHistory.length,
    successfulBackups: allHistory.filter(h => h.status === 'success').length,
    failedBackups: allHistory.filter(h => h.status === 'failed').length,
    totalSize: allHistory.reduce((sum, h) => sum + h.fileSize, 0),
    averageSize: allHistory.length > 0 ? 
      Math.round(allHistory.reduce((sum, h) => sum + h.fileSize, 0) / allHistory.length) : 0,
    averageDuration: allHistory.length > 0 ? 
      Math.round(allHistory.reduce((sum, h) => sum + h.duration, 0) / allHistory.length) : 0,
    last30Days: {
      count: last30Days.length,
      successRate: last30Days.length > 0 ? 
        Math.round((last30Days.filter(h => h.status === 'success').length / last30Days.length) * 100) : 0,
      totalSize: last30Days.reduce((sum, h) => sum + h.fileSize, 0)
    },
    activeJobs: allJobs.filter(j => j.status === 'running' || j.status === 'pending').length,
    scheduledJobs: allJobs.filter(j => j.schedule?.enabled).length
  };
};

// POST - Create backup job
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

    if (!canManageBackups(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to manage backups' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      type = 'full',
      priority = 'normal',
      schedule,
      configuration = {},
      executeImmediately = true
    } = body;

    // Validate backup type
    const validTypes = ['full', 'incremental', 'differential', 'database', 'files', 'configuration'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid backup type' },
        { status: 400 }
      );
    }

    // Create backup job
    const jobId = `JOB-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const defaultConfiguration = {
      includeUserData: true,
      includeSystemData: true,
      includeFiles: true,
      includeDatabase: true,
      includeLogs: false,
      compression: 'gzip',
      encryption: true,
      retentionDays: 30,
      excludePatterns: []
    };

    const backupJob = {
      id: jobId,
      type: type as 'full' | 'incremental' | 'differential' | 'database' | 'files' | 'configuration',
      status: executeImmediately ? 'pending' : 'pending' as const,
      priority: priority as 'low' | 'normal' | 'high' | 'critical',
      schedule,
      configuration: { ...defaultConfiguration, ...configuration },
      progress: {
        percentage: 0,
        currentStep: 'Queued',
        processedItems: 0,
        totalItems: 1000, // Estimated
        bytesProcessed: 0,
        totalBytes: 500000000 // Estimated 500MB
      },
      metadata: {
        createdBy: userId,
        createdAt: new Date().toISOString(),
        warnings: []
      }
    };

    // Store backup job
    backupJobs.set(jobId, backupJob);

    // Start backup process if immediate execution requested
    if (executeImmediately) {
      processBackup(jobId);
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: backupJob.status,
        type: backupJob.type,
        priority: backupJob.priority,
        estimatedDuration: '5-15 minutes',
        monitorUrl: `/api/admin/backup/status/${jobId}`,
        scheduled: !executeImmediately
      },
      message: executeImmediately ? 'Backup job started successfully' : 'Backup job scheduled successfully'
    });

  } catch (error) {
    console.error('Create backup job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get backup jobs and history
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

    if (!canManageBackups(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view backups' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeStatistics = searchParams.get('includeStatistics') === 'true';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get backup jobs
    let jobs = Array.from(backupJobs.values());

    // Apply filters
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }

    // Sort by creation date (most recent first)
    jobs.sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime());

    // Limit results
    jobs = jobs.slice(0, limit);

    // Prepare response data
    let responseData: any = {
      jobs: jobs.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        priority: job.priority,
        progress: job.progress,
        createdAt: job.metadata.createdAt,
        startedAt: job.metadata.startedAt,
        completedAt: job.metadata.completedAt,
        duration: job.metadata.duration,
        result: job.result,
        errorMessage: job.metadata.errorMessage,
        warnings: job.metadata.warnings
      }))
    };

    // Include backup history if requested
    if (includeHistory) {
      let history = Array.from(backupHistory.values());
      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      history = history.slice(0, limit);

      responseData.history = history;
    }

    // Include statistics if requested
    if (includeStatistics) {
      responseData.statistics = calculateBackupStatistics();
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Backup information retrieved successfully'
    });

  } catch (error) {
    console.error('Get backup jobs error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel backup job
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!canManageBackups(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to cancel backups' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = backupJobs.get(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Backup job not found' },
        { status: 404 }
      );
    }

    // Check if job can be cancelled
    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel completed or failed backup job' },
        { status: 400 }
      );
    }

    // Cancel the job
    job.status = 'cancelled';
    job.metadata.completedAt = new Date().toISOString();
    job.progress.currentStep = 'Cancelled';
    backupJobs.set(jobId, job);

    return NextResponse.json({
      success: true,
      data: { jobId, status: 'cancelled' },
      message: 'Backup job cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel backup job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
