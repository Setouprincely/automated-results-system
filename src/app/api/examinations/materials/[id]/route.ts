import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared exam materials storage (in production, use database)
const examMaterials: Map<string, any> = new Map();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// PUT - Update examination materials
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

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const { id } = params;
    const materials = examMaterials.get(id);

    if (!materials) {
      return NextResponse.json(
        { success: false, message: 'Examination materials not found' },
        { status: 404 }
      );
    }

    // Check if materials can be modified
    if (materials.status === 'archived') {
      return NextResponse.json(
        { success: false, message: 'Cannot modify archived materials' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      questionPapers,
      answerSheets,
      additionalMaterials,
      distributionUpdate,
      status,
      securityUpdate,
      action
    } = body;

    // Prepare update data
    const updateData: any = {
      ...materials,
      updatedAt: new Date().toISOString()
    };

    // Add audit trail entry
    const auditEntry = {
      action: 'Materials Updated',
      performedBy: userId,
      timestamp: new Date().toISOString(),
      details: ''
    };

    // Handle specific actions
    if (action) {
      switch (action) {
        case 'add_question_paper':
          if (body.newQuestionPaper) {
            const newPaper = {
              id: `QP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              ...body.newQuestionPaper,
              uploadedAt: new Date().toISOString(),
              uploadedBy: userId
            };
            updateData.materials.questionPapers.push(newPaper);
            auditEntry.details = `Added question paper: ${newPaper.fileName}`;
          }
          break;

        case 'remove_question_paper':
          if (body.questionPaperId) {
            const paperIndex = updateData.materials.questionPapers.findIndex(
              (paper: any) => paper.id === body.questionPaperId
            );
            if (paperIndex !== -1) {
              const removedPaper = updateData.materials.questionPapers.splice(paperIndex, 1)[0];
              auditEntry.details = `Removed question paper: ${removedPaper.fileName}`;
            }
          }
          break;

        case 'update_distribution':
          if (body.centerId && body.deliveryStatus) {
            const centerIndex = updateData.distribution.centers.findIndex(
              (center: any) => center.centerId === body.centerId
            );
            if (centerIndex !== -1) {
              updateData.distribution.centers[centerIndex].deliveryStatus = body.deliveryStatus;
              if (body.deliveryDate) {
                updateData.distribution.centers[centerIndex].deliveryDate = body.deliveryDate;
              }
              if (body.receivedBy) {
                updateData.distribution.centers[centerIndex].receivedBy = body.receivedBy;
              }
              auditEntry.details = `Updated delivery status for ${updateData.distribution.centers[centerIndex].centerName}: ${body.deliveryStatus}`;
            }
          }
          break;

        case 'approve_materials':
          updateData.status = 'ready';
          updateData.approvedBy = userId;
          updateData.approvedAt = new Date().toISOString();
          auditEntry.details = 'Materials approved and ready for distribution';
          break;
      }
    }

    // Update materials components
    if (questionPapers !== undefined) {
      updateData.materials.questionPapers = questionPapers;
      auditEntry.details = 'Question papers updated';
    }

    if (answerSheets !== undefined) {
      updateData.materials.answerSheets = answerSheets;
      auditEntry.details = 'Answer sheets updated';
    }

    if (additionalMaterials !== undefined) {
      updateData.materials.additionalMaterials = additionalMaterials;
      auditEntry.details = 'Additional materials updated';
    }

    if (distributionUpdate !== undefined) {
      updateData.distribution = { ...updateData.distribution, ...distributionUpdate };
      auditEntry.details = 'Distribution information updated';
    }

    if (status !== undefined) {
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        'preparation': ['ready'],
        'ready': ['distributed'],
        'distributed': ['collected'],
        'collected': ['archived'],
        'archived': [] // Cannot change from archived
      };

      if (!validTransitions[materials.status].includes(status)) {
        return NextResponse.json(
          { success: false, message: `Cannot change status from ${materials.status} to ${status}` },
          { status: 400 }
        );
      }

      updateData.status = status;
      auditEntry.details = `Status changed to ${status}`;
    }

    if (securityUpdate !== undefined) {
      updateData.security = { ...updateData.security, ...securityUpdate };
      auditEntry.details = 'Security settings updated';
    }

    // Add audit trail entry
    updateData.security.auditTrail.push(auditEntry);

    // Update materials
    examMaterials.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Examination materials updated successfully'
    });

  } catch (error) {
    console.error('Update exam materials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get examination materials by ID
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
    
    // Check if ID is examId (get materials by exam) or materialId (get specific materials)
    let materials;
    
    if (id.startsWith('EXAM-')) {
      // Get materials by exam ID
      materials = Array.from(examMaterials.values()).filter(
        material => material.examId === id
      );
      
      if (materials.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No materials found for this exam' },
          { status: 404 }
        );
      }

      // Calculate summary statistics
      const summary = {
        totalMaterials: materials.length,
        totalQuestionPapers: materials.reduce((sum, m) => sum + m.materials.questionPapers.length, 0),
        totalAnswerSheets: materials.reduce((sum, m) => sum + m.materials.answerSheets.reduce((s: number, sheet: any) => s + sheet.quantity, 0), 0),
        distributionStatus: {
          pending: materials.reduce((sum, m) => sum + m.distribution.centers.filter((c: any) => c.deliveryStatus === 'pending').length, 0),
          dispatched: materials.reduce((sum, m) => sum + m.distribution.centers.filter((c: any) => c.deliveryStatus === 'dispatched').length, 0),
          delivered: materials.reduce((sum, m) => sum + m.distribution.centers.filter((c: any) => c.deliveryStatus === 'delivered').length, 0),
          confirmed: materials.reduce((sum, m) => sum + m.distribution.centers.filter((c: any) => c.deliveryStatus === 'confirmed').length, 0)
        }
      };

      return NextResponse.json({
        success: true,
        data: {
          materials,
          summary
        },
        message: 'Examination materials retrieved successfully'
      });
    } else {
      // Get specific materials by ID
      materials = examMaterials.get(id);
      
      if (!materials) {
        return NextResponse.json(
          { success: false, message: 'Examination materials not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: materials,
        message: 'Examination materials retrieved successfully'
      });
    }

  } catch (error) {
    console.error('Get exam materials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
