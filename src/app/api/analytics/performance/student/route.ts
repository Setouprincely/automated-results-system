import { NextRequest, NextResponse } from 'next/server';

// Mock student performance data
const mockStudentPerformance = {
  overview: {
    totalStudents: 15420,
    averageScore: 78.5,
    passRate: 85.2,
    topPerformers: 156,
    improvementRate: 12.3
  },
  trends: [
    { period: '2023', score: 76.2, passRate: 82.1 },
    { period: '2024', score: 77.8, passRate: 84.5 },
    { period: '2025', score: 78.5, passRate: 85.2 }
  ],
  subjects: [
    { name: 'Mathematics', averageScore: 82.1, passRate: 88.5 },
    { name: 'English', averageScore: 79.3, passRate: 86.2 },
    { name: 'Physics', averageScore: 75.8, passRate: 81.7 },
    { name: 'Chemistry', averageScore: 77.2, passRate: 83.4 }
  ],
  topStudents: [
    { id: 'GCE2025-ST-001', name: 'Alice Johnson', score: 95.2 },
    { id: 'GCE2025-ST-002', name: 'Bob Smith', score: 94.8 },
    { id: 'GCE2025-ST-003', name: 'Carol Davis', score: 94.1 }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current';
    const subject = searchParams.get('subject') || '';
    const level = searchParams.get('level') || '';

    return NextResponse.json({
      success: true,
      data: mockStudentPerformance,
      message: 'Student performance data retrieved successfully'
    });
  } catch (error) {
    console.error('student performance API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
