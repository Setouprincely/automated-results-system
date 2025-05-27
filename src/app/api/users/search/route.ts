import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Helper function to check if user is admin
const isAdmin = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
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

    // Check if user is admin
    if (!isAdmin(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const userType = searchParams.get('userType') || '';
    const status = searchParams.get('status') || '';
    const emailVerified = searchParams.get('emailVerified') || '';
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

    // Get all users
    let users = userStorage.getAllUsers();

    // Apply filters
    if (query) {
      const searchQuery = query.toLowerCase();
      users = users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery) ||
        user.id.toLowerCase().includes(searchQuery) ||
        (user.candidateNumber && user.candidateNumber.toLowerCase().includes(searchQuery)) ||
        (user.school && user.school.toLowerCase().includes(searchQuery))
      );
    }

    if (userType) {
      users = users.filter(user => user.userType === userType);
    }

    if (status) {
      users = users.filter(user => user.registrationStatus === status);
    }

    if (emailVerified) {
      const isVerified = emailVerified === 'true';
      users = users.filter(user => user.emailVerified === isVerified);
    }

    // Sort users
    users.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'fullName':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'userType':
          aValue = a.userType;
          bValue = b.userType;
          break;
        case 'registrationStatus':
          aValue = a.registrationStatus;
          bValue = b.registrationStatus;
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
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // Remove password hashes from response
    const safeUsers = paginatedUsers.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });

    // Calculate statistics
    const stats = {
      total: totalUsers,
      byType: {
        student: users.filter(u => u.userType === 'student').length,
        teacher: users.filter(u => u.userType === 'teacher').length,
        examiner: users.filter(u => u.userType === 'examiner').length,
        admin: users.filter(u => u.userType === 'admin').length
      },
      byStatus: {
        confirmed: users.filter(u => u.registrationStatus === 'confirmed').length,
        pending: users.filter(u => u.registrationStatus === 'pending').length,
        suspended: users.filter(u => u.registrationStatus === 'suspended').length
      },
      emailVerified: users.filter(u => u.emailVerified).length,
      emailUnverified: users.filter(u => !u.emailVerified).length
    };

    return NextResponse.json({
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: {
          query,
          userType,
          status,
          emailVerified,
          sortBy,
          sortOrder
        },
        statistics: stats
      },
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
