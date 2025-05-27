import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage (in production, use database)
const studentRegistrations: Map<string, any> = new Map();
const payments: Map<string, any> = new Map();
const photoStorage: Map<string, any> = new Map();

// Helper function to check access permissions
const canAccessConfirmation = (token: string, registrationId: string): { canAccess: boolean; isAdmin: boolean; currentUserId: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const currentUserId = tokenParts.slice(2, -1).join('-');
  const currentUser = userStorage.findById(currentUserId);
  
  if (!currentUser) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const isAdmin = currentUser.userType === 'admin';
  const registration = studentRegistrations.get(registrationId);
  const isOwner = registration && registration.studentId === currentUserId;
  
  return {
    canAccess: isAdmin || isOwner,
    isAdmin,
    currentUserId
  };
};

// Generate confirmation certificate/slip
const generateConfirmationDocument = (registration: any, student: any, payments: any[], photo?: any): any => {
  return {
    confirmationNumber: `CONF-${registration.id}-${Date.now().toString().slice(-6)}`,
    examSession: registration.examSession,
    examLevel: registration.examLevel,
    examCenter: registration.examCenter,
    centerCode: registration.centerCode,
    student: {
      id: student.id,
      fullName: registration.personalInfo.fullName,
      dateOfBirth: registration.personalInfo.dateOfBirth,
      gender: registration.personalInfo.gender,
      candidateNumber: student.candidateNumber,
      photo: photo?.thumbnailUrl || photo?.url
    },
    subjects: registration.subjects.map((subject: any) => ({
      code: subject.code,
      name: subject.name,
      type: subject.type,
      fee: subject.fee
    })),
    fees: {
      totalAmount: registration.fees.totalAmount,
      paidAmount: payments.reduce((sum: number, payment: any) => 
        payment.status === 'completed' ? sum + payment.amount : sum, 0
      ),
      balance: registration.fees.totalAmount - payments.reduce((sum: number, payment: any) => 
        payment.status === 'completed' ? sum + payment.amount : sum, 0
      ),
      currency: registration.fees.currency
    },
    status: registration.status,
    confirmedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    instructions: [
      'Keep this confirmation slip safe as it will be required during examination',
      'Arrive at the examination center 30 minutes before the exam starts',
      'Bring a valid ID card and this confirmation slip',
      'Mobile phones and electronic devices are not allowed in the examination hall',
      'Contact the examination board for any queries or changes'
    ],
    importantDates: {
      registrationDeadline: '2025-03-31T23:59:59Z',
      examStartDate: '2025-06-01T08:00:00Z',
      resultsReleaseDate: '2025-08-15T00:00:00Z'
    }
  };
};

// GET - Get registration confirmation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { canAccess } = canAccessConfirmation(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const registration = studentRegistrations.get(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Get student information
    const student = userStorage.findById(registration.studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Get payment information
    const registrationPayments = Array.from(payments.values()).filter(
      payment => payment.registrationId === id
    );

    // Get student photo
    const studentPhoto = Array.from(photoStorage.values()).find(
      photo => photo.studentId === registration.studentId && photo.registrationId === id
    );

    // Check if registration is complete and approved
    const isComplete = registration.status === 'approved';
    const hasPayment = registrationPayments.some(payment => payment.status === 'completed');
    const hasPhoto = !!studentPhoto && studentPhoto.status === 'approved';

    if (!isComplete) {
      return NextResponse.json({
        success: false,
        message: 'Registration is not yet approved',
        data: {
          registrationId: id,
          status: registration.status,
          requirements: {
            approval: registration.status === 'approved',
            payment: hasPayment,
            photo: hasPhoto
          }
        }
      }, { status: 400 });
    }

    // Generate confirmation document
    const confirmationDocument = generateConfirmationDocument(
      registration,
      student,
      registrationPayments,
      studentPhoto
    );

    // Calculate completion status
    const completionStatus = {
      isComplete: true,
      requirements: {
        registration: true,
        approval: true,
        payment: hasPayment,
        photo: hasPhoto,
        documentation: true
      },
      completionPercentage: 100
    };

    return NextResponse.json({
      success: true,
      data: {
        registration,
        confirmation: confirmationDocument,
        completionStatus,
        payments: registrationPayments,
        photo: studentPhoto
      },
      message: 'Registration confirmation retrieved successfully'
    });

  } catch (error) {
    console.error('Get confirmation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Generate/regenerate confirmation document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { canAccess, isAdmin } = canAccessConfirmation(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const registration = studentRegistrations.get(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Only allow confirmation generation for approved registrations
    if (!isAdmin && registration.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Registration must be approved before generating confirmation' },
        { status: 400 }
      );
    }

    const student = userStorage.findById(registration.studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Get related data
    const registrationPayments = Array.from(payments.values()).filter(
      payment => payment.registrationId === id
    );

    const studentPhoto = Array.from(photoStorage.values()).find(
      photo => photo.studentId === registration.studentId && photo.registrationId === id
    );

    // Generate new confirmation document
    const confirmationDocument = generateConfirmationDocument(
      registration,
      student,
      registrationPayments,
      studentPhoto
    );

    // Update registration with confirmation details
    const updatedRegistration = {
      ...registration,
      confirmationGenerated: true,
      confirmationNumber: confirmationDocument.confirmationNumber,
      confirmedAt: confirmationDocument.confirmedAt,
      updatedAt: new Date().toISOString()
    };

    studentRegistrations.set(id, updatedRegistration);

    return NextResponse.json({
      success: true,
      data: {
        confirmation: confirmationDocument,
        registration: updatedRegistration
      },
      message: 'Confirmation document generated successfully'
    });

  } catch (error) {
    console.error('Generate confirmation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
