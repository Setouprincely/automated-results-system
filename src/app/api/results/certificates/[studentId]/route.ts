import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared certificates storage (in production, use database)
const certificates: Map<string, any> = new Map();

// Helper function to check student certificate access
const canAccessStudentCertificates = (token: string, studentId: string): { canAccess: boolean; userId: string | null; userType: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, userId: null, userType: null };
  
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  
  if (!user) return { canAccess: false, userId: null, userType: null };
  
  // Admin and examiners can access all certificates
  if (user.userType === 'admin' || user.userType === 'examiner') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Students can only access their own certificates
  if (user.userType === 'student' && userId === studentId) {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  // Teachers can access certificates from their school students
  if (user.userType === 'teacher') {
    return { canAccess: true, userId, userType: user.userType };
  }
  
  return { canAccess: false, userId, userType: user.userType };
};

// Log certificate access/download
const logCertificateAccess = (certificateId: string, userId: string, action: 'view' | 'download' | 'print', request: NextRequest): void => {
  const certificate = certificates.get(certificateId);
  if (!certificate) return;

  const logEntry = {
    accessId: `ACCESS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    action,
    timestamp: new Date().toISOString(),
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  };

  if (action === 'download') {
    certificate.downloads.push({
      downloadId: logEntry.accessId,
      downloadedBy: userId,
      downloadedAt: logEntry.timestamp,
      ipAddress: logEntry.ipAddress,
      userAgent: logEntry.userAgent
    });
  }

  certificate.updatedAt = new Date().toISOString();
  certificates.set(certificateId, certificate);
};

// Generate certificate download URL with security token
const generateSecureDownloadUrl = (certificateId: string, userId: string): string => {
  const token = Buffer.from(`${certificateId}:${userId}:${Date.now()}`).toString('base64');
  return `https://gce.cm/api/certificates/${certificateId}/download?token=${token}`;
};

// GET - Get student certificates
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
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

    const { studentId } = params;
    const { canAccess, userId, userType } = canAccessStudentCertificates(token, studentId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examLevel = searchParams.get('examLevel') || '';
    const examSession = searchParams.get('examSession') || '';
    const certificateType = searchParams.get('certificateType') || '';
    const includeRevoked = searchParams.get('includeRevoked') === 'true';

    // Get all certificates for this student
    let studentCertificates = Array.from(certificates.values()).filter(
      cert => cert.studentId === studentId
    );

    if (studentCertificates.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          certificates: [],
          summary: {
            totalCertificates: 0,
            availableDownloads: 0,
            latestCertificate: null
          }
        },
        message: 'No certificates found for this student'
      });
    }

    // Apply filters
    if (examLevel) {
      studentCertificates = studentCertificates.filter(cert => cert.examLevel === examLevel);
    }

    if (examSession) {
      studentCertificates = studentCertificates.filter(cert => cert.examSession === examSession);
    }

    if (certificateType) {
      studentCertificates = studentCertificates.filter(cert => cert.certificateType === certificateType);
    }

    // Filter out revoked certificates unless specifically requested
    if (!includeRevoked) {
      studentCertificates = studentCertificates.filter(cert => cert.status !== 'revoked');
    }

    // Sort by issuance date (most recent first)
    studentCertificates.sort((a, b) => 
      new Date(b.issuanceDetails.issuedDate).getTime() - new Date(a.issuanceDetails.issuedDate).getTime()
    );

    // Prepare certificates with download URLs and access logging
    const certificatesWithUrls = studentCertificates.map(cert => {
      // Log certificate view
      if (userId) {
        logCertificateAccess(cert.id, userId, 'view', request);
      }

      // Generate secure download URL
      const downloadUrl = cert.status === 'generated' || cert.status === 'issued' || cert.status === 'delivered' ? 
        generateSecureDownloadUrl(cert.id, userId!) : null;

      return {
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        examId: cert.examId,
        examSession: cert.examSession,
        examLevel: cert.examLevel,
        examYear: cert.examYear,
        certificateType: cert.certificateType,
        subjects: cert.subjects,
        overallPerformance: cert.overallPerformance,
        issuanceDetails: {
          issuedDate: cert.issuanceDetails.issuedDate,
          authorizedBy: cert.issuanceDetails.authorizedBy,
          serialNumber: cert.issuanceDetails.serialNumber
        },
        security: {
          verificationUrl: cert.security.verificationUrl,
          securityCode: cert.security.securityCode
        },
        delivery: cert.delivery,
        status: cert.status,
        downloadUrl,
        canDownload: downloadUrl !== null,
        downloadCount: cert.downloads.length,
        printCount: cert.prints.reduce((sum: number, print: any) => sum + print.copies, 0)
      };
    });

    // Calculate summary statistics
    const availableDownloads = certificatesWithUrls.filter(cert => cert.canDownload).length;
    const latestCertificate = certificatesWithUrls.length > 0 ? certificatesWithUrls[0] : null;

    const summary = {
      totalCertificates: certificatesWithUrls.length,
      availableDownloads,
      latestCertificate: latestCertificate ? {
        examSession: latestCertificate.examSession,
        examLevel: latestCertificate.examLevel,
        certificateNumber: latestCertificate.certificateNumber,
        issuedDate: latestCertificate.issuanceDetails.issuedDate,
        status: latestCertificate.status
      } : null,
      byType: {
        original: certificatesWithUrls.filter(c => c.certificateType === 'original').length,
        duplicate: certificatesWithUrls.filter(c => c.certificateType === 'duplicate').length,
        replacement: certificatesWithUrls.filter(c => c.certificateType === 'replacement').length,
        provisional: certificatesWithUrls.filter(c => c.certificateType === 'provisional').length
      },
      byLevel: {
        oLevel: certificatesWithUrls.filter(c => c.examLevel === 'O Level').length,
        aLevel: certificatesWithUrls.filter(c => c.examLevel === 'A Level').length
      },
      byStatus: {
        generated: certificatesWithUrls.filter(c => c.status === 'generated').length,
        issued: certificatesWithUrls.filter(c => c.status === 'issued').length,
        delivered: certificatesWithUrls.filter(c => c.status === 'delivered').length,
        revoked: includeRevoked ? certificatesWithUrls.filter(c => c.status === 'revoked').length : 0
      }
    };

    // Include verification instructions for students
    const verificationInstructions = userType === 'student' ? {
      howToVerify: [
        'Visit the verification URL provided with your certificate',
        'Enter your certificate number and security code',
        'Verify the details match your certificate',
        'Contact the examination board if there are any discrepancies'
      ],
      importantNotes: [
        'Keep your certificate number and security code confidential',
        'Report any suspicious activity or unauthorized access',
        'Original certificates cannot be replaced if lost - only duplicates can be issued',
        'Digital certificates have the same legal validity as physical certificates'
      ]
    } : undefined;

    return NextResponse.json({
      success: true,
      data: {
        certificates: certificatesWithUrls,
        summary,
        verificationInstructions
      },
      message: 'Student certificates retrieved successfully'
    });

  } catch (error) {
    console.error('Get student certificates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Request certificate actions (download, print, duplicate)
export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
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

    const { studentId } = params;
    const { canAccess, userId } = canAccessStudentCertificates(token, studentId);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, certificateId, reason, copies = 1 } = body;

    // Validate required fields
    if (!action || !certificateId) {
      return NextResponse.json(
        { success: false, message: 'Missing required action or certificate ID' },
        { status: 400 }
      );
    }

    // Get the certificate
    const certificate = certificates.get(certificateId);
    if (!certificate || certificate.studentId !== studentId) {
      return NextResponse.json(
        { success: false, message: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Check certificate status
    if (certificate.status === 'revoked') {
      return NextResponse.json(
        { success: false, message: 'Certificate has been revoked' },
        { status: 400 }
      );
    }

    let responseData: any = {};

    switch (action) {
      case 'download':
        // Log download
        logCertificateAccess(certificateId, userId!, 'download', request);
        
        // Generate secure download URL
        const downloadUrl = generateSecureDownloadUrl(certificateId, userId!);
        
        responseData = {
          downloadUrl,
          expiresIn: '1 hour',
          instructions: 'Click the download link to get your certificate. The link expires in 1 hour for security.'
        };
        break;

      case 'print':
        // Log print request
        const printEntry = {
          printId: `PRINT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          printedBy: userId!,
          printedAt: new Date().toISOString(),
          copies: copies,
          reason: reason || 'Student request'
        };

        certificate.prints.push(printEntry);
        certificate.updatedAt = new Date().toISOString();
        certificates.set(certificateId, certificate);

        responseData = {
          printId: printEntry.printId,
          copies,
          message: 'Print request recorded successfully'
        };
        break;

      case 'request_duplicate':
        // Check if student can request duplicate
        const existingDuplicates = Array.from(certificates.values()).filter(
          cert => cert.studentId === studentId && 
                 cert.examId === certificate.examId &&
                 cert.certificateType === 'duplicate'
        );

        if (existingDuplicates.length >= 3) {
          return NextResponse.json(
            { success: false, message: 'Maximum number of duplicates already issued' },
            { status: 400 }
          );
        }

        responseData = {
          requestId: `DUP-REQ-${Date.now()}`,
          message: 'Duplicate certificate request submitted for review',
          estimatedProcessingTime: '5-7 business days',
          fee: 'XAF 5,000', // Would be from configuration
          instructions: 'Your request will be reviewed and you will be contacted for payment and processing.'
        };
        break;

      case 'verify':
        // Verify certificate authenticity
        const isValid = certificate.status !== 'revoked' && 
                       certificate.security.securityCode && 
                       certificate.security.digitalSignature;

        responseData = {
          isValid,
          certificateNumber: certificate.certificateNumber,
          studentName: certificate.studentName,
          examSession: certificate.examSession,
          examLevel: certificate.examLevel,
          issuedDate: certificate.issuanceDetails.issuedDate,
          verificationTime: new Date().toISOString(),
          securityFeatures: {
            hasDigitalSignature: !!certificate.security.digitalSignature,
            hasQRCode: !!certificate.security.qrCode,
            hasWatermark: !!certificate.security.watermark
          }
        };
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: `Certificate ${action} completed successfully`
    });

  } catch (error) {
    console.error('Student certificate action error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
