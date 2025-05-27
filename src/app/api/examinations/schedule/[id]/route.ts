import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared exam schedules storage (in production, use database)
const examSchedules: Map<string, any> = new Map();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// PUT - Update exam schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    if (!isAdminOrExaminer(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin or examiner access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const examSchedule = examSchedules.get(id);

    if (!examSchedule) {
      return NextResponse.json(
        { success: false, message: 'Exam schedule not found' },
        { status: 404 }
      );
    }

    // Check if exam can be modified
    if (examSchedule.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot modify completed exam' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      examSession,
      examLevel,
      subjectCode,
      subjectName,
      paperNumber,
      paperTitle,
      examDate,
      startTime,
      endTime,
      duration,
      examType,
      totalMarks,
      passingMarks,
      instructions,
      materials,
      venues,
      invigilators,
      status
    } = body;

    // Prepare update data
    const updateData: any = {
      ...examSchedule,
      updatedAt: new Date().toISOString()
    };

    if (examSession !== undefined) updateData.examSession = examSession;
    if (examLevel !== undefined) updateData.examLevel = examLevel;
    if (subjectCode !== undefined) updateData.subjectCode = subjectCode;
    if (subjectName !== undefined) updateData.subjectName = subjectName;
    if (paperNumber !== undefined) updateData.paperNumber = paperNumber;
    if (paperTitle !== undefined) updateData.paperTitle = paperTitle;
    if (examDate !== undefined) {
      // Validate future date
      if (new Date(examDate) <= new Date()) {
        return NextResponse.json(
          { success: false, message: 'Exam date must be in the future' },
          { status: 400 }
        );
      }
      updateData.examDate = examDate;
    }
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (duration !== undefined) updateData.duration = duration;
    if (examType !== undefined) updateData.examType = examType;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (passingMarks !== undefined) updateData.passingMarks = passingMarks;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (materials !== undefined) updateData.materials = { ...examSchedule.materials, ...materials };
    if (venues !== undefined) updateData.venues = venues;
    if (invigilators !== undefined) updateData.invigilators = invigilators;

    if (status !== undefined) {
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        'draft': ['scheduled', 'cancelled'],
        'scheduled': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [], // Cannot change from completed
        'cancelled': ['scheduled'] // Can reschedule cancelled exams
      };

      if (!validTransitions[examSchedule.status].includes(status)) {
        return NextResponse.json(
          { success: false, message: `Cannot change status from ${examSchedule.status} to ${status}` },
          { status: 400 }
        );
      }

      updateData.status = status;

      // Set published date when scheduling
      if (status === 'scheduled' && !examSchedule.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }

    // Update exam schedule
    examSchedules.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Exam schedule updated successfully'
    });

  } catch (error) {
    console.error('Update exam schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete exam schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    if (!isAdminOrExaminer(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin or examiner access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const examSchedule = examSchedules.get(id);

    if (!examSchedule) {
      return NextResponse.json(
        { success: false, message: 'Exam schedule not found' },
        { status: 404 }
      );
    }

    // Check if exam can be deleted
    if (['in_progress', 'completed'].includes(examSchedule.status)) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete exam that is in progress or completed' },
        { status: 400 }
      );
    }

    // Check if there are registered candidates (in production, check database)
    // For now, just check if venues have assigned candidates
    const hasAssignedCandidates = examSchedule.venues.some((venue: any) => venue.assignedCandidates > 0);
    if (hasAssignedCandidates) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete exam with assigned candidates. Cancel the exam instead.' },
        { status: 400 }
      );
    }

    // Delete exam schedule
    examSchedules.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Exam schedule deleted successfully'
    });

  } catch (error) {
    console.error('Delete exam schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
