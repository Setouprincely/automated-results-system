import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();

// Score normalization storage
const scoreNormalizations: Map<string, {
  id: string;
  examId: string;
  subjectCode: string;
  subjectName: string;
  examLevel: 'O Level' | 'A Level';
  normalizationType: 'linear' | 'z_score' | 'percentile' | 'equipercentile' | 'custom';
  parameters: {
    targetMean?: number;
    targetStandardDeviation?: number;
    scalingFactor?: number;
    referenceDistribution?: any;
    customFormula?: string;
  };
  originalStatistics: {
    mean: number;
    standardDeviation: number;
    median: number;
    range: { min: number; max: number };
    distribution: any;
  };
  normalizedStatistics: {
    mean: number;
    standardDeviation: number;
    median: number;
    range: { min: number; max: number };
    distribution: any;
  };
  candidateAdjustments: Array<{
    candidateId: string;
    candidateNumber: string;
    originalScore: number;
    normalizedScore: number;
    adjustment: number;
    originalGrade: string;
    normalizedGrade: string;
    gradeChanged: boolean;
  }>;
  qualityMetrics: {
    correlationCoefficient: number;
    reliabilityIndex: number;
    fairnessIndex: number;
    validityMeasure: number;
  };
  justification: {
    reason: string;
    methodology: string;
    expectedOutcome: string;
    riskAssessment: string;
  };
  approvalWorkflow: {
    status: 'draft' | 'pending_review' | 'reviewed' | 'approved' | 'applied';
    submittedBy?: string;
    submittedAt?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewComments?: string;
    approvedBy?: string;
    approvedAt?: string;
    appliedAt?: string;
  };
  impactAnalysis: {
    candidatesAffected: number;
    gradeChanges: {
      improved: number;
      declined: number;
      unchanged: number;
    };
    distributionShift: any;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Helper function to check normalization access
const canNormalizeScores = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate statistics
const calculateStatistics = (scores: number[]): any => {
  if (scores.length === 0) return null;

  const sortedScores = [...scores].sort((a, b) => a - b);
  const sum = scores.reduce((acc, score) => acc + score, 0);
  const mean = sum / scores.length;
  
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  const median = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];

  // Create distribution
  const distribution = {};
  const binSize = 10;
  for (let i = 0; i <= 100; i += binSize) {
    const binKey = `${i}-${i + binSize - 1}`;
    distribution[binKey] = scores.filter(score => score >= i && score < i + binSize).length;
  }

  return {
    mean: Math.round(mean * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    median: Math.round(median * 100) / 100,
    range: { min: sortedScores[0], max: sortedScores[sortedScores.length - 1] },
    distribution
  };
};

// Apply normalization
const applyNormalization = (scores: any[], normalizationType: string, parameters: any): any[] => {
  const originalScores = scores.map(s => s.originalScore);
  const originalStats = calculateStatistics(originalScores);

  switch (normalizationType) {
    case 'linear':
      return applyLinearNormalization(scores, parameters);
    case 'z_score':
      return applyZScoreNormalization(scores, parameters, originalStats);
    case 'percentile':
      return applyPercentileNormalization(scores, parameters);
    case 'equipercentile':
      return applyEquipercentileNormalization(scores, parameters);
    case 'custom':
      return applyCustomNormalization(scores, parameters);
    default:
      return scores;
  }
};

// Linear normalization
const applyLinearNormalization = (scores: any[], parameters: any): any[] => {
  const { scalingFactor = 1.1 } = parameters;
  
  return scores.map(candidate => {
    const normalizedScore = Math.min(100, Math.round(candidate.originalScore * scalingFactor));
    return {
      ...candidate,
      normalizedScore,
      adjustment: normalizedScore - candidate.originalScore
    };
  });
};

// Z-score normalization
const applyZScoreNormalization = (scores: any[], parameters: any, originalStats: any): any[] => {
  const { targetMean = 50, targetStandardDeviation = 15 } = parameters;
  
  return scores.map(candidate => {
    const zScore = (candidate.originalScore - originalStats.mean) / originalStats.standardDeviation;
    const normalizedScore = Math.max(0, Math.min(100, Math.round(zScore * targetStandardDeviation + targetMean)));
    
    return {
      ...candidate,
      normalizedScore,
      adjustment: normalizedScore - candidate.originalScore
    };
  });
};

// Percentile normalization
const applyPercentileNormalization = (scores: any[], parameters: any): any[] => {
  const sortedScores = [...scores].sort((a, b) => a.originalScore - b.originalScore);
  
  return scores.map(candidate => {
    const rank = sortedScores.findIndex(s => s.candidateId === candidate.candidateId) + 1;
    const percentile = (rank / sortedScores.length) * 100;
    const normalizedScore = Math.round(percentile);
    
    return {
      ...candidate,
      normalizedScore,
      adjustment: normalizedScore - candidate.originalScore
    };
  });
};

// Equipercentile normalization
const applyEquipercentileNormalization = (scores: any[], parameters: any): any[] => {
  const { referenceDistribution } = parameters;
  
  // Simplified equipercentile - would need reference distribution in practice
  return scores.map(candidate => {
    const normalizedScore = Math.min(100, Math.round(candidate.originalScore * 1.05));
    return {
      ...candidate,
      normalizedScore,
      adjustment: normalizedScore - candidate.originalScore
    };
  });
};

// Custom normalization
const applyCustomNormalization = (scores: any[], parameters: any): any[] => {
  const { customFormula } = parameters;
  
  // Simplified custom formula application
  return scores.map(candidate => {
    let normalizedScore = candidate.originalScore;
    
    // Apply custom formula (simplified - in practice would parse and evaluate)
    if (customFormula === 'sqrt_transform') {
      normalizedScore = Math.round(Math.sqrt(candidate.originalScore) * 10);
    } else if (customFormula === 'log_transform') {
      normalizedScore = Math.round(Math.log(candidate.originalScore + 1) * 20);
    }
    
    normalizedScore = Math.max(0, Math.min(100, normalizedScore));
    
    return {
      ...candidate,
      normalizedScore,
      adjustment: normalizedScore - candidate.originalScore
    };
  });
};

// Calculate grade based on score
const calculateGrade = (score: number, examLevel: string): string => {
  if (examLevel === 'O Level') {
    if (score >= 80) return 'A1';
    if (score >= 70) return 'B2';
    if (score >= 60) return 'B3';
    if (score >= 50) return 'C4';
    if (score >= 45) return 'C5';
    if (score >= 40) return 'C6';
    if (score >= 30) return 'D7';
    if (score >= 20) return 'E8';
    return 'F9';
  } else {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  }
};

// POST - Apply score normalization
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

    if (!canNormalizeScores(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to normalize scores' },
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
      normalizationType,
      parameters,
      justification,
      applyImmediately = false
    } = body;

    // Validate required fields
    if (!examId || !subjectCode || !examLevel || !normalizationType || !justification) {
      return NextResponse.json(
        { success: false, message: 'Missing required normalization information' },
        { status: 400 }
      );
    }

    // Get all markings for this exam and subject
    const examMarkings = Array.from(markingScores.values()).filter(
      marking => marking.examId === examId && 
                marking.subjectCode === subjectCode &&
                (marking.status === 'submitted' || marking.status === 'verified' || marking.status === 'moderated')
    );

    if (examMarkings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No completed markings found for this exam and subject' },
        { status: 404 }
      );
    }

    // Check if normalization already exists
    const existingNormalization = Array.from(scoreNormalizations.values()).find(
      norm => norm.examId === examId && norm.subjectCode === subjectCode
    );

    if (existingNormalization && existingNormalization.approvalWorkflow.status === 'applied') {
      return NextResponse.json(
        { success: false, message: 'Score normalization already applied for this exam and subject' },
        { status: 409 }
      );
    }

    // Prepare candidate scores
    const candidateScores = examMarkings.map(marking => ({
      candidateId: marking.candidateId || marking.scriptId,
      candidateNumber: marking.candidateNumber,
      originalScore: marking.moderation?.finalMarks || marking.totalMarks,
      originalGrade: calculateGrade(marking.moderation?.finalMarks || marking.totalMarks, examLevel)
    }));

    // Calculate original statistics
    const originalScores = candidateScores.map(c => c.originalScore);
    const originalStatistics = calculateStatistics(originalScores);

    // Apply normalization
    const normalizedCandidates = applyNormalization(candidateScores, normalizationType, parameters);

    // Add normalized grades
    const candidateAdjustments = normalizedCandidates.map(candidate => {
      const normalizedGrade = calculateGrade(candidate.normalizedScore, examLevel);
      return {
        ...candidate,
        normalizedGrade,
        gradeChanged: candidate.originalGrade !== normalizedGrade
      };
    });

    // Calculate normalized statistics
    const normalizedScores = candidateAdjustments.map(c => c.normalizedScore);
    const normalizedStatistics = calculateStatistics(normalizedScores);

    // Calculate quality metrics
    const correlationCoefficient = calculateCorrelation(originalScores, normalizedScores);
    const qualityMetrics = {
      correlationCoefficient,
      reliabilityIndex: 0.92, // Would be calculated from actual data
      fairnessIndex: 0.88,
      validityMeasure: 0.90
    };

    // Calculate impact analysis
    const gradeChanges = {
      improved: candidateAdjustments.filter(c => c.gradeChanged && c.normalizedScore > c.originalScore).length,
      declined: candidateAdjustments.filter(c => c.gradeChanged && c.normalizedScore < c.originalScore).length,
      unchanged: candidateAdjustments.filter(c => !c.gradeChanged).length
    };

    // Generate normalization ID
    const normalizationId = existingNormalization?.id || `NORM-${examId}-${subjectCode}-${Date.now()}`;

    // Create normalization record
    const normalization = {
      id: normalizationId,
      examId,
      subjectCode,
      subjectName: subjectName || subjectCode,
      examLevel: examLevel as 'O Level' | 'A Level',
      normalizationType: normalizationType as 'linear' | 'z_score' | 'percentile' | 'equipercentile' | 'custom',
      parameters: parameters || {},
      originalStatistics: originalStatistics!,
      normalizedStatistics: normalizedStatistics!,
      candidateAdjustments,
      qualityMetrics,
      justification,
      approvalWorkflow: {
        status: applyImmediately ? 'applied' : 'draft',
        submittedBy: userId,
        submittedAt: new Date().toISOString(),
        appliedAt: applyImmediately ? new Date().toISOString() : undefined
      },
      impactAnalysis: {
        candidatesAffected: candidateAdjustments.filter(c => c.adjustment !== 0).length,
        gradeChanges,
        distributionShift: {
          meanChange: normalizedStatistics.mean - originalStatistics.mean,
          stdDevChange: normalizedStatistics.standardDeviation - originalStatistics.standardDeviation
        }
      },
      createdBy: userId,
      createdAt: existingNormalization?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Apply normalization to actual scores if requested
    if (applyImmediately) {
      for (const adjustment of candidateAdjustments) {
        const originalMarking = examMarkings.find(m => 
          (m.candidateId || m.scriptId) === adjustment.candidateId
        );

        if (originalMarking) {
          originalMarking.totalMarks = adjustment.normalizedScore;
          originalMarking.percentage = adjustment.normalizedScore;
          originalMarking.grade = adjustment.normalizedGrade;
          originalMarking.normalization = {
            isNormalized: true,
            normalizationId,
            originalScore: adjustment.originalScore,
            adjustment: adjustment.adjustment
          };
          originalMarking.updatedAt = new Date().toISOString();

          markingScores.set(originalMarking.id, originalMarking);
        }
      }
    }

    // Store normalization
    scoreNormalizations.set(normalizationId, normalization);

    return NextResponse.json({
      success: true,
      data: normalization,
      message: applyImmediately ? 'Score normalization applied successfully' : 'Score normalization created successfully'
    });

  } catch (error) {
    console.error('Normalize scores error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate correlation
const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
};
