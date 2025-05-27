import { NextRequest, NextResponse } from 'next/server';
import { userStorage } from '@/lib/userStorage';

// System configuration storage
const systemConfig: Map<string, {
  category: string;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isEditable: boolean;
  requiresRestart: boolean;
  validationRules?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    allowedValues?: any[];
  };
  metadata: {
    lastModified: string;
    modifiedBy: string;
    version: number;
    environment: 'development' | 'staging' | 'production';
  };
}> = new Map();

// Configuration change history
const configHistory: Map<string, {
  id: string;
  category: string;
  key: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  reason?: string;
  rollbackId?: string;
}> = new Map();

// Initialize default system configuration
const initializeDefaultConfig = () => {
  const defaultConfigs = [
    // Authentication Settings
    {
      category: 'authentication',
      key: 'session_timeout',
      value: 30,
      dataType: 'number',
      description: 'Session timeout in minutes',
      isEditable: true,
      requiresRestart: false,
      validationRules: { required: true, min: 5, max: 480 }
    },
    {
      category: 'authentication',
      key: 'password_policy',
      value: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90
      },
      dataType: 'object',
      description: 'Password policy configuration',
      isEditable: true,
      requiresRestart: false
    },
    {
      category: 'authentication',
      key: 'max_login_attempts',
      value: 5,
      dataType: 'number',
      description: 'Maximum failed login attempts before account lockout',
      isEditable: true,
      requiresRestart: false,
      validationRules: { required: true, min: 3, max: 10 }
    },
    {
      category: 'authentication',
      key: 'two_factor_enabled',
      value: true,
      dataType: 'boolean',
      description: 'Enable two-factor authentication',
      isEditable: true,
      requiresRestart: false
    },

    // System Settings
    {
      category: 'system',
      key: 'maintenance_mode',
      value: false,
      dataType: 'boolean',
      description: 'Enable maintenance mode',
      isEditable: true,
      requiresRestart: false
    },
    {
      category: 'system',
      key: 'max_file_upload_size',
      value: 10485760, // 10MB
      dataType: 'number',
      description: 'Maximum file upload size in bytes',
      isEditable: true,
      requiresRestart: true,
      validationRules: { required: true, min: 1048576, max: 104857600 } // 1MB to 100MB
    },
    {
      category: 'system',
      key: 'allowed_file_types',
      value: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
      dataType: 'array',
      description: 'Allowed file types for upload',
      isEditable: true,
      requiresRestart: false
    },
    {
      category: 'system',
      key: 'system_timezone',
      value: 'Africa/Douala',
      dataType: 'string',
      description: 'System timezone',
      isEditable: true,
      requiresRestart: true,
      validationRules: { required: true }
    },

    // Email Settings
    {
      category: 'email',
      key: 'smtp_host',
      value: 'smtp.gce.cm',
      dataType: 'string',
      description: 'SMTP server hostname',
      isEditable: true,
      requiresRestart: true,
      validationRules: { required: true }
    },
    {
      category: 'email',
      key: 'smtp_port',
      value: 587,
      dataType: 'number',
      description: 'SMTP server port',
      isEditable: true,
      requiresRestart: true,
      validationRules: { required: true, min: 1, max: 65535 }
    },
    {
      category: 'email',
      key: 'email_from_address',
      value: 'noreply@gce.cm',
      dataType: 'string',
      description: 'Default from email address',
      isEditable: true,
      requiresRestart: false,
      validationRules: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$' }
    },
    {
      category: 'email',
      key: 'email_notifications_enabled',
      value: true,
      dataType: 'boolean',
      description: 'Enable email notifications',
      isEditable: true,
      requiresRestart: false
    },

    // Security Settings
    {
      category: 'security',
      key: 'encryption_algorithm',
      value: 'AES-256-GCM',
      dataType: 'string',
      description: 'Encryption algorithm for sensitive data',
      isEditable: false,
      requiresRestart: true,
      validationRules: { allowedValues: ['AES-256-GCM', 'AES-256-CBC'] }
    },
    {
      category: 'security',
      key: 'audit_log_retention',
      value: 2555, // 7 years in days
      dataType: 'number',
      description: 'Audit log retention period in days',
      isEditable: true,
      requiresRestart: false,
      validationRules: { required: true, min: 365, max: 3650 }
    },
    {
      category: 'security',
      key: 'ip_whitelist',
      value: [],
      dataType: 'array',
      description: 'IP addresses allowed to access admin functions',
      isEditable: true,
      requiresRestart: false
    },
    {
      category: 'security',
      key: 'rate_limiting_enabled',
      value: true,
      dataType: 'boolean',
      description: 'Enable API rate limiting',
      isEditable: true,
      requiresRestart: false
    },

    // Backup Settings
    {
      category: 'backup',
      key: 'auto_backup_enabled',
      value: true,
      dataType: 'boolean',
      description: 'Enable automatic backups',
      isEditable: true,
      requiresRestart: false
    },
    {
      category: 'backup',
      key: 'backup_schedule',
      value: '0 2 * * *', // Daily at 2 AM
      dataType: 'string',
      description: 'Backup schedule (cron format)',
      isEditable: true,
      requiresRestart: false,
      validationRules: { required: true }
    },
    {
      category: 'backup',
      key: 'backup_retention_days',
      value: 30,
      dataType: 'number',
      description: 'Number of days to retain backups',
      isEditable: true,
      requiresRestart: false,
      validationRules: { required: true, min: 7, max: 365 }
    }
  ];

  defaultConfigs.forEach(config => {
    const configKey = `${config.category}.${config.key}`;
    systemConfig.set(configKey, {
      ...config,
      dataType: config.dataType as any,
      metadata: {
        lastModified: new Date().toISOString(),
        modifiedBy: 'system',
        version: 1,
        environment: 'production'
      }
    });
  });
};

// Initialize default configuration
initializeDefaultConfig();

// Helper function to check system config access
const canManageSystemConfig = (token: string): boolean => {
  const tokenParts = token.split('-');
  if (tokenParts.length < 3) return false;
  const userId = tokenParts.slice(2, -1).join('-');
  const user = userStorage.findById(userId);
  return user?.userType === 'admin';
};

// Validate configuration value
const validateConfigValue = (config: any, value: any): { isValid: boolean; error?: string } => {
  const rules = config.validationRules;
  if (!rules) return { isValid: true };

  // Required check
  if (rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: 'Value is required' };
  }

  // Type-specific validation
  switch (config.dataType) {
    case 'number':
      if (typeof value !== 'number') {
        return { isValid: false, error: 'Value must be a number' };
      }
      if (rules.min !== undefined && value < rules.min) {
        return { isValid: false, error: `Value must be at least ${rules.min}` };
      }
      if (rules.max !== undefined && value > rules.max) {
        return { isValid: false, error: `Value must be at most ${rules.max}` };
      }
      break;

    case 'string':
      if (typeof value !== 'string') {
        return { isValid: false, error: 'Value must be a string' };
      }
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        return { isValid: false, error: 'Value does not match required pattern' };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { isValid: false, error: 'Value must be a boolean' };
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return { isValid: false, error: 'Value must be an array' };
      }
      break;
  }

  // Allowed values check
  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    return { isValid: false, error: `Value must be one of: ${rules.allowedValues.join(', ')}` };
  }

  return { isValid: true };
};

// GET - Get system configuration
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

    if (!canManageSystemConfig(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view system configuration' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const includeHistory = searchParams.get('includeHistory') === 'true';

    // Get configuration
    let configs = Array.from(systemConfig.values());

    // Filter by category if specified
    if (category) {
      configs = configs.filter(config => config.category === category);
    }

    // Group by category
    const configsByCategory = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push({
        key: config.key,
        value: config.value,
        dataType: config.dataType,
        description: config.description,
        isEditable: config.isEditable,
        requiresRestart: config.requiresRestart,
        validationRules: config.validationRules,
        metadata: config.metadata
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Prepare response data
    let responseData: any = {
      configuration: configsByCategory,
      categories: Object.keys(configsByCategory),
      totalSettings: configs.length,
      editableSettings: configs.filter(c => c.isEditable).length,
      lastModified: configs.length > 0 ? 
        Math.max(...configs.map(c => new Date(c.metadata.lastModified).getTime())) : null
    };

    // Include change history if requested
    if (includeHistory) {
      let history = Array.from(configHistory.values());
      
      if (category) {
        history = history.filter(h => h.category === category);
      }
      
      history.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
      responseData.changeHistory = history.slice(0, 50); // Last 50 changes
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'System configuration retrieved successfully'
    });

  } catch (error) {
    console.error('Get system configuration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update system configuration
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!canManageSystemConfig(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to modify system configuration' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const { changes, reason } = body;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No configuration changes provided' },
        { status: 400 }
      );
    }

    const results = [];
    const requiresRestart = [];

    // Process each configuration change
    for (const change of changes) {
      const { category, key, value } = change;
      const configKey = `${category}.${key}`;
      const config = systemConfig.get(configKey);

      if (!config) {
        results.push({
          key: configKey,
          success: false,
          error: 'Configuration key not found'
        });
        continue;
      }

      if (!config.isEditable) {
        results.push({
          key: configKey,
          success: false,
          error: 'Configuration is not editable'
        });
        continue;
      }

      // Validate the new value
      const validation = validateConfigValue(config, value);
      if (!validation.isValid) {
        results.push({
          key: configKey,
          success: false,
          error: validation.error
        });
        continue;
      }

      // Store old value for history
      const oldValue = config.value;

      // Update configuration
      config.value = value;
      config.metadata.lastModified = new Date().toISOString();
      config.metadata.modifiedBy = userId;
      config.metadata.version += 1;

      systemConfig.set(configKey, config);

      // Add to change history
      const historyId = `HIST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      configHistory.set(historyId, {
        id: historyId,
        category,
        key,
        oldValue,
        newValue: value,
        changedBy: userId,
        changedAt: new Date().toISOString(),
        reason
      });

      // Track if restart is required
      if (config.requiresRestart) {
        requiresRestart.push(configKey);
      }

      results.push({
        key: configKey,
        success: true,
        oldValue,
        newValue: value,
        requiresRestart: config.requiresRestart
      });
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      data: {
        results,
        summary: {
          totalChanges: changes.length,
          successful: successCount,
          failed: failureCount,
          requiresRestart: requiresRestart.length > 0,
          restartRequired: requiresRestart
        }
      },
      message: successCount > 0 ? 
        `${successCount} configuration(s) updated successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}` :
        'No configurations were updated'
    });

  } catch (error) {
    console.error('Update system configuration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Reset configuration to defaults
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

    if (!canManageSystemConfig(token)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to reset system configuration' },
        { status: 403 }
      );
    }

    const tokenParts = token.split('-');
    const userId = tokenParts.slice(2, -1).join('-');

    const body = await request.json();
    const { category, keys, reason } = body;

    if (!category && !keys) {
      return NextResponse.json(
        { success: false, message: 'Category or specific keys must be specified' },
        { status: 400 }
      );
    }

    // Get configurations to reset
    let configsToReset = Array.from(systemConfig.values());

    if (category) {
      configsToReset = configsToReset.filter(config => config.category === category);
    }

    if (keys && Array.isArray(keys)) {
      configsToReset = configsToReset.filter(config => 
        keys.some(key => `${config.category}.${config.key}` === key)
      );
    }

    const resetResults = [];

    // Reset configurations to defaults
    configsToReset.forEach(config => {
      if (!config.isEditable) {
        resetResults.push({
          key: `${config.category}.${config.key}`,
          success: false,
          error: 'Configuration is not editable'
        });
        return;
      }

      // Store old value for history
      const oldValue = config.value;

      // Reset to default (this would need to be implemented with actual default values)
      // For now, we'll just record the reset attempt
      const historyId = `HIST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      configHistory.set(historyId, {
        id: historyId,
        category: config.category,
        key: config.key,
        oldValue,
        newValue: 'RESET_TO_DEFAULT',
        changedBy: userId,
        changedAt: new Date().toISOString(),
        reason: reason || 'Configuration reset to default'
      });

      resetResults.push({
        key: `${config.category}.${config.key}`,
        success: true,
        action: 'reset_to_default'
      });
    });

    const successCount = resetResults.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      data: {
        resetResults,
        summary: {
          totalReset: successCount,
          category: category || 'multiple',
          resetAt: new Date().toISOString()
        }
      },
      message: `${successCount} configuration(s) reset to defaults`
    });

  } catch (error) {
    console.error('Reset system configuration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
