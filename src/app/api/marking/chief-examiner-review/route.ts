import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();
const doubleMarkingVerifications: Map<string, any> = new Map();

// Chief examiner reviews storage
const chiefExaminerReviews: Map<string, {
  id: string;
  examId: string;
  subjectCode: string;
  paperNumber: number;
  chiefExaminerId: string;
  chiefExaminerName: string;
  reviewType: 'sample_review' | 'discrepancy_review' | 'quality_review' | 'final_moderation';
  scriptsReviewed: Array<{
    scriptId: string;
    candidateNumber: string;
    originalMarks: number;
    reviewedMarks: number;
    adjustment: number;
    adjustmentReason: string;
    markingQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
    examinerFeedback: string;
    recommendations: string[];
  }>;
  overallAssessment: {
    markingStandard: 'too_lenient' | 'appropriate' | 'too_strict';
    consistency: number; // 1-5
    accuracy: number; // 1-5
    adherenceToScheme: number; // 1-5
    overallQuality: number; // 1-5
  };
  recommendations: {
    gradeBoundaryAdjustment: boolean;
    additionalModeration: boolean;
    examinerRetraining: boolean;
    markingSchemeRevision: boolean;
    specificActions: string[];
  };
  statistics: {
    totalScriptsReviewed: number;
    scriptsAdjusted: number;
    averageAdjustment: number;
    adjustmentRange: { min: number; max: number };
    qualityDistribution: {
      excellent: number;
      good: number;
      acceptable: number;
      poor: number;
    };
  };
  status: 'in_progress' | 'completed' | 'approved';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  approvedAt?: string;
}> = new Map();

// Helper function to check chief examiner access
const isChiefExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner'; // In production, check specific chief examiner role
};

// Calculate marking quality based on various factors
const assessMarkingQuality = (originalMarks: number, reviewedMarks: number, maxMarks: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
  const difference = Math.abs(originalMarks - reviewedMarks);
  const percentageDifference = maxMarks > 0 ? (difference / maxMarks) * 100 : 0;

  if (percentageDifference <= 2) return 'excellent';
  if (percentageDifference <= 5) return 'good';
  if (percentageDifference <= 10) return 'acceptable';
  return 'poor';
};

// PUT - Submit chief examiner review
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isChiefExaminer(token)) {
      return NextResponse.json(
        { success: false, message: 'Chief examiner access required' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    const body = await request.json();
    const {
      examId,
      subjectCode,
      paperNumber,
      reviewType,
      scriptsReviewed,
      overallAssessment,
      recommendations,
      action = 'create'
    } = body;

    // Validate required fields
    if (!examId || !subjectCode || !paperNumber || !reviewType || !scriptsReviewed) {
      return NextResponse.json(
        { success: false, message: 'Missing required review information' },
        { status: 400 }
      );
    }

    let reviewId: string;
    let existingReview: any = null;

    if (action === 'update' && body.reviewId) {
      reviewId = body.reviewId;
      existingReview = chiefExaminerReviews.get(reviewId);
      if (!existingReview) {
        return NextResponse.json(
          { success: false, message: 'Review not found' },
          { status: 404 }
        );
      }
    } else {
      // Check if review already exists for this exam/paper
      existingReview = Array.from(chiefExaminerReviews.values()).find(
        review => review.examId === examId && 
                 review.subjectCode === subjectCode && 
                 review.paperNumber === paperNumber &&
                 review.reviewType === reviewType
      );

      if (existingReview) {
        reviewId = existingReview.id;
      } else {
        reviewId = `CHIEF-REVIEW-${examId}-${subjectCode}-P${paperNumber}-${Date.now()}`;
      }
    }

    // Process scripts reviewed
    const processedScripts = scriptsReviewed.map((script: any) => {
      const adjustment = script.reviewedMarks - script.originalMarks;
      const markingQuality = assessMarkingQuality(
        script.originalMarks, 
        script.reviewedMarks, 
        script.maxMarks || 100
      );

      return {
        scriptId: script.scriptId,
        candidateNumber: script.candidateNumber,
        originalMarks: script.originalMarks,
        reviewedMarks: script.reviewedMarks,
        adjustment,
        adjustmentReason: script.adjustmentReason || '',
        markingQuality,
        examinerFeedback: script.examinerFeedback || '',
        recommendations: script.recommendations || []
      };
    });

    // Calculate statistics
    const totalScriptsReviewed = processedScripts.length;
    const scriptsAdjusted = processedScripts.filter(script => script.adjustment !== 0).length;
    const adjustments = processedScripts.map(script => script.adjustment);
    const averageAdjustment = adjustments.length > 0 ? 
      Math.round(adjustments.reduce((sum, adj) => sum + adj, 0) / adjustments.length * 100) / 100 : 0;
    
    const adjustmentRange = {
      min: adjustments.length > 0 ? Math.min(...adjustments) : 0,
      max: adjustments.length > 0 ? Math.max(...adjustments) : 0
    };

    const qualityDistribution = {
      excellent: processedScripts.filter(s => s.markingQuality === 'excellent').length,
      good: processedScripts.filter(s => s.markingQuality === 'good').length,
      acceptable: processedScripts.filter(s => s.markingQuality === 'acceptable').length,
      poor: processedScripts.filter(s => s.markingQuality === 'poor').length
    };

    // Create or update review
    const review = {
      id: reviewId,
      examId,
      subjectCode,
      paperNumber,
      chiefExaminerId: userId,
      chiefExaminerName: user?.fullName || 'Chief Examiner',
      reviewType: reviewType as 'sample_review' | 'discrepancy_review' | 'quality_review' | 'final_moderation',
      scriptsReviewed: processedScripts,
      overallAssessment: overallAssessment || {
        markingStandard: 'appropriate',
        consistency: 4,
        accuracy: 4,
        adherenceToScheme: 4,
        overallQuality: 4
      },
      recommendations: recommendations || {
        gradeBoundaryAdjustment: false,
        additionalModeration: false,
        examinerRetraining: false,
        markingSchemeRevision: false,
        specificActions: []
      },
      statistics: {
        totalScriptsReviewed,
        scriptsAdjusted,
        averageAdjustment,
        adjustmentRange,
        qualityDistribution
      },
      status: body.status || 'in_progress',
      createdAt: existingReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: body.status === 'completed' ? new Date().toISOString() : existingReview?.completedAt,
      approvedAt: body.status === 'approved' ? new Date().toISOString() : existingReview?.approvedAt
    };

    // Apply adjustments to original markings
    for (const script of processedScripts) {
      if (script.adjustment !== 0) {
        // Find and update the original marking
        const originalMarking = Array.from(markingScores.values()).find(
          marking => marking.scriptId === script.scriptId
        );

        if (originalMarking) {
          // Create moderation entry
          originalMarking.moderation = {
            isModerated: true,
            moderatedBy: userId,
            moderatedAt: new Date().toISOString(),
            moderationComments: script.adjustmentReason,
            finalMarks: script.reviewedMarks,
            adjustments: [{
              questionId: 'overall',
              originalMarks: script.originalMarks,
              adjustedMarks: script.reviewedMarks,
              reason: script.adjustmentReason
            }]
          };

          originalMarking.totalMarks = script.reviewedMarks;
          originalMarking.percentage = originalMarking.totalMaxMarks > 0 ? 
            Math.round((script.reviewedMarks / originalMarking.totalMaxMarks) * 100) : 0;
          originalMarking.status = 'moderated';
          originalMarking.updatedAt = new Date().toISOString();

          markingScores.set(originalMarking.id, originalMarking);
        }
      }
    }

    // Store review
    chiefExaminerReviews.set(reviewId, review);

    return NextResponse.json({
      success: true,
      data: review,
      message: action === 'update' ? 'Chief examiner review updated successfully' : 'Chief examiner review created successfully'
    });

  } catch (error) {
    console.error('Chief examiner review error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get chief examiner reviews
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

    if (!isChiefExaminer(token)) {
      return NextResponse.json(
        { success: false, message: 'Chief examiner access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const reviewType = searchParams.get('reviewType') || '';
    const status = searchParams.get('status') || '';

    // Get all reviews
    let reviews = Array.from(chiefExaminerReviews.values());

    // Apply filters
    if (examId) {
      reviews = reviews.filter(review => review.examId === examId);
    }

    if (subjectCode) {
      reviews = reviews.filter(review => review.subjectCode === subjectCode);
    }

    if (reviewType) {
      reviews = reviews.filter(review => review.reviewType === reviewType);
    }

    if (status) {
      reviews = reviews.filter(review => review.status === status);
    }

    // Sort by creation date
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate summary statistics
    const summary = {
      totalReviews: reviews.length,
      byType: {
        sampleReview: reviews.filter(r => r.reviewType === 'sample_review').length,
        discrepancyReview: reviews.filter(r => r.reviewType === 'discrepancy_review').length,
        qualityReview: reviews.filter(r => r.reviewType === 'quality_review').length,
        finalModeration: reviews.filter(r => r.reviewType === 'final_moderation').length
      },
      byStatus: {
        inProgress: reviews.filter(r => r.status === 'in_progress').length,
        completed: reviews.filter(r => r.status === 'completed').length,
        approved: reviews.filter(r => r.status === 'approved').length
      },
      totalScriptsReviewed: reviews.reduce((sum, review) => sum + review.statistics.totalScriptsReviewed, 0),
      totalAdjustments: reviews.reduce((sum, review) => sum + review.statistics.scriptsAdjusted, 0),
      averageQuality: reviews.length > 0 ? 
        Math.round(reviews.reduce((sum, review) => sum + review.overallAssessment.overallQuality, 0) / reviews.length * 10) / 10 : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        summary
      },
      message: 'Chief examiner reviews retrieved successfully'
    });

  } catch (error) {
    console.error('Get chief examiner reviews error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
