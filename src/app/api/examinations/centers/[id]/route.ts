import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared exam centers storage (in production, use database)
const examCenters: Map<string, any> = new Map();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// PUT - Update examination center
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
    const examCenter = examCenters.get(id);

    if (!examCenter) {
      return NextResponse.json(
        { success: false, message: 'Examination center not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      centerName,
      centerType,
      address,
      contactInfo,
      centerHead,
      facilities,
      examTypes,
      status
    } = body;

    // Prepare update data
    const updateData: any = {
      ...examCenter,
      updatedAt: new Date().toISOString()
    };

    if (centerName !== undefined) {
      // Check if new name conflicts with existing centers
      const existingCenter = Array.from(examCenters.values()).find(
        center => center.centerName.toLowerCase() === centerName.toLowerCase() && center.id !== id
      );
      if (existingCenter) {
        return NextResponse.json(
          { success: false, message: 'Center name already exists' },
          { status: 409 }
        );
      }
      updateData.centerName = centerName;
    }

    if (centerType !== undefined) updateData.centerType = centerType;
    if (address !== undefined) updateData.address = { ...examCenter.address, ...address };
    if (contactInfo !== undefined) updateData.contactInfo = { ...examCenter.contactInfo, ...contactInfo };
    if (centerHead !== undefined) updateData.centerHead = { ...examCenter.centerHead, ...centerHead };
    if (examTypes !== undefined) updateData.examTypes = examTypes;
    if (status !== undefined) updateData.status = status;

    if (facilities !== undefined) {
      const totalCapacity = facilities.rooms?.reduce((sum: number, room: any) => sum + room.capacity, 0) || 0;
      updateData.facilities = {
        totalRooms: facilities.rooms?.length || 0,
        totalCapacity,
        rooms: facilities.rooms || [],
        amenities: facilities.amenities || []
      };
    }

    // Update examination center
    examCenters.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Examination center updated successfully'
    });

  } catch (error) {
    console.error('Update exam center error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete examination center
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
    const examCenter = examCenters.get(id);

    if (!examCenter) {
      return NextResponse.json(
        { success: false, message: 'Examination center not found' },
        { status: 404 }
      );
    }

    // Check if center has active exams (in production, check database)
    // For now, just check status
    if (examCenter.status === 'active') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete active examination center. Deactivate it first.' },
        { status: 400 }
      );
    }

    // Delete examination center
    examCenters.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Examination center deleted successfully'
    });

  } catch (error) {
    console.error('Delete exam center error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
