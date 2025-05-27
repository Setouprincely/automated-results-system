import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Incident reports storage (in production, use database)
const incidentReports: Map<string, {
  id: string;
  examId: string;
  examTitle: string;
  examDate: string;
  examSession: string;
  centerId: string;
  centerName: string;
  roomNumber: string;
  incidentType: 'cheating' | 'misconduct' | 'technical' | 'medical' | 'security' | 'disruption' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timeOccurred: string;
  timeReported: string;
  involvedPersons: Array<{
    type: 'candidate' | 'invigilator' | 'staff' | 'visitor';
    id?: string;
    name: string;
    role?: string;
    candidateNumber?: string;
    description: string;
  }>;
  witnesses: Array<{
    name: string;
    role: string;
    contactInfo: string;
    statement: string;
  }>;
  evidence: Array<{
    type: 'photo' | 'video' | 'document' | 'audio' | 'physical';
    description: string;
    fileUrl?: string;
    fileName?: string;
    collectedBy: string;
    collectedAt: string;
  }>;
  actionsTaken: Array<{
    action: string;
    takenBy: string;
    takenAt: string;
    outcome: string;
    notes?: string;
  }>;
  followUpRequired: boolean;
  followUpActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed';
    notes?: string;
  }>;
  impact: {
    candidatesAffected: number;
    examDisruption: boolean;
    timeDelayed: number; // in minutes
    additionalCosts: number;
  };
  resolution: {
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    resolutionDate?: string;
    resolutionSummary?: string;
    disciplinaryAction?: string;
    preventiveMeasures?: string[];
  };
  reportedBy: string;
  reporterRole: string;
  reporterContact: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  relatedIncidents: string[];
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Helper function to check access permissions
const canManageIncidents = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return ['admin', 'examiner', 'teacher'].includes(user?.userType || '');
};

// Generate incident ID
const generateIncidentId = (examId: string): string => {
  return `INC-${examId}-${Date.now()}`;
};

// Determine priority based on incident type and severity
const calculatePriority = (incidentType: string, severity: string): string => {
  const priorityMatrix: Record<string, Record<string, string>> = {
    'cheating': { 'low': 'normal', 'medium': 'high', 'high': 'urgent', 'critical': 'urgent' },
    'security': { 'low': 'normal', 'medium': 'high', 'high': 'urgent', 'critical': 'urgent' },
    'medical': { 'low': 'normal', 'medium': 'high', 'high': 'urgent', 'critical': 'urgent' },
    'technical': { 'low': 'low', 'medium': 'normal', 'high': 'high', 'critical': 'urgent' },
    'misconduct': { 'low': 'low', 'medium': 'normal', 'high': 'high', 'critical': 'urgent' },
    'disruption': { 'low': 'low', 'medium': 'normal', 'high': 'high', 'critical': 'high' },
    'other': { 'low': 'low', 'medium': 'normal', 'high': 'normal', 'critical': 'high' }
  };

  return priorityMatrix[incidentType]?.[severity] || 'normal';
};

// POST - Create incident report
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

    if (!canManageIncidents(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to report incidents' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    const body = await request.json();
    const {
      examId,
      examTitle,
      examDate,
      examSession,
      centerId,
      centerName,
      roomNumber,
      incidentType,
      severity,
      title,
      description,
      timeOccurred,
      involvedPersons,
      witnesses,
      evidence,
      actionsTaken,
      impact,
      tags
    } = body;

    // Validate required fields
    if (!examId || !incidentType || !severity || !title || !description || !timeOccurred) {
      return NextResponse.json(
        { success: false, message: 'Missing required incident information' },
        { status: 400 }
      );
    }

    // Validate incident type
    const validIncidentTypes = ['cheating', 'misconduct', 'technical', 'medical', 'security', 'disruption', 'other'];
    if (!validIncidentTypes.includes(incidentType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid incident type' },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { success: false, message: 'Invalid severity level' },
        { status: 400 }
      );
    }

    // Generate incident ID
    const incidentId = generateIncidentId(examId);

    // Calculate priority
    const priority = calculatePriority(incidentType, severity);

    // Process involved persons
    const processedInvolvedPersons = (involvedPersons || []).map((person: any) => ({
      type: person.type,
      id: person.id,
      name: person.name,
      role: person.role,
      candidateNumber: person.candidateNumber,
      description: person.description
    }));

    // Process witnesses
    const processedWitnesses = (witnesses || []).map((witness: any) => ({
      name: witness.name,
      role: witness.role,
      contactInfo: witness.contactInfo,
      statement: witness.statement
    }));

    // Process evidence
    const processedEvidence = (evidence || []).map((item: any) => ({
      type: item.type,
      description: item.description,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      collectedBy: userId,
      collectedAt: new Date().toISOString()
    }));

    // Process actions taken
    const processedActionsTaken = (actionsTaken || []).map((action: any) => ({
      action: action.action,
      takenBy: action.takenBy || userId,
      takenAt: action.takenAt || new Date().toISOString(),
      outcome: action.outcome,
      notes: action.notes
    }));

    // Create incident report
    const incidentReport = {
      id: incidentId,
      examId,
      examTitle: examTitle || `Exam ${examId}`,
      examDate: examDate || new Date().toISOString().split('T')[0],
      examSession: examSession || 'Unknown',
      centerId: centerId || 'Unknown',
      centerName: centerName || 'Unknown Center',
      roomNumber: roomNumber || 'Unknown',
      incidentType: incidentType as 'cheating' | 'misconduct' | 'technical' | 'medical' | 'security' | 'disruption' | 'other',
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      title,
      description,
      timeOccurred,
      timeReported: new Date().toISOString(),
      involvedPersons: processedInvolvedPersons,
      witnesses: processedWitnesses,
      evidence: processedEvidence,
      actionsTaken: processedActionsTaken,
      followUpRequired: severity === 'high' || severity === 'critical' || incidentType === 'cheating',
      followUpActions: [],
      impact: {
        candidatesAffected: impact?.candidatesAffected || 0,
        examDisruption: impact?.examDisruption || false,
        timeDelayed: impact?.timeDelayed || 0,
        additionalCosts: impact?.additionalCosts || 0
      },
      resolution: {
        status: 'open' as const
      },
      reportedBy: userId,
      reporterRole: user?.userType || 'Unknown',
      reporterContact: user?.email || 'Unknown',
      priority: priority as 'low' | 'normal' | 'high' | 'urgent',
      tags: tags || [],
      relatedIncidents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Auto-generate follow-up actions for high priority incidents
    if (incidentReport.followUpRequired) {
      incidentReport.followUpActions = [
        {
          action: 'Investigate incident thoroughly',
          assignedTo: 'Investigation Team',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          status: 'pending' as const,
          notes: 'High priority incident requires immediate investigation'
        }
      ];

      if (incidentType === 'cheating') {
        incidentReport.followUpActions.push({
          action: 'Review candidate examination materials',
          assignedTo: 'Examination Board',
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
          status: 'pending' as const,
          notes: 'Potential academic misconduct requires material review'
        });
      }
    }

    // Store incident report
    incidentReports.set(incidentId, incidentReport);

    return NextResponse.json({
      success: true,
      data: incidentReport,
      message: 'Incident report created successfully'
    });

  } catch (error) {
    console.error('Create incident report error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get incidents data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mock data for incidents
    const mockData = {
      message: 'incidents data retrieved successfully',
      timestamp: new Date().toISOString(),
      data: []
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'incidents retrieved successfully'
    });
  } catch (error) {
    console.error('incidents GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

