import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Invigilator assignments storage (in production, use database)
const invigilatorAssignments: Map<string, {
  id: string;
  examId: string;
  centerId: string;
  centerName: string;
  examDate: string;
  examSession: string;
  assignments: Array<{
    invigilatorId: string;
    invigilatorName: string;
    invigilatorEmail: string;
    role: 'chief' | 'assistant' | 'observer' | 'special_needs';
    roomNumber: string;
    startTime: string;
    endTime: string;
    responsibilities: string[];
    contactNumber: string;
    qualifications: string[];
    experience: number; // years
    specializations?: string[];
  }>;
  requirements: {
    chiefInvigilators: number;
    assistantInvigilators: number;
    observers: number;
    specialNeedsSupport: number;
  };
  status: 'draft' | 'assigned' | 'confirmed' | 'completed';
  assignedBy: string;
  assignedAt: string;
  confirmedAt?: string;
  notes?: string;
  emergencyContacts: Array<{
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
  }>;
}> = new Map();

// Available invigilators pool (in production, fetch from database)
const availableInvigilators: Map<string, {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  qualifications: string[];
  experience: number;
  specializations: string[];
  availability: {
    dates: string[];
    timeSlots: string[];
    regions: string[];
  };
  rating: number;
  totalAssignments: number;
  status: 'active' | 'inactive' | 'suspended';
}> = new Map();

// Initialize default invigilators
const initializeDefaultInvigilators = () => {
  const defaultInvigilators = [
    {
      id: 'INV-001',
      name: 'Dr. Paul Mbeki',
      email: 'paul.mbeki@education.cm',
      phoneNumber: '+237222111222',
      qualifications: ['PhD Education', 'TESOL Certificate'],
      experience: 15,
      specializations: ['Mathematics', 'Sciences', 'Special Needs'],
      availability: {
        dates: ['2025-06-01', '2025-06-02', '2025-06-03'],
        timeSlots: ['08:00-12:00', '14:00-18:00'],
        regions: ['Centre', 'Littoral']
      },
      rating: 4.8,
      totalAssignments: 45,
      status: 'active' as const
    },
    {
      id: 'INV-002',
      name: 'Mrs. Sarah Fon',
      email: 'sarah.fon@education.cm',
      phoneNumber: '+237233222333',
      qualifications: ['Masters in English', 'Examination Certification'],
      experience: 8,
      specializations: ['Languages', 'Literature'],
      availability: {
        dates: ['2025-06-01', '2025-06-02'],
        timeSlots: ['08:00-12:00'],
        regions: ['Centre']
      },
      rating: 4.6,
      totalAssignments: 28,
      status: 'active' as const
    }
  ];

  defaultInvigilators.forEach(invigilator => {
    availableInvigilators.set(invigilator.id, invigilator);
  });
};

// Initialize default invigilators
initializeDefaultInvigilators();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Calculate invigilator requirements based on exam details
const calculateRequirements = (examDetails: any): any => {
  const totalCandidates = examDetails.totalCandidates || 100;
  const candidatesPerInvigilator = 30;
  const totalInvigilators = Math.ceil(totalCandidates / candidatesPerInvigilator);
  
  return {
    chiefInvigilators: Math.max(1, Math.ceil(totalInvigilators * 0.2)),
    assistantInvigilators: Math.max(2, Math.ceil(totalInvigilators * 0.7)),
    observers: Math.max(1, Math.ceil(totalInvigilators * 0.1)),
    specialNeedsSupport: examDetails.hasSpecialNeeds ? 1 : 0
  };
};

// POST - Create invigilator assignment
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
      centerId,
      centerName,
      examDate,
      examSession,
      assignments,
      autoAssign = false,
      examDetails,
      notes
    } = body;

    // Validate required fields
    if (!examId || !centerId || !examDate || !examSession) {
      return NextResponse.json(
        { success: false, message: 'Missing required assignment information' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = Array.from(invigilatorAssignments.values()).find(
      assignment => assignment.examId === examId && assignment.centerId === centerId
    );

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, message: 'Invigilator assignment already exists for this exam and center' },
        { status: 409 }
      );
    }

    // Generate assignment ID
    const assignmentId = `ASSIGN-${examId}-${centerId}-${Date.now()}`;

    // Calculate requirements
    const requirements = calculateRequirements(examDetails || {});

    let finalAssignments = assignments || [];

    // Auto-assign invigilators if requested
    if (autoAssign) {
      const availableInvs = Array.from(availableInvigilators.values()).filter(inv => 
        inv.status === 'active' &&
        inv.availability.dates.includes(examDate) &&
        inv.availability.regions.some(region => centerName.includes(region))
      );

      // Sort by rating and experience
      availableInvs.sort((a, b) => (b.rating * b.experience) - (a.rating * a.experience));

      finalAssignments = [];
      let assignedCount = { chief: 0, assistant: 0, observer: 0, specialNeeds: 0 };

      for (const inv of availableInvs) {
        let role: string = '';
        
        if (assignedCount.chief < requirements.chiefInvigilators) {
          role = 'chief';
          assignedCount.chief++;
        } else if (assignedCount.assistant < requirements.assistantInvigilators) {
          role = 'assistant';
          assignedCount.assistant++;
        } else if (assignedCount.observer < requirements.observers) {
          role = 'observer';
          assignedCount.observer++;
        } else if (requirements.specialNeedsSupport > 0 && assignedCount.specialNeeds < requirements.specialNeedsSupport) {
          role = 'special_needs';
          assignedCount.specialNeeds++;
        }

        if (role) {
          finalAssignments.push({
            invigilatorId: inv.id,
            invigilatorName: inv.name,
            invigilatorEmail: inv.email,
            role: role as 'chief' | 'assistant' | 'observer' | 'special_needs',
            roomNumber: `Room-${finalAssignments.length + 1}`,
            startTime: '08:00',
            endTime: '12:00',
            responsibilities: getRoleResponsibilities(role),
            contactNumber: inv.phoneNumber,
            qualifications: inv.qualifications,
            experience: inv.experience,
            specializations: inv.specializations
          });
        }

        if (finalAssignments.length >= (requirements.chiefInvigilators + requirements.assistantInvigilators + requirements.observers + requirements.specialNeedsSupport)) {
          break;
        }
      }
    }

    // Create invigilator assignment
    const assignment = {
      id: assignmentId,
      examId,
      centerId,
      centerName,
      examDate,
      examSession,
      assignments: finalAssignments,
      requirements,
      status: 'assigned' as const,
      assignedBy: userId,
      assignedAt: new Date().toISOString(),
      notes,
      emergencyContacts: [
        {
          name: 'Examination Board Emergency',
          role: 'Emergency Coordinator',
          phoneNumber: '+237222000111',
          email: 'emergency@gce.cm'
        }
      ]
    };

    // Store assignment
    invigilatorAssignments.set(assignmentId, assignment);

    return NextResponse.json({
      success: true,
      data: assignment,
      message: 'Invigilator assignment created successfully'
    });

  } catch (error) {
    console.error('Create invigilator assignment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get role responsibilities
const getRoleResponsibilities = (role: string): string[] => {
  const responsibilities: Record<string, string[]> = {
    chief: [
      'Overall supervision of examination room',
      'Distribute and collect question papers',
      'Ensure examination rules are followed',
      'Handle emergencies and irregularities',
      'Submit examination reports'
    ],
    assistant: [
      'Assist chief invigilator',
      'Monitor candidates during examination',
      'Help with seating arrangements',
      'Collect answer scripts',
      'Report any irregularities'
    ],
    observer: [
      'Observe examination procedures',
      'Ensure fair conduct',
      'Report any violations',
      'Assist with crowd control',
      'Document examination process'
    ],
    special_needs: [
      'Assist candidates with special needs',
      'Provide necessary accommodations',
      'Ensure accessibility compliance',
      'Coordinate with medical staff if needed',
      'Maintain confidentiality'
    ]
  };

  return responsibilities[role] || [];
};

// GET - Get assign-invigilators data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mock data for assign-invigilators
    const mockData = {
      message: 'assign-invigilators data retrieved successfully',
      timestamp: new Date().toISOString(),
      data: []
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'assign-invigilators retrieved successfully'
    });
  } catch (error) {
    console.error('assign-invigilators GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

