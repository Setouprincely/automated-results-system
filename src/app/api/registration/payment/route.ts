import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Payment storage (in production, use database)
const payments: Map<string, {
  id: string;
  registrationId: string;
  studentId: string;
  paymentType: 'registration' | 'subject_fees' | 'late_fee' | 'penalty';
  amount: number;
  currency: 'XAF' | 'USD';
  paymentMethod: 'mobile_money' | 'bank_transfer' | 'cash' | 'card' | 'online';
  paymentProvider?: string; // MTN, Orange, Express Union, etc.
  transactionId?: string;
  referenceNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentDetails: {
    payerName: string;
    payerPhone?: string;
    payerEmail?: string;
    description: string;
    breakdown: Array<{
      item: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceInfo?: string;
  };
  timestamps: {
    createdAt: string;
    initiatedAt?: string;
    completedAt?: string;
    failedAt?: string;
    cancelledAt?: string;
  };
  verification: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationNotes?: string;
  };
}> = new Map();

// Generate payment reference
const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp.slice(-8)}-${random}`;
};

// Mock payment processing (in production, integrate with actual payment gateways)
const processPayment = async (paymentData: any): Promise<{ success: boolean; transactionId?: string; message: string }> => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 90% success rate
  const isSuccessful = Math.random() > 0.1;
  
  if (isSuccessful) {
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      message: 'Payment processed successfully'
    };
  } else {
    return {
      success: false,
      message: 'Payment failed. Please try again or contact support.'
    };
  }
};

// POST - Create new payment
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

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    const userId = tokenParts.slice(2, -1).join('-');
    const user = userStorage.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      registrationId,
      paymentType,
      amount,
      currency = 'XAF',
      paymentMethod,
      paymentProvider,
      paymentDetails,
      processImmediately = false
    } = body;

    // Validate required fields
    if (!registrationId || !paymentType || !amount || !paymentMethod || !paymentDetails) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Validate payment type
    if (!['registration', 'subject_fees', 'late_fee', 'penalty'].includes(paymentType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!['mobile_money', 'bank_transfer', 'cash', 'card', 'online'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Payment amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Generate payment ID and reference
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const referenceNumber = generatePaymentReference();

    // Get request metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      location: request.headers.get('cf-ipcountry') || 'unknown'
    };

    // Create payment record
    const payment = {
      id: paymentId,
      registrationId,
      studentId: userId,
      paymentType: paymentType as 'registration' | 'subject_fees' | 'late_fee' | 'penalty',
      amount,
      currency: currency as 'XAF' | 'USD',
      paymentMethod: paymentMethod as 'mobile_money' | 'bank_transfer' | 'cash' | 'card' | 'online',
      paymentProvider,
      referenceNumber,
      status: 'pending' as const,
      paymentDetails: {
        payerName: paymentDetails.payerName || user.fullName,
        payerPhone: paymentDetails.payerPhone,
        payerEmail: paymentDetails.payerEmail || user.email,
        description: paymentDetails.description || `Payment for ${paymentType}`,
        breakdown: paymentDetails.breakdown || [
          {
            item: paymentType.replace('_', ' ').toUpperCase(),
            quantity: 1,
            unitPrice: amount,
            totalPrice: amount
          }
        ]
      },
      metadata,
      timestamps: {
        createdAt: new Date().toISOString()
      },
      verification: {
        isVerified: false
      }
    };

    // Store payment
    payments.set(paymentId, payment);

    // Process payment immediately if requested
    if (processImmediately) {
      payment.status = 'processing';
      payment.timestamps.initiatedAt = new Date().toISOString();
      payments.set(paymentId, payment);

      try {
        const result = await processPayment(payment);
        
        if (result.success) {
          payment.status = 'completed';
          payment.transactionId = result.transactionId;
          payment.timestamps.completedAt = new Date().toISOString();
        } else {
          payment.status = 'failed';
          payment.timestamps.failedAt = new Date().toISOString();
        }
        
        payments.set(paymentId, payment);
        
        return NextResponse.json({
          success: result.success,
          data: payment,
          message: result.message
        });
      } catch (error) {
        payment.status = 'failed';
        payment.timestamps.failedAt = new Date().toISOString();
        payments.set(paymentId, payment);
        
        return NextResponse.json({
          success: false,
          data: payment,
          message: 'Payment processing failed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment created successfully'
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
