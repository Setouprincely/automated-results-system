import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const markingScores: Map<string, any> = new Map();

// Grade calculations storage
const gradeCalculations: Map<string, {
  id: string;
  examId: string;
  subjectCode: string;
  examLevel: 'O Level' | 'A Level';
  calculationType: 'standard' | 'normalized' | 'curved' | 'custom';
  gradeBoundaries: {
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
  statistics: {
    totalCandidates: number;
    meanScore: number;
    standardDeviation: number;
    median: number;
    mode: number;
    range: { min: number; max: number };
    quartiles: { q1: number; q2: number; q3: number };
  };
  gradeDistribution: {
    [grade: string]: {
      count: number;
      percentage: number;
      scoreRange: { min: number; max: number };
    };
  };
  candidateGrades: Array<{
    candidateId: string;
    candidateNumber: string;
    rawScore: number;
    adjustedScore?: number;
    percentage: number;
    grade: string;
    position: number;
    remarks?: string;
  }>;
  qualityIndicators: {
    reliability: number;
    validity: number;
    discrimination: number;
    difficulty: number;
  };
  adjustments: Array<{
    type: 'boundary_adjustment' | 'score_normalization' | 'curve_application';
    reason: string;
    appliedBy: string;
    appliedAt: string;
    details: any;
  }>;
  status: 'draft' | 'calculated' | 'reviewed' | 'approved' | 'published';
  calculatedBy: string;
  calculatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
}> = new Map();

// Helper function to check grading access
const canCalculateGrades = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Default grade boundaries
const getDefaultGradeBoundaries = (examLevel: string): any => {
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

// Calculate statistical measures
const calculateStatistics = (scores: number[]): any => {
  if (scores.length === 0) return null;

  const sortedScores = [...scores].sort((a, b) => a - b);
  const sum = scores.reduce((acc, score) => acc + score, 0);
  const mean = sum / scores.length;
  
  // Standard deviation
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Median
  const median = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];
  
  // Mode
  const frequency: { [key: number]: number } = {};
  scores.forEach(score => frequency[score] = (frequency[score] || 0) + 1);
  const mode = parseInt(Object.keys(frequency).reduce((a, b) => frequency[parseInt(a)] > frequency[parseInt(b)] ? a : b));
  
  // Quartiles
  const q1Index = Math.floor(sortedScores.length * 0.25);
  const q3Index = Math.floor(sortedScores.length * 0.75);
  
  return {
    totalCandidates: scores.length,
    meanScore: Math.round(mean * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    median: Math.round(median * 100) / 100,
    mode,
    range: { min: sortedScores[0], max: sortedScores[sortedScores.length - 1] },
    quartiles: {
      q1: sortedScores[q1Index],
      q2: median,
      q3: sortedScores[q3Index]
    }
  };
};

// Assign grades based on boundaries
const assignGrades = (scores: any[], boundaries: any, examLevel: string): any[] => {
  const sortedScores = [...scores].sort((a, b) => b.rawScore - a.rawScore);
  
  return sortedScores.map((candidate, index) => {
    let grade = examLevel === 'O Level' ? 'F9' : 'F';
    
    if (examLevel === 'O Level') {
      if (candidate.rawScore >= boundaries.A1) grade = 'A1';
      else if (candidate.rawScore >= boundaries.B2) grade = 'B2';
      else if (candidate.rawScore >= boundaries.B3) grade = 'B3';
      else if (candidate.rawScore >= boundaries.C4) grade = 'C4';
      else if (candidate.rawScore >= boundaries.C5) grade = 'C5';
      else if (candidate.rawScore >= boundaries.C6) grade = 'C6';
      else if (candidate.rawScore >= boundaries.D7) grade = 'D7';
      else if (candidate.rawScore >= boundaries.E8) grade = 'E8';
    } else {
      if (candidate.rawScore >= boundaries.A) grade = 'A';
      else if (candidate.rawScore >= boundaries.B) grade = 'B';
      else if (candidate.rawScore >= boundaries.C) grade = 'C';
      else if (candidate.rawScore >= boundaries.D) grade = 'D';
      else if (candidate.rawScore >= boundaries.E) grade = 'E';
    }
    
    return {
      ...candidate,
      grade,
      position: index + 1,
      percentage: Math.round((candidate.rawScore / 100) * 100) // Assuming max score is 100
    };
  });
};

// Calculate grade distribution
const calculateGradeDistribution = (candidateGrades: any[], examLevel: string): any => {
  const distribution: any = {};
  const grades = examLevel === 'O Level' 
    ? ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']
    : ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Initialize distribution
  grades.forEach(grade => {
    distribution[grade] = { count: 0, percentage: 0, scoreRange: { min: 0, max: 0 } };
  });
  
  // Count grades
  candidateGrades.forEach(candidate => {
    if (distribution[candidate.grade]) {
      distribution[candidate.grade].count++;
    }
  });
  
  // Calculate percentages and score ranges
  const totalCandidates = candidateGrades.length;
  Object.keys(distribution).forEach(grade => {
    distribution[grade].percentage = totalCandidates > 0 
      ? Math.round((distribution[grade].count / totalCandidates) * 100 * 100) / 100 
      : 0;
    
    const gradeScores = candidateGrades
      .filter(c => c.grade === grade)
      .map(c => c.rawScore);
    
    if (gradeScores.length > 0) {
      distribution[grade].scoreRange = {
        min: Math.min(...gradeScores),
        max: Math.max(...gradeScores)
      };
    }
  });
  
  return distribution;
};

// POST - Calculate grades
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

    if (!canCalculateGrades(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to calculate grades' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      examId,
      subjectCode,
      examLevel,
      calculationType = 'standard',
      customBoundaries,
      normalizationParameters,
      curveParameters
    } = body;

    // Validate required fields
    if (!examId || !subjectCode || !examLevel) {
      return NextResponse.json(
        { success: false, message: 'Missing required calculation information' },
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

    // Check if calculation already exists
    const existingCalculation = Array.from(gradeCalculations.values()).find(
      calc => calc.examId === examId && calc.subjectCode === subjectCode
    );

    if (existingCalculation && existingCalculation.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Grade calculation already exists and is not in draft status' },
        { status: 409 }
      );
    }

    // Prepare candidate scores
    let candidateScores = examMarkings.map(marking => ({
      candidateId: marking.candidateId || marking.scriptId,
      candidateNumber: marking.candidateNumber,
      rawScore: marking.moderation?.finalMarks || marking.totalMarks,
      adjustedScore: undefined
    }));

    // Apply normalization or curve if specified
    if (calculationType === 'normalized' && normalizationParameters) {
      candidateScores = applyNormalization(candidateScores, normalizationParameters);
    } else if (calculationType === 'curved' && curveParameters) {
      candidateScores = applyCurve(candidateScores, curveParameters);
    }

    // Get grade boundaries
    let gradeBoundaries = customBoundaries || getDefaultGradeBoundaries(examLevel);

    // Calculate statistics
    const rawScores = candidateScores.map(c => c.rawScore);
    const statistics = calculateStatistics(rawScores);

    // Assign grades
    const candidateGrades = assignGrades(candidateScores, gradeBoundaries, examLevel);

    // Calculate grade distribution
    const gradeDistribution = calculateGradeDistribution(candidateGrades, examLevel);

    // Calculate quality indicators
    const qualityIndicators = {
      reliability: calculateReliability(rawScores),
      validity: 0.85, // Would be calculated based on content validity
      discrimination: calculateDiscrimination(candidateGrades),
      difficulty: statistics ? (statistics.meanScore / 100) : 0.5
    };

    // Generate calculation ID
    const calculationId = existingCalculation?.id || `GRADE-CALC-${examId}-${subjectCode}-${Date.now()}`;

    // Create grade calculation
    const gradeCalculation = {
      id: calculationId,
      examId,
      subjectCode,
      examLevel: examLevel as 'O Level' | 'A Level',
      calculationType: calculationType as 'standard' | 'normalized' | 'curved' | 'custom',
      gradeBoundaries,
      statistics: statistics!,
      gradeDistribution,
      candidateGrades,
      qualityIndicators,
      adjustments: [],
      status: 'calculated' as const,
      calculatedBy: userId,
      calculatedAt: new Date().toISOString()
    };

    // Store calculation
    gradeCalculations.set(calculationId, gradeCalculation);

    return NextResponse.json({
      success: true,
      data: gradeCalculation,
      message: 'Grades calculated successfully'
    });

  } catch (error) {
    console.error('Calculate grades error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const applyNormalization = (scores: any[], parameters: any): any[] => {
  const { targetMean = 50, targetStdDev = 15 } = parameters;
  const rawScores = scores.map(s => s.rawScore);
  const currentMean = rawScores.reduce((sum, score) => sum + score, 0) / rawScores.length;
  const currentStdDev = Math.sqrt(rawScores.reduce((sum, score) => sum + Math.pow(score - currentMean, 2), 0) / rawScores.length);
  
  return scores.map(candidate => ({
    ...candidate,
    adjustedScore: Math.round(((candidate.rawScore - currentMean) / currentStdDev) * targetStdDev + targetMean)
  }));
};

const applyCurve = (scores: any[], parameters: any): any[] => {
  const { curveType = 'linear', adjustment = 5 } = parameters;
  
  return scores.map(candidate => ({
    ...candidate,
    adjustedScore: Math.min(100, candidate.rawScore + adjustment)
  }));
};

const calculateReliability = (scores: number[]): number => {
  // Simplified reliability calculation (Cronbach's alpha approximation)
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  
  // Simplified calculation - in practice would use item-level data
  return Math.min(1, Math.max(0, 0.7 + (variance / 1000))); // Placeholder calculation
};

const calculateDiscrimination = (candidateGrades: any[]): number => {
  // Calculate discrimination index based on grade distribution
  const topGroup = candidateGrades.slice(0, Math.floor(candidateGrades.length * 0.27));
  const bottomGroup = candidateGrades.slice(-Math.floor(candidateGrades.length * 0.27));
  
  const topMean = topGroup.reduce((sum, c) => sum + c.rawScore, 0) / topGroup.length;
  const bottomMean = bottomGroup.reduce((sum, c) => sum + c.rawScore, 0) / bottomGroup.length;
  
  return Math.round(((topMean - bottomMean) / 100) * 100) / 100;
};
