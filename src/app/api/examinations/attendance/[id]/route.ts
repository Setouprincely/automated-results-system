import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared attendance records storage (in production, use database)
const attendanceRecords: Map<string, any> = new Map();

// Helper function to check access permissions
const canManageAttendance = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return ['admin', 'examiner', 'teacher'].includes(user?.userType || '');
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

// PUT - Update attendance record
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

    if (!canManageAttendance(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to manage attendance' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const { id } = params;
    
    // Check if ID is examId (get attendance by exam) or attendanceId (get specific record)
    let attendanceRecord;
    
    if (id.startsWith('EXAM-')) {
      // Get attendance records by exam ID
      const records = Array.from(attendanceRecords.values()).filter(
        record => record.examId === id
      );
      
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No attendance records found for this exam' },
          { status: 404 }
        );
      }

      // For bulk update of exam attendance
      const body = await request.json();
      const { action, data } = body;

      if (action === 'bulk_update') {
        const updatedRecords = [];
        
        for (const record of records) {
          if (data.recordIds && !data.recordIds.includes(record.id)) continue;
          
          const updateData = {
            ...record,
            updatedAt: new Date().toISOString()
          };

          if (data.status) {
            updateData.status = data.status;
            if (data.status === 'submitted') {
              updateData.submittedAt = new Date().toISOString();
            }
          }

          attendanceRecords.set(record.id, updateData);
          updatedRecords.push(updateData);
        }

        return NextResponse.json({
          success: true,
          data: updatedRecords,
          message: 'Attendance records updated successfully'
        });
      }

      return NextResponse.json(
        { success: false, message: 'Invalid action for exam attendance update' },
        { status: 400 }
      );
    } else {
      // Update specific attendance record
      attendanceRecord = attendanceRecords.get(id);
      
      if (!attendanceRecord) {
        return NextResponse.json(
          { success: false, message: 'Attendance record not found' },
          { status: 404 }
        );
      }

      // Check if record can be modified
      if (attendanceRecord.status === 'submitted') {
        return NextResponse.json(
          { success: false, message: 'Cannot modify submitted attendance record' },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        candidates,
        sessionInfo,
        status,
        action,
        candidateUpdate,
        bulkAction
      } = body;

      // Prepare update data
      const updateData: any = {
        ...attendanceRecord,
        updatedAt: new Date().toISOString()
      };

      // Handle specific actions
      if (action) {
        switch (action) {
          case 'mark_present':
            if (candidateUpdate?.candidateId) {
              const candidateIndex = updateData.candidates.findIndex(
                (c: any) => c.candidateId === candidateUpdate.candidateId
              );
              if (candidateIndex !== -1) {
                updateData.candidates[candidateIndex].attendanceStatus = 'present';
                updateData.candidates[candidateIndex].entryTime = new Date().toISOString();
                updateData.candidates[candidateIndex].verificationStatus = 'verified';
              }
            }
            break;

          case 'mark_absent':
            if (candidateUpdate?.candidateId) {
              const candidateIndex = updateData.candidates.findIndex(
                (c: any) => c.candidateId === candidateUpdate.candidateId
              );
              if (candidateIndex !== -1) {
                updateData.candidates[candidateIndex].attendanceStatus = 'absent';
                updateData.candidates[candidateIndex].entryTime = undefined;
                updateData.candidates[candidateIndex].verificationStatus = 'pending';
              }
            }
            break;

          case 'mark_late':
            if (candidateUpdate?.candidateId) {
              const candidateIndex = updateData.candidates.findIndex(
                (c: any) => c.candidateId === candidateUpdate.candidateId
              );
              if (candidateIndex !== -1) {
                updateData.candidates[candidateIndex].attendanceStatus = 'late';
                updateData.candidates[candidateIndex].entryTime = new Date().toISOString();
                updateData.candidates[candidateIndex].arrivalTime = candidateUpdate.arrivalTime || new Date().toISOString();
                updateData.candidates[candidateIndex].notes = candidateUpdate.notes || 'Arrived late';
              }
            }
            break;

          case 'verify_identity':
            if (candidateUpdate?.candidateId) {
              const candidateIndex = updateData.candidates.findIndex(
                (c: any) => c.candidateId === candidateUpdate.candidateId
              );
              if (candidateIndex !== -1) {
                updateData.candidates[candidateIndex].verificationStatus = 'verified';
                if (candidateUpdate.identityDocuments) {
                  updateData.candidates[candidateIndex].identityDocuments = candidateUpdate.identityDocuments;
                }
                if (candidateUpdate.biometricData) {
                  updateData.candidates[candidateIndex].biometricData = candidateUpdate.biometricData;
                }
              }
            }
            break;

          case 'start_session':
            updateData.status = 'in_progress';
            updateData.sessionInfo.actualStartTime = new Date().toISOString();
            break;

          case 'end_session':
            updateData.status = 'completed';
            updateData.sessionInfo.actualEndTime = new Date().toISOString();
            break;

          case 'add_break':
            if (body.breakInfo) {
              updateData.sessionInfo.breaks.push({
                startTime: body.breakInfo.startTime || new Date().toISOString(),
                endTime: body.breakInfo.endTime,
                reason: body.breakInfo.reason || 'Break'
              });
            }
            break;
        }
      }

      // Handle bulk actions
      if (bulkAction) {
        const { actionType, candidateIds, newStatus } = bulkAction;
        
        if (actionType === 'bulk_status_change' && candidateIds && newStatus) {
          updateData.candidates.forEach((candidate: any) => {
            if (candidateIds.includes(candidate.candidateId)) {
              candidate.attendanceStatus = newStatus;
              if (newStatus === 'present') {
                candidate.entryTime = new Date().toISOString();
                candidate.verificationStatus = 'verified';
              } else if (newStatus === 'absent') {
                candidate.entryTime = undefined;
                candidate.verificationStatus = 'pending';
              }
            }
          });
        }
      }

      // Update individual fields
      if (candidates !== undefined) {
        updateData.candidates = candidates;
      }

      if (sessionInfo !== undefined) {
        updateData.sessionInfo = { ...updateData.sessionInfo, ...sessionInfo };
      }

      if (status !== undefined) {
        // Validate status transitions
        const validTransitions: Record<string, string[]> = {
          'preparation': ['in_progress'],
          'in_progress': ['completed'],
          'completed': ['submitted'],
          'submitted': [] // Cannot change from submitted
        };

        if (!validTransitions[attendanceRecord.status].includes(status)) {
          return NextResponse.json(
            { success: false, message: `Cannot change status from ${attendanceRecord.status} to ${status}` },
            { status: 400 }
          );
        }

        updateData.status = status;
        
        if (status === 'submitted') {
          updateData.submittedAt = new Date().toISOString();
        }
      }

      // Recalculate statistics
      updateData.statistics = calculateStatistics(updateData.candidates);

      // Update attendance record
      attendanceRecords.set(id, updateData);

      return NextResponse.json({
        success: true,
        data: updateData,
        message: 'Attendance record updated successfully'
      });
    }

  } catch (error) {
    console.error('Update attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get attendance record by ID or exam ID
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

    if (!canManageAttendance(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view attendance' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (id.startsWith('EXAM-')) {
      // Get attendance records by exam ID
      const records = Array.from(attendanceRecords.values()).filter(
        record => record.examId === id
      );
      
      if (records.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No attendance records found for this exam' },
          { status: 404 }
        );
      }

      // Calculate summary statistics
      const summary = {
        totalRecords: records.length,
        totalCandidates: records.reduce((sum, record) => sum + record.statistics.totalCandidates, 0),
        totalPresent: records.reduce((sum, record) => sum + record.statistics.present, 0),
        totalAbsent: records.reduce((sum, record) => sum + record.statistics.absent, 0),
        averageAttendanceRate: records.length > 0 ? 
          Math.round(records.reduce((sum, record) => sum + record.statistics.attendanceRate, 0) / records.length) : 0,
        byCenter: records.reduce((acc: any, record) => {
          if (!acc[record.centerName]) {
            acc[record.centerName] = { present: 0, total: 0 };
          }
          acc[record.centerName].present += record.statistics.present;
          acc[record.centerName].total += record.statistics.totalCandidates;
          return acc;
        }, {})
      };

      return NextResponse.json({
        success: true,
        data: {
          records,
          summary
        },
        message: 'Attendance records retrieved successfully'
      });
    } else {
      // Get specific attendance record
      const attendanceRecord = attendanceRecords.get(id);
      
      if (!attendanceRecord) {
        return NextResponse.json(
          { success: false, message: 'Attendance record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: attendanceRecord,
        message: 'Attendance record retrieved successfully'
      });
    }

  } catch (error) {
    console.error('Get attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
