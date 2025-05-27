import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Attendance records storage (in production, use database)
const attendanceRecords: Map<string, {
  id: string;
  examId: string;
  examTitle: string;
  examDate: string;
  examSession: string;
  centerId: string;
  centerName: string;
  roomNumber: string;
  invigilatorId: string;
  invigilatorName: string;
  candidates: Array<{
    candidateId: string;
    candidateNumber: string;
    fullName: string;
    seatNumber: string;
    arrivalTime?: string;
    attendanceStatus: 'present' | 'absent' | 'late' | 'excused' | 'disqualified';
    entryTime?: string;
    exitTime?: string;
    specialAccommodations?: string[];
    notes?: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
    identityDocuments: Array<{
      type: 'national_id' | 'passport' | 'school_id' | 'birth_certificate';
      number: string;
      verified: boolean;
    }>;
    biometricData?: {
      fingerprint?: string;
      photo?: string;
      signature?: string;
    };
  }>;
  statistics: {
    totalCandidates: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    disqualified: number;
    attendanceRate: number;
  };
  sessionInfo: {
    startTime: string;
    endTime: string;
    actualStartTime?: string;
    actualEndTime?: string;
    duration: number; // in minutes
    breaks: Array<{
      startTime: string;
      endTime: string;
      reason: string;
    }>;
  };
  status: 'preparation' | 'in_progress' | 'completed' | 'submitted';
  recordedBy: string;
  recordedAt: string;
  updatedAt: string;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}> = new Map();

// Helper function to check access permissions
const canManageAttendance = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return ['admin', 'examiner', 'teacher'].includes(user?.userType || '');
};

// Generate attendance record ID
const generateAttendanceId = (examId: string, centerId: string): string => {
  return `ATT-${examId}-${centerId}-${Date.now()}`;
};

// Calculate attendance statistics
const calculateStatistics = (candidates: any[]): any => {
  const stats = {
    totalCandidates: candidates.length,
    present: candidates.filter(c => c.attendanceStatus === 'present').length,
    absent: candidates.filter(c => c.attendanceStatus === 'absent').length,
    late: candidates.filter(c => c.attendanceStatus === 'late').length,
    excused: candidates.filter(c => c.attendanceStatus === 'excused').length,
    disqualified: candidates.filter(c => c.attendanceStatus === 'disqualified').length,
    attendanceRate: 0
  };

  stats.attendanceRate = stats.totalCandidates > 0 ? 
    Math.round(((stats.present + stats.late) / stats.totalCandidates) * 100) : 0;

  return stats;
};

// POST - Create attendance record
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

    if (!canManageAttendance(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to manage attendance' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      examId,
      examTitle,
      examDate,
      examSession,
      centerId,
      centerName,
      roomNumber,
      invigilatorId,
      invigilatorName,
      candidates,
      sessionInfo,
      bulkAttendance
    } = body;

    // Validate required fields
    if (!examId || !centerId || !examDate || !candidates || !sessionInfo) {
      return NextResponse.json(
        { success: false, message: 'Missing required attendance information' },
        { status: 400 }
      );
    }

    // Check if attendance record already exists
    const existingRecord = Array.from(attendanceRecords.values()).find(
      record => record.examId === examId && record.centerId === centerId && record.roomNumber === roomNumber
    );

    if (existingRecord) {
      return NextResponse.json(
        { success: false, message: 'Attendance record already exists for this exam, center, and room' },
        { status: 409 }
      );
    }

    // Generate attendance ID
    const attendanceId = generateAttendanceId(examId, centerId);

    // Process candidates data
    const processedCandidates = candidates.map((candidate: any) => ({
      candidateId: candidate.candidateId,
      candidateNumber: candidate.candidateNumber,
      fullName: candidate.fullName,
      seatNumber: candidate.seatNumber,
      arrivalTime: candidate.arrivalTime,
      attendanceStatus: candidate.attendanceStatus || 'absent',
      entryTime: candidate.entryTime,
      exitTime: candidate.exitTime,
      specialAccommodations: candidate.specialAccommodations || [],
      notes: candidate.notes,
      verificationStatus: candidate.verificationStatus || 'pending',
      identityDocuments: candidate.identityDocuments || [],
      biometricData: candidate.biometricData || {}
    }));

    // Handle bulk attendance marking
    if (bulkAttendance) {
      const { status, candidateIds } = bulkAttendance;
      processedCandidates.forEach(candidate => {
        if (candidateIds.includes(candidate.candidateId)) {
          candidate.attendanceStatus = status;
          if (status === 'present') {
            candidate.entryTime = new Date().toISOString();
            candidate.verificationStatus = 'verified';
          }
        }
      });
    }

    // Calculate statistics
    const statistics = calculateStatistics(processedCandidates);

    // Create attendance record
    const attendanceRecord = {
      id: attendanceId,
      examId,
      examTitle: examTitle || `Exam ${examId}`,
      examDate,
      examSession: examSession || 'Morning',
      centerId,
      centerName: centerName || 'Unknown Center',
      roomNumber: roomNumber || 'Room 1',
      invigilatorId: invigilatorId || userId,
      invigilatorName: invigilatorName || 'Unknown Invigilator',
      candidates: processedCandidates,
      statistics,
      sessionInfo: {
        startTime: sessionInfo.startTime,
        endTime: sessionInfo.endTime,
        actualStartTime: sessionInfo.actualStartTime,
        actualEndTime: sessionInfo.actualEndTime,
        duration: sessionInfo.duration || 180, // default 3 hours
        breaks: sessionInfo.breaks || []
      },
      status: 'preparation' as const,
      recordedBy: userId,
      recordedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store attendance record
    attendanceRecords.set(attendanceId, attendanceRecord);

    return NextResponse.json({
      success: true,
      data: attendanceRecord,
      message: 'Attendance record created successfully'
    });

  } catch (error) {
    console.error('Create attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!canManageAttendance(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view attendance' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const centerId = searchParams.get('centerId') || '';
    const examDate = searchParams.get('examDate') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all attendance records
    let records = Array.from(attendanceRecords.values());

    // Apply filters
    if (examId) {
      records = records.filter(record => record.examId === examId);
    }

    if (centerId) {
      records = records.filter(record => record.centerId === centerId);
    }

    if (examDate) {
      records = records.filter(record => record.examDate.startsWith(examDate));
    }

    if (status) {
      records = records.filter(record => record.status === status);
    }

    // Sort by exam date and recorded time
    records.sort((a, b) => {
      const dateA = new Date(`${a.examDate} ${a.recordedAt}`);
      const dateB = new Date(`${b.examDate} ${b.recordedAt}`);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate pagination
    const totalRecords = records.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecords = records.slice(startIndex, endIndex);

    // Calculate overall statistics
    const overallStats = {
      totalRecords,
      totalCandidates: records.reduce((sum, record) => sum + record.statistics.totalCandidates, 0),
      totalPresent: records.reduce((sum, record) => sum + record.statistics.present, 0),
      totalAbsent: records.reduce((sum, record) => sum + record.statistics.absent, 0),
      averageAttendanceRate: records.length > 0 ? 
        Math.round(records.reduce((sum, record) => sum + record.statistics.attendanceRate, 0) / records.length) : 0,
      byStatus: {
        preparation: records.filter(r => r.status === 'preparation').length,
        inProgress: records.filter(r => r.status === 'in_progress').length,
        completed: records.filter(r => r.status === 'completed').length,
        submitted: records.filter(r => r.status === 'submitted').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        statistics: overallStats
      },
      message: 'Attendance records retrieved successfully'
    });

  } catch (error) {
    console.error('Get attendance records error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
