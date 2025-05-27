-- GCE Database Schema - Administrative and System Tables
-- Version: 1.0
-- Description: Tables for notifications, backups, monitoring, and system administration

-- Create administrative-specific types
CREATE TYPE notification_type_enum AS ENUM ('info', 'warning', 'success', 'error', 'maintenance', 'announcement');
CREATE TYPE notification_status_enum AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled');
CREATE TYPE backup_type_enum AS ENUM ('full', 'incremental', 'differential', 'database', 'files', 'configuration');
CREATE TYPE backup_status_enum AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE system_health_status_enum AS ENUM ('healthy', 'warning', 'critical', 'maintenance');

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE gce_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Notification Details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL DEFAULT 'info',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Targeting
    target_user_types JSONB DEFAULT '[]', -- Array of user types
    target_users JSONB DEFAULT '[]', -- Array of specific user IDs
    target_schools JSONB DEFAULT '[]', -- Array of school IDs
    target_regions JSONB DEFAULT '[]', -- Array of regions
    exclude_users JSONB DEFAULT '[]', -- Array of user IDs to exclude
    
    -- Content
    html_content TEXT,
    plain_text_content TEXT,
    attachments JSONB DEFAULT '[]', -- Array of attachment objects
    
    -- Delivery Channels
    channels JSONB NOT NULL DEFAULT '["in_app"]', -- email, sms, push, in_app, portal
    
    -- Scheduling
    send_immediately BOOLEAN NOT NULL DEFAULT true,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'Africa/Douala',
    
    -- Recurring Notifications
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_pattern JSONB, -- {frequency, interval, end_date}
    
    -- Status and Delivery
    status notification_status_enum NOT NULL DEFAULT 'draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Template Information
    template_id UUID,
    template_variables JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id)
);

-- Indexes for notifications
CREATE INDEX idx_gce_notifications_tenant ON gce_notifications(tenant_id);
CREATE INDEX idx_gce_notifications_type ON gce_notifications(type);
CREATE INDEX idx_gce_notifications_status ON gce_notifications(status);
CREATE INDEX idx_gce_notifications_scheduled ON gce_notifications(scheduled_time);
CREATE INDEX idx_gce_notifications_created_by ON gce_notifications(created_by);

-- =============================================================================
-- NOTIFICATION DELIVERIES TABLE
-- =============================================================================
CREATE TABLE gce_notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES gce_notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE CASCADE,
    
    -- Delivery Details
    channel VARCHAR(50) NOT NULL, -- email, sms, push, in_app
    recipient_address VARCHAR(255) NOT NULL, -- email address, phone number, etc.
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, delivered, failed, bounced, opened, clicked
    
    -- Delivery Information
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Error Information
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Tracking
    tracking_id VARCHAR(255),
    external_id VARCHAR(255), -- ID from external service (email provider, SMS gateway)
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_gce_notification_deliveries_notification_user_channel 
        UNIQUE (notification_id, user_id, channel)
);

-- Indexes for notification deliveries
CREATE INDEX idx_gce_notification_deliveries_notification ON gce_notification_deliveries(notification_id);
CREATE INDEX idx_gce_notification_deliveries_user ON gce_notification_deliveries(user_id);
CREATE INDEX idx_gce_notification_deliveries_status ON gce_notification_deliveries(status);
CREATE INDEX idx_gce_notification_deliveries_channel ON gce_notification_deliveries(channel);

-- =============================================================================
-- BACKUP JOBS TABLE
-- =============================================================================
CREATE TABLE gce_backup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES gce_tenants(id) ON DELETE SET NULL,
    
    -- Job Details
    job_name VARCHAR(255) NOT NULL,
    backup_type backup_type_enum NOT NULL,
    status backup_status_enum NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- low, normal, high, critical
    
    -- Configuration
    configuration JSONB NOT NULL, -- Backup configuration details
    
    -- Scheduling
    is_scheduled BOOLEAN NOT NULL DEFAULT false,
    schedule_pattern VARCHAR(100), -- Cron pattern
    next_run_time TIMESTAMP WITH TIME ZONE,
    
    -- Progress
    progress_percentage INTEGER DEFAULT 0,
    current_step VARCHAR(255),
    processed_items INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    bytes_processed BIGINT DEFAULT 0,
    total_bytes BIGINT DEFAULT 0,
    
    -- Results
    backup_file_path VARCHAR(500),
    backup_file_size BIGINT,
    backup_checksum VARCHAR(255),
    compression_ratio DECIMAL(5,2),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Error Information
    error_message TEXT,
    error_details JSONB,
    
    -- Retention
    retention_days INTEGER DEFAULT 30,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id)
);

-- Indexes for backup jobs
CREATE INDEX idx_gce_backup_jobs_tenant ON gce_backup_jobs(tenant_id);
CREATE INDEX idx_gce_backup_jobs_type ON gce_backup_jobs(backup_type);
CREATE INDEX idx_gce_backup_jobs_status ON gce_backup_jobs(status);
CREATE INDEX idx_gce_backup_jobs_scheduled ON gce_backup_jobs(is_scheduled);
CREATE INDEX idx_gce_backup_jobs_next_run ON gce_backup_jobs(next_run_time);
CREATE INDEX idx_gce_backup_jobs_expires ON gce_backup_jobs(expires_at);

-- =============================================================================
-- RESTORE JOBS TABLE
-- =============================================================================
CREATE TABLE gce_restore_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES gce_tenants(id) ON DELETE SET NULL,
    
    -- Job Details
    job_name VARCHAR(255) NOT NULL,
    backup_job_id UUID REFERENCES gce_backup_jobs(id) ON DELETE SET NULL,
    restore_type VARCHAR(100) NOT NULL, -- full, selective, database_only, files_only
    status backup_status_enum NOT NULL DEFAULT 'pending',
    
    -- Source Information
    backup_file_path VARCHAR(500) NOT NULL,
    backup_file_size BIGINT,
    backup_checksum VARCHAR(255),
    
    -- Configuration
    configuration JSONB NOT NULL, -- Restore configuration details
    target_environment VARCHAR(100), -- production, staging, development
    
    -- Validation
    validation_results JSONB, -- Pre-restore validation results
    
    -- Progress
    progress_percentage INTEGER DEFAULT 0,
    current_step VARCHAR(255),
    processed_items INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    
    -- Results
    restored_items INTEGER DEFAULT 0,
    skipped_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    
    -- Pre-restore Backup
    pre_restore_backup_id UUID REFERENCES gce_backup_jobs(id),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Error Information
    error_message TEXT,
    error_details JSONB,
    warnings JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id)
);

-- Indexes for restore jobs
CREATE INDEX idx_gce_restore_jobs_tenant ON gce_restore_jobs(tenant_id);
CREATE INDEX idx_gce_restore_jobs_backup ON gce_restore_jobs(backup_job_id);
CREATE INDEX idx_gce_restore_jobs_status ON gce_restore_jobs(status);
CREATE INDEX idx_gce_restore_jobs_environment ON gce_restore_jobs(target_environment);

-- =============================================================================
-- SYSTEM HEALTH MONITORING TABLE
-- =============================================================================
CREATE TABLE gce_system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES gce_tenants(id) ON DELETE SET NULL,
    
    -- Health Status
    overall_status system_health_status_enum NOT NULL,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    
    -- Service Status
    services JSONB NOT NULL, -- Status of individual services
    
    -- Performance Metrics
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_latency INTEGER, -- in milliseconds
    active_connections INTEGER,
    requests_per_minute INTEGER,
    
    -- Database Metrics
    database_connections INTEGER,
    database_response_time INTEGER, -- in milliseconds
    database_size BIGINT, -- in bytes
    
    -- Application Metrics
    active_users INTEGER,
    error_rate DECIMAL(5,2),
    response_time_avg INTEGER, -- in milliseconds
    
    -- Security Metrics
    failed_login_attempts INTEGER,
    suspicious_activities INTEGER,
    security_alerts INTEGER,
    
    -- Alerts and Issues
    active_alerts JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    errors JSONB DEFAULT '[]',
    
    -- Uptime
    uptime_seconds BIGINT,
    last_restart TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Partition system health by month for performance
CREATE TABLE gce_system_health_y2025m01 PARTITION OF gce_system_health
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for system health
CREATE INDEX idx_gce_system_health_tenant ON gce_system_health(tenant_id);
CREATE INDEX idx_gce_system_health_status ON gce_system_health(overall_status);
CREATE INDEX idx_gce_system_health_timestamp ON gce_system_health(check_timestamp);
CREATE INDEX idx_gce_system_health_score ON gce_system_health(health_score);

-- =============================================================================
-- USER ACTIVITY TRACKING TABLE
-- =============================================================================
CREATE TABLE gce_user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES gce_tenants(id) ON DELETE SET NULL,
    
    -- User Information
    user_id UUID REFERENCES gce_users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES gce_user_sessions(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL, -- login, logout, page_view, action, download, upload
    activity_action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    
    -- Request Details
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    request_headers JSONB,
    
    -- Response Details
    response_status INTEGER,
    response_time INTEGER, -- in milliseconds
    response_size INTEGER, -- in bytes
    
    -- Location Information
    country VARCHAR(100),
    city VARCHAR(100),
    coordinates POINT,
    
    -- Device Information
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    
    -- Security Analysis
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    anomaly_flags JSONB DEFAULT '[]',
    security_flags JSONB DEFAULT '[]',
    
    -- Performance Metrics
    page_load_time INTEGER, -- in milliseconds
    network_latency INTEGER, -- in milliseconds
    
    -- Additional Context
    referrer_url TEXT,
    search_query TEXT,
    form_data JSONB, -- Sanitized form data (no sensitive info)
    
    -- Metadata
    activity_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Partition user activities by month for performance
CREATE TABLE gce_user_activities_y2025m01 PARTITION OF gce_user_activities
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for user activities
CREATE INDEX idx_gce_user_activities_tenant ON gce_user_activities(tenant_id);
CREATE INDEX idx_gce_user_activities_user ON gce_user_activities(user_id);
CREATE INDEX idx_gce_user_activities_session ON gce_user_activities(session_id);
CREATE INDEX idx_gce_user_activities_type ON gce_user_activities(activity_type);
CREATE INDEX idx_gce_user_activities_timestamp ON gce_user_activities(activity_timestamp);
CREATE INDEX idx_gce_user_activities_ip ON gce_user_activities(ip_address);
CREATE INDEX idx_gce_user_activities_risk ON gce_user_activities(risk_score);

-- =============================================================================
-- REPORTS TABLE
-- =============================================================================
CREATE TABLE gce_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Report Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL, -- performance, statistical, comparative, administrative
    category VARCHAR(100) NOT NULL, -- academic, administrative, financial, security
    
    -- Configuration
    data_source VARCHAR(100) NOT NULL, -- results, markings, certificates, analytics
    filters JSONB DEFAULT '{}',
    columns JSONB NOT NULL, -- Array of column definitions
    grouping JSONB DEFAULT '[]',
    sorting JSONB DEFAULT '[]',
    calculations JSONB DEFAULT '[]',
    
    -- Visualization
    visualizations JSONB DEFAULT '[]', -- Chart and graph configurations
    
    -- Scheduling
    is_scheduled BOOLEAN NOT NULL DEFAULT false,
    schedule_pattern VARCHAR(100), -- Cron pattern
    next_run_time TIMESTAMP WITH TIME ZONE,
    
    -- Access Control
    is_public BOOLEAN NOT NULL DEFAULT false,
    allowed_roles JSONB DEFAULT '[]',
    allowed_users JSONB DEFAULT '[]',
    
    -- Usage Statistics
    run_count INTEGER DEFAULT 0,
    last_run_time TIMESTAMP WITH TIME ZONE,
    average_execution_time INTEGER, -- in milliseconds
    
    -- Template Information
    is_template BOOLEAN NOT NULL DEFAULT false,
    template_category VARCHAR(100),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id)
);

-- Indexes for reports
CREATE INDEX idx_gce_reports_tenant ON gce_reports(tenant_id);
CREATE INDEX idx_gce_reports_type ON gce_reports(report_type);
CREATE INDEX idx_gce_reports_category ON gce_reports(category);
CREATE INDEX idx_gce_reports_scheduled ON gce_reports(is_scheduled);
CREATE INDEX idx_gce_reports_template ON gce_reports(is_template);
CREATE INDEX idx_gce_reports_active ON gce_reports(is_active);

-- =============================================================================
-- REPORT EXECUTIONS TABLE
-- =============================================================================
CREATE TABLE gce_report_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES gce_reports(id) ON DELETE CASCADE,
    
    -- Execution Details
    execution_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, scheduled, api
    parameters JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- running, completed, failed
    
    -- Results
    total_records INTEGER,
    execution_time INTEGER, -- in milliseconds
    file_size BIGINT, -- in bytes
    output_format VARCHAR(50), -- pdf, excel, csv, json
    output_url VARCHAR(500),
    
    -- Error Information
    error_message TEXT,
    error_details JSONB,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- When output files expire
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES gce_users(id)
);

-- Indexes for report executions
CREATE INDEX idx_gce_report_executions_report ON gce_report_executions(report_id);
CREATE INDEX idx_gce_report_executions_status ON gce_report_executions(status);
CREATE INDEX idx_gce_report_executions_started ON gce_report_executions(started_at);
CREATE INDEX idx_gce_report_executions_expires ON gce_report_executions(expires_at);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

CREATE TRIGGER tr_gce_notifications_updated_at
    BEFORE UPDATE ON gce_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_backup_jobs_updated_at
    BEFORE UPDATE ON gce_backup_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_restore_jobs_updated_at
    BEFORE UPDATE ON gce_restore_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_reports_updated_at
    BEFORE UPDATE ON gce_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE gce_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_restore_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_report_executions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE gce_notifications IS 'System notifications with multi-channel delivery support';
COMMENT ON TABLE gce_notification_deliveries IS 'Individual notification delivery tracking';
COMMENT ON TABLE gce_backup_jobs IS 'Backup job management with scheduling and monitoring';
COMMENT ON TABLE gce_restore_jobs IS 'Restore job management with validation and progress tracking';
COMMENT ON TABLE gce_system_health IS 'System health monitoring with performance metrics';
COMMENT ON TABLE gce_user_activities IS 'Comprehensive user activity tracking and analytics';
COMMENT ON TABLE gce_reports IS 'Custom report definitions with scheduling and access control';
COMMENT ON TABLE gce_report_executions IS 'Report execution history and output management';
