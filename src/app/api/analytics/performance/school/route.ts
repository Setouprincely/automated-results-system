import { NextRequest, NextResponse } from 'next/server';

// Mock school performance data
const mockSchoolPerformance = {
  overview: {
    totalSchools: 89,
    averageScore: 78.5,
    passRate: 85.2,
    topPerformers: 12,
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
  topSchools: [
    { id: 'SCH-001', name: 'Government High School Yaoundé', score: 92.1 },
    { id: 'SCH-002', name: 'GBHS Limbe', score: 90.8 },
    { id: 'SCH-003', name: 'Lycée de Douala', score: 89.5 }
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
      data: mockSchoolPerformance,
      message: 'School performance data retrieved successfully'
    });
  } catch (error) {
    console.error('school performance API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
