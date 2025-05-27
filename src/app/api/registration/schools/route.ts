import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared school registration storage (in production, use database)
const schoolRegistrations: Map<string, any> = new Map();

// Helper function to check access permissions
const canAccessSchools = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return ['admin', 'teacher', 'examiner'].includes(user?.userType || '');
};

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

    if (!canAccessSchools(token)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const region = searchParams.get('region') || '';
    const status = searchParams.get('status') || '';
    const isExamCenter = searchParams.get('isExamCenter') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get all school registrations
    let schools = Array.from(schoolRegistrations.values());

    // Apply filters
    if (query) {
      const searchQuery = query.toLowerCase();
      schools = schools.filter(school =>
        school.schoolInfo.name.toLowerCase().includes(searchQuery) ||
        school.schoolCode.toLowerCase().includes(searchQuery) ||
        school.contactInfo.address.toLowerCase().includes(searchQuery) ||
        school.principalInfo.fullName.toLowerCase().includes(searchQuery)
      );
    }

    if (type) {
      schools = schools.filter(school => school.schoolInfo.type === type);
    }

    if (region) {
      schools = schools.filter(school => 
        school.contactInfo.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    if (status) {
      schools = schools.filter(school => school.status === status);
    }

    if (isExamCenter) {
      const isCenter = isExamCenter === 'true';
      schools = schools.filter(school => school.examCenterInfo.isExamCenter === isCenter);
    }

    // Sort schools
    schools.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.schoolInfo.name.toLowerCase();
          bValue = b.schoolInfo.name.toLowerCase();
          break;
        case 'type':
          aValue = a.schoolInfo.type;
          bValue = b.schoolInfo.type;
          break;
        case 'region':
          aValue = a.contactInfo.region;
          bValue = b.contactInfo.region;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'totalStudents':
          aValue = a.academicInfo.totalStudents;
          bValue = b.academicInfo.totalStudents;
          break;
        case 'submittedAt':
          aValue = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          bValue = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Calculate pagination
    const totalSchools = schools.length;
    const totalPages = Math.ceil(totalSchools / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSchools = schools.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: totalSchools,
      byType: {
        government: schools.filter(s => s.schoolInfo.type === 'Government').length,
        private: schools.filter(s => s.schoolInfo.type === 'Private').length,
        mission: schools.filter(s => s.schoolInfo.type === 'Mission').length
      },
      byStatus: {
        draft: schools.filter(s => s.status === 'draft').length,
        submitted: schools.filter(s => s.status === 'submitted').length,
        underReview: schools.filter(s => s.status === 'under_review').length,
        approved: schools.filter(s => s.status === 'approved').length,
        rejected: schools.filter(s => s.status === 'rejected').length,
        suspended: schools.filter(s => s.status === 'suspended').length
      },
      examCenters: schools.filter(s => s.examCenterInfo.isExamCenter).length,
      totalStudents: schools.reduce((sum, school) => sum + school.academicInfo.totalStudents, 0),
      totalTeachers: schools.reduce((sum, school) => sum + school.academicInfo.teachingStaff, 0),
      averageStudentsPerSchool: schools.length > 0 ? 
        Math.round(schools.reduce((sum, school) => sum + school.academicInfo.totalStudents, 0) / schools.length) : 0
    };

    // Group by regions
    const regionStats = schools.reduce((acc: any, school) => {
      const region = school.contactInfo.region;
      if (!acc[region]) {
        acc[region] = 0;
      }
      acc[region]++;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        schools: paginatedSchools,
        pagination: {
          currentPage: page,
          totalPages,
          totalSchools,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: {
          query,
          type,
          region,
          status,
          isExamCenter,
          sortBy,
          sortOrder
        },
        statistics: {
          ...stats,
          byRegion: regionStats
        }
      },
      message: 'Schools retrieved successfully'
    });

  } catch (error) {
    console.error('Get schools error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
