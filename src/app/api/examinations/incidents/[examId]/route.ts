import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared incident reports storage (in production, use database)
const incidentReports: Map<string, any> = new Map();

// Helper function to check access permissions
const canManageIncidents = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return ['admin', 'examiner', 'teacher'].includes(user?.userType || '');
};

// GET - Get incidents by exam ID
export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
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

    if (!canManageIncidents(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view incidents' },
        { status: 403 }
      );
    }

    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const incidentType = searchParams.get('incidentType') || '';
    const severity = searchParams.get('severity') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const centerId = searchParams.get('centerId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get incidents for the specific exam
    let incidents = Array.from(incidentReports.values()).filter(
      incident => incident.examId === examId
    );

    if (incidents.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          incidents: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalIncidents: 0,
            limit,
            hasNextPage: false,
            hasPreviousPage: false
          },
          statistics: {
            total: 0,
            byType: {},
            bySeverity: {},
            byStatus: {},
            byPriority: {},
            byCenter: {},
            totalCandidatesAffected: 0,
            totalTimeDelayed: 0,
            resolutionRate: 0
          }
        },
        message: 'No incidents found for this exam'
      });
    }

    // Apply filters
    if (incidentType) {
      incidents = incidents.filter(incident => incident.incidentType === incidentType);
    }

    if (severity) {
      incidents = incidents.filter(incident => incident.severity === severity);
    }

    if (status) {
      incidents = incidents.filter(incident => incident.resolution.status === status);
    }

    if (priority) {
      incidents = incidents.filter(incident => incident.priority === priority);
    }

    if (centerId) {
      incidents = incidents.filter(incident => incident.centerId === centerId);
    }

    // Sort by priority and creation time
    incidents.sort((a, b) => {
      const priorityOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Calculate pagination
    const totalIncidents = incidents.length;
    const totalPages = Math.ceil(totalIncidents / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIncidents = incidents.slice(startIndex, endIndex);

    // Calculate statistics
    const statistics = {
      total: totalIncidents,
      byType: incidents.reduce((acc: any, incident) => {
        acc[incident.incidentType] = (acc[incident.incidentType] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: incidents.reduce((acc: any, incident) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      }, {}),
      byStatus: incidents.reduce((acc: any, incident) => {
        acc[incident.resolution.status] = (acc[incident.resolution.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: incidents.reduce((acc: any, incident) => {
        acc[incident.priority] = (acc[incident.priority] || 0) + 1;
        return acc;
      }, {}),
      byCenter: incidents.reduce((acc: any, incident) => {
        acc[incident.centerName] = (acc[incident.centerName] || 0) + 1;
        return acc;
      }, {}),
      totalCandidatesAffected: incidents.reduce((sum, incident) => sum + incident.impact.candidatesAffected, 0),
      totalTimeDelayed: incidents.reduce((sum, incident) => sum + incident.impact.timeDelayed, 0),
      resolutionRate: totalIncidents > 0 ? 
        Math.round((incidents.filter(i => ['resolved', 'closed'].includes(i.resolution.status)).length / totalIncidents) * 100) : 0
    };

    // Calculate trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentIncidents = incidents.filter(incident => new Date(incident.createdAt) >= sevenDaysAgo);
    
    const trends = {
      recentIncidents: recentIncidents.length,
      trendDirection: recentIncidents.length > (totalIncidents - recentIncidents.length) ? 'increasing' : 'decreasing',
      mostCommonType: Object.entries(statistics.byType).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'none',
      averageResolutionTime: calculateAverageResolutionTime(incidents.filter(i => i.resolution.resolutionDate))
    };

    return NextResponse.json({
      success: true,
      data: {
        incidents: paginatedIncidents,
        pagination: {
          currentPage: page,
          totalPages,
          totalIncidents,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        statistics,
        trends
      },
      message: 'Incidents retrieved successfully'
    });

  } catch (error) {
    console.error('Get incidents by exam error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update incident by exam (bulk operations)
export async function PUT(
  request: NextRequest,
  { params }: { params: { examId: string } }
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

    if (!canManageIncidents(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to manage incidents' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const { examId } = params;
    const body = await request.json();
    const { action, incidentIds, updateData } = body;

    // Get incidents for the exam
    let incidents = Array.from(incidentReports.values()).filter(
      incident => incident.examId === examId
    );

    if (incidents.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No incidents found for this exam' },
        { status: 404 }
      );
    }

    // Filter by specific incident IDs if provided
    if (incidentIds && incidentIds.length > 0) {
      incidents = incidents.filter(incident => incidentIds.includes(incident.id));
    }

    const updatedIncidents = [];

    // Handle bulk actions
    switch (action) {
      case 'bulk_status_update':
        if (!updateData.status) {
          return NextResponse.json(
            { success: false, message: 'Status is required for bulk status update' },
            { status: 400 }
          );
        }

        for (const incident of incidents) {
          const updatedIncident = {
            ...incident,
            resolution: {
              ...incident.resolution,
              status: updateData.status
            },
            updatedAt: new Date().toISOString()
          };

          if (updateData.status === 'resolved' || updateData.status === 'closed') {
            updatedIncident.resolution.resolutionDate = new Date().toISOString();
            updatedIncident.resolution.resolutionSummary = updateData.resolutionSummary || 'Bulk resolution';
            updatedIncident.reviewedBy = userId;
            updatedIncident.reviewedAt = new Date().toISOString();
          }

          incidentReports.set(incident.id, updatedIncident);
          updatedIncidents.push(updatedIncident);
        }
        break;

      case 'bulk_priority_update':
        if (!updateData.priority) {
          return NextResponse.json(
            { success: false, message: 'Priority is required for bulk priority update' },
            { status: 400 }
          );
        }

        for (const incident of incidents) {
          const updatedIncident = {
            ...incident,
            priority: updateData.priority,
            updatedAt: new Date().toISOString()
          };

          incidentReports.set(incident.id, updatedIncident);
          updatedIncidents.push(updatedIncident);
        }
        break;

      case 'bulk_assign_reviewer':
        if (!updateData.reviewerId) {
          return NextResponse.json(
            { success: false, message: 'Reviewer ID is required for bulk assignment' },
            { status: 400 }
          );
        }

        for (const incident of incidents) {
          const updatedIncident = {
            ...incident,
            reviewedBy: updateData.reviewerId,
            reviewedAt: new Date().toISOString(),
            resolution: {
              ...incident.resolution,
              status: incident.resolution.status === 'open' ? 'investigating' : incident.resolution.status
            },
            updatedAt: new Date().toISOString()
          };

          incidentReports.set(incident.id, updatedIncident);
          updatedIncidents.push(updatedIncident);
        }
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid bulk action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedIncidents,
        totalUpdated: updatedIncidents.length
      },
      message: `Bulk ${action} completed successfully`
    });

  } catch (error) {
    console.error('Bulk update incidents error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate average resolution time
const calculateAverageResolutionTime = (resolvedIncidents: any[]): number => {
  if (resolvedIncidents.length === 0) return 0;

  const totalTime = resolvedIncidents.reduce((sum, incident) => {
    const created = new Date(incident.createdAt).getTime();
    const resolved = new Date(incident.resolution.resolutionDate).getTime();
    return sum + (resolved - created);
  }, 0);

  // Return average time in hours
  return Math.round(totalTime / (resolvedIncidents.length * 60 * 60 * 1000));
};
