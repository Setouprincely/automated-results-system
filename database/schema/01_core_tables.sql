-- GCE Database Schema - Core Tables
-- Version: 1.0
-- Description: Core system tables for users, tenants, and system configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_type_enum AS ENUM ('admin', 'examiner', 'teacher', 'student');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE audit_operation_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'SELECT');

-- =============================================================================
-- TENANTS TABLE - Multi-tenant support
-- =============================================================================
CREATE TABLE gce_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'examination_center', -- examination_center, region, ministry
    region VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'Cameroon',
    contact_info JSONB,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Indexes for tenants
CREATE INDEX idx_gce_tenants_code ON gce_tenants(code);
CREATE INDEX idx_gce_tenants_region ON gce_tenants(region);
CREATE INDEX idx_gce_tenants_active ON gce_tenants(is_active);

-- =============================================================================
-- USERS TABLE - Core user management
-- =============================================================================
CREATE TABLE gce_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    user_type user_type_enum NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender gender_enum,
    nationality VARCHAR(100) DEFAULT 'Cameroonian',
    
    -- Address Information
    address JSONB, -- {street, city, region, postal_code, country}
    
    -- Contact Information
    emergency_contact JSONB, -- {name, relationship, phone, email}
    
    -- Account Status
    status user_status_enum NOT NULL DEFAULT 'pending_verification',
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret VARCHAR(255),
    
    -- Security
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Profile
    profile_picture_url VARCHAR(500),
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT uk_gce_users_email_tenant UNIQUE (email, tenant_id),
    CONSTRAINT chk_gce_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_gce_users_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Indexes for users
CREATE INDEX idx_gce_users_tenant_id ON gce_users(tenant_id);
CREATE INDEX idx_gce_users_email ON gce_users(email);
CREATE INDEX idx_gce_users_user_type ON gce_users(user_type);
CREATE INDEX idx_gce_users_status ON gce_users(status);
CREATE INDEX idx_gce_users_created_at ON gce_users(created_at);
CREATE INDEX idx_gce_users_deleted_at ON gce_users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_gce_users_last_login ON gce_users(last_login_at);

-- Full-text search index for user names
CREATE INDEX idx_gce_users_fulltext ON gce_users USING gin(
    to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(middle_name, ''))
);

-- =============================================================================
-- USER SESSIONS TABLE - Session management
-- =============================================================================
CREATE TABLE gce_user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) UNIQUE,
    device_info JSONB, -- {user_agent, browser, os, device_type, is_mobile}
    ip_address INET NOT NULL,
    location JSONB, -- {country, city, coordinates}
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_gce_user_sessions_user_id ON gce_user_sessions(user_id);
CREATE INDEX idx_gce_user_sessions_token ON gce_user_sessions(session_token);
CREATE INDEX idx_gce_user_sessions_active ON gce_user_sessions(is_active);
CREATE INDEX idx_gce_user_sessions_expires ON gce_user_sessions(expires_at);

-- =============================================================================
-- SYSTEM CONFIGURATION TABLE
-- =============================================================================
CREATE TABLE gce_system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES gce_tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- string, number, boolean, object, array
    description TEXT,
    is_editable BOOLEAN NOT NULL DEFAULT true,
    requires_restart BOOLEAN NOT NULL DEFAULT false,
    validation_rules JSONB, -- {required, min, max, pattern, allowed_values}
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_system_config_key UNIQUE (tenant_id, category, config_key)
);

-- Indexes for system config
CREATE INDEX idx_gce_system_config_tenant ON gce_system_config(tenant_id);
CREATE INDEX idx_gce_system_config_category ON gce_system_config(category);
CREATE INDEX idx_gce_system_config_key ON gce_system_config(config_key);

-- =============================================================================
-- AUDIT LOG TABLE - Complete audit trail
-- =============================================================================
CREATE TABLE gce_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES gce_tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES gce_users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES gce_user_sessions(id) ON DELETE SET NULL,
    
    -- Audit Information
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    operation audit_operation_enum NOT NULL,
    old_values JSONB,
    new_values JSONB,
    
    -- Context Information
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    api_endpoint VARCHAR(255),
    
    -- Classification
    category VARCHAR(100), -- authentication, user_management, data_access, etc.
    severity VARCHAR(50) DEFAULT 'info', -- low, medium, high, critical
    
    -- Compliance
    gdpr_relevant BOOLEAN NOT NULL DEFAULT false,
    retention_until DATE,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Indexes will be created separately due to size
    CONSTRAINT chk_audit_operation_values CHECK (
        (operation = 'DELETE' AND old_values IS NOT NULL AND new_values IS NULL) OR
        (operation = 'INSERT' AND old_values IS NULL AND new_values IS NOT NULL) OR
        (operation = 'UPDATE' AND old_values IS NOT NULL AND new_values IS NOT NULL) OR
        (operation = 'SELECT')
    )
);

-- Partition audit log by month for performance
CREATE TABLE gce_audit_log_y2025m01 PARTITION OF gce_audit_log
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for audit log (will be inherited by partitions)
CREATE INDEX idx_gce_audit_log_tenant ON gce_audit_log(tenant_id);
CREATE INDEX idx_gce_audit_log_user ON gce_audit_log(user_id);
CREATE INDEX idx_gce_audit_log_table ON gce_audit_log(table_name);
CREATE INDEX idx_gce_audit_log_operation ON gce_audit_log(operation);
CREATE INDEX idx_gce_audit_log_created_at ON gce_audit_log(created_at);
CREATE INDEX idx_gce_audit_log_category ON gce_audit_log(category);
CREATE INDEX idx_gce_audit_log_severity ON gce_audit_log(severity);

-- =============================================================================
-- SCHOOLS TABLE - Educational institutions
-- =============================================================================
CREATE TABLE gce_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- School Information
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL, -- public, private, mission, technical
    level VARCHAR(100) NOT NULL, -- primary, secondary, technical, university
    
    -- Location
    region VARCHAR(100) NOT NULL,
    division VARCHAR(100),
    subdivision VARCHAR(100),
    town VARCHAR(100),
    address TEXT,
    coordinates POINT, -- PostGIS point for geographic queries
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Administrative
    principal_name VARCHAR(255),
    principal_phone VARCHAR(20),
    principal_email VARCHAR(255),
    
    -- Registration
    registration_number VARCHAR(100),
    ministry_code VARCHAR(50),
    accreditation_status VARCHAR(50) DEFAULT 'accredited',
    accreditation_date DATE,
    
    -- Capacity
    student_capacity INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    staff_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_examination_center BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_schools_code_tenant UNIQUE (code, tenant_id),
    CONSTRAINT chk_gce_schools_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Indexes for schools
CREATE INDEX idx_gce_schools_tenant ON gce_schools(tenant_id);
CREATE INDEX idx_gce_schools_code ON gce_schools(code);
CREATE INDEX idx_gce_schools_region ON gce_schools(region);
CREATE INDEX idx_gce_schools_type ON gce_schools(type);
CREATE INDEX idx_gce_schools_active ON gce_schools(is_active);
CREATE INDEX idx_gce_schools_exam_center ON gce_schools(is_examination_center);

-- Full-text search for school names
CREATE INDEX idx_gce_schools_fulltext ON gce_schools USING gin(
    to_tsvector('english', name)
);

-- =============================================================================
-- USER ROLES TABLE - Role-based access control
-- =============================================================================
CREATE TABLE gce_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES gce_schools(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '[]', -- Array of permission strings
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_user_roles_user_school_role UNIQUE (user_id, school_id, role_name),
    CONSTRAINT chk_gce_user_roles_valid_dates CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

-- Indexes for user roles
CREATE INDEX idx_gce_user_roles_user ON gce_user_roles(user_id);
CREATE INDEX idx_gce_user_roles_school ON gce_user_roles(school_id);
CREATE INDEX idx_gce_user_roles_role ON gce_user_roles(role_name);
CREATE INDEX idx_gce_user_roles_active ON gce_user_roles(is_active);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS AND AUDIT
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER tr_gce_tenants_updated_at
    BEFORE UPDATE ON gce_tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_users_updated_at
    BEFORE UPDATE ON gce_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_system_config_updated_at
    BEFORE UPDATE ON gce_system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_schools_updated_at
    BEFORE UPDATE ON gce_schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tenant-aware tables
ALTER TABLE gce_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (will be defined in separate security file)
-- These policies ensure users can only access data from their tenant

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE gce_tenants IS 'Multi-tenant support for examination centers and regions';
COMMENT ON TABLE gce_users IS 'Core user management with comprehensive profile and security features';
COMMENT ON TABLE gce_user_sessions IS 'Active user sessions for authentication and security tracking';
COMMENT ON TABLE gce_system_config IS 'System configuration with tenant-specific settings';
COMMENT ON TABLE gce_audit_log IS 'Comprehensive audit trail for all system operations';
COMMENT ON TABLE gce_schools IS 'Educational institutions and examination centers';
COMMENT ON TABLE gce_user_roles IS 'Role-based access control with school-specific permissions';

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default tenant (will be expanded in data setup file)
INSERT INTO gce_tenants (id, name, code, type, region, country) VALUES
(uuid_generate_v4(), 'GCE Board Cameroon', 'GCE-CM', 'ministry', 'National', 'Cameroon');

-- Insert default system configurations (will be expanded in configuration file)
-- This will be done in a separate file to keep this schema file focused
