-- GCE Database Migration 001 - Initial Setup
-- Version: 1.0.0
-- Description: Initial database setup with core tables and configuration
-- Author: GCE Development Team
-- Date: 2025-01-15

-- =============================================================================
-- MIGRATION METADATA
-- =============================================================================
INSERT INTO gce_migrations (
    version,
    name,
    description,
    applied_at,
    checksum
) VALUES (
    '001',
    'initial_setup',
    'Initial database setup with core tables and configuration',
    NOW(),
    'sha256:initial_setup_checksum_placeholder'
);

-- =============================================================================
-- INITIAL TENANT SETUP
-- =============================================================================

-- Create default tenant for GCE Board Cameroon
INSERT INTO gce_tenants (
    id,
    name,
    code,
    type,
    region,
    country,
    contact_info,
    settings,
    is_active,
    created_at,
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'GCE Board Cameroon',
    'GCE-CM',
    'ministry',
    'National',
    'Cameroon',
    '{
        "address": "Ministry of Secondary Education, Yaoundé, Cameroon",
        "phone": "+237-222-223-344",
        "email": "info@gce.cm",
        "website": "https://gce.cm"
    }'::JSONB,
    '{
        "timezone": "Africa/Douala",
        "currency": "XAF",
        "languages": ["en", "fr"],
        "academic_year_start": "09-01",
        "academic_year_end": "07-31"
    }'::JSONB,
    true,
    NOW(),
    NULL
);

-- =============================================================================
-- INITIAL SYSTEM CONFIGURATION
-- =============================================================================

-- Authentication settings
INSERT INTO gce_system_config (tenant_id, category, config_key, config_value, data_type, description, is_editable, requires_restart, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'authentication', 'session_timeout', '30', 'number', 'Session timeout in minutes', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'authentication', 'password_policy', '{"minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumbers": true, "requireSpecialChars": true, "maxAge": 90}', 'object', 'Password policy configuration', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'authentication', 'max_login_attempts', '5', 'number', 'Maximum failed login attempts before lockout', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'authentication', 'account_lockout_duration', '30', 'number', 'Account lockout duration in minutes', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'authentication', 'two_factor_enabled', 'true', 'boolean', 'Enable two-factor authentication', true, false, NULL);

-- System settings
INSERT INTO gce_system_config (tenant_id, category, config_key, config_value, data_type, description, is_editable, requires_restart, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'system', 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'system', 'max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'system', 'allowed_file_types', '["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"]', 'array', 'Allowed file types for upload', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'system', 'system_timezone', 'Africa/Douala', 'string', 'System timezone', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'system', 'default_language', 'en', 'string', 'Default system language', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'system', 'supported_languages', '["en", "fr"]', 'array', 'Supported system languages', true, true, NULL);

-- Email settings
INSERT INTO gce_system_config (tenant_id, category, config_key, config_value, data_type, description, is_editable, requires_restart, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'email', 'smtp_host', 'smtp.gce.cm', 'string', 'SMTP server hostname', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'email', 'smtp_port', '587', 'number', 'SMTP server port', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'email', 'smtp_encryption', 'tls', 'string', 'SMTP encryption method', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'email', 'email_from_address', 'noreply@gce.cm', 'string', 'Default from email address', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'email', 'email_from_name', 'GCE Board Cameroon', 'string', 'Default from name', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'email', 'email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', true, false, NULL);

-- Security settings
INSERT INTO gce_system_config (tenant_id, category, config_key, config_value, data_type, description, is_editable, requires_restart, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'security', 'encryption_algorithm', 'AES-256-GCM', 'string', 'Encryption algorithm for sensitive data', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'security', 'audit_log_retention', '2555', 'number', 'Audit log retention period in days (7 years)', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'security', 'ip_whitelist', '[]', 'array', 'IP addresses allowed for admin access', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'security', 'rate_limiting_enabled', 'true', 'boolean', 'Enable API rate limiting', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'security', 'max_concurrent_sessions', '3', 'number', 'Maximum concurrent sessions per user', true, false, NULL);

-- Backup settings
INSERT INTO gce_system_config (tenant_id, category, config_key, config_value, data_type, description, is_editable, requires_restart, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'backup', 'auto_backup_enabled', 'true', 'boolean', 'Enable automatic backups', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'backup', 'backup_schedule', '0 2 * * *', 'string', 'Backup schedule (cron format) - Daily at 2 AM', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'backup', 'backup_retention_days', '30', 'number', 'Number of days to retain backups', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'backup', 'backup_compression', 'gzip', 'string', 'Backup compression method', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'backup', 'backup_encryption', 'true', 'boolean', 'Enable backup encryption', true, false, NULL);

-- Examination settings
INSERT INTO gce_system_config (tenant_id, category, config_key, config_value, data_type, description, is_editable, requires_restart, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'registration_fee_o_level', '15000', 'number', 'O Level registration fee in XAF', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'registration_fee_a_level', '20000', 'number', 'A Level registration fee in XAF', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'subject_fee', '2500', 'number', 'Fee per subject in XAF', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'practical_fee', '5000', 'number', 'Practical examination fee in XAF', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'late_registration_fee', '10000', 'number', 'Late registration penalty fee in XAF', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'max_subjects_o_level', '9', 'number', 'Maximum subjects for O Level', true, false, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'examination', 'max_subjects_a_level', '4', 'number', 'Maximum subjects for A Level', true, false, NULL);

-- =============================================================================
-- INITIAL SUBJECTS SETUP
-- =============================================================================

-- O Level Core Subjects
INSERT INTO gce_subjects (tenant_id, code, name, full_name, exam_level, subject_type, max_marks, pass_mark, grade_boundaries, has_practical, is_active, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'ENG', 'English Language', 'English Language', 'O Level', 'core', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'MAT', 'Mathematics', 'Mathematics', 'O Level', 'core', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'BIO', 'Biology', 'Biology', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'CHE', 'Chemistry', 'Chemistry', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'PHY', 'Physics', 'Physics', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'HIS', 'History', 'History', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'GEO', 'Geography', 'Geography', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'FRE', 'French', 'French Language', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'LIT', 'Literature', 'Literature in English', 'O Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL);

-- A Level Subjects
INSERT INTO gce_subjects (tenant_id, code, name, full_name, exam_level, subject_type, max_marks, pass_mark, grade_boundaries, has_practical, is_active, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'AMAT', 'Mathematics', 'Advanced Mathematics', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'AFMA', 'Further Mathematics', 'Advanced Further Mathematics', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'APHY', 'Physics', 'Advanced Physics', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'ACHE', 'Chemistry', 'Advanced Chemistry', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'ABIO', 'Biology', 'Advanced Biology', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', true, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'AECO', 'Economics', 'Advanced Economics', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'AHIS', 'History', 'Advanced History', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'AGEO', 'Geography', 'Advanced Geography', 'A Level', 'elective', 100, 50, '{"A": 80, "B": 70, "C": 60, "D": 50, "E": 40, "F": 0}', false, true, NULL);

-- =============================================================================
-- INITIAL ADMIN USER SETUP
-- =============================================================================

-- Create system administrator account
INSERT INTO gce_users (
    id,
    tenant_id,
    user_type,
    email,
    phone,
    password_hash,
    salt,
    first_name,
    last_name,
    status,
    email_verified,
    phone_verified,
    two_factor_enabled,
    created_at,
    created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'admin',
    'admin@gce.cm',
    '+237700000000',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/...',  -- Password: Admin@123
    'random_salt_string_here',
    'System',
    'Administrator',
    'active',
    true,
    true,
    false,
    NOW(),
    NULL
);

-- =============================================================================
-- SAMPLE EXAMINATION SESSION
-- =============================================================================

-- Create 2025 examination sessions
INSERT INTO gce_examination_sessions (
    id,
    tenant_id,
    year,
    session_type,
    name,
    code,
    registration_start_date,
    registration_end_date,
    late_registration_end_date,
    examination_start_date,
    examination_end_date,
    base_registration_fee,
    late_registration_fee,
    subject_fee,
    practical_fee,
    is_active,
    is_registration_open,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440010'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    2025,
    'May/June',
    'GCE O Level May/June 2025',
    'OL-MJ-2025',
    '2025-01-15',
    '2025-03-15',
    '2025-03-30',
    '2025-05-15',
    '2025-06-30',
    15000.00,
    10000.00,
    2500.00,
    5000.00,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440001'::UUID
),
(
    '550e8400-e29b-41d4-a716-446655440011'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    2025,
    'May/June',
    'GCE A Level May/June 2025',
    'AL-MJ-2025',
    '2025-01-15',
    '2025-03-15',
    '2025-03-30',
    '2025-05-15',
    '2025-06-30',
    20000.00,
    10000.00,
    2500.00,
    5000.00,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440001'::UUID
);

-- =============================================================================
-- SAMPLE SCHOOLS
-- =============================================================================

-- Create sample schools
INSERT INTO gce_schools (
    id,
    tenant_id,
    name,
    code,
    type,
    level,
    region,
    division,
    town,
    address,
    phone,
    email,
    principal_name,
    principal_email,
    registration_number,
    student_capacity,
    is_active,
    is_examination_center,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440020'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'Government High School Yaoundé',
    'GHS-YDE-001',
    'public',
    'secondary',
    'Centre',
    'Mfoundi',
    'Yaoundé',
    'BP 1234, Yaoundé, Cameroon',
    '+237222334455',
    'principal@ghsyaounde.cm',
    'Dr. Jean Baptiste',
    'principal@ghsyaounde.cm',
    'REG-GHS-YDE-001',
    1500,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440001'::UUID
),
(
    '550e8400-e29b-41d4-a716-446655440021'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'Sacred Heart College Douala',
    'SHC-DLA-001',
    'private',
    'secondary',
    'Littoral',
    'Wouri',
    'Douala',
    'BP 5678, Douala, Cameroon',
    '+237233445566',
    'principal@shcdouala.cm',
    'Sister Mary Catherine',
    'principal@shcdouala.cm',
    'REG-SHC-DLA-001',
    1200,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440001'::UUID
);

-- =============================================================================
-- INITIAL NOTIFICATION TEMPLATES
-- =============================================================================

-- Create default notification templates
INSERT INTO gce_notifications (
    id,
    tenant_id,
    title,
    message,
    type,
    priority,
    target_user_types,
    channels,
    send_immediately,
    status,
    html_content,
    plain_text_content,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440030'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'Welcome to GCE System',
    'Welcome to the GCE Automated Results System. Your account has been created successfully.',
    'info',
    'normal',
    '["student", "teacher", "examiner"]'::JSONB,
    '["email", "in_app"]'::JSONB,
    false,
    'draft',
    '<h2>Welcome to GCE System</h2><p>Your account has been created successfully. You can now access all system features.</p>',
    'Welcome to GCE System. Your account has been created successfully. You can now access all system features.',
    '550e8400-e29b-41d4-a716-446655440001'::UUID
);

-- =============================================================================
-- INITIAL AUDIT LOG ENTRY
-- =============================================================================

-- Log the initial setup
INSERT INTO gce_audit_log (
    tenant_id,
    user_id,
    table_name,
    operation,
    new_values,
    category,
    severity,
    gdpr_relevant,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    'system_setup',
    'INSERT',
    '{"action": "initial_database_setup", "version": "1.0.0", "tables_created": 25, "configuration_items": 25}'::JSONB,
    'system_config',
    'info',
    false,
    NOW()
);

-- =============================================================================
-- VERIFY SETUP
-- =============================================================================

-- Verify that all essential data was created
DO $$
DECLARE
    tenant_count INTEGER;
    config_count INTEGER;
    subject_count INTEGER;
    session_count INTEGER;
    school_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM gce_tenants WHERE is_active = true;
    SELECT COUNT(*) INTO config_count FROM gce_system_config;
    SELECT COUNT(*) INTO subject_count FROM gce_subjects WHERE is_active = true;
    SELECT COUNT(*) INTO session_count FROM gce_examination_sessions WHERE is_active = true;
    SELECT COUNT(*) INTO school_count FROM gce_schools WHERE is_active = true;
    SELECT COUNT(*) INTO admin_count FROM gce_users WHERE user_type = 'admin' AND status = 'active';
    
    RAISE NOTICE 'Setup verification:';
    RAISE NOTICE '- Tenants created: %', tenant_count;
    RAISE NOTICE '- Configuration items: %', config_count;
    RAISE NOTICE '- Subjects created: %', subject_count;
    RAISE NOTICE '- Examination sessions: %', session_count;
    RAISE NOTICE '- Schools created: %', school_count;
    RAISE NOTICE '- Admin users: %', admin_count;
    
    IF tenant_count = 0 OR config_count = 0 OR admin_count = 0 THEN
        RAISE EXCEPTION 'Initial setup verification failed. Essential data missing.';
    END IF;
    
    RAISE NOTICE 'Initial setup completed successfully!';
END $$;

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

-- Update migration status
UPDATE gce_migrations 
SET 
    completed_at = NOW(),
    status = 'completed'
WHERE version = '001';

COMMIT;
