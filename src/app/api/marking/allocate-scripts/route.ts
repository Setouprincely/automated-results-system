import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Script allocations storage (in production, use database)
const scriptAllocations: Map<string, {
  id: string;
  examId: string;
  examTitle: string;
  subjectCode: string;
  subjectName: string;
  paperNumber: number;
  examLevel: 'O Level' | 'A Level';
  totalScripts: number;
  allocatedScripts: number;
  remainingScripts: number;
  allocations: Array<{
    examinerId: string;
    examinerName: string;
    examinerEmail: string;
    specialization: string[];
    experience: number;
    scriptsAllocated: number;
    scriptsMarked: number;
    scriptsRemaining: number;
    allocationDate: string;
    deadline: string;
    status: 'allocated' | 'in_progress' | 'completed' | 'overdue';
    scripts: Array<{
      scriptId: string;
      candidateNumber: string;
      centerCode: string;
      markingStatus: 'pending' | 'in_progress' | 'completed' | 'verified';
      allocatedAt: string;
      markedAt?: string;
      verifiedAt?: string;
      priority: 'normal' | 'high' | 'urgent';
    }>;
  }>;
  markingScheme: {
    totalMarks: number;
    sections: Array<{
      sectionId: string;
      sectionName: string;
      maxMarks: number;
      questions: Array<{
        questionId: string;
        questionNumber: string;
        maxMarks: number;
        markingCriteria: string[];
        rubric?: string;
      }>;
    }>;
  };
  qualityAssurance: {
    doubleMarkingRequired: boolean;
    doubleMarkingPercentage: number;
    chiefExaminerReview: boolean;
    moderationRequired: boolean;
  };
  deadlines: {
    firstMarking: string;
    doubleMarking: string;
    moderation: string;
    finalSubmission: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Available examiners pool
const availableExaminers: Map<string, {
  id: string;
  name: string;
  email: string;
  qualifications: string[];
  specializations: string[];
  experience: number;
  markingHistory: {
    totalScriptsMarked: number;
    averageMarkingTime: number; // minutes per script
    qualityRating: number; // 1-5
    reliability: number; // 1-5
  };
  availability: {
    maxScriptsPerSession: number;
    preferredSubjects: string[];
    availableDates: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  currentWorkload: {
    activeAllocations: number;
    scriptsInProgress: number;
    upcomingDeadlines: number;
  };
  status: 'available' | 'busy' | 'unavailable';
}> = new Map();

// Initialize default examiners
const initializeDefaultExaminers = () => {
  const defaultExaminers = [
    {
      id: 'EXM-001',
      name: 'Dr. Alice Mbeki',
      email: 'alice.mbeki@education.cm',
      qualifications: ['PhD English Literature', 'TESOL Certificate'],
      specializations: ['English Literature', 'Creative Writing', 'Poetry'],
      experience: 12,
      markingHistory: {
        totalScriptsMarked: 2450,
        averageMarkingTime: 25,
        qualityRating: 4.8,
        reliability: 4.9
      },
      availability: {
        maxScriptsPerSession: 150,
        preferredSubjects: ['ALG', 'OLG'],
        availableDates: ['2025-07-01', '2025-07-02', '2025-07-03'],
        workingHours: { start: '08:00', end: '17:00' }
      },
      currentWorkload: {
        activeAllocations: 2,
        scriptsInProgress: 45,
        upcomingDeadlines: 1
      },
      status: 'available' as const
    },
    {
      id: 'EXM-002',
      name: 'Prof. Jean Fouda',
      email: 'jean.fouda@education.cm',
      qualifications: ['PhD Mathematics', 'Statistics Certificate'],
      specializations: ['Advanced Mathematics', 'Statistics', 'Calculus'],
      experience: 18,
      markingHistory: {
        totalScriptsMarked: 3200,
        averageMarkingTime: 30,
        qualityRating: 4.9,
        reliability: 5.0
      },
      availability: {
        maxScriptsPerSession: 120,
        preferredSubjects: ['AMH', 'OMH'],
        availableDates: ['2025-07-01', '2025-07-02'],
        workingHours: { start: '09:00', end: '18:00' }
      },
      currentWorkload: {
        activeAllocations: 1,
        scriptsInProgress: 30,
        upcomingDeadlines: 0
      },
      status: 'available' as const
    }
  ];

  defaultExaminers.forEach(examiner => {
    availableExaminers.set(examiner.id, examiner);
  });
};

// Initialize default examiners
initializeDefaultExaminers();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate optimal script allocation
const calculateOptimalAllocation = (totalScripts: number, examiners: any[]): any[] => {
  // Sort examiners by quality rating and availability
  const sortedExaminers = examiners.sort((a, b) => {
    const scoreA = (a.markingHistory.qualityRating * 0.4) + 
                   (a.markingHistory.reliability * 0.3) + 
                   ((5 - a.currentWorkload.activeAllocations) * 0.3);
    const scoreB = (b.markingHistory.qualityRating * 0.4) + 
                   (b.markingHistory.reliability * 0.3) + 
                   ((5 - b.currentWorkload.activeAllocations) * 0.3);
    return scoreB - scoreA;
  });

  const allocations = [];
  let remainingScripts = totalScripts;

  for (const examiner of sortedExaminers) {
    if (remainingScripts <= 0) break;

    const maxCapacity = examiner.availability.maxScriptsPerSession - examiner.currentWorkload.scriptsInProgress;
    const allocation = Math.min(remainingScripts, maxCapacity);

    if (allocation > 0) {
      allocations.push({
        examinerId: examiner.id,
        examinerName: examiner.name,
        examinerEmail: examiner.email,
        specialization: examiner.specializations,
        experience: examiner.experience,
        scriptsAllocated: allocation,
        scriptsMarked: 0,
        scriptsRemaining: allocation,
        allocationDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'allocated' as const,
        scripts: []
      });

      remainingScripts -= allocation;
    }
  }

  return allocations;
};

// POST - Allocate scripts to examiners
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

    if (!isAdminOrExaminer(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin or examiner access required' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      examId,
      examTitle,
      subjectCode,
      subjectName,
      paperNumber,
      examLevel,
      totalScripts,
      markingScheme,
      qualityAssurance,
      deadlines,
      allocationMethod = 'auto',
      manualAllocations,
      selectedExaminers
    } = body;

    // Validate required fields
    if (!examId || !subjectCode || !paperNumber || !totalScripts || !markingScheme) {
      return NextResponse.json(
        { success: false, message: 'Missing required allocation information' },
        { status: 400 }
      );
    }

    // Check if allocation already exists
    const existingAllocation = Array.from(scriptAllocations.values()).find(
      allocation => allocation.examId === examId && allocation.paperNumber === paperNumber
    );

    if (existingAllocation) {
      return NextResponse.json(
        { success: false, message: 'Script allocation already exists for this exam and paper' },
        { status: 409 }
      );
    }

    // Generate allocation ID
    const allocationId = `ALLOC-${examId}-P${paperNumber}-${Date.now()}`;

    let allocations = [];

    if (allocationMethod === 'auto') {
      // Get available examiners for this subject
      const suitableExaminers = Array.from(availableExaminers.values()).filter(examiner => 
        examiner.status === 'available' &&
        examiner.specializations.some(spec => spec.toLowerCase().includes(subjectName.toLowerCase())) &&
        examiner.currentWorkload.scriptsInProgress < examiner.availability.maxScriptsPerSession
      );

      if (suitableExaminers.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No suitable examiners available for this subject' },
          { status: 400 }
        );
      }

      allocations = calculateOptimalAllocation(totalScripts, suitableExaminers);
    } else if (allocationMethod === 'manual' && manualAllocations) {
      allocations = manualAllocations.map((allocation: any) => ({
        ...allocation,
        allocationDate: new Date().toISOString(),
        status: 'allocated' as const,
        scriptsMarked: 0,
        scriptsRemaining: allocation.scriptsAllocated,
        scripts: []
      }));
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid allocation method or missing manual allocations' },
        { status: 400 }
      );
    }

    // Generate script entries for each allocation
    let scriptCounter = 1;
    for (const allocation of allocations) {
      for (let i = 0; i < allocation.scriptsAllocated; i++) {
        allocation.scripts.push({
          scriptId: `SCRIPT-${examId}-P${paperNumber}-${String(scriptCounter).padStart(4, '0')}`,
          candidateNumber: `CAND-${String(scriptCounter).padStart(5, '0')}`,
          centerCode: `CTR-${Math.floor(scriptCounter / 50) + 1}`,
          markingStatus: 'pending' as const,
          allocatedAt: new Date().toISOString(),
          priority: 'normal' as const
        });
        scriptCounter++;
      }
    }

    // Create script allocation
    const scriptAllocation = {
      id: allocationId,
      examId,
      examTitle: examTitle || `${subjectName} Paper ${paperNumber}`,
      subjectCode,
      subjectName,
      paperNumber,
      examLevel: examLevel as 'O Level' | 'A Level',
      totalScripts,
      allocatedScripts: allocations.reduce((sum, alloc) => sum + alloc.scriptsAllocated, 0),
      remainingScripts: totalScripts - allocations.reduce((sum, alloc) => sum + alloc.scriptsAllocated, 0),
      allocations,
      markingScheme,
      qualityAssurance: {
        doubleMarkingRequired: qualityAssurance?.doubleMarkingRequired || true,
        doubleMarkingPercentage: qualityAssurance?.doubleMarkingPercentage || 20,
        chiefExaminerReview: qualityAssurance?.chiefExaminerReview || true,
        moderationRequired: qualityAssurance?.moderationRequired || true
      },
      deadlines: {
        firstMarking: deadlines?.firstMarking || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        doubleMarking: deadlines?.doubleMarking || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        moderation: deadlines?.moderation || new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        finalSubmission: deadlines?.finalSubmission || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update examiner workloads
    for (const allocation of allocations) {
      const examiner = availableExaminers.get(allocation.examinerId);
      if (examiner) {
        examiner.currentWorkload.activeAllocations += 1;
        examiner.currentWorkload.scriptsInProgress += allocation.scriptsAllocated;
        examiner.currentWorkload.upcomingDeadlines += 1;
        availableExaminers.set(allocation.examinerId, examiner);
      }
    }

    // Store script allocation
    scriptAllocations.set(allocationId, scriptAllocation);

    return NextResponse.json({
      success: true,
      data: scriptAllocation,
      message: 'Scripts allocated successfully'
    });

  } catch (error) {
    console.error('Allocate scripts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get allocate-scripts data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mock data for allocate-scripts
    const mockData = {
      message: 'allocate-scripts data retrieved successfully',
      timestamp: new Date().toISOString(),
      data: []
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'allocate-scripts retrieved successfully'
    });
  } catch (error) {
    console.error('allocate-scripts GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

