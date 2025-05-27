import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Grade boundaries storage
const gradeBoundaries: Map<string, {
  id: string;
  examId: string;
  subjectCode: string;
  subjectName: string;
  examLevel: 'O Level' | 'A Level';
  examSession: string;
  boundaries: {
    A1?: number; A?: number;
    B2?: number; B?: number;
    B3?: number;
    C4?: number; C?: number;
    C5?: number;
    C6?: number;
    D7?: number; D?: number;
    E8?: number; E?: number;
    F9?: number; F?: number;
  };
  previousBoundaries?: {
    [grade: string]: number;
  };
  adjustmentHistory: Array<{
    adjustmentId: string;
    previousBoundaries: any;
    newBoundaries: any;
    reason: string;
    justification: string;
    adjustedBy: string;
    adjustedAt: string;
    impactAnalysis: {
      candidatesAffected: number;
      gradeChanges: Array<{
        candidateNumber: string;
        oldGrade: string;
        newGrade: string;
      }>;
    };
  }>;
  statistics: {
    totalCandidates: number;
    meanScore: number;
    standardDeviation: number;
    gradeDistribution: {
      [grade: string]: {
        count: number;
        percentage: number;
      };
    };
  };
  qualityMetrics: {
    reliability: number;
    validity: number;
    fairness: number;
    consistency: number;
  };
  approvalWorkflow: {
    status: 'draft' | 'pending_review' | 'reviewed' | 'approved' | 'published';
    submittedBy?: string;
    submittedAt?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewComments?: string;
    approvedBy?: string;
    approvedAt?: string;
    publishedAt?: string;
  };
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Helper function to check boundaries access
const canManageBoundaries = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Default grade boundaries
const getDefaultBoundaries = (examLevel: string): any => {
  if (examLevel === 'O Level') {
    return {
      A1: 80, B2: 70, B3: 60, C4: 50, C5: 45, C6: 40, D7: 30, E8: 20, F9: 0
    };
  } else { // A Level
    return {
      A: 80, B: 70, C: 60, D: 50, E: 40, F: 0
    };
  }
};

// Validate boundaries
const validateBoundaries = (boundaries: any, examLevel: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (examLevel === 'O Level') {
    const grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
    const values = grades.map(grade => boundaries[grade]).filter(val => val !== undefined);
    
    // Check descending order
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] < values[i + 1]) {
        errors.push(`Grade boundaries must be in descending order`);
        break;
      }
    }
    
    // Check range
    values.forEach((value, index) => {
      if (value < 0 || value > 100) {
        errors.push(`${grades[index]} boundary must be between 0 and 100`);
      }
    });
  } else {
    const grades = ['A', 'B', 'C', 'D', 'E', 'F'];
    const values = grades.map(grade => boundaries[grade]).filter(val => val !== undefined);
    
    // Similar validation for A Level
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] < values[i + 1]) {
        errors.push(`Grade boundaries must be in descending order`);
        break;
      }
    }
    
    values.forEach((value, index) => {
      if (value < 0 || value > 100) {
        errors.push(`${grades[index]} boundary must be between 0 and 100`);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
};

// PUT - Update grade boundaries
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

    if (!canManageBoundaries(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to manage grade boundaries' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      examId,
      subjectCode,
      subjectName,
      examLevel,
      examSession,
      boundaries,
      reason,
      justification,
      effectiveDate,
      action = 'create'
    } = body;

    // Validate required fields
    if (!examId || !subjectCode || !examLevel || !boundaries) {
      return NextResponse.json(
        { success: false, message: 'Missing required boundary information' },
        { status: 400 }
      );
    }

    // Validate boundaries
    const validation = validateBoundaries(boundaries, examLevel);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid boundaries', errors: validation.errors },
        { status: 400 }
      );
    }

    let boundaryId: string;
    let existingBoundary: any = null;

    if (action === 'update' && body.boundaryId) {
      boundaryId = body.boundaryId;
      existingBoundary = gradeBoundaries.get(boundaryId);
      if (!existingBoundary) {
        return NextResponse.json(
          { success: false, message: 'Boundary record not found' },
          { status: 404 }
        );
      }
    } else {
      // Check if boundaries already exist for this exam/subject
      existingBoundary = Array.from(gradeBoundaries.values()).find(
        boundary => boundary.examId === examId && 
                   boundary.subjectCode === subjectCode &&
                   boundary.examSession === examSession
      );

      if (existingBoundary) {
        boundaryId = existingBoundary.id;
      } else {
        boundaryId = `BOUNDARIES-${examId}-${subjectCode}-${Date.now()}`;
      }
    }

    // Create adjustment history entry if updating
    let adjustmentHistory = existingBoundary?.adjustmentHistory || [];
    if (existingBoundary && JSON.stringify(existingBoundary.boundaries) !== JSON.stringify(boundaries)) {
      const adjustmentId = `ADJ-${Date.now()}`;
      adjustmentHistory.push({
        adjustmentId,
        previousBoundaries: existingBoundary.boundaries,
        newBoundaries: boundaries,
        reason: reason || 'Boundary adjustment',
        justification: justification || 'Administrative adjustment',
        adjustedBy: userId,
        adjustedAt: new Date().toISOString(),
        impactAnalysis: {
          candidatesAffected: 0, // Would be calculated from actual candidate data
          gradeChanges: [] // Would be calculated from actual candidate data
        }
      });
    }

    // Calculate quality metrics (simplified)
    const qualityMetrics = {
      reliability: 0.85, // Would be calculated from actual data
      validity: 0.90,
      fairness: 0.88,
      consistency: 0.92
    };

    // Create or update boundary record
    const boundaryRecord = {
      id: boundaryId,
      examId,
      subjectCode,
      subjectName: subjectName || subjectCode,
      examLevel: examLevel as 'O Level' | 'A Level',
      examSession: examSession || '2025',
      boundaries,
      previousBoundaries: existingBoundary?.boundaries,
      adjustmentHistory,
      statistics: existingBoundary?.statistics || {
        totalCandidates: 0,
        meanScore: 0,
        standardDeviation: 0,
        gradeDistribution: {}
      },
      qualityMetrics,
      approvalWorkflow: {
        status: 'draft' as const,
        submittedBy: userId,
        submittedAt: new Date().toISOString()
      },
      effectiveDate: effectiveDate || new Date().toISOString(),
      expiryDate: body.expiryDate,
      isActive: true,
      createdBy: existingBoundary?.createdBy || userId,
      createdAt: existingBoundary?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store boundary record
    gradeBoundaries.set(boundaryId, boundaryRecord);

    return NextResponse.json({
      success: true,
      data: boundaryRecord,
      message: action === 'update' ? 'Grade boundaries updated successfully' : 'Grade boundaries created successfully'
    });

  } catch (error) {
    console.error('Update grade boundaries error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get grade boundaries
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

    if (!canManageBoundaries(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view grade boundaries' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const examSession = searchParams.get('examSession') || '';
    const status = searchParams.get('status') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Get all boundaries
    let boundaries = Array.from(gradeBoundaries.values());

    // Apply filters
    if (examId) {
      boundaries = boundaries.filter(boundary => boundary.examId === examId);
    }

    if (subjectCode) {
      boundaries = boundaries.filter(boundary => boundary.subjectCode === subjectCode);
    }

    if (examLevel) {
      boundaries = boundaries.filter(boundary => boundary.examLevel === examLevel);
    }

    if (examSession) {
      boundaries = boundaries.filter(boundary => boundary.examSession === examSession);
    }

    if (status) {
      boundaries = boundaries.filter(boundary => boundary.approvalWorkflow.status === status);
    }

    if (activeOnly) {
      boundaries = boundaries.filter(boundary => boundary.isActive);
    }

    // Sort by creation date
    boundaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate summary statistics
    const summary = {
      totalBoundaries: boundaries.length,
      byLevel: {
        oLevel: boundaries.filter(b => b.examLevel === 'O Level').length,
        aLevel: boundaries.filter(b => b.examLevel === 'A Level').length
      },
      byStatus: {
        draft: boundaries.filter(b => b.approvalWorkflow.status === 'draft').length,
        pendingReview: boundaries.filter(b => b.approvalWorkflow.status === 'pending_review').length,
        reviewed: boundaries.filter(b => b.approvalWorkflow.status === 'reviewed').length,
        approved: boundaries.filter(b => b.approvalWorkflow.status === 'approved').length,
        published: boundaries.filter(b => b.approvalWorkflow.status === 'published').length
      },
      activeBoundaries: boundaries.filter(b => b.isActive).length,
      recentAdjustments: boundaries.filter(b => 
        b.adjustmentHistory.length > 0 && 
        new Date(b.adjustmentHistory[b.adjustmentHistory.length - 1].adjustedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };

    return NextResponse.json({
      success: true,
      data: {
        boundaries,
        summary
      },
      message: 'Grade boundaries retrieved successfully'
    });

  } catch (error) {
    console.error('Get grade boundaries error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
