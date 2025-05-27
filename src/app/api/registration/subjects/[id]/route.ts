import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared subjects storage (in production, use database)
const subjects: Map<string, any> = new Map();

// Helper function to check admin access
const isAdmin = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// GET - Get subject by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const subject = subjects.get(id);

    if (!subject) {
      return NextResponse.json(
        { success: false, message: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subject,
      message: 'Subject retrieved successfully'
    });

  } catch (error) {
    console.error('Get subject error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update subject (Admin only)
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

    if (!isAdmin(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const subject = subjects.get(id);

    if (!subject) {
      return NextResponse.json(
        { success: false, message: 'Subject not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      code,
      name,
      level,
      category,
      department,
      description,
      prerequisites,
      duration,
      fee,
      examFormat,
      syllabus,
      isActive
    } = body;

    // Prepare update data
    const updateData: any = {
      ...subject,
      updatedAt: new Date().toISOString()
    };

    if (code !== undefined) {
      // Check if new code conflicts with existing subjects
      const existingSubject = Array.from(subjects.values()).find(s => s.code === code && s.id !== id);
      if (existingSubject) {
        return NextResponse.json(
          { success: false, message: 'Subject code already exists' },
          { status: 409 }
        );
      }
      updateData.code = code;
    }

    if (name !== undefined) updateData.name = name;
    if (level !== undefined) {
      if (!['O Level', 'A Level', 'Both'].includes(level)) {
        return NextResponse.json(
          { success: false, message: 'Invalid level. Must be "O Level", "A Level", or "Both"' },
          { status: 400 }
        );
      }
      updateData.level = level;
    }

    if (category !== undefined) {
      if (!['core', 'elective'].includes(category)) {
        return NextResponse.json(
          { success: false, message: 'Invalid category. Must be "core" or "elective"' },
          { status: 400 }
        );
      }
      updateData.category = category;
    }

    if (department !== undefined) updateData.department = department;
    if (description !== undefined) updateData.description = description;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (duration !== undefined) updateData.duration = duration;
    if (fee !== undefined) updateData.fee = fee;
    if (examFormat !== undefined) updateData.examFormat = examFormat;
    if (syllabus !== undefined) updateData.syllabus = syllabus;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update subject
    subjects.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Subject updated successfully'
    });

  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete subject (Admin only)
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

    if (!isAdmin(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const subject = subjects.get(id);

    if (!subject) {
      return NextResponse.json(
        { success: false, message: 'Subject not found' },
        { status: 404 }
      );
    }

    // Check if subject is being used in any registrations
    // In production, check database for dependencies
    // For now, just mark as inactive instead of deleting
    const updateData = {
      ...subject,
      isActive: false,
      updatedAt: new Date().toISOString()
    };

    subjects.set(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Subject deactivated successfully (cannot delete subjects in use)'
    });

  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
