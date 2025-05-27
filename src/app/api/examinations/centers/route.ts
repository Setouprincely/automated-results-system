import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Examination centers storage (in production, use database)
const examCenters: Map<string, {
  id: string;
  centerCode: string;
  centerName: string;
  centerType: 'primary' | 'secondary' | 'both';
  address: {
    street: string;
    city: string;
    region: string;
    division: string;
    postalCode?: string;
  };
  contactInfo: {
    phoneNumber: string;
    email: string;
  };
  centerHead: {
    name: string;
    title: string;
    phoneNumber: string;
    email: string;
  };
  facilities: {
    totalRooms: number;
    totalCapacity: number;
    rooms: Array<{
      roomNumber: string;
      capacity: number;
      type: 'classroom' | 'hall' | 'laboratory';
    }>;
    amenities: string[];
  };
  examTypes: Array<'O Level' | 'A Level'>;
  status: 'active' | 'inactive' | 'suspended';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Initialize with default centers
const initializeDefaultCenters = () => {
  const defaultCenters = [
    {
      id: 'CENTER-001',
      centerCode: 'CENS001',
      centerName: 'Government High School Yaoundé',
      centerType: 'secondary' as const,
      address: {
        street: 'Avenue Kennedy',
        city: 'Yaoundé',
        region: 'Centre',
        division: 'Mfoundi'
      },
      contactInfo: {
        phoneNumber: '+237222123456',
        email: 'ghsy@education.cm'
      },
      centerHead: {
        name: 'Dr. Marie Ngozi',
        title: 'Principal',
        phoneNumber: '+237222123457',
        email: 'marie.ngozi@ghsy.cm'
      },
      facilities: {
        totalRooms: 15,
        totalCapacity: 500,
        rooms: [
          { roomNumber: 'A101', capacity: 40, type: 'classroom' as const },
          { roomNumber: 'A102', capacity: 40, type: 'classroom' as const },
          { roomNumber: 'HALL1', capacity: 200, type: 'hall' as const }
        ],
        amenities: ['Computer Lab', 'Science Lab', 'Library']
      },
      examTypes: ['O Level', 'A Level'] as const,
      status: 'active' as const,
      createdBy: 'admin',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    },
    {
      id: 'CENTER-002',
      centerCode: 'LITS002',
      centerName: 'Lycée Classique et Moderne de Douala',
      centerType: 'secondary' as const,
      address: {
        street: 'Rue Bonanjo',
        city: 'Douala',
        region: 'Littoral',
        division: 'Wouri'
      },
      contactInfo: {
        phoneNumber: '+237233456789',
        email: 'lcmd@education.cm'
      },
      centerHead: {
        name: 'Mme. Fouda Marie',
        title: 'Principal',
        phoneNumber: '+237233456790',
        email: 'marie.fouda@lcmd.cm'
      },
      facilities: {
        totalRooms: 12,
        totalCapacity: 450,
        rooms: [
          { roomNumber: 'B101', capacity: 35, type: 'classroom' as const },
          { roomNumber: 'B102', capacity: 35, type: 'classroom' as const }
        ],
        amenities: ['Computer Lab', 'Science Lab']
      },
      examTypes: ['A Level'] as const,
      status: 'active' as const,
      createdBy: 'admin',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    }
  ];

  defaultCenters.forEach(center => {
    examCenters.set(center.id, center);
  });
};

// Initialize default centers
initializeDefaultCenters();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// POST - Create new examination center
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
      centerName,
      centerType,
      address,
      contactInfo,
      centerHead,
      facilities,
      examTypes,
      status = 'active'
    } = body;

    // Validate required fields
    if (!centerName || !centerType || !address || !contactInfo || !centerHead || !facilities) {
      return NextResponse.json(
        { success: false, message: 'Missing required center information' },
        { status: 400 }
      );
    }

    // Check if center name already exists
    const existingCenter = Array.from(examCenters.values()).find(
      center => center.centerName.toLowerCase() === centerName.toLowerCase()
    );

    if (existingCenter) {
      return NextResponse.json(
        { success: false, message: 'Examination center with this name already exists' },
        { status: 409 }
      );
    }

    // Generate center ID and code
    const centerId = `CENTER-${Date.now()}`;
    const centerCode = `${address.region.substring(0, 2).toUpperCase()}${centerType.substring(0, 1).toUpperCase()}${Date.now().toString().slice(-3)}`;

    // Calculate total capacity
    const totalCapacity = facilities.rooms?.reduce((sum: number, room: any) => sum + room.capacity, 0) || 0;

    // Create examination center
    const examCenter = {
      id: centerId,
      centerCode,
      centerName,
      centerType: centerType as 'primary' | 'secondary' | 'both',
      address,
      contactInfo,
      centerHead,
      facilities: {
        totalRooms: facilities.rooms?.length || 0,
        totalCapacity,
        rooms: facilities.rooms || [],
        amenities: facilities.amenities || []
      },
      examTypes: examTypes || ['O Level', 'A Level'],
      status: status as 'active' | 'inactive' | 'suspended',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store examination center
    examCenters.set(centerId, examCenter);

    return NextResponse.json({
      success: true,
      data: examCenter,
      message: 'Examination center created successfully'
    });

  } catch (error) {
    console.error('Create exam center error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all examination centers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || '';
    const centerType = searchParams.get('centerType') || '';
    const status = searchParams.get('status') || '';
    const examType = searchParams.get('examType') || '';
    const query = searchParams.get('q') || '';

    // Get all examination centers
    let centers = Array.from(examCenters.values());

    // Apply filters
    if (region) {
      centers = centers.filter(center => 
        center.address.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    if (centerType) {
      centers = centers.filter(center => center.centerType === centerType);
    }

    if (status) {
      centers = centers.filter(center => center.status === status);
    }

    if (examType) {
      centers = centers.filter(center => center.examTypes.includes(examType as any));
    }

    if (query) {
      const searchQuery = query.toLowerCase();
      centers = centers.filter(center =>
        center.centerName.toLowerCase().includes(searchQuery) ||
        center.centerCode.toLowerCase().includes(searchQuery) ||
        center.address.city.toLowerCase().includes(searchQuery)
      );
    }

    // Sort by center name
    centers.sort((a, b) => a.centerName.localeCompare(b.centerName));

    // Calculate statistics
    const stats = {
      total: centers.length,
      byType: {
        primary: centers.filter(c => c.centerType === 'primary').length,
        secondary: centers.filter(c => c.centerType === 'secondary').length,
        both: centers.filter(c => c.centerType === 'both').length
      },
      byStatus: {
        active: centers.filter(c => c.status === 'active').length,
        inactive: centers.filter(c => c.status === 'inactive').length,
        suspended: centers.filter(c => c.status === 'suspended').length
      },
      totalCapacity: centers.reduce((sum, center) => sum + center.facilities.totalCapacity, 0),
      totalRooms: centers.reduce((sum, center) => sum + center.facilities.totalRooms, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        centers,
        statistics: stats
      },
      message: 'Examination centers retrieved successfully'
    });

  } catch (error) {
    console.error('Get exam centers error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
