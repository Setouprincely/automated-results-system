import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Pre-defined report templates
const reportTemplates = new Map<string, {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'administrative' | 'statistical' | 'comparative' | 'quality';
  dataSource: 'results' | 'markings' | 'certificates' | 'analytics' | 'combined';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requiredPermissions: string[];
  configuration: {
    filters: any;
    columns: any[];
    groupBy?: string[];
    sortBy?: any[];
    calculations?: any[];
    visualizations?: any[];
  };
  sampleOutput: {
    description: string;
    previewData: any[];
  };
  tags: string[];
  isBuiltIn: boolean;
  createdBy?: string;
  createdAt: string;
  lastModified: string;
  usageCount: number;
  rating: number;
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}>();

// Initialize built-in templates
const initializeBuiltInTemplates = () => {
  // Student Performance Summary Template
  reportTemplates.set('student-performance-summary', {
    id: 'student-performance-summary',
    name: 'Student Performance Summary',
    description: 'Comprehensive overview of individual student performance across all subjects',
    category: 'academic',
    dataSource: 'results',
    difficulty: 'beginner',
    estimatedTime: '2-3 minutes',
    requiredPermissions: ['admin', 'examiner', 'teacher'],
    configuration: {
      filters: {
        examLevel: '',
        examSession: ''
      },
      columns: [
        { field: 'studentName', label: 'Student Name', type: 'text', visible: true },
        { field: 'studentNumber', label: 'Student Number', type: 'text', visible: true },
        { field: 'schoolName', label: 'School', type: 'text', visible: true },
        { field: 'overallPerformance.averagePercentage', label: 'Average %', type: 'percentage', visible: true },
        { field: 'overallPerformance.classification', label: 'Classification', type: 'text', visible: true },
        { field: 'overallPerformance.totalSubjects', label: 'Total Subjects', type: 'number', visible: true },
        { field: 'overallPerformance.subjectsPassed', label: 'Subjects Passed', type: 'number', visible: true }
      ],
      sortBy: [{ field: 'overallPerformance.averagePercentage', direction: 'desc' }],
      calculations: [
        {
          id: 'passRate',
          name: 'Pass Rate',
          formula: 'subjectsPassed / totalSubjects * 100',
          type: 'percentage'
        }
      ]
    },
    sampleOutput: {
      description: 'Shows student names, numbers, schools, average performance, and pass rates',
      previewData: [
        { studentName: 'John Doe', studentNumber: 'CM2025-12345', schoolName: 'Example High School', averagePercentage: '85%', classification: 'Distinction' },
        { studentName: 'Jane Smith', studentNumber: 'CM2025-12346', schoolName: 'Sample Academy', averagePercentage: '78%', classification: 'Credit' }
      ]
    },
    tags: ['student', 'performance', 'summary', 'academic'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 0,
    rating: 4.8,
    reviews: []
  });

  // School Comparison Template
  reportTemplates.set('school-comparison', {
    id: 'school-comparison',
    name: 'School Performance Comparison',
    description: 'Compare performance metrics across multiple schools',
    category: 'comparative',
    dataSource: 'results',
    difficulty: 'intermediate',
    estimatedTime: '3-5 minutes',
    requiredPermissions: ['admin', 'examiner'],
    configuration: {
      filters: {
        examLevel: '',
        examSession: '',
        schoolIds: []
      },
      columns: [
        { field: 'schoolName', label: 'School Name', type: 'text', visible: true },
        { field: 'totalStudents', label: 'Total Students', type: 'number', visible: true },
        { field: 'averagePerformance', label: 'Average Performance', type: 'percentage', visible: true },
        { field: 'passRate', label: 'Pass Rate', type: 'percentage', visible: true },
        { field: 'excellenceRate', label: 'Excellence Rate', type: 'percentage', visible: true }
      ],
      groupBy: ['schoolName'],
      sortBy: [{ field: 'averagePerformance', direction: 'desc' }]
    },
    sampleOutput: {
      description: 'Compares schools by student count, average performance, pass rates, and excellence rates',
      previewData: [
        { schoolName: 'Top High School', totalStudents: 150, averagePerformance: '82%', passRate: '95%', excellenceRate: '45%' },
        { schoolName: 'Good Academy', totalStudents: 120, averagePerformance: '75%', passRate: '88%', excellenceRate: '32%' }
      ]
    },
    tags: ['school', 'comparison', 'performance', 'ranking'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 0,
    rating: 4.6,
    reviews: []
  });

  // Subject Analysis Template
  reportTemplates.set('subject-analysis', {
    id: 'subject-analysis',
    name: 'Subject Performance Analysis',
    description: 'Detailed analysis of performance in specific subjects',
    category: 'academic',
    dataSource: 'results',
    difficulty: 'intermediate',
    estimatedTime: '4-6 minutes',
    requiredPermissions: ['admin', 'examiner', 'teacher'],
    configuration: {
      filters: {
        subjectCodes: [],
        examLevel: '',
        examSession: ''
      },
      columns: [
        { field: 'subjectCode', label: 'Subject Code', type: 'text', visible: true },
        { field: 'subjectName', label: 'Subject Name', type: 'text', visible: true },
        { field: 'totalCandidates', label: 'Total Candidates', type: 'number', visible: true },
        { field: 'averagePercentage', label: 'Average %', type: 'percentage', visible: true },
        { field: 'passRate', label: 'Pass Rate', type: 'percentage', visible: true },
        { field: 'gradeDistribution', label: 'Grade Distribution', type: 'text', visible: true }
      ],
      groupBy: ['subjectCode'],
      sortBy: [{ field: 'averagePercentage', direction: 'desc' }]
    },
    sampleOutput: {
      description: 'Shows subject-wise performance metrics including pass rates and grade distributions',
      previewData: [
        { subjectCode: 'MAT', subjectName: 'Mathematics', totalCandidates: 500, averagePercentage: '72%', passRate: '85%' },
        { subjectCode: 'ENG', subjectName: 'English', totalCandidates: 500, averagePercentage: '68%', passRate: '82%' }
      ]
    },
    tags: ['subject', 'analysis', 'performance', 'grades'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 0,
    rating: 4.7,
    reviews: []
  });

  // Regional Performance Template
  reportTemplates.set('regional-performance', {
    id: 'regional-performance',
    name: 'Regional Performance Overview',
    description: 'Performance comparison across different regions',
    category: 'comparative',
    dataSource: 'results',
    difficulty: 'advanced',
    estimatedTime: '5-8 minutes',
    requiredPermissions: ['admin', 'examiner'],
    configuration: {
      filters: {
        regionIds: [],
        examLevel: '',
        examSession: ''
      },
      columns: [
        { field: 'region', label: 'Region', type: 'text', visible: true },
        { field: 'totalStudents', label: 'Total Students', type: 'number', visible: true },
        { field: 'totalSchools', label: 'Total Schools', type: 'number', visible: true },
        { field: 'averagePerformance', label: 'Average Performance', type: 'percentage', visible: true },
        { field: 'passRate', label: 'Pass Rate', type: 'percentage', visible: true },
        { field: 'ranking', label: 'National Ranking', type: 'number', visible: true }
      ],
      groupBy: ['region'],
      sortBy: [{ field: 'averagePerformance', direction: 'desc' }],
      visualizations: [
        {
          type: 'chart',
          chartType: 'bar',
          config: { xAxis: 'region', yAxis: 'averagePerformance' }
        }
      ]
    },
    sampleOutput: {
      description: 'Regional comparison with performance metrics and rankings',
      previewData: [
        { region: 'Centre', totalStudents: 5000, totalSchools: 50, averagePerformance: '75%', passRate: '88%', ranking: 1 },
        { region: 'Littoral', totalStudents: 4500, totalSchools: 45, averagePerformance: '73%', passRate: '85%', ranking: 2 }
      ]
    },
    tags: ['regional', 'comparison', 'ranking', 'geography'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 0,
    rating: 4.5,
    reviews: []
  });

  // Certificate Status Template
  reportTemplates.set('certificate-status', {
    id: 'certificate-status',
    name: 'Certificate Status Report',
    description: 'Track certificate generation and delivery status',
    category: 'administrative',
    dataSource: 'certificates',
    difficulty: 'beginner',
    estimatedTime: '2-3 minutes',
    requiredPermissions: ['admin', 'examiner'],
    configuration: {
      filters: {
        examSession: '',
        certificateType: '',
        status: ''
      },
      columns: [
        { field: 'studentName', label: 'Student Name', type: 'text', visible: true },
        { field: 'studentNumber', label: 'Student Number', type: 'text', visible: true },
        { field: 'certificateNumber', label: 'Certificate Number', type: 'text', visible: true },
        { field: 'certificateType', label: 'Type', type: 'text', visible: true },
        { field: 'status', label: 'Status', type: 'status', visible: true },
        { field: 'issuanceDetails.issuedDate', label: 'Issue Date', type: 'date', visible: true }
      ],
      sortBy: [{ field: 'issuanceDetails.issuedDate', direction: 'desc' }]
    },
    sampleOutput: {
      description: 'Lists certificates with their current status and issue dates',
      previewData: [
        { studentName: 'John Doe', certificateNumber: 'CMOL25123456', certificateType: 'Original', status: 'Issued', issueDate: '2025-01-15' },
        { studentName: 'Jane Smith', certificateNumber: 'CMOL25123457', certificateType: 'Original', status: 'Generated', issueDate: '2025-01-14' }
      ]
    },
    tags: ['certificate', 'status', 'administrative', 'tracking'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 0,
    rating: 4.4,
    reviews: []
  });

  // Examiner Performance Template
  reportTemplates.set('examiner-performance', {
    id: 'examiner-performance',
    name: 'Examiner Performance Metrics',
    description: 'Evaluate examiner marking quality and efficiency',
    category: 'quality',
    dataSource: 'markings',
    difficulty: 'advanced',
    estimatedTime: '6-10 minutes',
    requiredPermissions: ['admin'],
    configuration: {
      filters: {
        examSession: '',
        subjectCodes: []
      },
      columns: [
        { field: 'examinerId', label: 'Examiner ID', type: 'text', visible: true },
        { field: 'totalScripts', label: 'Total Scripts', type: 'number', visible: true },
        { field: 'completedScripts', label: 'Completed', type: 'number', visible: true },
        { field: 'completionRate', label: 'Completion Rate', type: 'percentage', visible: true },
        { field: 'averageMarkingTime', label: 'Avg Time (min)', type: 'number', visible: true },
        { field: 'qualityScore', label: 'Quality Score', type: 'number', visible: true },
        { field: 'consistencyScore', label: 'Consistency', type: 'number', visible: true }
      ],
      sortBy: [{ field: 'qualityScore', direction: 'desc' }]
    },
    sampleOutput: {
      description: 'Examiner performance metrics including completion rates and quality scores',
      previewData: [
        { examinerId: 'EX001', totalScripts: 100, completedScripts: 98, completionRate: '98%', averageMarkingTime: 25, qualityScore: 92 },
        { examinerId: 'EX002', totalScripts: 95, completedScripts: 90, completionRate: '95%', averageMarkingTime: 28, qualityScore: 88 }
      ]
    },
    tags: ['examiner', 'quality', 'performance', 'marking'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    usageCount: 0,
    rating: 4.3,
    reviews: []
  });
};

// Initialize templates on module load
initializeBuiltInTemplates();

// Helper function to check template access
const canViewTemplates = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user !== null; // All authenticated users can view templates
};

// Helper function to check if user can use template
const canUseTemplate = (template: any, userType: string): boolean => {
  return template.requiredPermissions.includes(userType) || userType === 'admin';
};

// GET - Get report templates
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

    if (!canViewTemplates(token)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const dataSource = searchParams.get('dataSource') || '';
    const includeConfiguration = searchParams.get('includeConfiguration') === 'true';

    // Get all templates
    let templates = Array.from(reportTemplates.values());

    // Filter by user permissions
    templates = templates.filter(template => canUseTemplate(template, user.userType));

    // Apply filters
    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    if (difficulty) {
      templates = templates.filter(template => template.difficulty === difficulty);
    }

    if (dataSource) {
      templates = templates.filter(template => template.dataSource === dataSource);
    }

    // Sort by rating and usage
    templates.sort((a, b) => {
      const scoreA = a.rating * 0.7 + (a.usageCount / 100) * 0.3;
      const scoreB = b.rating * 0.7 + (b.usageCount / 100) * 0.3;
      return scoreB - scoreA;
    });

    // Prepare response data
    const responseTemplates = templates.map(template => {
      const baseTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        dataSource: template.dataSource,
        difficulty: template.difficulty,
        estimatedTime: template.estimatedTime,
        requiredPermissions: template.requiredPermissions,
        tags: template.tags,
        isBuiltIn: template.isBuiltIn,
        usageCount: template.usageCount,
        rating: template.rating,
        sampleOutput: template.sampleOutput,
        canUse: canUseTemplate(template, user.userType)
      };

      if (includeConfiguration) {
        return {
          ...baseTemplate,
          configuration: template.configuration
        };
      }

      return baseTemplate;
    });

    // Calculate summary statistics
    const summary = {
      totalTemplates: templates.length,
      byCategory: {
        academic: templates.filter(t => t.category === 'academic').length,
        administrative: templates.filter(t => t.category === 'administrative').length,
        statistical: templates.filter(t => t.category === 'statistical').length,
        comparative: templates.filter(t => t.category === 'comparative').length,
        quality: templates.filter(t => t.category === 'quality').length
      },
      byDifficulty: {
        beginner: templates.filter(t => t.difficulty === 'beginner').length,
        intermediate: templates.filter(t => t.difficulty === 'intermediate').length,
        advanced: templates.filter(t => t.difficulty === 'advanced').length
      },
      byDataSource: {
        results: templates.filter(t => t.dataSource === 'results').length,
        markings: templates.filter(t => t.dataSource === 'markings').length,
        certificates: templates.filter(t => t.dataSource === 'certificates').length,
        analytics: templates.filter(t => t.dataSource === 'analytics').length,
        combined: templates.filter(t => t.dataSource === 'combined').length
      },
      mostPopular: templates.slice(0, 5).map(t => ({ id: t.id, name: t.name, usageCount: t.usageCount })),
      highestRated: templates.sort((a, b) => b.rating - a.rating).slice(0, 5).map(t => ({ id: t.id, name: t.name, rating: t.rating }))
    };

    return NextResponse.json({
      success: true,
      data: {
        templates: responseTemplates,
        summary
      },
      message: 'Report templates retrieved successfully'
    });

  } catch (error) {
    console.error('Get report templates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create custom template or rate existing template
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

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, templateId, rating, comment, templateData } = body;

    if (action === 'rate') {
      // Rate an existing template
      if (!templateId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, message: 'Invalid rating data' },
          { status: 400 }
        );
      }

      const template = reportTemplates.get(templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        );
      }

      // Add or update review
      const existingReviewIndex = template.reviews.findIndex(r => r.userId === userId);
      const review = {
        userId,
        rating,
        comment: comment || '',
        date: new Date().toISOString()
      };

      if (existingReviewIndex >= 0) {
        template.reviews[existingReviewIndex] = review;
      } else {
        template.reviews.push(review);
      }

      // Recalculate average rating
      template.rating = Math.round(
        (template.reviews.reduce((sum, r) => sum + r.rating, 0) / template.reviews.length) * 10
      ) / 10;

      template.lastModified = new Date().toISOString();
      reportTemplates.set(templateId, template);

      return NextResponse.json({
        success: true,
        data: { templateId, newRating: template.rating },
        message: 'Template rated successfully'
      });

    } else if (action === 'create') {
      // Create custom template (admin only)
      if (user.userType !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Only administrators can create custom templates' },
          { status: 403 }
        );
      }

      if (!templateData || !templateData.name || !templateData.configuration) {
        return NextResponse.json(
          { success: false, message: 'Invalid template data' },
          { status: 400 }
        );
      }

      const newTemplateId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newTemplate = {
        id: newTemplateId,
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category || 'custom',
        dataSource: templateData.dataSource,
        difficulty: templateData.difficulty || 'intermediate',
        estimatedTime: templateData.estimatedTime || '5-10 minutes',
        requiredPermissions: templateData.requiredPermissions || ['admin'],
        configuration: templateData.configuration,
        sampleOutput: templateData.sampleOutput || { description: '', previewData: [] },
        tags: templateData.tags || [],
        isBuiltIn: false,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usageCount: 0,
        rating: 0,
        reviews: []
      };

      reportTemplates.set(newTemplateId, newTemplate);

      return NextResponse.json({
        success: true,
        data: { templateId: newTemplateId, template: newTemplate },
        message: 'Custom template created successfully'
      });

    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Template action error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
