import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Student registration storage (in production, use database)
const studentRegistrations: Map<string, {
  id: string;
  studentId: string;
  examSession: string;
  examLevel: 'O Level' | 'A Level';
  examCenter: string;
  centerCode: string;
  subjects: Array<{
    code: string;
    name: string;
    type: 'core' | 'elective';
    fee: number;
  }>;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
    nationality: string;
    region: string;
    division: string;
    placeOfBirth: string;
    phoneNumber?: string;
    email: string;
  };
  guardianInfo: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address: string;
  };
  schoolInfo: {
    name: string;
    type: 'Government' | 'Private' | 'Mission';
    region: string;
    division: string;
  };
  documents: {
    photo?: string;
    birthCertificate?: string;
    schoolTranscript?: string;
    nationalId?: string;
  };
  fees: {
    registrationFee: number;
    subjectFees: number;
    totalAmount: number;
    currency: 'XAF' | 'USD';
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'payment_pending';
  paymentStatus: 'pending' | 'partial' | 'completed' | 'failed';
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Generate registration ID
const generateRegistrationId = (examLevel: string): string => {
  const year = new Date().getFullYear();
  const level = examLevel === 'O Level' ? 'OL' : 'AL';
  const timestamp = Date.now().toString().slice(-6);
  return `REG-${year}-${level}-${timestamp}`;
};

// Calculate fees based on subjects
const calculateFees = (subjects: any[], examLevel: string): { registrationFee: number; subjectFees: number; totalAmount: number } => {
  const registrationFee = examLevel === 'O Level' ? 5000 : 7500; // XAF
  const subjectFeePerSubject = examLevel === 'O Level' ? 2000 : 3000; // XAF
  const subjectFees = subjects.length * subjectFeePerSubject;
  const totalAmount = registrationFee + subjectFees;
  
  return { registrationFee, subjectFees, totalAmount };
};

// POST - Create new student registration
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

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      examSession,
      examLevel,
      examCenter,
      centerCode,
      subjects,
      personalInfo,
      guardianInfo,
      schoolInfo,
      status = 'draft'
    } = body;

    // Validate required fields
    if (!examSession || !examLevel || !subjects || !personalInfo || !guardianInfo || !schoolInfo) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate exam level
    if (!['O Level', 'A Level'].includes(examLevel)) {
      return NextResponse.json(
        { success: false, message: 'Invalid exam level. Must be "O Level" or "A Level"' },
        { status: 400 }
      );
    }

    // Validate subjects
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one subject is required' },
        { status: 400 }
      );
    }

    // Check subject limits
    const maxSubjects = examLevel === 'O Level' ? 9 : 4;
    if (subjects.length > maxSubjects) {
      return NextResponse.json(
        { success: false, message: `Maximum ${maxSubjects} subjects allowed for ${examLevel}` },
        { status: 400 }
      );
    }

    // Generate registration ID
    const registrationId = generateRegistrationId(examLevel);

    // Calculate fees
    const fees = calculateFees(subjects, examLevel);

    // Create registration
    const registration = {
      id: registrationId,
      studentId: userId,
      examSession,
      examLevel: examLevel as 'O Level' | 'A Level',
      examCenter: examCenter || 'Default Examination Center',
      centerCode: centerCode || 'DEC-001',
      subjects: subjects.map((subject: any) => ({
        code: subject.code,
        name: subject.name,
        type: subject.type || 'elective',
        fee: examLevel === 'O Level' ? 2000 : 3000
      })),
      personalInfo: {
        fullName: personalInfo.fullName,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        nationality: personalInfo.nationality || 'Cameroonian',
        region: personalInfo.region,
        division: personalInfo.division,
        placeOfBirth: personalInfo.placeOfBirth,
        phoneNumber: personalInfo.phoneNumber,
        email: personalInfo.email || user.email
      },
      guardianInfo,
      schoolInfo,
      documents: {},
      fees: {
        ...fees,
        currency: 'XAF' as const
      },
      status: status as 'draft' | 'submitted' | 'approved' | 'rejected' | 'payment_pending',
      paymentStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store registration
    studentRegistrations.set(registrationId, registration);

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Student registration created successfully'
    });

  } catch (error) {
    console.error('Create student registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
