import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared invigilator assignments storage (in production, use database)
const invigilatorAssignments: Map<string, any> = new Map();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// PUT - Update invigilator assignment
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
    const assignment = invigilatorAssignments.get(id);

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'Invigilator assignment not found' },
        { status: 404 }
      );
    }

    // Check if assignment can be modified
    if (assignment.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot modify completed assignment' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      assignments,
      status,
      notes,
      emergencyContacts,
      action
    } = body;

    // Prepare update data
    const updateData: any = {
      ...assignment,
      updatedAt: new Date().toISOString()
    };

    if (assignments !== undefined) {
      // Validate assignments
      for (const assign of assignments) {
        if (!assign.invigilatorId || !assign.role || !assign.roomNumber) {
          return NextResponse.json(
            { success: false, message: 'Invalid assignment data. Missing required fields.' },
            { status: 400 }
          );
        }
      }
      updateData.assignments = assignments;
    }

    if (status !== undefined) {
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        'draft': ['assigned'],
        'assigned': ['confirmed', 'draft'],
        'confirmed': ['completed'],
        'completed': [] // Cannot change from completed
      };

      if (!validTransitions[assignment.status].includes(status)) {
        return NextResponse.json(
          { success: false, message: `Cannot change status from ${assignment.status} to ${status}` },
          { status: 400 }
        );
      }

      updateData.status = status;

      if (status === 'confirmed') {
        updateData.confirmedAt = new Date().toISOString();
        // Send notifications to invigilators (in production)
        await notifyInvigilators(updateData.assignments);
      }
    }

    if (notes !== undefined) updateData.notes = notes;
    if (emergencyContacts !== undefined) updateData.emergencyContacts = emergencyContacts;

    // Handle specific actions
    if (action) {
      switch (action) {
        case 'add_invigilator':
          if (body.newInvigilator) {
            updateData.assignments.push(body.newInvigilator);
          }
          break;
        case 'remove_invigilator':
          if (body.invigilatorId) {
            updateData.assignments = updateData.assignments.filter(
              (assign: any) => assign.invigilatorId !== body.invigilatorId
            );
          }
          break;
        case 'swap_invigilators':
          if (body.swapData) {
            const { invigilator1Id, invigilator2Id } = body.swapData;
            const inv1Index = updateData.assignments.findIndex((a: any) => a.invigilatorId === invigilator1Id);
            const inv2Index = updateData.assignments.findIndex((a: any) => a.invigilatorId === invigilator2Id);
            
            if (inv1Index !== -1 && inv2Index !== -1) {
              const temp = updateData.assignments[inv1Index].roomNumber;
              updateData.assignments[inv1Index].roomNumber = updateData.assignments[inv2Index].roomNumber;
              updateData.assignments[inv2Index].roomNumber = temp;
            }
          }
          break;
      }
    }

    // Update assignment
    invigilatorAssignments.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Invigilator assignment updated successfully'
    });

  } catch (error) {
    console.error('Update invigilator assignment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get invigilator assignment details
export async function GET(
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
    const assignment = invigilatorAssignments.get(id);

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'Invigilator assignment not found' },
        { status: 404 }
      );
    }

    // Calculate assignment statistics
    const stats = {
      totalInvigilators: assignment.assignments.length,
      byRole: {
        chief: assignment.assignments.filter((a: any) => a.role === 'chief').length,
        assistant: assignment.assignments.filter((a: any) => a.role === 'assistant').length,
        observer: assignment.assignments.filter((a: any) => a.role === 'observer').length,
        specialNeeds: assignment.assignments.filter((a: any) => a.role === 'special_needs').length
      },
      averageExperience: assignment.assignments.length > 0 ? 
        Math.round(assignment.assignments.reduce((sum: number, a: any) => sum + a.experience, 0) / assignment.assignments.length) : 0,
      fulfillmentRate: {
        chief: Math.min(100, (assignment.assignments.filter((a: any) => a.role === 'chief').length / assignment.requirements.chiefInvigilators) * 100),
        assistant: Math.min(100, (assignment.assignments.filter((a: any) => a.role === 'assistant').length / assignment.requirements.assistantInvigilators) * 100),
        observer: Math.min(100, (assignment.assignments.filter((a: any) => a.role === 'observer').length / assignment.requirements.observers) * 100)
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        assignment,
        statistics: stats
      },
      message: 'Invigilator assignment retrieved successfully'
    });

  } catch (error) {
    console.error('Get invigilator assignment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invigilator assignment
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
    const assignment = invigilatorAssignments.get(id);

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'Invigilator assignment not found' },
        { status: 404 }
      );
    }

    // Check if assignment can be deleted
    if (['confirmed', 'completed'].includes(assignment.status)) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete confirmed or completed assignment' },
        { status: 400 }
      );
    }

    // Delete assignment
    invigilatorAssignments.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Invigilator assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete invigilator assignment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock notification function (in production, use email/SMS service)
const notifyInvigilators = async (assignments: any[]): Promise<void> => {
  for (const assignment of assignments) {
    console.log(`Notification sent to ${assignment.invigilatorName} (${assignment.invigilatorEmail}) for ${assignment.role} role`);
    // In production: send email/SMS notification
  }
};
