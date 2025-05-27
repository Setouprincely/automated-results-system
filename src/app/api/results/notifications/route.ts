import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Import shared storage
const examResults: Map<string, any> = new Map();
const certificates: Map<string, any> = new Map();

// Notifications storage
const notifications: Map<string, {
  id: string;
  type: 'result_published' | 'certificate_ready' | 'verification_alert' | 'system_update' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipients: Array<{
    type: 'student' | 'school' | 'parent' | 'admin' | 'public';
    identifier: string; // student ID, school ID, email, etc.
    name: string;
    contactMethod: 'email' | 'sms' | 'push' | 'portal';
    contactDetails: string;
  }>;
  content: {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    templateId?: string;
    variables?: Record<string, any>;
  };
  delivery: {
    scheduledFor?: string;
    sentAt?: string;
    deliveryStatus: 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
    deliveryAttempts: number;
    lastAttemptAt?: string;
    failureReason?: string;
  };
  tracking: {
    opened: boolean;
    openedAt?: string;
    clicked: boolean;
    clickedAt?: string;
    responded: boolean;
    respondedAt?: string;
  };
  metadata: {
    examId?: string;
    examSession?: string;
    examLevel?: string;
    resultIds?: string[];
    certificateIds?: string[];
    batchId?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}> = new Map();

// Notification templates
const notificationTemplates = {
  result_published: {
    title: 'Your {examLevel} Results are Now Available',
    message: 'Dear {studentName}, your {examSession} {examLevel} examination results have been published. You can now view your results online.',
    actionText: 'View Results',
    actionUrl: '/results/student/{studentId}'
  },
  certificate_ready: {
    title: 'Your Certificate is Ready for Download',
    message: 'Dear {studentName}, your {examLevel} certificate for {examSession} is now ready for download.',
    actionText: 'Download Certificate',
    actionUrl: '/certificates/{certificateId}/download'
  },
  verification_alert: {
    title: 'Verification Alert',
    message: 'A verification attempt was made for {documentType} {documentNumber}. If this was not you, please contact us immediately.',
    actionText: 'View Details',
    actionUrl: '/verification/logs'
  },
  system_update: {
    title: 'System Update Notification',
    message: 'The GCE Results System will undergo maintenance on {maintenanceDate}. Services may be temporarily unavailable.',
    actionText: 'Learn More',
    actionUrl: '/announcements'
  },
  reminder: {
    title: 'Reminder: {reminderType}',
    message: '{reminderMessage}',
    actionText: 'Take Action',
    actionUrl: '{actionUrl}'
  }
};

// Helper function to check notification access
const canManageNotifications = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin' || user?.userType === 'examiner';
};

// Generate notification content from template
const generateNotificationContent = (templateId: string, variables: Record<string, any>): any => {
  const template = notificationTemplates[templateId as keyof typeof notificationTemplates];
  if (!template) return null;

  let title = template.title;
  let message = template.message;
  let actionUrl = template.actionUrl;

  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(new RegExp(placeholder, 'g'), value);
    message = message.replace(new RegExp(placeholder, 'g'), value);
    if (actionUrl) {
      actionUrl = actionUrl.replace(new RegExp(placeholder, 'g'), value);
    }
  });

  return {
    title,
    message,
    actionUrl,
    actionText: template.actionText,
    templateId,
    variables
  };
};

// Send notification (mock implementation)
const sendNotification = async (notification: any): Promise<boolean> => {
  // In production, this would integrate with actual notification services
  console.log(`Sending notification: ${notification.content.title} to ${notification.recipients.length} recipients`);
  
  // Simulate delivery delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate 95% success rate
  return Math.random() > 0.05;
};

// POST - Send notifications
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

    if (!canManageNotifications(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to send notifications' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      type,
      priority = 'normal',
      recipients,
      content,
      templateId,
      templateVariables,
      scheduledFor,
      metadata,
      sendImmediately = true
    } = body;

    // Validate required fields
    if (!type || (!recipients && !metadata?.resultIds && !metadata?.certificateIds)) {
      return NextResponse.json(
        { success: false, message: 'Missing required notification information' },
        { status: 400 }
      );
    }

    let notificationRecipients = recipients || [];

    // Auto-generate recipients based on metadata
    if (metadata?.resultIds && metadata.resultIds.length > 0) {
      const resultRecipients = metadata.resultIds.map((resultId: string) => {
        const result = examResults.get(resultId);
        if (result) {
          return {
            type: 'student',
            identifier: result.studentId,
            name: result.studentName,
            contactMethod: 'email',
            contactDetails: `${result.studentNumber}@student.gce.cm`
          };
        }
        return null;
      }).filter(Boolean);
      
      notificationRecipients = notificationRecipients.concat(resultRecipients);
    }

    if (metadata?.certificateIds && metadata.certificateIds.length > 0) {
      const certificateRecipients = metadata.certificateIds.map((certId: string) => {
        const certificate = certificates.get(certId);
        if (certificate) {
          return {
            type: 'student',
            identifier: certificate.studentId,
            name: certificate.studentName,
            contactMethod: 'email',
            contactDetails: `${certificate.studentNumber}@student.gce.cm`
          };
        }
        return null;
      }).filter(Boolean);
      
      notificationRecipients = notificationRecipients.concat(certificateRecipients);
    }

    // Remove duplicates
    const uniqueRecipients = notificationRecipients.filter((recipient, index, self) => 
      index === self.findIndex(r => r.identifier === recipient.identifier && r.type === recipient.type)
    );

    if (uniqueRecipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid recipients found' },
        { status: 400 }
      );
    }

    // Generate content from template if templateId provided
    let notificationContent = content;
    if (templateId && templateVariables) {
      notificationContent = generateNotificationContent(templateId, templateVariables);
      if (!notificationContent) {
        return NextResponse.json(
          { success: false, message: 'Invalid template ID' },
          { status: 400 }
        );
      }
    }

    // Create notification
    const notificationId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const notification = {
      id: notificationId,
      type: type as 'result_published' | 'certificate_ready' | 'verification_alert' | 'system_update' | 'reminder',
      priority: priority as 'low' | 'normal' | 'high' | 'urgent',
      recipients: uniqueRecipients,
      content: notificationContent,
      delivery: {
        scheduledFor: scheduledFor || (sendImmediately ? new Date().toISOString() : undefined),
        deliveryStatus: sendImmediately ? 'sending' : 'scheduled',
        deliveryAttempts: 0
      },
      tracking: {
        opened: false,
        clicked: false,
        responded: false
      },
      metadata: metadata || {},
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store notification
    notifications.set(notificationId, notification);

    // Send immediately if requested
    let deliveryResults = [];
    if (sendImmediately) {
      try {
        const success = await sendNotification(notification);
        
        notification.delivery.deliveryStatus = success ? 'sent' : 'failed';
        notification.delivery.sentAt = new Date().toISOString();
        notification.delivery.deliveryAttempts = 1;
        notification.delivery.lastAttemptAt = new Date().toISOString();
        
        if (!success) {
          notification.delivery.failureReason = 'Delivery service error';
        }

        notifications.set(notificationId, notification);

        deliveryResults.push({
          notificationId,
          success,
          recipientCount: uniqueRecipients.length,
          deliveryStatus: notification.delivery.deliveryStatus
        });
      } catch (error) {
        notification.delivery.deliveryStatus = 'failed';
        notification.delivery.failureReason = 'System error during delivery';
        notifications.set(notificationId, notification);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        notification,
        deliveryResults: sendImmediately ? deliveryResults : undefined,
        summary: {
          notificationId,
          recipientCount: uniqueRecipients.length,
          deliveryStatus: notification.delivery.deliveryStatus,
          scheduledFor: notification.delivery.scheduledFor
        }
      },
      message: sendImmediately ? 
        `Notification sent to ${uniqueRecipients.length} recipients` :
        `Notification scheduled for ${scheduledFor}`
    });

  } catch (error) {
    console.error('Send notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get notifications
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
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const recipientType = searchParams.get('recipientType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all notifications
    let allNotifications = Array.from(notifications.values());

    // Apply filters
    if (type) {
      allNotifications = allNotifications.filter(notif => notif.type === type);
    }

    if (status) {
      allNotifications = allNotifications.filter(notif => notif.delivery.deliveryStatus === status);
    }

    if (priority) {
      allNotifications = allNotifications.filter(notif => notif.priority === priority);
    }

    if (recipientType) {
      allNotifications = allNotifications.filter(notif => 
        notif.recipients.some(r => r.type === recipientType)
      );
    }

    // Sort by creation date (most recent first)
    allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate pagination
    const totalNotifications = allNotifications.length;
    const totalPages = Math.ceil(totalNotifications / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      totalNotifications,
      byType: {
        result_published: allNotifications.filter(n => n.type === 'result_published').length,
        certificate_ready: allNotifications.filter(n => n.type === 'certificate_ready').length,
        verification_alert: allNotifications.filter(n => n.type === 'verification_alert').length,
        system_update: allNotifications.filter(n => n.type === 'system_update').length,
        reminder: allNotifications.filter(n => n.type === 'reminder').length
      },
      byStatus: {
        pending: allNotifications.filter(n => n.delivery.deliveryStatus === 'pending').length,
        scheduled: allNotifications.filter(n => n.delivery.deliveryStatus === 'scheduled').length,
        sending: allNotifications.filter(n => n.delivery.deliveryStatus === 'sending').length,
        sent: allNotifications.filter(n => n.delivery.deliveryStatus === 'sent').length,
        failed: allNotifications.filter(n => n.delivery.deliveryStatus === 'failed').length,
        cancelled: allNotifications.filter(n => n.delivery.deliveryStatus === 'cancelled').length
      },
      byPriority: {
        low: allNotifications.filter(n => n.priority === 'low').length,
        normal: allNotifications.filter(n => n.priority === 'normal').length,
        high: allNotifications.filter(n => n.priority === 'high').length,
        urgent: allNotifications.filter(n => n.priority === 'urgent').length
      },
      totalRecipients: allNotifications.reduce((sum, notif) => sum + notif.recipients.length, 0),
      deliveryRate: allNotifications.length > 0 ? 
        Math.round((allNotifications.filter(n => n.delivery.deliveryStatus === 'sent').length / allNotifications.length) * 100) : 0,
      openRate: allNotifications.length > 0 ? 
        Math.round((allNotifications.filter(n => n.tracking.opened).length / allNotifications.length) * 100) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalNotifications,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        summary
      },
      message: 'Notifications retrieved successfully'
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
