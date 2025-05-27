import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared registration storage (in production, use database)
const studentRegistrations: Map<string, any> = new Map();

// Helper function to check access permissions
const canAccessRegistration = (token: string, registrationId: string): { canAccess: boolean; isAdmin: boolean; currentUserId: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const currentUserId = tokenParts.slice(2, -1).join('-');
  const currentUser = userStorage.findById(currentUserId);
  
  if (!currentUser) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const isAdmin = currentUser.userType === 'admin';
  const registration = studentRegistrations.get(registrationId);
  const isOwner = registration && registration.studentId === currentUserId;
  
  return {
    canAccess: isAdmin || isOwner,
    isAdmin,
    currentUserId
  };
};

// GET - Get student registration by ID
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

    const { id } = params;
    const { canAccess } = canAccessRegistration(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const registration = studentRegistrations.get(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Registration retrieved successfully'
    });

  } catch (error) {
    console.error('Get registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update student registration
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

    const { id } = params;
    const { canAccess, isAdmin } = canAccessRegistration(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const registration = studentRegistrations.get(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if registration can be modified
    if (!isAdmin && ['approved', 'rejected'].includes(registration.status)) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify approved or rejected registration' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      examSession,
      examLevel,
      examCenter,
      centerCode,
      subjects,
      personalInfo,
      guardianInfo,
      schoolInfo,
      status,
      documents
    } = body;

    // Prepare update data
    const updateData: any = {
      ...registration,
      updatedAt: new Date().toISOString()
    };

    if (examSession !== undefined) updateData.examSession = examSession;
    if (examLevel !== undefined) updateData.examLevel = examLevel;
    if (examCenter !== undefined) updateData.examCenter = examCenter;
    if (centerCode !== undefined) updateData.centerCode = centerCode;
    if (personalInfo !== undefined) updateData.personalInfo = { ...registration.personalInfo, ...personalInfo };
    if (guardianInfo !== undefined) updateData.guardianInfo = { ...registration.guardianInfo, ...guardianInfo };
    if (schoolInfo !== undefined) updateData.schoolInfo = { ...registration.schoolInfo, ...schoolInfo };
    if (documents !== undefined) updateData.documents = { ...registration.documents, ...documents };

    // Handle subjects update
    if (subjects !== undefined) {
      if (!Array.isArray(subjects) || subjects.length === 0) {
        return NextResponse.json(
          { success: false, message: 'At least one subject is required' },
          { status: 400 }
        );
      }

      const maxSubjects = updateData.examLevel === 'O Level' ? 9 : 4;
      if (subjects.length > maxSubjects) {
        return NextResponse.json(
          { success: false, message: `Maximum ${maxSubjects} subjects allowed for ${updateData.examLevel}` },
          { status: 400 }
        );
      }

      updateData.subjects = subjects.map((subject: any) => ({
        code: subject.code,
        name: subject.name,
        type: subject.type || 'elective',
        fee: updateData.examLevel === 'O Level' ? 2000 : 3000
      }));

      // Recalculate fees
      const registrationFee = updateData.examLevel === 'O Level' ? 5000 : 7500;
      const subjectFeePerSubject = updateData.examLevel === 'O Level' ? 2000 : 3000;
      const subjectFees = subjects.length * subjectFeePerSubject;
      const totalAmount = registrationFee + subjectFees;

      updateData.fees = {
        registrationFee,
        subjectFees,
        totalAmount,
        currency: 'XAF'
      };
    }

    // Only admins can update status
    if (isAdmin && status !== undefined) {
      updateData.status = status;
      
      if (status === 'approved') {
        updateData.approvedAt = new Date().toISOString();
      } else if (status === 'submitted') {
        updateData.submittedAt = new Date().toISOString();
      }
    }

    // Update registration
    studentRegistrations.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Registration updated successfully'
    });

  } catch (error) {
    console.error('Update registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete student registration
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

    const { id } = params;
    const { canAccess, isAdmin } = canAccessRegistration(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const registration = studentRegistrations.get(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of draft registrations or admin override
    if (!isAdmin && registration.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Can only delete draft registrations' },
        { status: 400 }
      );
    }

    // Delete registration
    studentRegistrations.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    });

  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
