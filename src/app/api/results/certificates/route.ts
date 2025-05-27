import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared results storage (in production, use database)
const examResults: Map<string, any> = new Map();

// Certificates storage
const certificates: Map<string, {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  examId: string;
  examSession: string;
  examLevel: 'O Level' | 'A Level';
  examYear: string;
  schoolName: string;
  centerName: string;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    grade: string;
    gradePoints: number;
    remarks: string;
  }>;
  overallPerformance: {
    classification: string;
    totalSubjects: number;
    subjectsPassed: number;
    averageGrade: string;
    distinction: boolean;
    credit: boolean;
  };
  certificateType: 'original' | 'duplicate' | 'replacement' | 'provisional';
  issuanceDetails: {
    issuedDate: string;
    issuedBy: string;
    authorizedBy: string;
    serialNumber: string;
    batchNumber: string;
  };
  security: {
    digitalSignature: string;
    qrCode: string;
    watermark: string;
    securityCode: string;
    verificationUrl: string;
  };
  delivery: {
    method: 'digital' | 'physical' | 'both';
    status: 'pending' | 'generated' | 'delivered' | 'collected';
    deliveryDate?: string;
    deliveryAddress?: string;
    trackingNumber?: string;
  };
  downloads: Array<{
    downloadId: string;
    downloadedBy: string;
    downloadedAt: string;
    ipAddress: string;
    userAgent: string;
  }>;
  prints: Array<{
    printId: string;
    printedBy: string;
    printedAt: string;
    copies: number;
    reason: string;
  }>;
  status: 'draft' | 'generated' | 'issued' | 'delivered' | 'revoked';
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Helper function to check certificate access
const canManageCertificates = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Generate certificate number
const generateCertificateNumber = (examLevel: string, examYear: string, sequence: number): string => {
  const levelCode = examLevel === 'O Level' ? 'OL' : 'AL';
  const yearCode = examYear.slice(-2);
  const sequenceCode = sequence.toString().padStart(6, '0');
  return `CM${levelCode}${yearCode}${sequenceCode}`;
};

// Generate security features
const generateSecurityFeatures = (certificateId: string): any => {
  const securityCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  const digitalSignature = `SIG-${certificateId}-${Date.now()}`;
  const qrCode = `QR-${certificateId}`;
  const watermark = `WM-${Date.now()}`;
  const verificationUrl = `https://gce.cm/verify/${certificateId}`;

  return {
    digitalSignature,
    qrCode,
    watermark,
    securityCode,
    verificationUrl
  };
};

// Generate certificate template data
const generateCertificateTemplate = (result: any, certificate: any): any => {
  return {
    header: {
      title: 'REPUBLIC OF CAMEROON',
      subtitle: 'MINISTRY OF SECONDARY EDUCATION',
      examTitle: `${result.examLevel} CERTIFICATE`,
      session: result.examSession,
      year: result.examYear
    },
    student: {
      name: result.studentName,
      number: result.studentNumber,
      school: result.schoolName,
      center: result.centerName
    },
    subjects: result.subjects.map((subject: any) => ({
      code: subject.subjectCode,
      name: subject.subjectName,
      grade: subject.grade,
      remarks: subject.remarks
    })),
    performance: {
      classification: result.overallPerformance.classification,
      totalSubjects: result.overallPerformance.totalSubjects,
      subjectsPassed: result.overallPerformance.subjectsPassed,
      distinction: result.overallPerformance.distinction,
      credit: result.overallPerformance.credit
    },
    certification: {
      certificateNumber: certificate.certificateNumber,
      issuedDate: certificate.issuanceDetails.issuedDate,
      authorizedBy: certificate.issuanceDetails.authorizedBy,
      serialNumber: certificate.issuanceDetails.serialNumber
    },
    security: certificate.security
  };
};

// POST - Generate certificates
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

    if (!canManageCertificates(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to generate certificates' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    const body = await request.json();
    const {
      resultIds,
      certificateType = 'original',
      deliveryMethod = 'digital',
      batchName,
      authorizedBy,
      generateAll = false,
      examId
    } = body;

    // Validate required fields
    if (!resultIds || resultIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing result IDs for certificate generation' },
        { status: 400 }
      );
    }

    // Get results for certificate generation
    let results = resultIds.map((id: string) => examResults.get(id)).filter(Boolean);

    // Filter only published results
    results = results.filter(result => result.publication.isPublished);

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No published results found for certificate generation' },
        { status: 404 }
      );
    }

    const generatedCertificates = [];
    const errors = [];
    let sequenceCounter = Date.now() % 1000000; // Simple sequence for demo

    // Generate certificates for each result
    for (const result of results) {
      try {
        // Check if certificate already exists
        const existingCertificate = Array.from(certificates.values()).find(
          cert => cert.studentId === result.studentId && 
                 cert.examId === result.examId &&
                 cert.certificateType === certificateType
        );

        if (existingCertificate && certificateType === 'original') {
          errors.push({
            studentId: result.studentId,
            error: 'Original certificate already exists'
          });
          continue;
        }

        // Generate certificate ID and number
        const certificateId = `CERT-${result.examId}-${result.studentId}-${Date.now()}`;
        const certificateNumber = generateCertificateNumber(
          result.examLevel, 
          result.examYear, 
          ++sequenceCounter
        );

        // Generate security features
        const security = generateSecurityFeatures(certificateId);

        // Create certificate record
        const certificate = {
          id: certificateId,
          certificateNumber,
          studentId: result.studentId,
          studentName: result.studentName,
          studentNumber: result.studentNumber,
          examId: result.examId,
          examSession: result.examSession,
          examLevel: result.examLevel as 'O Level' | 'A Level',
          examYear: result.examYear,
          schoolName: result.schoolName,
          centerName: result.centerName,
          subjects: result.subjects.map((subject: any) => ({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            grade: subject.grade,
            gradePoints: subject.gradePoints,
            remarks: subject.remarks
          })),
          overallPerformance: result.overallPerformance,
          certificateType: certificateType as 'original' | 'duplicate' | 'replacement' | 'provisional',
          issuanceDetails: {
            issuedDate: new Date().toISOString(),
            issuedBy: userId,
            authorizedBy: authorizedBy || user?.fullName || 'System Administrator',
            serialNumber: `SN-${Date.now()}`,
            batchNumber: batchName || `BATCH-${Date.now()}`
          },
          security,
          delivery: {
            method: deliveryMethod as 'digital' | 'physical' | 'both',
            status: 'generated' as const
          },
          downloads: [],
          prints: [],
          status: 'generated' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Generate certificate template data
        const templateData = generateCertificateTemplate(result, certificate);

        // In production, this would generate actual PDF certificate
        const certificateUrl = `https://gce.cm/certificates/${certificateId}/download`;

        // Update result with certificate information
        result.certificates.isGenerated = true;
        result.certificates.certificateNumber = certificateNumber;
        result.certificates.generatedAt = new Date().toISOString();
        result.certificates.downloadUrl = certificateUrl;

        examResults.set(result.id, result);

        // Store certificate
        certificates.set(certificateId, certificate);

        generatedCertificates.push({
          ...certificate,
          templateData,
          downloadUrl: certificateUrl
        });

      } catch (error) {
        errors.push({
          studentId: result.studentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Calculate generation statistics
    const statistics = {
      totalRequested: resultIds.length,
      totalGenerated: generatedCertificates.length,
      totalErrors: errors.length,
      byLevel: {
        oLevel: generatedCertificates.filter(c => c.examLevel === 'O Level').length,
        aLevel: generatedCertificates.filter(c => c.examLevel === 'A Level').length
      },
      byType: {
        [certificateType]: generatedCertificates.length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        certificates: generatedCertificates,
        errors,
        statistics,
        batchInfo: {
          batchName: batchName || `Certificate Batch ${new Date().toISOString().split('T')[0]}`,
          generatedBy: userId,
          generatedAt: new Date().toISOString(),
          totalCertificates: generatedCertificates.length
        }
      },
      message: `${generatedCertificates.length} certificates generated successfully`
    });

  } catch (error) {
    console.error('Generate certificates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get certificates
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

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId') || '';
    const studentId = searchParams.get('studentId') || '';
    const certificateType = searchParams.get('certificateType') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all certificates
    let allCertificates = Array.from(certificates.values());

    // Apply filters
    if (examId) {
      allCertificates = allCertificates.filter(cert => cert.examId === examId);
    }

    if (studentId) {
      allCertificates = allCertificates.filter(cert => cert.studentId === studentId);
    }

    if (certificateType) {
      allCertificates = allCertificates.filter(cert => cert.certificateType === certificateType);
    }

    if (status) {
      allCertificates = allCertificates.filter(cert => cert.status === status);
    }

    // Sort by creation date (most recent first)
    allCertificates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate pagination
    const totalCertificates = allCertificates.length;
    const totalPages = Math.ceil(totalCertificates / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCertificates = allCertificates.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      totalCertificates,
      byType: {
        original: allCertificates.filter(c => c.certificateType === 'original').length,
        duplicate: allCertificates.filter(c => c.certificateType === 'duplicate').length,
        replacement: allCertificates.filter(c => c.certificateType === 'replacement').length,
        provisional: allCertificates.filter(c => c.certificateType === 'provisional').length
      },
      byStatus: {
        draft: allCertificates.filter(c => c.status === 'draft').length,
        generated: allCertificates.filter(c => c.status === 'generated').length,
        issued: allCertificates.filter(c => c.status === 'issued').length,
        delivered: allCertificates.filter(c => c.status === 'delivered').length,
        revoked: allCertificates.filter(c => c.status === 'revoked').length
      },
      byLevel: {
        oLevel: allCertificates.filter(c => c.examLevel === 'O Level').length,
        aLevel: allCertificates.filter(c => c.examLevel === 'A Level').length
      },
      totalDownloads: allCertificates.reduce((sum, cert) => sum + cert.downloads.length, 0),
      totalPrints: allCertificates.reduce((sum, cert) => sum + cert.prints.reduce((printSum, print) => printSum + print.copies, 0), 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        certificates: paginatedCertificates,
        pagination: {
          currentPage: page,
          totalPages,
          totalCertificates,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        summary
      },
      message: 'Certificates retrieved successfully'
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
