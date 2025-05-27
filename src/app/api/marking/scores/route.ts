import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Marking scores storage (in production, use database)
const markingScores: Map<string, {
  id: string;
  scriptId: string;
  candidateNumber: string;
  examId: string;
  subjectCode: string;
  paperNumber: number;
  examinerId: string;
  examinerName: string;
  markingType: 'first' | 'second' | 'moderation' | 'chief_review';
  scores: Array<{
    sectionId: string;
    sectionName: string;
    questions: Array<{
      questionId: string;
      questionNumber: string;
      maxMarks: number;
      marksAwarded: number;
      comments?: string;
      annotations?: Array<{
        type: 'highlight' | 'comment' | 'correction';
        position: { x: number; y: number };
        content: string;
        timestamp: string;
      }>;
    }>;
    sectionTotal: number;
    sectionMaxMarks: number;
  }>;
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  grade?: string;
  qualityIndicators: {
    clarity: number; // 1-5
    accuracy: number; // 1-5
    consistency: number; // 1-5
    completeness: number; // 1-5
  };
  markingTime: {
    startTime: string;
    endTime?: string;
    totalMinutes?: number;
    pausedTime?: number;
  };
  flags: Array<{
    type: 'exceptional_performance' | 'poor_handwriting' | 'incomplete_answer' | 'potential_malpractice' | 'technical_issue';
    description: string;
    severity: 'low' | 'medium' | 'high';
    flaggedAt: string;
  }>;
  verification: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationComments?: string;
    discrepancies?: Array<{
      questionId: string;
      originalMarks: number;
      verifiedMarks: number;
      reason: string;
    }>;
  };
  moderation: {
    isModerated: boolean;
    moderatedBy?: string;
    moderatedAt?: string;
    moderationComments?: string;
    finalMarks?: number;
    adjustments?: Array<{
      questionId: string;
      originalMarks: number;
      adjustedMarks: number;
      reason: string;
    }>;
  };
  status: 'draft' | 'submitted' | 'verified' | 'moderated' | 'finalized';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Helper function to check marking access
const canMarkScript = (token: string, scriptId?: string): { canMark: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canMark: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canMark: false, userId: null, userType: null };
  
  // Admin and examiners can mark
  const canMark = ['admin', 'examiner'].includes(user.userType);
  
  return { canMark, userId, userType: user.userType };
};

// Calculate grade based on percentage
const calculateGrade = (percentage: number, examLevel: string): string => {
  if (examLevel === 'O Level') {
    if (percentage >= 80) return 'A1';
    if (percentage >= 70) return 'B2';
    if (percentage >= 60) return 'B3';
    if (percentage >= 50) return 'C4';
    if (percentage >= 45) return 'C5';
    if (percentage >= 40) return 'C6';
    if (percentage >= 30) return 'D7';
    if (percentage >= 20) return 'E8';
    return 'F9';
  } else { // A Level
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  }
};

// POST - Submit marking scores
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

    const { canMark, userId, userType } = canMarkScript(token);

    if (!canMark) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to mark scripts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      scriptId,
      candidateNumber,
      examId,
      subjectCode,
      paperNumber,
      markingType = 'first',
      scores,
      markingTime,
      flags = [],
      examLevel,
      autoSubmit = false
    } = body;

    // Validate required fields
    if (!scriptId || !candidateNumber || !examId || !scores) {
      return NextResponse.json(
        { success: false, message: 'Missing required marking information' },
        { status: 400 }
      );
    }

    // Check if marking already exists for this script and marking type
    const existingMarking = Array.from(markingScores.values()).find(
      score => score.scriptId === scriptId && score.markingType === markingType && score.examinerId === userId
    );

    if (existingMarking && existingMarking.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Marking already submitted for this script' },
        { status: 409 }
      );
    }

    // Calculate totals
    let totalMarks = 0;
    let totalMaxMarks = 0;

    const processedScores = scores.map((section: any) => {
      let sectionTotal = 0;
      let sectionMaxMarks = 0;

      const processedQuestions = section.questions.map((question: any) => {
        sectionTotal += question.marksAwarded || 0;
        sectionMaxMarks += question.maxMarks || 0;
        
        return {
          questionId: question.questionId,
          questionNumber: question.questionNumber,
          maxMarks: question.maxMarks,
          marksAwarded: question.marksAwarded || 0,
          comments: question.comments || '',
          annotations: question.annotations || []
        };
      });

      totalMarks += sectionTotal;
      totalMaxMarks += sectionMaxMarks;

      return {
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        questions: processedQuestions,
        sectionTotal,
        sectionMaxMarks
      };
    });

    const percentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;
    const grade = calculateGrade(percentage, examLevel || 'O Level');

    // Generate marking ID
    const markingId = existingMarking?.id || `MARK-${scriptId}-${markingType}-${Date.now()}`;

    // Get examiner info
    const examiner = userStorage.findById(userId!);

    // Create or update marking score
    const markingScore = {
      id: markingId,
      scriptId,
      candidateNumber,
      examId,
      subjectCode,
      paperNumber,
      examinerId: userId!,
      examinerName: examiner?.fullName || 'Unknown Examiner',
      markingType: markingType as 'first' | 'second' | 'moderation' | 'chief_review',
      scores: processedScores,
      totalMarks,
      totalMaxMarks,
      percentage,
      grade,
      qualityIndicators: {
        clarity: 4, // Default values, could be calculated
        accuracy: 4,
        consistency: 4,
        completeness: 4
      },
      markingTime: {
        startTime: markingTime?.startTime || new Date().toISOString(),
        endTime: markingTime?.endTime,
        totalMinutes: markingTime?.totalMinutes,
        pausedTime: markingTime?.pausedTime || 0
      },
      flags: flags.map((flag: any) => ({
        ...flag,
        flaggedAt: new Date().toISOString()
      })),
      verification: {
        isVerified: false
      },
      moderation: {
        isModerated: false
      },
      status: autoSubmit ? 'submitted' : 'draft',
      submittedAt: autoSubmit ? new Date().toISOString() : undefined,
      createdAt: existingMarking?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store marking score
    markingScores.set(markingId, markingScore);

    return NextResponse.json({
      success: true,
      data: markingScore,
      message: autoSubmit ? 'Marking submitted successfully' : 'Marking saved as draft'
    });

  } catch (error) {
    console.error('Submit marking scores error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get scores data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mock data for scores
    const mockData = {
      message: 'scores data retrieved successfully',
      timestamp: new Date().toISOString(),
      data: []
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'scores retrieved successfully'
    });
  } catch (error) {
    console.error('scores GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

