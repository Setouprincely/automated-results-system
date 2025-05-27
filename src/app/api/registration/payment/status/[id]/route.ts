import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared payment storage (in production, use database)
const payments: Map<string, any> = new Map();

// Helper function to check payment access permissions
const canAccessPayment = (token: string, paymentId: string): { canAccess: boolean; isAdmin: boolean; currentUserId: string | null } => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const currentUserId = tokenParts.slice(2, -1).join('-');
  const currentUser = userStorage.findById(currentUserId);
  
  if (!currentUser) return { canAccess: false, isAdmin: false, currentUserId: null };
  
  const isAdmin = currentUser.userType === 'admin';
  const payment = payments.get(paymentId);
  const isOwner = payment && payment.studentId === currentUserId;
  
  return {
    canAccess: isAdmin || isOwner,
    isAdmin,
    currentUserId
  };
};

// Mock payment verification (in production, verify with payment gateway)
const verifyPaymentWithGateway = async (payment: any): Promise<{ verified: boolean; status: string; transactionId?: string }> => {
  // Simulate gateway verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate verification logic
  if (payment.transactionId) {
    return {
      verified: true,
      status: 'completed',
      transactionId: payment.transactionId
    };
  }
  
  return {
    verified: false,
    status: 'pending'
  };
};

// GET - Get payment status by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const { canAccess } = canAccessPayment(token, id);

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const payment = payments.get(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if verification is requested
    const { searchParams } = new URL(request.url);
    const verify = searchParams.get('verify') === 'true';

    if (verify && payment.status === 'processing') {
      try {
        const verificationResult = await verifyPaymentWithGateway(payment);
        
        if (verificationResult.verified) {
          payment.status = verificationResult.status;
          payment.verification.isVerified = true;
          payment.verification.verifiedAt = new Date().toISOString();
          
          if (verificationResult.status === 'completed') {
            payment.timestamps.completedAt = new Date().toISOString();
          }
          
          payments.set(id, payment);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    }

    // Calculate payment summary
    const summary = {
      paymentId: payment.id,
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentProvider: payment.paymentProvider,
      transactionId: payment.transactionId,
      createdAt: payment.timestamps.createdAt,
      completedAt: payment.timestamps.completedAt,
      isVerified: payment.verification.isVerified,
      canRetry: ['failed', 'cancelled'].includes(payment.status),
      canCancel: ['pending', 'processing'].includes(payment.status)
    };

    return NextResponse.json({
      success: true,
      data: {
        payment,
        summary
      },
      message: 'Payment status retrieved successfully'
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update payment status (Admin only or payment gateway webhook)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Allow webhook calls without authentication (in production, verify webhook signature)
    const isWebhook = request.headers.get('x-webhook-source') === 'payment-gateway';

    if (!token && !isWebhook) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    let canUpdate = false;

    if (isWebhook) {
      canUpdate = true;
    } else {
      const { isAdmin } = canAccessPayment(token!, id);
      canUpdate = isAdmin;
    }

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const payment = payments.get(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      transactionId,
      verificationNotes,
      failureReason
    } = body;

    // Validate status
    if (status && !['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Update payment
    const updateData: any = {
      ...payment
    };

    if (status !== undefined) {
      updateData.status = status;
      
      // Update timestamps based on status
      switch (status) {
        case 'processing':
          updateData.timestamps.initiatedAt = new Date().toISOString();
          break;
        case 'completed':
          updateData.timestamps.completedAt = new Date().toISOString();
          updateData.verification.isVerified = true;
          updateData.verification.verifiedAt = new Date().toISOString();
          break;
        case 'failed':
          updateData.timestamps.failedAt = new Date().toISOString();
          if (failureReason) {
            updateData.verification.verificationNotes = failureReason;
          }
          break;
        case 'cancelled':
          updateData.timestamps.cancelledAt = new Date().toISOString();
          break;
      }
    }

    if (transactionId !== undefined) {
      updateData.transactionId = transactionId;
    }

    if (verificationNotes !== undefined) {
      updateData.verification.verificationNotes = verificationNotes;
    }

    // Update verification info for admin updates
    if (!isWebhook && token) {
      const tokenParts = token.split('-');
      const adminUserId = tokenParts.slice(2, -1).join('-');
      updateData.verification.verifiedBy = adminUserId;
      updateData.verification.verifiedAt = new Date().toISOString();
    }

    // Store updated payment
    payments.set(id, updateData);

    return NextResponse.json({
      success: true,
      data: updateData,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
