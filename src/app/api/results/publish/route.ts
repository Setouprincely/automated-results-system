import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared results storage (in production, use database)
const examResults: Map<string, any> = new Map();

// Publication batches storage
const publicationBatches: Map<string, {
  id: string;
  examId: string;
  examSession: string;
  examLevel: 'O Level' | 'A Level';
  batchName: string;
  resultIds: string[];
  publicationType: 'full' | 'partial' | 'provisional' | 'final';
  accessLevel: 'private' | 'school' | 'public';
  releaseDate: string;
  publishedBy: string;
  publishedAt: string;
  statistics: {
    totalResults: number;
    studentsAffected: number;
    schoolsAffected: number;
    subjectsIncluded: string[];
  };
  notifications: {
    studentsNotified: boolean;
    schoolsNotified: boolean;
    publicNotified: boolean;
    notificationsSent: number;
  };
  verification: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationChecks: Array<{
      check: string;
      status: 'passed' | 'failed' | 'warning';
      details: string;
    }>;
  };
  status: 'draft' | 'scheduled' | 'published' | 'withdrawn';
}> = new Map();

// Helper function to check publication access
const canPublishResults = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Perform pre-publication verification checks
const performVerificationChecks = (resultIds: string[]): any[] => {
  const checks = [];
  const results = resultIds.map(id => examResults.get(id)).filter(Boolean);

  // Check 1: All results are generated and verified
  const unverifiedResults = results.filter(r => !r.verification.isVerified);
  checks.push({
    check: 'verification_status',
    status: unverifiedResults.length === 0 ? 'passed' : 'warning',
    details: unverifiedResults.length === 0 ? 
      'All results are verified' : 
      `${unverifiedResults.length} results are not verified`
  });

  // Check 2: Grade consistency
  const gradeInconsistencies = results.filter(r => 
    r.subjects.some((s: any) => !s.grade || s.grade === 'Unknown')
  );
  checks.push({
    check: 'grade_consistency',
    status: gradeInconsistencies.length === 0 ? 'passed' : 'failed',
    details: gradeInconsistencies.length === 0 ? 
      'All grades are properly assigned' : 
      `${gradeInconsistencies.length} results have grade inconsistencies`
  });

  // Check 3: Student information completeness
  const incompleteStudentInfo = results.filter(r => 
    !r.studentName || !r.studentNumber || !r.schoolName
  );
  checks.push({
    check: 'student_information',
    status: incompleteStudentInfo.length === 0 ? 'passed' : 'failed',
    details: incompleteStudentInfo.length === 0 ? 
      'All student information is complete' : 
      `${incompleteStudentInfo.length} results have incomplete student information`
  });

  // Check 4: Subject completeness
  const incompleteSubjects = results.filter(r => r.subjects.length === 0);
  checks.push({
    check: 'subject_completeness',
    status: incompleteSubjects.length === 0 ? 'passed' : 'failed',
    details: incompleteSubjects.length === 0 ? 
      'All results have subjects' : 
      `${incompleteSubjects.length} results have no subjects`
  });

  return checks;
};

// Calculate publication statistics
const calculatePublicationStatistics = (resultIds: string[]): any => {
  const results = resultIds.map(id => examResults.get(id)).filter(Boolean);
  
  const studentsAffected = results.length;
  const schoolsAffected = new Set(results.map(r => r.schoolId)).size;
  const subjectsIncluded = Array.from(new Set(
    results.flatMap(r => r.subjects.map((s: any) => s.subjectCode))
  ));

  return {
    totalResults: results.length,
    studentsAffected,
    schoolsAffected,
    subjectsIncluded
  };
};

// Send notifications (mock implementation)
const sendPublicationNotifications = async (batchId: string, results: any[]): Promise<any> => {
  // In production, this would send actual notifications
  const notifications = {
    studentsNotified: true,
    schoolsNotified: true,
    publicNotified: true,
    notificationsSent: results.length + new Set(results.map(r => r.schoolId)).size
  };

  console.log(`Notifications sent for publication batch ${batchId}`);
  return notifications;
};

// PUT - Publish results
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!canPublishResults(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to publish results' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      examId,
      examSession,
      examLevel,
      resultIds,
      batchName,
      publicationType = 'final',
      accessLevel = 'public',
      releaseDate,
      schedulePublication = false,
      sendNotifications = true,
      action = 'publish'
    } = body;

    // Validate required fields
    if (!examId || !resultIds || resultIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required publication information' },
        { status: 400 }
      );
    }

    // Validate that all result IDs exist
    const results = resultIds.map((id: string) => examResults.get(id)).filter(Boolean);
    if (results.length !== resultIds.length) {
      return NextResponse.json(
        { success: false, message: 'Some result IDs are invalid' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'withdraw') {
      // Withdraw published results
      const withdrawnResults = [];
      
      for (const resultId of resultIds) {
        const result = examResults.get(resultId);
        if (result && result.publication.isPublished) {
          result.publication.isPublished = false;
          result.publication.accessLevel = 'private';
          result.audit.lastModifiedBy = userId;
          result.audit.lastModifiedAt = new Date().toISOString();
          result.audit.modifications.push({
            field: 'publication_status',
            oldValue: 'published',
            newValue: 'withdrawn',
            modifiedBy: userId,
            modifiedAt: new Date().toISOString(),
            reason: 'Results withdrawn'
          });
          
          examResults.set(resultId, result);
          withdrawnResults.push(result);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          withdrawnResults: withdrawnResults.length,
          message: `${withdrawnResults.length} results withdrawn successfully`
        },
        message: 'Results withdrawn successfully'
      });
    }

    // Perform verification checks
    const verificationChecks = performVerificationChecks(resultIds);
    const hasFailedChecks = verificationChecks.some(check => check.status === 'failed');

    if (hasFailedChecks && publicationType === 'final') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot publish final results with failed verification checks',
          verificationChecks 
        },
        { status: 400 }
      );
    }

    // Calculate statistics
    const statistics = calculatePublicationStatistics(resultIds);

    // Generate batch ID
    const batchId = `BATCH-${examId}-${Date.now()}`;

    // Create publication batch
    const publicationBatch = {
      id: batchId,
      examId,
      examSession: examSession || results[0].examSession,
      examLevel: examLevel as 'O Level' | 'A Level',
      batchName: batchName || `${examSession} ${examLevel} Results`,
      resultIds,
      publicationType: publicationType as 'full' | 'partial' | 'provisional' | 'final',
      accessLevel: accessLevel as 'private' | 'school' | 'public',
      releaseDate: releaseDate || new Date().toISOString(),
      publishedBy: userId,
      publishedAt: new Date().toISOString(),
      statistics,
      notifications: {
        studentsNotified: false,
        schoolsNotified: false,
        publicNotified: false,
        notificationsSent: 0
      },
      verification: {
        isVerified: !hasFailedChecks,
        verifiedBy: userId,
        verifiedAt: new Date().toISOString(),
        verificationChecks
      },
      status: schedulePublication ? 'scheduled' : 'published'
    };

    // Update individual results
    const publishedResults = [];
    
    for (const resultId of resultIds) {
      const result = examResults.get(resultId);
      if (result) {
        // Update publication status
        result.publication.isPublished = !schedulePublication;
        result.publication.publishedAt = new Date().toISOString();
        result.publication.publishedBy = userId;
        result.publication.releaseDate = releaseDate || new Date().toISOString();
        result.publication.accessLevel = accessLevel;
        
        // Update audit trail
        result.audit.lastModifiedBy = userId;
        result.audit.lastModifiedAt = new Date().toISOString();
        result.audit.modifications.push({
          field: 'publication_status',
          oldValue: 'unpublished',
          newValue: schedulePublication ? 'scheduled' : 'published',
          modifiedBy: userId,
          modifiedAt: new Date().toISOString(),
          reason: `Results ${schedulePublication ? 'scheduled for publication' : 'published'}`
        });

        // Update verification if not already verified
        if (!result.verification.isVerified && !hasFailedChecks) {
          result.verification.isVerified = true;
          result.verification.verifiedBy = userId;
          result.verification.verifiedAt = new Date().toISOString();
        }

        // Update status
        result.status = schedulePublication ? 'verified' : 'published';
        
        examResults.set(resultId, result);
        publishedResults.push(result);
      }
    }

    // Send notifications if requested and not scheduled
    if (sendNotifications && !schedulePublication) {
      const notifications = await sendPublicationNotifications(batchId, publishedResults);
      publicationBatch.notifications = notifications;
    }

    // Store publication batch
    publicationBatches.set(batchId, publicationBatch);

    return NextResponse.json({
      success: true,
      data: {
        publicationBatch,
        publishedResults: publishedResults.length,
        verificationChecks,
        statistics
      },
      message: schedulePublication ? 
        `Results scheduled for publication on ${releaseDate}` : 
        `${publishedResults.length} results published successfully`
    });

  } catch (error) {
    console.error('Publish results error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get publication batches
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

    if (!canPublishResults(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view publication data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const status = searchParams.get('status') || '';
    const publicationType = searchParams.get('publicationType') || '';

    // Get all publication batches
    let batches = Array.from(publicationBatches.values());

    // Apply filters
    if (examId) {
      batches = batches.filter(batch => batch.examId === examId);
    }

    if (status) {
      batches = batches.filter(batch => batch.status === status);
    }

    if (publicationType) {
      batches = batches.filter(batch => batch.publicationType === publicationType);
    }

    // Sort by publication date (most recent first)
    batches.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Calculate summary statistics
    const summary = {
      totalBatches: batches.length,
      totalResultsPublished: batches.reduce((sum, batch) => sum + batch.statistics.totalResults, 0),
      byStatus: {
        draft: batches.filter(b => b.status === 'draft').length,
        scheduled: batches.filter(b => b.status === 'scheduled').length,
        published: batches.filter(b => b.status === 'published').length,
        withdrawn: batches.filter(b => b.status === 'withdrawn').length
      },
      byType: {
        full: batches.filter(b => b.publicationType === 'full').length,
        partial: batches.filter(b => b.publicationType === 'partial').length,
        provisional: batches.filter(b => b.publicationType === 'provisional').length,
        final: batches.filter(b => b.publicationType === 'final').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        batches,
        summary
      },
      message: 'Publication batches retrieved successfully'
    });

  } catch (error) {
    console.error('Get publication batches error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
