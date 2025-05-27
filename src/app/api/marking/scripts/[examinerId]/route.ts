import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared script allocations storage (in production, use database)
const scriptAllocations: Map<string, any> = new Map();

// Helper function to check examiner access
const canAccessExaminerScripts = (token: string, examinerId: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  // Admin and examiner coordinators can access all
  if (user?.userType === 'admin') return true;
  
  // Examiners can only access their own scripts
  return userId === examinerId;
};

// GET - Get scripts allocated to examiner
export async function GET(
  request: NextRequest,
  { params }: { params: { examinerId: string } }
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

    const { examinerId } = params;

    if (!canAccessExaminerScripts(token, examinerId)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const examId = searchParams.get('examId') || '';
    const priority = searchParams.get('priority') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Find all allocations for this examiner
    const examinerAllocations = Array.from(scriptAllocations.values())
      .map(allocation => ({
        ...allocation,
        examinerAllocation: allocation.allocations.find((alloc: any) => alloc.examinerId === examinerId)
      }))
      .filter(allocation => allocation.examinerAllocation);

    if (examinerAllocations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          scripts: [],
          allocations: [],
          summary: {
            totalScripts: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            verified: 0,
            overdue: 0
          },
          workload: {
            totalAllocated: 0,
            totalMarked: 0,
            totalRemaining: 0,
            averageTimePerScript: 0,
            estimatedCompletionTime: 0
          }
        },
        message: 'No scripts allocated to this examiner'
      });
    }

    // Collect all scripts for this examiner
    let allScripts: any[] = [];
    const allocationSummaries = [];

    for (const allocation of examinerAllocations) {
      const examinerAlloc = allocation.examinerAllocation;
      let scripts = [...examinerAlloc.scripts];

      // Apply filters
      if (status) {
        scripts = scripts.filter((script: any) => script.markingStatus === status);
      }

      if (examId) {
        scripts = scripts.filter((script: any) => allocation.examId === examId);
      }

      if (priority) {
        scripts = scripts.filter((script: any) => script.priority === priority);
      }

      // Add allocation context to each script
      scripts = scripts.map((script: any) => ({
        ...script,
        examId: allocation.examId,
        examTitle: allocation.examTitle,
        subjectCode: allocation.subjectCode,
        subjectName: allocation.subjectName,
        paperNumber: allocation.paperNumber,
        examLevel: allocation.examLevel,
        markingScheme: allocation.markingScheme,
        deadline: examinerAlloc.deadline,
        allocationId: allocation.id
      }));

      allScripts = allScripts.concat(scripts);

      // Create allocation summary
      allocationSummaries.push({
        allocationId: allocation.id,
        examId: allocation.examId,
        examTitle: allocation.examTitle,
        subjectCode: allocation.subjectCode,
        subjectName: allocation.subjectName,
        paperNumber: allocation.paperNumber,
        examLevel: allocation.examLevel,
        scriptsAllocated: examinerAlloc.scriptsAllocated,
        scriptsMarked: examinerAlloc.scriptsMarked,
        scriptsRemaining: examinerAlloc.scriptsRemaining,
        deadline: examinerAlloc.deadline,
        status: examinerAlloc.status,
        progress: examinerAlloc.scriptsAllocated > 0 ? 
          Math.round((examinerAlloc.scriptsMarked / examinerAlloc.scriptsAllocated) * 100) : 0
      });
    }

    // Sort scripts by priority and deadline
    allScripts.sort((a, b) => {
      const priorityOrder = { 'urgent': 3, 'high': 2, 'normal': 1 };
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    // Calculate pagination
    const totalScripts = allScripts.length;
    const totalPages = Math.ceil(totalScripts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedScripts = allScripts.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      totalScripts,
      pending: allScripts.filter(s => s.markingStatus === 'pending').length,
      inProgress: allScripts.filter(s => s.markingStatus === 'in_progress').length,
      completed: allScripts.filter(s => s.markingStatus === 'completed').length,
      verified: allScripts.filter(s => s.markingStatus === 'verified').length,
      overdue: allScripts.filter(s => 
        s.markingStatus !== 'completed' && 
        s.markingStatus !== 'verified' && 
        new Date(s.deadline) < new Date()
      ).length
    };

    // Calculate workload statistics
    const totalAllocated = allocationSummaries.reduce((sum, alloc) => sum + alloc.scriptsAllocated, 0);
    const totalMarked = allocationSummaries.reduce((sum, alloc) => sum + alloc.scriptsMarked, 0);
    const totalRemaining = totalAllocated - totalMarked;

    const workload = {
      totalAllocated,
      totalMarked,
      totalRemaining,
      averageTimePerScript: 25, // minutes (could be calculated from historical data)
      estimatedCompletionTime: totalRemaining * 25, // minutes
      overallProgress: totalAllocated > 0 ? Math.round((totalMarked / totalAllocated) * 100) : 0
    };

    // Calculate upcoming deadlines
    const upcomingDeadlines = allocationSummaries
      .filter(alloc => alloc.status !== 'completed')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        scripts: paginatedScripts,
        allocations: allocationSummaries,
        pagination: {
          currentPage: page,
          totalPages,
          totalScripts,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        summary,
        workload,
        upcomingDeadlines
      },
      message: 'Examiner scripts retrieved successfully'
    });

  } catch (error) {
    console.error('Get examiner scripts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update examiner script status (bulk operations)
export async function PUT(
  request: NextRequest,
  { params }: { params: { examinerId: string } }
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

    const { examinerId } = params;

    if (!canAccessExaminerScripts(token, examinerId)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, scriptIds, allocationId, newStatus, priority } = body;

    // Find the specific allocation
    const allocation = scriptAllocations.get(allocationId);
    if (!allocation) {
      return NextResponse.json(
        { success: false, message: 'Allocation not found' },
        { status: 404 }
      );
    }

    const examinerAllocation = allocation.allocations.find((alloc: any) => alloc.examinerId === examinerId);
    if (!examinerAllocation) {
      return NextResponse.json(
        { success: false, message: 'Examiner allocation not found' },
        { status: 404 }
      );
    }

    let updatedScripts = 0;

    switch (action) {
      case 'bulk_status_update':
        if (!newStatus || !scriptIds || scriptIds.length === 0) {
          return NextResponse.json(
            { success: false, message: 'Status and script IDs are required' },
            { status: 400 }
          );
        }

        examinerAllocation.scripts.forEach((script: any) => {
          if (scriptIds.includes(script.scriptId)) {
            script.markingStatus = newStatus;
            if (newStatus === 'in_progress') {
              script.startedAt = new Date().toISOString();
            } else if (newStatus === 'completed') {
              script.markedAt = new Date().toISOString();
            } else if (newStatus === 'verified') {
              script.verifiedAt = new Date().toISOString();
            }
            updatedScripts++;
          }
        });
        break;

      case 'bulk_priority_update':
        if (!priority || !scriptIds || scriptIds.length === 0) {
          return NextResponse.json(
            { success: false, message: 'Priority and script IDs are required' },
            { status: 400 }
          );
        }

        examinerAllocation.scripts.forEach((script: any) => {
          if (scriptIds.includes(script.scriptId)) {
            script.priority = priority;
            updatedScripts++;
          }
        });
        break;

      case 'start_marking_session':
        // Mark all pending scripts as in_progress
        examinerAllocation.scripts.forEach((script: any) => {
          if (script.markingStatus === 'pending') {
            script.markingStatus = 'in_progress';
            script.startedAt = new Date().toISOString();
            updatedScripts++;
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Recalculate allocation statistics
    examinerAllocation.scriptsMarked = examinerAllocation.scripts.filter(
      (script: any) => script.markingStatus === 'completed' || script.markingStatus === 'verified'
    ).length;
    examinerAllocation.scriptsRemaining = examinerAllocation.scriptsAllocated - examinerAllocation.scriptsMarked;

    // Update allocation status
    if (examinerAllocation.scriptsRemaining === 0) {
      examinerAllocation.status = 'completed';
    } else if (examinerAllocation.scriptsMarked > 0) {
      examinerAllocation.status = 'in_progress';
    }

    // Update allocation
    allocation.updatedAt = new Date().toISOString();
    scriptAllocations.set(allocationId, allocation);

    return NextResponse.json({
      success: true,
      data: {
        updatedScripts,
        allocation: examinerAllocation
      },
      message: `Bulk ${action} completed successfully`
    });

  } catch (error) {
    console.error('Update examiner scripts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
