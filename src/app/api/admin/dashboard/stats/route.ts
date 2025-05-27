import { NextRequest, NextResponse } from 'next/server';

// Mock dashboard statistics - replace with database queries
const mockStats = {
  totalUsers: 8750,
  activeExaminations: 12,
  pendingResults: 4,
  systemStatus: "Operational",
  serverUptime: "99.98%",
  todayLogins: 243,
  storageUsed: "68%",
  totalStudents: 15420,
  totalExaminers: 245,
  totalSchools: 89,
  completedExams: 156,
  pendingVerifications: 23,
  publishedResults: 134
};

const mockRecentActivity = [
  { 
    id: 1, 
    action: 'User created', 
    user: 'Jean Biya', 
    details: 'Added new examiner account', 
    time: '15m ago',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  { 
    id: 2, 
    action: 'Config changed', 
    user: 'Admin', 
    details: 'Updated grading algorithm for Physics', 
    time: '2h ago',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 3, 
    action: 'Results published', 
    user: 'System', 
    details: 'Geography A Level results published', 
    time: '5h ago',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 4, 
    action: 'Backup completed', 
    user: 'System', 
    details: 'Daily backup completed successfully', 
    time: '6h ago',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

const mockAlerts = [
  { 
    id: 1, 
    level: 'warning', 
    message: 'Database backup scheduled for tonight at 01:00', 
    time: '3h ago',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 2, 
    level: 'error', 
    message: 'Failed login attempts detected from IP 192.168.1.45', 
    time: '5h ago',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 3, 
    level: 'info', 
    message: 'System update v2.4.1 available', 
    time: '1d ago',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 4, 
    level: 'success', 
    message: 'O Level Chemistry results published successfully', 
    time: '1d ago',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return specific data based on type parameter
    switch (type) {
      case 'stats':
        return NextResponse.json({ 
          success: true, 
          data: mockStats 
        });
      
      case 'activity':
        return NextResponse.json({ 
          success: true, 
          data: mockRecentActivity 
        });
      
      case 'alerts':
        return NextResponse.json({ 
          success: true, 
          data: mockAlerts 
        });
      
      default:
        // Return all dashboard data
        return NextResponse.json({ 
          success: true, 
          data: {
            stats: mockStats,
            recentActivity: mockRecentActivity,
            alerts: mockAlerts
          }
        });
    }
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
