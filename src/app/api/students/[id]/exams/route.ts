import { NextRequest, NextResponse } from 'next/server';

// Mock exam data for students
const mockExamData = {
  'GCE2025-ST-003421': {
    upcomingExams: [
      { 
        subject: 'English Literature', 
        date: '2025-06-10', 
        time: '09:00 - 12:00', 
        center: 'GBHS Limbe, Hall A' 
      },
      { 
        subject: 'French', 
        date: '2025-06-12', 
        time: '09:00 - 12:00', 
        center: 'GBHS Limbe, Hall A' 
      },
      { 
        subject: 'Mathematics', 
        date: '2025-06-15', 
        time: '09:00 - 12:00', 
        center: 'GBHS Limbe, Hall B' 
      },
      { 
        subject: 'Physics', 
        date: '2025-06-17', 
        time: '09:00 - 12:00', 
        center: 'GBHS Limbe, Hall A' 
      },
      { 
        subject: 'Chemistry', 
        date: '2025-06-19', 
        time: '09:00 - 12:00', 
        center: 'GBHS Limbe, Hall B' 
      }
    ],
    notifications: [
      { 
        id: 1, 
        type: 'info', 
        message: 'Examination timetable has been released', 
        date: '2025-05-12' 
      },
      { 
        id: 2, 
        type: 'warning', 
        message: 'Confirm your examination center details', 
        date: '2025-05-10' 
      },
      { 
        id: 3, 
        type: 'success', 
        message: 'Registration successfully processed', 
        date: '2025-04-28' 
      }
    ]
  },
  'admin': {
    upcomingExams: [],
    notifications: [
      { 
        id: 1, 
        type: 'info', 
        message: 'Admin notification', 
        date: '2025-05-12' 
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get exam data for student
    const examData = mockExamData[id as keyof typeof mockExamData];
    
    if (!examData) {
      // Return empty data instead of error for better UX
      return NextResponse.json({
        success: true,
        data: {
          upcomingExams: [],
          notifications: []
        },
        message: 'No exam data found for student'
      });
    }

    return NextResponse.json({
      success: true,
      data: examData,
      message: 'Student exam data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching student exams:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
