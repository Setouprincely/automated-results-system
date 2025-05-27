import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared grade boundaries storage (in production, use database)
const gradeBoundaries: Map<string, any> = new Map();

// Helper function to check boundaries access
const canManageBoundaries = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// GET - Get grade boundaries by exam ID
export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
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

    if (!canManageBoundaries(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view grade boundaries' },
        { status: 403 }
      );
    }

    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const subjectCode = searchParams.get('subjectCode') || '';
    const includeHistory = searchParams.get('includeHistory') === 'true';

    // Get boundaries for this exam
    let examBoundaries = Array.from(gradeBoundaries.values()).filter(
      boundary => boundary.examId === examId
    );

    if (examBoundaries.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          boundaries: [],
          summary: {
            totalSubjects: 0,
            approvedBoundaries: 0,
            pendingApproval: 0,
            recentChanges: 0
          }
        },
        message: 'No grade boundaries found for this exam'
      });
    }

    // Filter by subject if specified
    if (subjectCode) {
      examBoundaries = examBoundaries.filter(boundary => boundary.subjectCode === subjectCode);
    }

    // Sort by subject code
    examBoundaries.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

    // Calculate summary statistics
    const summary = {
      totalSubjects: examBoundaries.length,
      approvedBoundaries: examBoundaries.filter(b => b.approvalWorkflow.status === 'approved').length,
      pendingApproval: examBoundaries.filter(b => ['draft', 'pending_review', 'reviewed'].includes(b.approvalWorkflow.status)).length,
      recentChanges: examBoundaries.filter(b => 
        b.adjustmentHistory.length > 0 && 
        new Date(b.adjustmentHistory[b.adjustmentHistory.length - 1].adjustedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      byLevel: {
        oLevel: examBoundaries.filter(b => b.examLevel === 'O Level').length,
        aLevel: examBoundaries.filter(b => b.examLevel === 'A Level').length
      },
      qualityMetrics: {
        averageReliability: examBoundaries.length > 0 ? 
          Math.round(examBoundaries.reduce((sum, b) => sum + b.qualityMetrics.reliability, 0) / examBoundaries.length * 100) / 100 : 0,
        averageValidity: examBoundaries.length > 0 ? 
          Math.round(examBoundaries.reduce((sum, b) => sum + b.qualityMetrics.validity, 0) / examBoundaries.length * 100) / 100 : 0,
        averageFairness: examBoundaries.length > 0 ? 
          Math.round(examBoundaries.reduce((sum, b) => sum + b.qualityMetrics.fairness, 0) / examBoundaries.length * 100) / 100 : 0
      }
    };

    // Prepare response data
    let responseData = examBoundaries;

    // Include history if requested
    if (!includeHistory) {
      responseData = examBoundaries.map(boundary => ({
        ...boundary,
        adjustmentHistory: boundary.adjustmentHistory.slice(-3) // Only last 3 adjustments
      }));
    }

    // Calculate comparison with previous session (if available)
    const comparisons = examBoundaries.map(boundary => {
      const previousSession = Array.from(gradeBoundaries.values()).find(
        b => b.subjectCode === boundary.subjectCode && 
             b.examLevel === boundary.examLevel &&
             b.examId !== boundary.examId &&
             b.approvalWorkflow.status === 'approved'
      );

      if (previousSession) {
        const changes = calculateBoundaryChanges(boundary.boundaries, previousSession.boundaries, boundary.examLevel);
        return {
          subjectCode: boundary.subjectCode,
          hasChanges: changes.length > 0,
          changes
        };
      }

      return {
        subjectCode: boundary.subjectCode,
        hasChanges: false,
        changes: []
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        boundaries: responseData,
        summary,
        comparisons
      },
      message: 'Grade boundaries retrieved successfully'
    });

  } catch (error) {
    console.error('Get exam grade boundaries error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update exam grade boundaries (bulk operations)
export async function PUT(
  request: NextRequest,
  { params }: { params: { examId: string } }
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

    if (!canManageBoundaries(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to manage grade boundaries' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const { examId } = params;
    const body = await request.json();
    const { action, boundaryIds, newStatus, adjustmentReason } = body;

    // Get boundaries for this exam
    const examBoundaries = Array.from(gradeBoundaries.values()).filter(
      boundary => boundary.examId === examId
    );

    if (examBoundaries.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No grade boundaries found for this exam' },
        { status: 404 }
      );
    }

    // Filter by specific boundary IDs if provided
    let targetBoundaries = examBoundaries;
    if (boundaryIds && boundaryIds.length > 0) {
      targetBoundaries = examBoundaries.filter(boundary => boundaryIds.includes(boundary.id));
    }

    const updatedBoundaries = [];

    // Handle bulk actions
    switch (action) {
      case 'bulk_status_update':
        if (!newStatus) {
          return NextResponse.json(
            { success: false, message: 'Status is required for bulk status update' },
            { status: 400 }
          );
        }

        for (const boundary of targetBoundaries) {
          const updatedBoundary = {
            ...boundary,
            approvalWorkflow: {
              ...boundary.approvalWorkflow,
              status: newStatus
            },
            updatedAt: new Date().toISOString()
          };

          // Update workflow timestamps based on status
          if (newStatus === 'pending_review') {
            updatedBoundary.approvalWorkflow.submittedBy = userId;
            updatedBoundary.approvalWorkflow.submittedAt = new Date().toISOString();
          } else if (newStatus === 'reviewed') {
            updatedBoundary.approvalWorkflow.reviewedBy = userId;
            updatedBoundary.approvalWorkflow.reviewedAt = new Date().toISOString();
            updatedBoundary.approvalWorkflow.reviewComments = adjustmentReason || 'Bulk review';
          } else if (newStatus === 'approved') {
            updatedBoundary.approvalWorkflow.approvedBy = userId;
            updatedBoundary.approvalWorkflow.approvedAt = new Date().toISOString();
          } else if (newStatus === 'published') {
            updatedBoundary.approvalWorkflow.publishedAt = new Date().toISOString();
          }

          gradeBoundaries.set(boundary.id, updatedBoundary);
          updatedBoundaries.push(updatedBoundary);
        }
        break;

      case 'bulk_activate':
        for (const boundary of targetBoundaries) {
          const updatedBoundary = {
            ...boundary,
            isActive: true,
            updatedAt: new Date().toISOString()
          };

          gradeBoundaries.set(boundary.id, updatedBoundary);
          updatedBoundaries.push(updatedBoundary);
        }
        break;

      case 'bulk_deactivate':
        for (const boundary of targetBoundaries) {
          const updatedBoundary = {
            ...boundary,
            isActive: false,
            updatedAt: new Date().toISOString()
          };

          gradeBoundaries.set(boundary.id, updatedBoundary);
          updatedBoundaries.push(updatedBoundary);
        }
        break;

      case 'publish_all_approved':
        const approvedBoundaries = targetBoundaries.filter(b => b.approvalWorkflow.status === 'approved');
        
        for (const boundary of approvedBoundaries) {
          const updatedBoundary = {
            ...boundary,
            approvalWorkflow: {
              ...boundary.approvalWorkflow,
              status: 'published',
              publishedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };

          gradeBoundaries.set(boundary.id, updatedBoundary);
          updatedBoundaries.push(updatedBoundary);
        }
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid bulk action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedBoundaries,
        totalUpdated: updatedBoundaries.length
      },
      message: `Bulk ${action} completed successfully`
    });

  } catch (error) {
    console.error('Bulk update exam grade boundaries error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate boundary changes
const calculateBoundaryChanges = (currentBoundaries: any, previousBoundaries: any, examLevel: string): any[] => {
  const changes = [];
  const grades = examLevel === 'O Level' 
    ? ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']
    : ['A', 'B', 'C', 'D', 'E', 'F'];

  for (const grade of grades) {
    const currentValue = currentBoundaries[grade];
    const previousValue = previousBoundaries[grade];

    if (currentValue !== undefined && previousValue !== undefined && currentValue !== previousValue) {
      changes.push({
        grade,
        previousValue,
        currentValue,
        change: currentValue - previousValue,
        changeType: currentValue > previousValue ? 'increased' : 'decreased'
      });
    }
  }

  return changes;
};
