import { NextRequest, NextResponse } from 'next/server';

// Mock region performance data
const mockRegionPerformance = {
  overview: {
    totalRegions: 10,
    averageScore: 78.5,
    passRate: 85.2,
    topPerformers: 3,
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
  regions: [
    { name: 'Centre', score: 79.1, passRate: 86.3, schools: 25 },
    { name: 'Littoral', score: 78.8, passRate: 85.9, schools: 18 },
    { name: 'West', score: 77.5, passRate: 84.2, schools: 22 },
    { name: 'Northwest', score: 76.8, passRate: 83.1, schools: 15 },
    { name: 'Southwest', score: 75.9, passRate: 82.4, schools: 9 }
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
      data: mockRegionPerformance,
      message: 'Region performance data retrieved successfully'
    });
  } catch (error) {
    console.error('region performance API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
