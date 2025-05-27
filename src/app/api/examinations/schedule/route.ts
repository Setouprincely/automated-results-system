import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Examination schedule storage (in production, use database)
const examSchedules: Map<string, {
  id: string;
  examSession: string;
  examLevel: 'O Level' | 'A Level';
  subjectCode: string;
  subjectName: string;
  paperNumber: number;
  paperTitle: string;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  examType: 'written' | 'practical' | 'oral' | 'coursework';
  totalMarks: number;
  passingMarks: number;
  instructions: string[];
  materials: {
    allowed: string[];
    prohibited: string[];
    provided: string[];
  };
  venues: Array<{
    centerId: string;
    centerName: string;
    roomNumber: string;
    capacity: number;
    assignedCandidates: number;
  }>;
  invigilators: Array<{
    id: string;
    name: string;
    role: 'chief' | 'assistant' | 'observer';
    centerId: string;
  }>;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}> = new Map();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Generate exam schedule ID
const generateExamId = (examLevel: string, subjectCode: string, paperNumber: number): string => {
  const year = new Date().getFullYear();
  const level = examLevel === 'O Level' ? 'OL' : 'AL';
  return `EXAM-${year}-${level}-${subjectCode}-P${paperNumber}`;
};

// Validate exam schedule data
const validateExamSchedule = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.examSession) errors.push('Exam session is required');
  if (!data.examLevel || !['O Level', 'A Level'].includes(data.examLevel)) {
    errors.push('Valid exam level is required (O Level or A Level)');
  }
  if (!data.subjectCode) errors.push('Subject code is required');
  if (!data.subjectName) errors.push('Subject name is required');
  if (!data.paperNumber || data.paperNumber < 1) errors.push('Valid paper number is required');
  if (!data.examDate) errors.push('Exam date is required');
  if (!data.startTime) errors.push('Start time is required');
  if (!data.endTime) errors.push('End time is required');
  if (!data.duration || data.duration < 30) errors.push('Duration must be at least 30 minutes');

  // Validate date format
  if (data.examDate && isNaN(Date.parse(data.examDate))) {
    errors.push('Invalid exam date format');
  }

  // Validate that exam date is in the future
  if (data.examDate && new Date(data.examDate) <= new Date()) {
    errors.push('Exam date must be in the future');
  }

  return { valid: errors.length === 0, errors };
};

// POST - Create new exam schedule
export async function POST(request: NextRequest) {
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
      examType = 'written',
      totalMarks,
      passingMarks,
      instructions = [],
      materials = { allowed: [], prohibited: [], provided: [] },
      venues = [],
      status = 'draft'
    } = body;

    // Validate exam schedule data
    const validation = validateExamSchedule(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Generate exam ID
    const examId = generateExamId(examLevel, subjectCode, paperNumber);

    // Check if exam already exists
    if (examSchedules.has(examId)) {
      return NextResponse.json(
        { success: false, message: 'Exam schedule already exists for this subject and paper' },
        { status: 409 }
      );
    }

    // Create exam schedule
    const examSchedule = {
      id: examId,
      examSession,
      examLevel: examLevel as 'O Level' | 'A Level',
      subjectCode,
      subjectName,
      paperNumber,
      paperTitle: paperTitle || `${subjectName} Paper ${paperNumber}`,
      examDate,
      startTime,
      endTime,
      duration,
      examType: examType as 'written' | 'practical' | 'oral' | 'coursework',
      totalMarks: totalMarks || 100,
      passingMarks: passingMarks || (examLevel === 'O Level' ? 50 : 40),
      instructions: Array.isArray(instructions) ? instructions : [],
      materials: {
        allowed: materials.allowed || [],
        prohibited: materials.prohibited || ['Mobile phones', 'Smart watches', 'Calculators (unless specified)'],
        provided: materials.provided || ['Answer booklet', 'Question paper']
      },
      venues: venues || [],
      invigilators: [],
      status: status as 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store exam schedule
    examSchedules.set(examId, examSchedule);

    return NextResponse.json({
      success: true,
      data: examSchedule,
      message: 'Exam schedule created successfully'
    });

  } catch (error) {
    console.error('Create exam schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all exam schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examSession = searchParams.get('examSession') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const status = searchParams.get('status') || '';
    const examDate = searchParams.get('examDate') || '';
    const centerId = searchParams.get('centerId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all exam schedules
    let schedules = Array.from(examSchedules.values());

    // Apply filters
    if (examSession) {
      schedules = schedules.filter(schedule => schedule.examSession === examSession);
    }

    if (examLevel) {
      schedules = schedules.filter(schedule => schedule.examLevel === examLevel);
    }

    if (subjectCode) {
      schedules = schedules.filter(schedule => 
        schedule.subjectCode.toLowerCase().includes(subjectCode.toLowerCase())
      );
    }

    if (status) {
      schedules = schedules.filter(schedule => schedule.status === status);
    }

    if (examDate) {
      schedules = schedules.filter(schedule => 
        schedule.examDate.startsWith(examDate)
      );
    }

    if (centerId) {
      schedules = schedules.filter(schedule => 
        schedule.venues.some(venue => venue.centerId === centerId)
      );
    }

    // Sort by exam date and start time
    schedules.sort((a, b) => {
      const dateA = new Date(`${a.examDate} ${a.startTime}`);
      const dateB = new Date(`${b.examDate} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate pagination
    const totalSchedules = schedules.length;
    const totalPages = Math.ceil(totalSchedules / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSchedules = schedules.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: totalSchedules,
      byLevel: {
        oLevel: schedules.filter(s => s.examLevel === 'O Level').length,
        aLevel: schedules.filter(s => s.examLevel === 'A Level').length
      },
      byStatus: {
        draft: schedules.filter(s => s.status === 'draft').length,
        scheduled: schedules.filter(s => s.status === 'scheduled').length,
        inProgress: schedules.filter(s => s.status === 'in_progress').length,
        completed: schedules.filter(s => s.status === 'completed').length,
        cancelled: schedules.filter(s => s.status === 'cancelled').length
      },
      byType: {
        written: schedules.filter(s => s.examType === 'written').length,
        practical: schedules.filter(s => s.examType === 'practical').length,
        oral: schedules.filter(s => s.examType === 'oral').length,
        coursework: schedules.filter(s => s.examType === 'coursework').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        schedules: paginatedSchedules,
        pagination: {
          currentPage: page,
          totalPages,
          totalSchedules,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        statistics: stats
      },
      message: 'Exam schedules retrieved successfully'
    });

  } catch (error) {
    console.error('Get exam schedules error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
