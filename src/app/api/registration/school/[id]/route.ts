import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared school registration storage (in production, use database)
const schoolRegistrations: Map<string, any> = new Map();

// Helper function to check access permissions
const canAccessSchoolRegistration = (token: string, isAdmin: boolean = false): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || (isAdmin ? false : ['teacher', 'examiner'].includes(user?.userType || ''));
};

// GET - Get school registration by ID
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

    if (!canAccessSchoolRegistration(token)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = params;
    const schoolRegistration = schoolRegistrations.get(id);

    if (!schoolRegistration) {
      return NextResponse.json(
        { success: false, message: 'School registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schoolRegistration,
      message: 'School registration retrieved successfully'
    });

  } catch (error) {
    console.error('Get school registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update school registration
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

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);
    const isAdmin = user?.userType === 'admin';

    if (!canAccessSchoolRegistration(token)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = params;
    const schoolRegistration = schoolRegistrations.get(id);

    if (!schoolRegistration) {
      return NextResponse.json(
        { success: false, message: 'School registration not found' },
        { status: 404 }
      );
    }

    // Check if registration can be modified
    if (!isAdmin && ['approved', 'rejected', 'suspended'].includes(schoolRegistration.status)) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify approved, rejected, or suspended registration' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      schoolInfo,
      contactInfo,
      principalInfo,
      registrarInfo,
      academicInfo,
      examCenterInfo,
      status,
      documents
    } = body;

    // Prepare update data
    const updateData: any = {
      ...schoolRegistration,
      updatedAt: new Date().toISOString()
    };

    if (schoolInfo !== undefined) {
      updateData.schoolInfo = { ...schoolRegistration.schoolInfo, ...schoolInfo };
    }

    if (contactInfo !== undefined) {
      updateData.contactInfo = { ...schoolRegistration.contactInfo, ...contactInfo };
    }

    if (principalInfo !== undefined) {
      updateData.principalInfo = { ...schoolRegistration.principalInfo, ...principalInfo };
    }

    if (registrarInfo !== undefined) {
      updateData.registrarInfo = { ...schoolRegistration.registrarInfo, ...registrarInfo };
    }

    if (academicInfo !== undefined) {
      updateData.academicInfo = { ...schoolRegistration.academicInfo, ...academicInfo };
    }

    if (examCenterInfo !== undefined) {
      updateData.examCenterInfo = { ...schoolRegistration.examCenterInfo, ...examCenterInfo };
      
      // Recalculate fees if exam center status changed
      if (examCenterInfo.isExamCenter !== schoolRegistration.examCenterInfo.isExamCenter) {
        const schoolType = updateData.schoolInfo.type;
        let registrationFee = 50000;
        let annualFee = 25000;

        if (schoolType === 'Private') {
          registrationFee = 75000;
          annualFee = 35000;
        } else if (schoolType === 'Mission') {
          registrationFee = 60000;
          annualFee = 30000;
        }

        if (examCenterInfo.isExamCenter) {
          registrationFee += 25000;
          annualFee += 15000;
        }

        updateData.fees = {
          registrationFee,
          annualFee,
          totalAmount: registrationFee + annualFee,
          currency: 'XAF'
        };
      }
    }

    if (documents !== undefined) {
      updateData.documents = { ...schoolRegistration.documents, ...documents };
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

    // Update school registration
    schoolRegistrations.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'School registration updated successfully'
    });

  } catch (error) {
    console.error('Update school registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete school registration
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

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);
    const isAdmin = user?.userType === 'admin';

    // Only admins can delete school registrations
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const schoolRegistration = schoolRegistrations.get(id);

    if (!schoolRegistration) {
      return NextResponse.json(
        { success: false, message: 'School registration not found' },
        { status: 404 }
      );
    }

    // Delete school registration
    schoolRegistrations.delete(id);

    return NextResponse.json({
      success: true,
      message: 'School registration deleted successfully'
    });

  } catch (error) {
    console.error('Delete school registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
