import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// School registration storage (in production, use database)
const schoolRegistrations: Map<string, {
  id: string;
  schoolCode: string;
  schoolInfo: {
    name: string;
    type: 'Government' | 'Private' | 'Mission';
    level: 'Primary' | 'Secondary' | 'Both';
    foundedYear: number;
    motto?: string;
    website?: string;
  };
  contactInfo: {
    address: string;
    region: string;
    division: string;
    subdivision: string;
    village?: string;
    postalCode?: string;
    phoneNumber: string;
    alternatePhone?: string;
    email: string;
    faxNumber?: string;
  };
  principalInfo: {
    title: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
    fullName: string;
    phoneNumber: string;
    email: string;
    qualification: string;
    experience: number;
  };
  registrarInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    qualification: string;
  };
  academicInfo: {
    totalStudents: number;
    oLevelStudents: number;
    aLevelStudents: number;
    teachingStaff: number;
    nonTeachingStaff: number;
    classrooms: number;
    laboratories: number;
    library: boolean;
    computerLab: boolean;
  };
  examCenterInfo: {
    isExamCenter: boolean;
    centerCode?: string;
    capacity?: number;
    examTypes: string[];
    facilities: string[];
  };
  documents: {
    schoolLicense?: string;
    principalCertificate?: string;
    taxClearance?: string;
    buildingPermit?: string;
    photos?: string[];
  };
  fees: {
    registrationFee: number;
    annualFee: number;
    totalAmount: number;
    currency: 'XAF' | 'USD';
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  paymentStatus: 'pending' | 'completed' | 'failed';
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Generate school code
const generateSchoolCode = (region: string, type: string): string => {
  const regionCode = region.substring(0, 2).toUpperCase();
  const typeCode = type === 'Government' ? 'GS' : type === 'Private' ? 'PS' : 'MS';
  const timestamp = Date.now().toString().slice(-4);
  return `${regionCode}-${typeCode}-${timestamp}`;
};

// Calculate school registration fees
const calculateSchoolFees = (type: string, isExamCenter: boolean): { registrationFee: number; annualFee: number; totalAmount: number } => {
  let registrationFee = 50000; // Base fee in XAF
  let annualFee = 25000;

  // Adjust fees based on school type
  if (type === 'Private') {
    registrationFee = 75000;
    annualFee = 35000;
  } else if (type === 'Mission') {
    registrationFee = 60000;
    annualFee = 30000;
  }

  // Additional fee for exam centers
  if (isExamCenter) {
    registrationFee += 25000;
    annualFee += 15000;
  }

  const totalAmount = registrationFee + annualFee;
  return { registrationFee, annualFee, totalAmount };
};

// POST - Register new school
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

    // Check if user is admin or teacher
    if (!['admin', 'teacher'].includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: 'Only admins and teachers can register schools' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      schoolInfo,
      contactInfo,
      principalInfo,
      registrarInfo,
      academicInfo,
      examCenterInfo,
      status = 'draft'
    } = body;

    // Validate required fields
    if (!schoolInfo || !contactInfo || !principalInfo || !registrarInfo || !academicInfo) {
      return NextResponse.json(
        { success: false, message: 'Missing required school information' },
        { status: 400 }
      );
    }

    // Validate school type
    if (!['Government', 'Private', 'Mission'].includes(schoolInfo.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid school type' },
        { status: 400 }
      );
    }

    // Check if school name already exists
    const existingSchool = Array.from(schoolRegistrations.values()).find(
      school => school.schoolInfo.name.toLowerCase() === schoolInfo.name.toLowerCase()
    );

    if (existingSchool) {
      return NextResponse.json(
        { success: false, message: 'School with this name already exists' },
        { status: 409 }
      );
    }

    // Generate school code and registration ID
    const schoolCode = generateSchoolCode(contactInfo.region, schoolInfo.type);
    const registrationId = `SCH-REG-${Date.now()}`;

    // Calculate fees
    const fees = calculateSchoolFees(schoolInfo.type, examCenterInfo?.isExamCenter || false);

    // Create school registration
    const schoolRegistration = {
      id: registrationId,
      schoolCode,
      schoolInfo: {
        name: schoolInfo.name,
        type: schoolInfo.type,
        level: schoolInfo.level || 'Secondary',
        foundedYear: schoolInfo.foundedYear,
        motto: schoolInfo.motto,
        website: schoolInfo.website
      },
      contactInfo: {
        address: contactInfo.address,
        region: contactInfo.region,
        division: contactInfo.division,
        subdivision: contactInfo.subdivision,
        village: contactInfo.village,
        postalCode: contactInfo.postalCode,
        phoneNumber: contactInfo.phoneNumber,
        alternatePhone: contactInfo.alternatePhone,
        email: contactInfo.email,
        faxNumber: contactInfo.faxNumber
      },
      principalInfo,
      registrarInfo,
      academicInfo,
      examCenterInfo: examCenterInfo || {
        isExamCenter: false,
        examTypes: [],
        facilities: []
      },
      documents: {},
      fees: {
        ...fees,
        currency: 'XAF' as const
      },
      status: status as 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended',
      paymentStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store school registration
    schoolRegistrations.set(registrationId, schoolRegistration);

    return NextResponse.json({
      success: true,
      data: schoolRegistration,
      message: 'School registration created successfully'
    });

  } catch (error) {
    console.error('Create school registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
