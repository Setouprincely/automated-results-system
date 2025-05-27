import { NextRequest, NextResponse } from 'next/server';

// Mock schools dashboard data
const mockSchoolsData = {
  stats: {
    totalStudents: 845,
    registeredForExam: 712,
    pendingRegistrations: 133,
    passRate: 78.3,
    examReadiness: 86
  },
  performanceTrend: [
    { year: '2021', passRate: 72 },
    { year: '2022', passRate: 74 },
    { year: '2023', passRate: 76 },
    { year: '2024', passRate: 78 },
    { year: '2025', passRate: 78.3 },
  ],
  subjectPerformance: [
    { subject: 'Mathematics', passRate: 68, avgScore: 62 },
    { subject: 'English', passRate: 82, avgScore: 74 },
    { subject: 'Physics', passRate: 71, avgScore: 65 },
    { subject: 'Chemistry', passRate: 73, avgScore: 66 },
    { subject: 'Biology', passRate: 77, avgScore: 70 },
  ],
  notifications: [
    { id: 1, type: 'info', message: 'Registration deadline for O Level candidates is May 30, 2025' },
    { id: 2, type: 'warning', message: '133 students still pending registration confirmation' },
    { id: 3, type: 'success', message: 'A Level results for February session have been published' },
    { id: 4, type: 'info', message: 'Teacher verification of candidate details ends next week' },
  ],
  upcomingEvents: [
    { id: 1, date: '2025-05-30', title: 'O Level Registration Deadline' },
    { id: 2, date: '2025-06-15', title: 'A Level Practical Examinations Begin' },
    { id: 3, date: '2025-06-25', title: 'O Level Written Examinations Begin' },
    { id: 4, date: '2025-07-10', title: 'Verification of Examination Centers' },
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: mockSchoolsData,
      message: 'Schools dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching schools dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
