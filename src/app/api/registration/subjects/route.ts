import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Subject storage (in production, use database)
const subjects: Map<string, {
  id: string;
  code: string;
  name: string;
  level: 'O Level' | 'A Level' | 'Both';
  category: 'core' | 'elective';
  department: string;
  description?: string;
  prerequisites?: string[];
  duration: number; // in hours
  fee: number;
  currency: 'XAF' | 'USD';
  isActive: boolean;
  examFormat: {
    papers: number;
    duration: number; // minutes per paper
    totalMarks: number;
    passingGrade: string;
  };
  syllabus?: {
    topics: string[];
    objectives: string[];
    resources: string[];
  };
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Initialize default subjects
const initializeDefaultSubjects = () => {
  const defaultSubjects = [
    // O Level Core Subjects
    {
      id: 'OL-ENG-001',
      code: 'OLG',
      name: 'English Language',
      level: 'O Level' as const,
      category: 'core' as const,
      department: 'Languages',
      description: 'English Language and Communication',
      duration: 120,
      fee: 2000,
      currency: 'XAF' as const,
      isActive: true,
      examFormat: {
        papers: 2,
        duration: 180,
        totalMarks: 100,
        passingGrade: 'C6'
      }
    },
    {
      id: 'OL-FRE-001',
      code: 'OFR',
      name: 'French',
      level: 'O Level' as const,
      category: 'core' as const,
      department: 'Languages',
      description: 'French Language',
      duration: 120,
      fee: 2000,
      currency: 'XAF' as const,
      isActive: true,
      examFormat: {
        papers: 2,
        duration: 180,
        totalMarks: 100,
        passingGrade: 'C6'
      }
    },
    {
      id: 'OL-MAT-001',
      code: 'OMH',
      name: 'Mathematics',
      level: 'O Level' as const,
      category: 'core' as const,
      department: 'Sciences',
      description: 'General Mathematics',
      duration: 120,
      fee: 2000,
      currency: 'XAF' as const,
      isActive: true,
      examFormat: {
        papers: 2,
        duration: 180,
        totalMarks: 100,
        passingGrade: 'C6'
      }
    },
    // A Level Subjects
    {
      id: 'AL-ENG-001',
      code: 'ALG',
      name: 'English Literature',
      level: 'A Level' as const,
      category: 'elective' as const,
      department: 'Languages',
      description: 'Advanced English Literature',
      duration: 180,
      fee: 3000,
      currency: 'XAF' as const,
      isActive: true,
      examFormat: {
        papers: 3,
        duration: 180,
        totalMarks: 100,
        passingGrade: 'E'
      }
    },
    {
      id: 'AL-MAT-001',
      code: 'AMH',
      name: 'Mathematics',
      level: 'A Level' as const,
      category: 'elective' as const,
      department: 'Sciences',
      description: 'Advanced Mathematics',
      duration: 180,
      fee: 3000,
      currency: 'XAF' as const,
      isActive: true,
      examFormat: {
        papers: 3,
        duration: 180,
        totalMarks: 100,
        passingGrade: 'E'
      }
    },
    {
      id: 'AL-PHY-001',
      code: 'APY',
      name: 'Physics',
      level: 'A Level' as const,
      category: 'elective' as const,
      department: 'Sciences',
      description: 'Advanced Physics',
      duration: 180,
      fee: 3000,
      currency: 'XAF' as const,
      isActive: true,
      examFormat: {
        papers: 3,
        duration: 180,
        totalMarks: 100,
        passingGrade: 'E'
      }
    }
  ];

  defaultSubjects.forEach(subject => {
    const subjectData = {
      ...subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    subjects.set(subject.id, subjectData);
  });
};

// Initialize default subjects
initializeDefaultSubjects();

// Helper function to check admin access
const isAdmin = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// GET - Get all subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || '';
    const category = searchParams.get('category') || '';
    const department = searchParams.get('department') || '';
    const isActive = searchParams.get('isActive') || '';
    const query = searchParams.get('q') || '';

    // Get all subjects
    let allSubjects = Array.from(subjects.values());

    // Apply filters
    if (level) {
      allSubjects = allSubjects.filter(subject => 
        subject.level === level || subject.level === 'Both'
      );
    }

    if (category) {
      allSubjects = allSubjects.filter(subject => subject.category === category);
    }

    if (department) {
      allSubjects = allSubjects.filter(subject => 
        subject.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (isActive) {
      const active = isActive === 'true';
      allSubjects = allSubjects.filter(subject => subject.isActive === active);
    }

    if (query) {
      const searchQuery = query.toLowerCase();
      allSubjects = allSubjects.filter(subject =>
        subject.name.toLowerCase().includes(searchQuery) ||
        subject.code.toLowerCase().includes(searchQuery) ||
        subject.department.toLowerCase().includes(searchQuery)
      );
    }

    // Sort by name
    allSubjects.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: {
        subjects: allSubjects,
        statistics: {
          total: allSubjects.length,
          byLevel: {
            oLevel: allSubjects.filter(s => s.level === 'O Level' || s.level === 'Both').length,
            aLevel: allSubjects.filter(s => s.level === 'A Level' || s.level === 'Both').length
          },
          byCategory: {
            core: allSubjects.filter(s => s.category === 'core').length,
            elective: allSubjects.filter(s => s.category === 'elective').length
          },
          active: allSubjects.filter(s => s.isActive).length,
          inactive: allSubjects.filter(s => !s.isActive).length
        }
      },
      message: 'Subjects retrieved successfully'
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new subject (Admin only)
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

    if (!isAdmin(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      code,
      name,
      level,
      category,
      department,
      description,
      prerequisites,
      duration,
      fee,
      examFormat,
      syllabus,
      isActive = true
    } = body;

    // Validate required fields
    if (!code || !name || !level || !category || !department || !duration || !fee || !examFormat) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate level
    if (!['O Level', 'A Level', 'Both'].includes(level)) {
      return NextResponse.json(
        { success: false, message: 'Invalid level. Must be "O Level", "A Level", or "Both"' },
        { status: 400 }
      );
    }

    // Validate category
    if (!['core', 'elective'].includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category. Must be "core" or "elective"' },
        { status: 400 }
      );
    }

    // Check if subject code already exists
    const existingSubject = Array.from(subjects.values()).find(s => s.code === code);
    if (existingSubject) {
      return NextResponse.json(
        { success: false, message: 'Subject code already exists' },
        { status: 409 }
      );
    }

    // Generate subject ID
    const subjectId = `${level.replace(' ', '').toUpperCase()}-${code}-${Date.now()}`;

    // Create subject
    const newSubject = {
      id: subjectId,
      code,
      name,
      level: level as 'O Level' | 'A Level' | 'Both',
      category: category as 'core' | 'elective',
      department,
      description,
      prerequisites: prerequisites || [],
      duration,
      fee,
      currency: 'XAF' as const,
      isActive,
      examFormat,
      syllabus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store subject
    subjects.set(subjectId, newSubject);

    return NextResponse.json({
      success: true,
      data: newSubject,
      message: 'Subject created successfully'
    });

  } catch (error) {
    console.error('Create subject error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
