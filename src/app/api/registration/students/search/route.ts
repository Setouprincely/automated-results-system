import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared registration storage (in production, use database)
const studentRegistrations: Map<string, any> = new Map();

// Helper function to check if user is admin or examiner
const canSearchRegistrations = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
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

    // Check if user can search registrations
    if (!canSearchRegistrations(token)) {
      return NextResponse.json(
        { success: false, message: 'Admin or examiner access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const examLevel = searchParams.get('examLevel') || '';
    const examSession = searchParams.get('examSession') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const examCenter = searchParams.get('examCenter') || '';
    const region = searchParams.get('region') || '';
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

    // Get all registrations
    let registrations = Array.from(studentRegistrations.values());

    // Apply filters
    if (query) {
      const searchQuery = query.toLowerCase();
      registrations = registrations.filter(reg =>
        reg.personalInfo.fullName.toLowerCase().includes(searchQuery) ||
        reg.personalInfo.email.toLowerCase().includes(searchQuery) ||
        reg.id.toLowerCase().includes(searchQuery) ||
        reg.studentId.toLowerCase().includes(searchQuery) ||
        reg.schoolInfo.name.toLowerCase().includes(searchQuery)
      );
    }

    if (examLevel) {
      registrations = registrations.filter(reg => reg.examLevel === examLevel);
    }

    if (examSession) {
      registrations = registrations.filter(reg => reg.examSession === examSession);
    }

    if (status) {
      registrations = registrations.filter(reg => reg.status === status);
    }

    if (paymentStatus) {
      registrations = registrations.filter(reg => reg.paymentStatus === paymentStatus);
    }

    if (examCenter) {
      registrations = registrations.filter(reg => 
        reg.examCenter.toLowerCase().includes(examCenter.toLowerCase())
      );
    }

    if (region) {
      registrations = registrations.filter(reg => 
        reg.personalInfo.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    // Sort registrations
    registrations.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'fullName':
          aValue = a.personalInfo.fullName.toLowerCase();
          bValue = b.personalInfo.fullName.toLowerCase();
          break;
        case 'examLevel':
          aValue = a.examLevel;
          bValue = b.examLevel;
          break;
        case 'examSession':
          aValue = a.examSession;
          bValue = b.examSession;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'totalAmount':
          aValue = a.fees.totalAmount;
          bValue = b.fees.totalAmount;
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
    const totalRegistrations = registrations.length;
    const totalPages = Math.ceil(totalRegistrations / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRegistrations = registrations.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      total: totalRegistrations,
      byLevel: {
        oLevel: registrations.filter(r => r.examLevel === 'O Level').length,
        aLevel: registrations.filter(r => r.examLevel === 'A Level').length
      },
      byStatus: {
        draft: registrations.filter(r => r.status === 'draft').length,
        submitted: registrations.filter(r => r.status === 'submitted').length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length,
        paymentPending: registrations.filter(r => r.status === 'payment_pending').length
      },
      byPaymentStatus: {
        pending: registrations.filter(r => r.paymentStatus === 'pending').length,
        partial: registrations.filter(r => r.paymentStatus === 'partial').length,
        completed: registrations.filter(r => r.paymentStatus === 'completed').length,
        failed: registrations.filter(r => r.paymentStatus === 'failed').length
      },
      totalFees: registrations.reduce((sum, reg) => sum + reg.fees.totalAmount, 0),
      averageFees: registrations.length > 0 ? 
        Math.round(registrations.reduce((sum, reg) => sum + reg.fees.totalAmount, 0) / registrations.length) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        registrations: paginatedRegistrations,
        pagination: {
          currentPage: page,
          totalPages,
          totalRegistrations,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: {
          query,
          examLevel,
          examSession,
          status,
          paymentStatus,
          examCenter,
          region,
          sortBy,
          sortOrder
        },
        statistics: stats
      },
      message: 'Student registrations retrieved successfully'
    });

  } catch (error) {
    console.error('Search registrations error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
