import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// Broadcast notifications storage
const broadcastNotifications: Map<string, {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'maintenance' | 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: Array<'email' | 'sms' | 'push' | 'in_app' | 'portal'>;
  targeting: {
    userTypes: string[];
    specificUsers?: string[];
    regions?: string[];
    schools?: string[];
    excludeUsers?: string[];
  };
  content: {
    subject: string;
    htmlContent?: string;
    plainTextContent: string;
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileSize: number;
    }>;
  };
  scheduling: {
    sendImmediately: boolean;
    scheduledTime?: string;
    timezone: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: string;
    };
  };
  delivery: {
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    openedCount: number;
    clickedCount: number;
    unsubscribedCount: number;
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    sentAt?: string;
    completedAt?: string;
    estimatedDeliveryTime?: number;
    actualDeliveryTime?: number;
  };
  tracking: {
    deliveryReports: Array<{
      userId: string;
      channel: string;
      status: 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
      timestamp: string;
      errorMessage?: string;
    }>;
    analytics: {
      openRate: number;
      clickRate: number;
      bounceRate: number;
      unsubscribeRate: number;
    };
  };
}> = new Map();

// Notification templates storage
const notificationTemplates: Map<string, {
  id: string;
  name: string;
  description: string;
  type: string;
  category: 'system' | 'academic' | 'administrative' | 'marketing';
  template: {
    subject: string;
    htmlContent: string;
    plainTextContent: string;
    variables: Array<{
      name: string;
      description: string;
      required: boolean;
      defaultValue?: string;
    }>;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  usageCount: number;
}> = new Map();

// Initialize default templates
const initializeDefaultTemplates = () => {
  const defaultTemplates = [
    {
      id: 'results-published',
      name: 'Results Published',
      description: 'Notification when examination results are published',
      type: 'announcement',
      category: 'academic',
      subject: 'Your {{examLevel}} Results Are Now Available',
      htmlContent: `
        <h2>Dear {{studentName}},</h2>
        <p>We are pleased to inform you that your {{examLevel}} examination results for the {{examSession}} session are now available.</p>
        <p>You can view your results by logging into your student portal.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Portal: <a href="{{portalUrl}}">{{portalUrl}}</a></li>
          <li>Student Number: {{studentNumber}}</li>
        </ul>
        <p>If you have any questions, please contact your school or the examination board.</p>
        <p>Best regards,<br>GCE Examination Board</p>
      `,
      plainTextContent: `Dear {{studentName}},

We are pleased to inform you that your {{examLevel}} examination results for the {{examSession}} session are now available.

You can view your results by logging into your student portal at {{portalUrl}} using your student number: {{studentNumber}}.

If you have any questions, please contact your school or the examination board.

Best regards,
GCE Examination Board`,
      variables: [
        { name: 'studentName', description: 'Student full name', required: true },
        { name: 'examLevel', description: 'Examination level (O Level/A Level)', required: true },
        { name: 'examSession', description: 'Examination session year', required: true },
        { name: 'studentNumber', description: 'Student registration number', required: true },
        { name: 'portalUrl', description: 'Student portal URL', required: true, defaultValue: 'https://gce.cm/student' }
      ]
    },
    {
      id: 'system-maintenance',
      name: 'System Maintenance',
      description: 'Notification for scheduled system maintenance',
      type: 'maintenance',
      category: 'system',
      subject: 'Scheduled System Maintenance - {{maintenanceDate}}',
      htmlContent: `
        <h2>System Maintenance Notice</h2>
        <p>Dear Users,</p>
        <p>We will be performing scheduled maintenance on our systems on <strong>{{maintenanceDate}}</strong> from <strong>{{startTime}}</strong> to <strong>{{endTime}}</strong>.</p>
        <p><strong>During this time:</strong></p>
        <ul>
          <li>The portal will be temporarily unavailable</li>
          <li>You will not be able to access your results or certificates</li>
          <li>All online services will be suspended</li>
        </ul>
        <p>We apologize for any inconvenience this may cause and appreciate your patience.</p>
        <p>Best regards,<br>GCE Technical Team</p>
      `,
      plainTextContent: `System Maintenance Notice

Dear Users,

We will be performing scheduled maintenance on our systems on {{maintenanceDate}} from {{startTime}} to {{endTime}}.

During this time:
- The portal will be temporarily unavailable
- You will not be able to access your results or certificates
- All online services will be suspended

We apologize for any inconvenience this may cause and appreciate your patience.

Best regards,
GCE Technical Team`,
      variables: [
        { name: 'maintenanceDate', description: 'Date of maintenance', required: true },
        { name: 'startTime', description: 'Maintenance start time', required: true },
        { name: 'endTime', description: 'Maintenance end time', required: true }
      ]
    }
  ];

  defaultTemplates.forEach(template => {
    notificationTemplates.set(template.id, {
      ...template,
      category: template.category as any,
      template: {
        subject: template.subject,
        htmlContent: template.htmlContent,
        plainTextContent: template.plainTextContent,
        variables: template.variables
      },
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      usageCount: 0
    });
  });
};

// Initialize default templates
initializeDefaultTemplates();

// Helper function to check broadcast access
const canSendBroadcast = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// Calculate recipient count based on targeting
const calculateRecipientCount = (targeting: any): number => {
  const allUsers = userStorage.getAllUsers();
  let recipients = allUsers;

  // Filter by user types
  if (targeting.userTypes && targeting.userTypes.length > 0) {
    recipients = recipients.filter(user => targeting.userTypes.includes(user.userType));
  }

  // Filter by specific users
  if (targeting.specificUsers && targeting.specificUsers.length > 0) {
    recipients = recipients.filter(user => targeting.specificUsers.includes(user.id));
  }

  // Exclude specific users
  if (targeting.excludeUsers && targeting.excludeUsers.length > 0) {
    recipients = recipients.filter(user => !targeting.excludeUsers.includes(user.id));
  }

  return recipients.length;
};

// Process template variables
const processTemplate = (template: string, variables: Record<string, string>): string => {
  let processed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value);
  });

  return processed;
};

// Simulate notification sending
const sendNotification = async (notificationId: string): Promise<void> => {
  const notification = broadcastNotifications.get(notificationId);
  if (!notification) return;

  try {
    // Update status to sending
    notification.delivery.status = 'sending';
    notification.metadata.sentAt = new Date().toISOString();
    broadcastNotifications.set(notificationId, notification);

    // Simulate sending process
    const totalRecipients = notification.delivery.totalRecipients;
    const batchSize = 50; // Send in batches of 50
    const batches = Math.ceil(totalRecipients / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      // Simulate batch processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, totalRecipients);
      const batchSize_actual = batchEnd - batchStart;

      // Simulate delivery success/failure rates
      const successRate = 0.95; // 95% success rate
      const delivered = Math.floor(batchSize_actual * successRate);
      const failed = batchSize_actual - delivered;

      notification.delivery.sentCount += batchSize_actual;
      notification.delivery.deliveredCount += delivered;
      notification.delivery.failedCount += failed;

      // Update notification
      broadcastNotifications.set(notificationId, notification);
    }

    // Complete the sending process
    notification.delivery.status = 'sent';
    notification.metadata.completedAt = new Date().toISOString();
    notification.metadata.actualDeliveryTime = Date.now() - new Date(notification.metadata.sentAt!).getTime();

    // Simulate engagement metrics
    notification.delivery.openedCount = Math.floor(notification.delivery.deliveredCount * 0.6); // 60% open rate
    notification.delivery.clickedCount = Math.floor(notification.delivery.openedCount * 0.15); // 15% click rate
    notification.delivery.unsubscribedCount = Math.floor(notification.delivery.deliveredCount * 0.001); // 0.1% unsubscribe rate

    // Calculate analytics
    notification.tracking.analytics = {
      openRate: Math.round((notification.delivery.openedCount / notification.delivery.deliveredCount) * 100),
      clickRate: Math.round((notification.delivery.clickedCount / notification.delivery.openedCount) * 100),
      bounceRate: Math.round((notification.delivery.failedCount / notification.delivery.totalRecipients) * 100),
      unsubscribeRate: Math.round((notification.delivery.unsubscribedCount / notification.delivery.deliveredCount) * 100)
    };

    broadcastNotifications.set(notificationId, notification);

  } catch (error) {
    // Handle sending failure
    notification.delivery.status = 'failed';
    notification.metadata.completedAt = new Date().toISOString();
    broadcastNotifications.set(notificationId, notification);
  }
};

// POST - Send broadcast notification
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

    if (!canSendBroadcast(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to send broadcast notifications' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const {
      title,
      message,
      type = 'info',
      priority = 'normal',
      channels = ['email', 'in_app'],
      targeting = { userTypes: ['student'] },
      content,
      scheduling = { sendImmediately: true, timezone: 'Africa/Douala' },
      templateId,
      templateVariables = {}
    } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Process template if provided
    let processedContent = content;
    if (templateId) {
      const template = notificationTemplates.get(templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        );
      }

      processedContent = {
        subject: processTemplate(template.template.subject, templateVariables),
        htmlContent: processTemplate(template.template.htmlContent, templateVariables),
        plainTextContent: processTemplate(template.template.plainTextContent, templateVariables)
      };

      // Update template usage count
      template.usageCount++;
      notificationTemplates.set(templateId, template);
    }

    // Calculate recipient count
    const recipientCount = calculateRecipientCount(targeting);

    if (recipientCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No recipients match the targeting criteria' },
        { status: 400 }
      );
    }

    // Create broadcast notification
    const notificationId = `BROADCAST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const notification = {
      id: notificationId,
      title,
      message,
      type: type as 'info' | 'warning' | 'success' | 'error' | 'maintenance' | 'announcement',
      priority: priority as 'low' | 'normal' | 'high' | 'urgent',
      channels: channels as Array<'email' | 'sms' | 'push' | 'in_app' | 'portal'>,
      targeting,
      content: processedContent || {
        subject: title,
        plainTextContent: message,
        htmlContent: `<p>${message}</p>`
      },
      scheduling,
      delivery: {
        status: scheduling.sendImmediately ? 'sending' : 'scheduled' as const,
        totalRecipients: recipientCount,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        openedCount: 0,
        clickedCount: 0,
        unsubscribedCount: 0
      },
      metadata: {
        createdBy: userId,
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: Math.ceil(recipientCount / 50) * 1000 // Estimate based on batch size
      },
      tracking: {
        deliveryReports: [],
        analytics: {
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0
        }
      }
    };

    // Store notification
    broadcastNotifications.set(notificationId, notification);

    // Start sending process if immediate
    if (scheduling.sendImmediately) {
      sendNotification(notificationId);
    }

    return NextResponse.json({
      success: true,
      data: {
        notificationId,
        status: notification.delivery.status,
        recipientCount,
        estimatedDeliveryTime: `${Math.ceil(notification.metadata.estimatedDeliveryTime! / 60000)} minutes`,
        channels: notification.channels,
        scheduled: !scheduling.sendImmediately,
        scheduledTime: scheduling.scheduledTime,
        monitorUrl: `/api/admin/notifications/broadcast/${notificationId}/status`
      },
      message: scheduling.sendImmediately ? 
        'Broadcast notification started successfully' : 
        'Broadcast notification scheduled successfully'
    });

  } catch (error) {
    console.error('Send broadcast notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get broadcast notifications and templates
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

    if (!canSendBroadcast(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view broadcast notifications' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeTemplates = searchParams.get('includeTemplates') === 'true';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get broadcast notifications
    let notifications = Array.from(broadcastNotifications.values());

    // Apply filters
    if (status) {
      notifications = notifications.filter(n => n.delivery.status === status);
    }

    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    // Sort by creation date (most recent first)
    notifications.sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime());

    // Limit results
    notifications = notifications.slice(0, limit);

    // Prepare response data
    let responseData: any = {
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        priority: n.priority,
        channels: n.channels,
        delivery: n.delivery,
        createdAt: n.metadata.createdAt,
        sentAt: n.metadata.sentAt,
        completedAt: n.metadata.completedAt,
        analytics: n.tracking.analytics
      }))
    };

    // Include templates if requested
    if (includeTemplates) {
      const templates = Array.from(notificationTemplates.values())
        .filter(t => t.isActive)
        .sort((a, b) => b.usageCount - a.usageCount);

      responseData.templates = templates;
    }

    // Calculate summary statistics
    responseData.statistics = {
      totalNotifications: notifications.length,
      byStatus: {
        draft: notifications.filter(n => n.delivery.status === 'draft').length,
        scheduled: notifications.filter(n => n.delivery.status === 'scheduled').length,
        sending: notifications.filter(n => n.delivery.status === 'sending').length,
        sent: notifications.filter(n => n.delivery.status === 'sent').length,
        failed: notifications.filter(n => n.delivery.status === 'failed').length
      },
      totalRecipients: notifications.reduce((sum, n) => sum + n.delivery.totalRecipients, 0),
      totalDelivered: notifications.reduce((sum, n) => sum + n.delivery.deliveredCount, 0),
      averageOpenRate: notifications.length > 0 ? 
        Math.round(notifications.reduce((sum, n) => sum + n.tracking.analytics.openRate, 0) / notifications.length) : 0
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Broadcast notifications retrieved successfully'
    });

  } catch (error) {
    console.error('Get broadcast notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
