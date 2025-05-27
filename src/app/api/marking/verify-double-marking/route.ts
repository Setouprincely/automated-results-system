import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared marking scores storage (in production, use database)
const markingScores: Map<string, any> = new Map();

// Double marking verification storage
const doubleMarkingVerifications: Map<string, {
  id: string;
  scriptId: string;
  candidateNumber: string;
  examId: string;
  subjectCode: string;
  paperNumber: number;
  firstMarkingId: string;
  secondMarkingId: string;
  firstMarker: {
    examinerId: string;
    examinerName: string;
    totalMarks: number;
    percentage: number;
    submittedAt: string;
  };
  secondMarker: {
    examinerId: string;
    examinerName: string;
    totalMarks: number;
    percentage: number;
    submittedAt: string;
  };
  discrepancy: {
    marksDifference: number;
    percentageDifference: number;
    isSignificant: boolean;
    threshold: number;
  };
  questionDiscrepancies: Array<{
    questionId: string;
    questionNumber: string;
    firstMarkerMarks: number;
    secondMarkerMarks: number;
    difference: number;
    maxMarks: number;
    percentageDifference: number;
    requiresReview: boolean;
  }>;
  verification: {
    status: 'pending' | 'reviewed' | 'resolved' | 'escalated';
    reviewedBy?: string;
    reviewedAt?: string;
    resolution: 'accept_first' | 'accept_second' | 'average' | 'third_marking' | 'moderation';
    finalMarks?: number;
    finalPercentage?: number;
    comments?: string;
    justification?: string;
  };
  escalation: {
    isEscalated: boolean;
    escalatedTo?: string;
    escalatedAt?: string;
    escalationReason?: string;
    escalationComments?: string;
  };
  qualityMetrics: {
    consistencyScore: number;
    reliabilityIndex: number;
    markingQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
  };
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Helper function to check verification access
const canVerifyDoubleMarking = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate discrepancy significance
const calculateDiscrepancy = (firstMarks: number, secondMarks: number, maxMarks: number, threshold: number = 10): any => {
  const marksDifference = Math.abs(firstMarks - secondMarks);
  const percentageDifference = maxMarks > 0 ? Math.round((marksDifference / maxMarks) * 100) : 0;
  const isSignificant = percentageDifference > threshold;

  return {
    marksDifference,
    percentageDifference,
    isSignificant,
    threshold
  };
};

// Calculate quality metrics
const calculateQualityMetrics = (discrepancy: any, questionDiscrepancies: any[]): any => {
  const consistencyScore = Math.max(0, 100 - discrepancy.percentageDifference);
  
  const significantDiscrepancies = questionDiscrepancies.filter(q => q.requiresReview).length;
  const reliabilityIndex = questionDiscrepancies.length > 0 ? 
    Math.max(0, 100 - (significantDiscrepancies / questionDiscrepancies.length) * 100) : 100;

  let markingQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
  if (consistencyScore >= 90 && reliabilityIndex >= 90) markingQuality = 'excellent';
  else if (consistencyScore >= 80 && reliabilityIndex >= 80) markingQuality = 'good';
  else if (consistencyScore >= 70 && reliabilityIndex >= 70) markingQuality = 'acceptable';
  else markingQuality = 'poor';

  return {
    consistencyScore: Math.round(consistencyScore),
    reliabilityIndex: Math.round(reliabilityIndex),
    markingQuality
  };
};

// POST - Create double marking verification
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

    if (!canVerifyDoubleMarking(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions for double marking verification' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      scriptId,
      firstMarkingId,
      secondMarkingId,
      discrepancyThreshold = 10,
      autoResolve = false
    } = body;

    // Validate required fields
    if (!scriptId || !firstMarkingId || !secondMarkingId) {
      return NextResponse.json(
        { success: false, message: 'Missing required verification information' },
        { status: 400 }
      );
    }

    // Get the two markings
    const firstMarking = markingScores.get(firstMarkingId);
    const secondMarking = markingScores.get(secondMarkingId);

    if (!firstMarking || !secondMarking) {
      return NextResponse.json(
        { success: false, message: 'One or both markings not found' },
        { status: 404 }
      );
    }

    // Validate that both markings are for the same script
    if (firstMarking.scriptId !== scriptId || secondMarking.scriptId !== scriptId) {
      return NextResponse.json(
        { success: false, message: 'Markings do not belong to the specified script' },
        { status: 400 }
      );
    }

    // Check if verification already exists
    const existingVerification = Array.from(doubleMarkingVerifications.values()).find(
      verification => verification.scriptId === scriptId
    );

    if (existingVerification) {
      return NextResponse.json(
        { success: false, message: 'Double marking verification already exists for this script' },
        { status: 409 }
      );
    }

    // Calculate overall discrepancy
    const discrepancy = calculateDiscrepancy(
      firstMarking.totalMarks,
      secondMarking.totalMarks,
      firstMarking.totalMaxMarks,
      discrepancyThreshold
    );

    // Calculate question-level discrepancies
    const questionDiscrepancies = [];
    
    for (let sectionIndex = 0; sectionIndex < firstMarking.scores.length; sectionIndex++) {
      const firstSection = firstMarking.scores[sectionIndex];
      const secondSection = secondMarking.scores[sectionIndex];

      if (firstSection && secondSection) {
        for (let questionIndex = 0; questionIndex < firstSection.questions.length; questionIndex++) {
          const firstQuestion = firstSection.questions[questionIndex];
          const secondQuestion = secondSection.questions[questionIndex];

          if (firstQuestion && secondQuestion && firstQuestion.questionId === secondQuestion.questionId) {
            const questionDiscrepancy = calculateDiscrepancy(
              firstQuestion.marksAwarded,
              secondQuestion.marksAwarded,
              firstQuestion.maxMarks,
              discrepancyThreshold
            );

            questionDiscrepancies.push({
              questionId: firstQuestion.questionId,
              questionNumber: firstQuestion.questionNumber,
              firstMarkerMarks: firstQuestion.marksAwarded,
              secondMarkerMarks: secondQuestion.marksAwarded,
              difference: questionDiscrepancy.marksDifference,
              maxMarks: firstQuestion.maxMarks,
              percentageDifference: questionDiscrepancy.percentageDifference,
              requiresReview: questionDiscrepancy.isSignificant
            });
          }
        }
      }
    }

    // Calculate quality metrics
    const qualityMetrics = calculateQualityMetrics(discrepancy, questionDiscrepancies);

    // Generate verification ID
    const verificationId = `VERIFY-${scriptId}-${Date.now()}`;

    // Determine initial status and resolution
    let initialStatus: 'pending' | 'reviewed' | 'resolved' = 'pending';
    let resolution: any = {};

    if (autoResolve && !discrepancy.isSignificant) {
      initialStatus = 'resolved';
      resolution = {
        status: 'resolved',
        resolution: 'average',
        finalMarks: Math.round((firstMarking.totalMarks + secondMarking.totalMarks) / 2),
        finalPercentage: Math.round((firstMarking.percentage + secondMarking.percentage) / 2),
        comments: 'Auto-resolved: Discrepancy within acceptable threshold',
        justification: 'Marks difference is within the acceptable threshold, averaged automatically'
      };
    }

    // Create double marking verification
    const verification = {
      id: verificationId,
      scriptId,
      candidateNumber: firstMarking.candidateNumber,
      examId: firstMarking.examId,
      subjectCode: firstMarking.subjectCode,
      paperNumber: firstMarking.paperNumber,
      firstMarkingId,
      secondMarkingId,
      firstMarker: {
        examinerId: firstMarking.examinerId,
        examinerName: firstMarking.examinerName,
        totalMarks: firstMarking.totalMarks,
        percentage: firstMarking.percentage,
        submittedAt: firstMarking.submittedAt || firstMarking.createdAt
      },
      secondMarker: {
        examinerId: secondMarking.examinerId,
        examinerName: secondMarking.examinerName,
        totalMarks: secondMarking.totalMarks,
        percentage: secondMarking.percentage,
        submittedAt: secondMarking.submittedAt || secondMarking.createdAt
      },
      discrepancy,
      questionDiscrepancies,
      verification: {
        status: initialStatus,
        ...resolution
      },
      escalation: {
        isEscalated: discrepancy.isSignificant && qualityMetrics.markingQuality === 'poor',
        escalationReason: discrepancy.isSignificant && qualityMetrics.markingQuality === 'poor' ? 
          'Significant discrepancy with poor marking quality' : undefined
      },
      qualityMetrics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store verification
    doubleMarkingVerifications.set(verificationId, verification);

    return NextResponse.json({
      success: true,
      data: verification,
      message: 'Double marking verification created successfully'
    });

  } catch (error) {
    console.error('Create double marking verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get double marking verifications
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

    if (!canVerifyDoubleMarking(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions for double marking verification' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const examId = searchParams.get('examId') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const significantOnly = searchParams.get('significantOnly') === 'true';
    const escalatedOnly = searchParams.get('escalatedOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all verifications
    let verifications = Array.from(doubleMarkingVerifications.values());

    // Apply filters
    if (status) {
      verifications = verifications.filter(verification => verification.verification.status === status);
    }

    if (examId) {
      verifications = verifications.filter(verification => verification.examId === examId);
    }

    if (subjectCode) {
      verifications = verifications.filter(verification => verification.subjectCode === subjectCode);
    }

    if (significantOnly) {
      verifications = verifications.filter(verification => verification.discrepancy.isSignificant);
    }

    if (escalatedOnly) {
      verifications = verifications.filter(verification => verification.escalation.isEscalated);
    }

    // Sort by discrepancy significance and creation date
    verifications.sort((a, b) => {
      if (a.discrepancy.isSignificant !== b.discrepancy.isSignificant) {
        return a.discrepancy.isSignificant ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Calculate pagination
    const totalVerifications = verifications.length;
    const totalPages = Math.ceil(totalVerifications / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVerifications = verifications.slice(startIndex, endIndex);

    // Calculate statistics
    const statistics = {
      total: totalVerifications,
      byStatus: {
        pending: verifications.filter(v => v.verification.status === 'pending').length,
        reviewed: verifications.filter(v => v.verification.status === 'reviewed').length,
        resolved: verifications.filter(v => v.verification.status === 'resolved').length,
        escalated: verifications.filter(v => v.verification.status === 'escalated').length
      },
      significantDiscrepancies: verifications.filter(v => v.discrepancy.isSignificant).length,
      escalatedCases: verifications.filter(v => v.escalation.isEscalated).length,
      averageDiscrepancy: verifications.length > 0 ? 
        Math.round(verifications.reduce((sum, v) => sum + v.discrepancy.percentageDifference, 0) / verifications.length) : 0,
      qualityDistribution: {
        excellent: verifications.filter(v => v.qualityMetrics.markingQuality === 'excellent').length,
        good: verifications.filter(v => v.qualityMetrics.markingQuality === 'good').length,
        acceptable: verifications.filter(v => v.qualityMetrics.markingQuality === 'acceptable').length,
        poor: verifications.filter(v => v.qualityMetrics.markingQuality === 'poor').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        verifications: paginatedVerifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalVerifications,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        statistics
      },
      message: 'Double marking verifications retrieved successfully'
    });

  } catch (error) {
    console.error('Get double marking verifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
