import { NextRequest, NextResponse } from 'next/server';

// Import shared storage
const examResults: Map<string, any> = new Map();
const certificates: Map<string, any> = new Map();

// Verification logs storage
const verificationLogs: Map<string, {
  id: string;
  verificationType: 'result' | 'certificate' | 'student';
  verificationMethod: 'code' | 'qr' | 'number' | 'biometric';
  searchCriteria: {
    studentNumber?: string;
    certificateNumber?: string;
    verificationCode?: string;
    examSession?: string;
    examLevel?: string;
    securityCode?: string;
  };
  verificationResult: {
    isValid: boolean;
    confidence: number; // 0-100
    matchedRecords: number;
    verificationStatus: 'verified' | 'invalid' | 'partial' | 'suspicious';
  };
  verifiedData?: {
    studentName: string;
    studentNumber: string;
    examSession: string;
    examLevel: string;
    schoolName: string;
    subjects?: Array<{
      subjectCode: string;
      subjectName: string;
      grade: string;
    }>;
    overallPerformance?: {
      classification: string;
      averagePercentage: number;
    };
    certificateNumber?: string;
    issuedDate?: string;
  };
  securityChecks: Array<{
    check: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
  }>;
  verificationMetadata: {
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    location?: string;
    verifiedBy?: string;
  };
  fraudIndicators: Array<{
    indicator: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}> = new Map();

// Perform security checks
const performSecurityChecks = (data: any, verificationType: string): any[] => {
  const checks = [];

  // Check 1: Data integrity
  if (data && Object.keys(data).length > 0) {
    checks.push({
      check: 'data_integrity',
      status: 'passed',
      details: 'Data structure is valid'
    });
  } else {
    checks.push({
      check: 'data_integrity',
      status: 'failed',
      details: 'Invalid or corrupted data structure'
    });
  }

  // Check 2: Timestamp validation
  if (data?.audit?.generatedAt || data?.issuanceDetails?.issuedDate) {
    const timestamp = new Date(data.audit?.generatedAt || data.issuanceDetails.issuedDate);
    const now = new Date();
    const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff >= 0 && daysDiff <= 3650) { // Within 10 years
      checks.push({
        check: 'timestamp_validation',
        status: 'passed',
        details: `Valid timestamp: ${daysDiff.toFixed(0)} days old`
      });
    } else {
      checks.push({
        check: 'timestamp_validation',
        status: 'warning',
        details: 'Timestamp is outside expected range'
      });
    }
  }

  // Check 3: Status validation
  if (verificationType === 'certificate' && data?.status) {
    if (['generated', 'issued', 'delivered'].includes(data.status)) {
      checks.push({
        check: 'status_validation',
        status: 'passed',
        details: `Certificate status: ${data.status}`
      });
    } else if (data.status === 'revoked') {
      checks.push({
        check: 'status_validation',
        status: 'failed',
        details: 'Certificate has been revoked'
      });
    } else {
      checks.push({
        check: 'status_validation',
        status: 'warning',
        details: `Unusual certificate status: ${data.status}`
      });
    }
  }

  // Check 4: Security features (for certificates)
  if (verificationType === 'certificate' && data?.security) {
    const securityFeatures = ['digitalSignature', 'qrCode', 'watermark', 'securityCode'];
    const presentFeatures = securityFeatures.filter(feature => data.security[feature]);
    
    if (presentFeatures.length >= 3) {
      checks.push({
        check: 'security_features',
        status: 'passed',
        details: `${presentFeatures.length}/4 security features present`
      });
    } else {
      checks.push({
        check: 'security_features',
        status: 'warning',
        details: `Only ${presentFeatures.length}/4 security features present`
      });
    }
  }

  return checks;
};

// Detect fraud indicators
const detectFraudIndicators = (searchCriteria: any, verificationResult: any, metadata: any): any[] => {
  const indicators = [];

  // Check for suspicious patterns
  if (metadata.userAgent && metadata.userAgent.includes('bot')) {
    indicators.push({
      indicator: 'automated_verification',
      severity: 'medium',
      description: 'Verification appears to be automated'
    });
  }

  // Check for multiple rapid verifications from same IP
  const recentVerifications = Array.from(verificationLogs.values()).filter(
    log => log.verificationMetadata.ipAddress === metadata.ipAddress &&
           new Date(log.verificationMetadata.timestamp) > new Date(Date.now() - 60000) // Last minute
  );

  if (recentVerifications.length > 5) {
    indicators.push({
      indicator: 'rapid_verification_attempts',
      severity: 'high',
      description: 'Multiple verification attempts from same IP in short time'
    });
  }

  // Check for invalid data patterns
  if (searchCriteria.studentNumber && !/^[A-Z]{2}\d{4}-\d{5}$/.test(searchCriteria.studentNumber)) {
    indicators.push({
      indicator: 'invalid_student_number_format',
      severity: 'medium',
      description: 'Student number format does not match expected pattern'
    });
  }

  return indicators;
};

// Calculate verification confidence
const calculateConfidence = (matchedRecords: number, securityChecks: any[], fraudIndicators: any[]): number => {
  let confidence = 0;

  // Base confidence from matched records
  if (matchedRecords === 1) confidence += 60;
  else if (matchedRecords > 1) confidence += 40;
  else confidence += 0;

  // Security checks contribution
  const passedChecks = securityChecks.filter(check => check.status === 'passed').length;
  const totalChecks = securityChecks.length;
  confidence += (passedChecks / totalChecks) * 30;

  // Fraud indicators penalty
  const highSeverityIndicators = fraudIndicators.filter(ind => ind.severity === 'high').length;
  const mediumSeverityIndicators = fraudIndicators.filter(ind => ind.severity === 'medium').length;
  
  confidence -= (highSeverityIndicators * 20) + (mediumSeverityIndicators * 10);

  return Math.max(0, Math.min(100, Math.round(confidence)));
};

// POST - Verify results/certificates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      verificationType = 'result',
      verificationMethod = 'code',
      studentNumber,
      certificateNumber,
      verificationCode,
      examSession,
      examLevel,
      securityCode
    } = body;

    // Validate required fields based on verification type
    if (verificationType === 'certificate' && !certificateNumber) {
      return NextResponse.json(
        { success: false, message: 'Certificate number is required for certificate verification' },
        { status: 400 }
      );
    }

    if (verificationType === 'result' && !studentNumber && !verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Student number or verification code is required for result verification' },
        { status: 400 }
      );
    }

    // Collect verification metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    };

    const searchCriteria = {
      studentNumber,
      certificateNumber,
      verificationCode,
      examSession,
      examLevel,
      securityCode
    };

    let matchedRecords = 0;
    let verifiedData: any = null;
    let securityChecks: any[] = [];

    // Perform verification based on type
    if (verificationType === 'certificate') {
      // Search certificates
      const certificate = Array.from(certificates.values()).find(cert => 
        cert.certificateNumber === certificateNumber &&
        (!securityCode || cert.security.securityCode === securityCode)
      );

      if (certificate) {
        matchedRecords = 1;
        verifiedData = {
          studentName: certificate.studentName,
          studentNumber: certificate.studentNumber,
          examSession: certificate.examSession,
          examLevel: certificate.examLevel,
          schoolName: certificate.schoolName,
          subjects: certificate.subjects,
          overallPerformance: certificate.overallPerformance,
          certificateNumber: certificate.certificateNumber,
          issuedDate: certificate.issuanceDetails.issuedDate
        };
        securityChecks = performSecurityChecks(certificate, 'certificate');
      }
    } else {
      // Search results
      const results = Array.from(examResults.values()).filter(result => {
        let matches = true;
        
        if (studentNumber) {
          matches = matches && result.studentNumber === studentNumber;
        }
        
        if (verificationCode) {
          matches = matches && result.verification.verificationCode === verificationCode;
        }
        
        if (examSession) {
          matches = matches && result.examSession === examSession;
        }
        
        if (examLevel) {
          matches = matches && result.examLevel === examLevel;
        }
        
        return matches;
      });

      matchedRecords = results.length;
      
      if (results.length === 1) {
        const result = results[0];
        verifiedData = {
          studentName: result.studentName,
          studentNumber: result.studentNumber,
          examSession: result.examSession,
          examLevel: result.examLevel,
          schoolName: result.schoolName,
          subjects: result.subjects,
          overallPerformance: result.overallPerformance
        };
        securityChecks = performSecurityChecks(result, 'result');
      } else if (results.length > 1) {
        // Multiple matches - return summary
        verifiedData = {
          multipleMatches: true,
          matchCount: results.length,
          sessions: [...new Set(results.map(r => r.examSession))],
          levels: [...new Set(results.map(r => r.examLevel))]
        };
      }
    }

    // Detect fraud indicators
    const fraudIndicators = detectFraudIndicators(searchCriteria, { matchedRecords }, metadata);

    // Calculate confidence
    const confidence = calculateConfidence(matchedRecords, securityChecks, fraudIndicators);

    // Determine verification status
    let verificationStatus: 'verified' | 'invalid' | 'partial' | 'suspicious';
    if (matchedRecords === 1 && confidence >= 80) {
      verificationStatus = 'verified';
    } else if (matchedRecords === 0) {
      verificationStatus = 'invalid';
    } else if (matchedRecords > 1 || confidence >= 50) {
      verificationStatus = 'partial';
    } else {
      verificationStatus = 'suspicious';
    }

    // Create verification log
    const verificationId = `VERIFY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const verificationLog = {
      id: verificationId,
      verificationType: verificationType as 'result' | 'certificate' | 'student',
      verificationMethod: verificationMethod as 'code' | 'qr' | 'number' | 'biometric',
      searchCriteria,
      verificationResult: {
        isValid: verificationStatus === 'verified',
        confidence,
        matchedRecords,
        verificationStatus
      },
      verifiedData,
      securityChecks,
      verificationMetadata: metadata,
      fraudIndicators
    };

    // Store verification log
    verificationLogs.set(verificationId, verificationLog);

    // Prepare response
    const responseData = {
      verificationId,
      isValid: verificationStatus === 'verified',
      verificationStatus,
      confidence,
      matchedRecords,
      verifiedData,
      securityChecks,
      fraudIndicators: fraudIndicators.length > 0 ? fraudIndicators : undefined,
      verificationTime: metadata.timestamp,
      instructions: getVerificationInstructions(verificationStatus)
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: getVerificationMessage(verificationStatus, matchedRecords)
    });

  } catch (error) {
    console.error('Verify results error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
const getVerificationMessage = (status: string, matchedRecords: number): string => {
  switch (status) {
    case 'verified':
      return 'Verification successful - document is authentic';
    case 'invalid':
      return 'Verification failed - no matching records found';
    case 'partial':
      return matchedRecords > 1 ? 
        'Multiple records found - please provide more specific information' :
        'Partial verification - some security checks failed';
    case 'suspicious':
      return 'Verification flagged as suspicious - manual review required';
    default:
      return 'Verification completed';
  }
};

const getVerificationInstructions = (status: string): string[] => {
  switch (status) {
    case 'verified':
      return [
        'The document has been successfully verified as authentic',
        'All security checks have passed',
        'You can trust the information provided'
      ];
    case 'invalid':
      return [
        'No matching records found in our database',
        'Please check the information provided and try again',
        'Contact the examination board if you believe this is an error'
      ];
    case 'partial':
      return [
        'Verification was partially successful',
        'Some information may need additional confirmation',
        'Contact the examination board for complete verification'
      ];
    case 'suspicious':
      return [
        'This verification has been flagged for manual review',
        'Please contact the examination board directly',
        'Do not rely on this document until verified by official channels'
      ];
    default:
      return ['Please contact the examination board for assistance'];
  }
};
