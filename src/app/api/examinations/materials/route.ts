import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Examination materials storage (in production, use database)
const examMaterials: Map<string, {
  id: string;
  examId: string;
  examTitle: string;
  examDate: string;
  examLevel: 'O Level' | 'A Level';
  subjectCode: string;
  subjectName: string;
  paperNumber: number;
  materials: {
    questionPapers: Array<{
      id: string;
      type: 'main' | 'alternative' | 'supplementary';
      language: 'English' | 'French';
      fileUrl: string;
      fileName: string;
      fileSize: number;
      checksum: string;
      uploadedAt: string;
      uploadedBy: string;
    }>;
    answerSheets: Array<{
      id: string;
      type: 'standard' | 'special_needs' | 'extra';
      quantity: number;
      barcoded: boolean;
      serialNumbers: string[];
    }>;
    additionalMaterials: Array<{
      id: string;
      name: string;
      type: 'calculator' | 'formula_sheet' | 'graph_paper' | 'map' | 'other';
      description: string;
      quantity: number;
      mandatory: boolean;
    }>;
  };
  distribution: {
    centers: Array<{
      centerId: string;
      centerName: string;
      quantities: {
        questionPapers: number;
        answerSheets: number;
        additionalMaterials: Record<string, number>;
      };
      deliveryStatus: 'pending' | 'dispatched' | 'delivered' | 'confirmed';
      deliveryDate?: string;
      receivedBy?: string;
      notes?: string;
    }>;
    totalQuantities: {
      questionPapers: number;
      answerSheets: number;
      additionalMaterials: Record<string, number>;
    };
  };
  security: {
    encryptionLevel: 'standard' | 'high' | 'maximum';
    accessLevel: 'restricted' | 'confidential' | 'top_secret';
    authorizedPersonnel: string[];
    auditTrail: Array<{
      action: string;
      performedBy: string;
      timestamp: string;
      details: string;
    }>;
  };
  status: 'preparation' | 'ready' | 'distributed' | 'collected' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}> = new Map();

// Helper function to check admin access
const isAdminOrExaminer = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Generate material ID
const generateMaterialId = (examId: string): string => {
  return `MAT-${examId}-${Date.now()}`;
};

// Calculate checksum for file integrity
const calculateChecksum = (fileContent: string): string => {
  // In production, use proper cryptographic hash
  return `checksum-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

// POST - Create examination materials
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
      examId,
      examTitle,
      examDate,
      examLevel,
      subjectCode,
      subjectName,
      paperNumber,
      questionPapers,
      answerSheets,
      additionalMaterials,
      distributionCenters,
      securityLevel = 'standard'
    } = body;

    // Validate required fields
    if (!examId || !examTitle || !examDate || !examLevel || !subjectCode || !paperNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required examination information' },
        { status: 400 }
      );
    }

    // Check if materials already exist for this exam
    const existingMaterials = Array.from(examMaterials.values()).find(
      material => material.examId === examId && material.paperNumber === paperNumber
    );

    if (existingMaterials) {
      return NextResponse.json(
        { success: false, message: 'Materials already exist for this exam and paper' },
        { status: 409 }
      );
    }

    // Generate material ID
    const materialId = generateMaterialId(examId);

    // Process question papers
    const processedQuestionPapers = (questionPapers || []).map((paper: any) => ({
      id: `QP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: paper.type || 'main',
      language: paper.language || 'English',
      fileUrl: paper.fileUrl || '',
      fileName: paper.fileName || `${subjectCode}_P${paperNumber}_${paper.language || 'EN'}.pdf`,
      fileSize: paper.fileSize || 0,
      checksum: calculateChecksum(paper.fileContent || ''),
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId
    }));

    // Process answer sheets
    const processedAnswerSheets = (answerSheets || []).map((sheet: any) => ({
      id: `AS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: sheet.type || 'standard',
      quantity: sheet.quantity || 100,
      barcoded: sheet.barcoded || true,
      serialNumbers: sheet.serialNumbers || []
    }));

    // Process additional materials
    const processedAdditionalMaterials = (additionalMaterials || []).map((material: any) => ({
      id: `AM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: material.name,
      type: material.type || 'other',
      description: material.description || '',
      quantity: material.quantity || 0,
      mandatory: material.mandatory || false
    }));

    // Calculate total quantities
    const totalQuantities = {
      questionPapers: processedQuestionPapers.reduce((sum, paper) => sum + 1, 0),
      answerSheets: processedAnswerSheets.reduce((sum, sheet) => sum + sheet.quantity, 0),
      additionalMaterials: processedAdditionalMaterials.reduce((acc, material) => {
        acc[material.name] = material.quantity;
        return acc;
      }, {} as Record<string, number>)
    };

    // Process distribution centers
    const distributionCentersData = (distributionCenters || []).map((center: any) => ({
      centerId: center.centerId,
      centerName: center.centerName,
      quantities: center.quantities || {
        questionPapers: Math.ceil(totalQuantities.questionPapers / (distributionCenters?.length || 1)),
        answerSheets: Math.ceil(totalQuantities.answerSheets / (distributionCenters?.length || 1)),
        additionalMaterials: {}
      },
      deliveryStatus: 'pending' as const,
      notes: center.notes
    }));

    // Create examination materials
    const materials = {
      id: materialId,
      examId,
      examTitle,
      examDate,
      examLevel: examLevel as 'O Level' | 'A Level',
      subjectCode,
      subjectName,
      paperNumber,
      materials: {
        questionPapers: processedQuestionPapers,
        answerSheets: processedAnswerSheets,
        additionalMaterials: processedAdditionalMaterials
      },
      distribution: {
        centers: distributionCentersData,
        totalQuantities
      },
      security: {
        encryptionLevel: securityLevel as 'standard' | 'high' | 'maximum',
        accessLevel: 'confidential' as const,
        authorizedPersonnel: [userId],
        auditTrail: [
          {
            action: 'Materials Created',
            performedBy: userId,
            timestamp: new Date().toISOString(),
            details: 'Initial materials setup completed'
          }
        ]
      },
      status: 'preparation' as const,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store examination materials
    examMaterials.set(materialId, materials);

    return NextResponse.json({
      success: true,
      data: materials,
      message: 'Examination materials created successfully'
    });

  } catch (error) {
    console.error('Create exam materials error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get materials data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Mock data for materials
    const mockData = {
      message: 'materials data retrieved successfully',
      timestamp: new Date().toISOString(),
      data: []
    };
    
    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'materials retrieved successfully'
    });
  } catch (error) {
    console.error('materials GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

