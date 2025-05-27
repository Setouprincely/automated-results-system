import { NextRequest, NextResponse } from 'next/server';

// Mock bulk operations storage
const bulkOperations: Map<string, {
  id: string;
  type: 'bulk-register' | 'bulk-update' | 'bulk-delete';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}> = new Map();

// Generate unique operation ID
const generateOperationId = () => {
  return `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate CSV data for bulk registration
const validateBulkRegistrationData = (data: any[]) => {
  const errors: string[] = [];
  const requiredFields = ['fullName', 'email', 'userType'];
  
  data.forEach((row, index) => {
    const rowNumber = index + 1;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Row ${rowNumber}: Missing required field '${field}'`);
      }
    });
    
    // Validate email format
    if (row.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
      }
    }
    
    // Validate user type
    if (row.userType && !['student', 'teacher', 'examiner'].includes(row.userType)) {
      errors.push(`Row ${rowNumber}: Invalid user type '${row.userType}'`);
    }
    
    // Student-specific validations
    if (row.userType === 'student') {
      if (!row.candidateNumber) {
        errors.push(`Row ${rowNumber}: Candidate number is required for students`);
      }
      if (!row.dateOfBirth) {
        errors.push(`Row ${rowNumber}: Date of birth is required for students`);
      }
    }
    
    // Teacher-specific validations
    if (row.userType === 'teacher') {
      if (!row.school) {
        errors.push(`Row ${rowNumber}: School is required for teachers`);
      }
    }
  });
  
  return errors;
};

// Process bulk registration
const processBulkRegistration = async (operationId: string, data: any[]) => {
  const operation = bulkOperations.get(operationId);
  if (!operation) return;
  
  operation.status = 'processing';
  operation.totalRecords = data.length;
  bulkOperations.set(operationId, operation);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1;
    
    try {
      // Simulate API call to register user
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...row,
          password: 'TempPassword123!' // Temporary password, user should reset
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        errors.push(`Row ${rowNumber}: ${result.message}`);
      }
    } catch (error) {
      errorCount++;
      errors.push(`Row ${rowNumber}: Registration failed - ${error}`);
    }
    
    // Update progress
    operation.processedRecords = i + 1;
    operation.successCount = successCount;
    operation.errorCount = errorCount;
    operation.errors = errors;
    bulkOperations.set(operationId, operation);
    
    // Small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Mark as completed
  operation.status = errorCount === 0 ? 'completed' : 'failed';
  operation.completedAt = new Date();
  bulkOperations.set(operationId, operation);
};

// Start bulk operation
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    if (!type || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data provided' },
        { status: 400 }
      );
    }
    
    if (data.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Maximum 1000 records allowed per batch' },
        { status: 400 }
      );
    }
    
    // Validate data based on operation type
    let validationErrors: string[] = [];
    
    if (type === 'bulk-register') {
      validationErrors = validateBulkRegistrationData(data);
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }
    
    // Create operation record
    const operationId = generateOperationId();
    const operation = {
      id: operationId,
      type: type as 'bulk-register' | 'bulk-update' | 'bulk-delete',
      status: 'pending' as const,
      totalRecords: data.length,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdAt: new Date()
    };
    
    bulkOperations.set(operationId, operation);
    
    // Start processing asynchronously
    if (type === 'bulk-register') {
      processBulkRegistration(operationId, data);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        operationId,
        status: 'pending',
        totalRecords: data.length
      },
      message: 'Bulk operation started successfully'
    });
    
  } catch (error) {
    console.error('Error starting bulk operation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start bulk operation' },
      { status: 500 }
    );
  }
}

// Get operation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get('operationId');
    
    if (!operationId) {
      // Return all operations
      const allOperations = Array.from(bulkOperations.values());
      return NextResponse.json({
        success: true,
        data: allOperations,
        message: 'Operations retrieved successfully'
      });
    }
    
    const operation = bulkOperations.get(operationId);
    
    if (!operation) {
      return NextResponse.json(
        { success: false, message: 'Operation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: operation,
      message: 'Operation status retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting operation status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get operation status' },
      { status: 500 }
    );
  }
}
