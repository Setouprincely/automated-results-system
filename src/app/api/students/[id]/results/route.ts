import { NextRequest, NextResponse } from 'next/server';

// Mock results data for students
const mockResultsData = {
  'GCE2025-ST-003421': {
    pastResults: {
      OLevel: {
        year: 2023,
        overall: 'A',
        subjects: [
          { name: 'English Language', grade: 'A' },
          { name: 'Mathematics', grade: 'A' },
          { name: 'Physics', grade: 'B' },
          { name: 'Chemistry', grade: 'A' },
          { name: 'Biology', grade: 'B' },
          { name: 'Geography', grade: 'A' },
          { name: 'Computer Science', grade: 'A' }
        ]
      }
    },
    oLevel: {
      year: "2023",
      overallGrade: "Merit",
      subjects: [
        { name: "English Language", grade: "A", score: 85 },
        { name: "Mathematics", grade: "B", score: 78 },
        { name: "Physics", grade: "A", score: 88 },
        { name: "Chemistry", grade: "B", score: 75 },
        { name: "Biology", grade: "A", score: 87 },
        { name: "Computer Science", grade: "A*", score: 92 },
        { name: "French", grade: "C", score: 65 },
        { name: "History", grade: "B", score: 74 }
      ]
    },
    aLevel: {
      year: "2025",
      overallGrade: "Distinction",
      subjects: [
        { name: "Mathematics", grade: "A", score: 85, ucasPoints: 48 },
        { name: "Physics", grade: "A*", score: 92, ucasPoints: 56 },
        { name: "Chemistry", grade: "B", score: 75, ucasPoints: 40 },
        { name: "Computer Science", grade: "A", score: 87, ucasPoints: 48 }
      ],
      totalUCASPoints: 192
    }
  },
  'admin': {
    pastResults: null,
    oLevel: null,
    aLevel: null
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get results data for student
    const resultsData = mockResultsData[id as keyof typeof mockResultsData];
    
    if (!resultsData) {
      // Return empty data instead of error for better UX
      return NextResponse.json({
        success: true,
        data: {
          pastResults: null,
          oLevel: null,
          aLevel: null
        },
        message: 'No results found for student'
      });
    }

    return NextResponse.json({
      success: true,
      data: resultsData,
      message: 'Student results retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
