-- GCE Database Schema - Examination and Academic Tables
-- Version: 1.0
-- Description: Tables for examinations, subjects, registrations, and academic management

-- Create examination-specific types
CREATE TYPE exam_level_enum AS ENUM ('O Level', 'A Level', 'Technical', 'Professional');
CREATE TYPE exam_session_enum AS ENUM ('May/June', 'November/December', 'Special');
CREATE TYPE subject_type_enum AS ENUM ('core', 'elective', 'practical', 'project');
CREATE TYPE registration_status_enum AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'partial', 'completed', 'failed', 'refunded');

-- =============================================================================
-- EXAMINATION SESSIONS TABLE
-- =============================================================================
CREATE TABLE gce_examination_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Session Information
    year INTEGER NOT NULL,
    session_type exam_session_enum NOT NULL,
    name VARCHAR(255) NOT NULL, -- e.g., "GCE O Level May/June 2025"
    code VARCHAR(50) NOT NULL, -- e.g., "OL-MJ-2025"
    
    -- Dates
    registration_start_date DATE NOT NULL,
    registration_end_date DATE NOT NULL,
    late_registration_end_date DATE,
    examination_start_date DATE NOT NULL,
    examination_end_date DATE NOT NULL,
    results_release_date DATE,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_registration_open BOOLEAN NOT NULL DEFAULT false,
    is_examination_completed BOOLEAN NOT NULL DEFAULT false,
    is_results_published BOOLEAN NOT NULL DEFAULT false,
    
    -- Fees
    base_registration_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    late_registration_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subject_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    practical_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Metadata
    description TEXT,
    instructions JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_exam_sessions_code_tenant UNIQUE (code, tenant_id),
    CONSTRAINT chk_gce_exam_sessions_dates CHECK (
        registration_start_date <= registration_end_date AND
        registration_end_date <= examination_start_date AND
        examination_start_date <= examination_end_date
    )
);

-- Indexes for examination sessions
CREATE INDEX idx_gce_exam_sessions_tenant ON gce_examination_sessions(tenant_id);
CREATE INDEX idx_gce_exam_sessions_year ON gce_examination_sessions(year);
CREATE INDEX idx_gce_exam_sessions_session_type ON gce_examination_sessions(session_type);
CREATE INDEX idx_gce_exam_sessions_active ON gce_examination_sessions(is_active);
CREATE INDEX idx_gce_exam_sessions_registration_open ON gce_examination_sessions(is_registration_open);

-- =============================================================================
-- SUBJECTS TABLE
-- =============================================================================
CREATE TABLE gce_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Subject Information
    code VARCHAR(20) NOT NULL, -- e.g., "MAT", "ENG", "PHY"
    name VARCHAR(255) NOT NULL, -- e.g., "Mathematics", "English Language"
    full_name VARCHAR(500), -- Full descriptive name
    exam_level exam_level_enum NOT NULL,
    subject_type subject_type_enum NOT NULL DEFAULT 'core',
    
    -- Academic Details
    credit_hours INTEGER DEFAULT 0,
    max_marks INTEGER NOT NULL DEFAULT 100,
    pass_mark INTEGER NOT NULL DEFAULT 50,
    grade_boundaries JSONB, -- {A: 80, B: 70, C: 60, D: 50, E: 40, F: 0}
    
    -- Examination Details
    has_practical BOOLEAN NOT NULL DEFAULT false,
    practical_percentage DECIMAL(5,2) DEFAULT 0.00,
    has_coursework BOOLEAN NOT NULL DEFAULT false,
    coursework_percentage DECIMAL(5,2) DEFAULT 0.00,
    examination_duration INTEGER, -- in minutes
    
    -- Prerequisites and Dependencies
    prerequisites JSONB DEFAULT '[]', -- Array of subject IDs
    corequisites JSONB DEFAULT '[]', -- Array of subject IDs
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_available_for_registration BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    description TEXT,
    syllabus_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_subjects_code_level_tenant UNIQUE (code, exam_level, tenant_id),
    CONSTRAINT chk_gce_subjects_percentages CHECK (
        practical_percentage + coursework_percentage <= 100
    ),
    CONSTRAINT chk_gce_subjects_marks CHECK (
        pass_mark <= max_marks AND pass_mark > 0
    )
);

-- Indexes for subjects
CREATE INDEX idx_gce_subjects_tenant ON gce_subjects(tenant_id);
CREATE INDEX idx_gce_subjects_code ON gce_subjects(code);
CREATE INDEX idx_gce_subjects_exam_level ON gce_subjects(exam_level);
CREATE INDEX idx_gce_subjects_type ON gce_subjects(subject_type);
CREATE INDEX idx_gce_subjects_active ON gce_subjects(is_active);

-- =============================================================================
-- STUDENT REGISTRATIONS TABLE
-- =============================================================================
CREATE TABLE gce_student_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Registration Details
    registration_number VARCHAR(50) NOT NULL,
    examination_session_id UUID NOT NULL REFERENCES gce_examination_sessions(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE RESTRICT,
    school_id UUID NOT NULL REFERENCES gce_schools(id) ON DELETE RESTRICT,
    
    -- Student Information (snapshot at registration time)
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255),
    student_phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender gender_enum NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    
    -- Academic Information
    exam_level exam_level_enum NOT NULL,
    previous_attempts INTEGER DEFAULT 0,
    is_private_candidate BOOLEAN NOT NULL DEFAULT false,
    
    -- Address Information
    home_address JSONB NOT NULL,
    contact_address JSONB,
    
    -- Guardian Information (for minors)
    guardian_info JSONB, -- {name, relationship, phone, email, address}
    
    -- Registration Status
    status registration_status_enum NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES gce_users(id),
    
    -- Payment Information
    total_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    
    -- Documents
    documents JSONB DEFAULT '{}', -- {passport_photo, birth_certificate, etc.}
    
    -- Special Needs
    special_needs JSONB DEFAULT '{}', -- {type, description, accommodations}
    
    -- Metadata
    registration_source VARCHAR(100) DEFAULT 'online', -- online, offline, bulk_import
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_registrations_number_tenant UNIQUE (registration_number, tenant_id),
    CONSTRAINT uk_gce_registrations_student_session UNIQUE (student_id, examination_session_id),
    CONSTRAINT chk_gce_registrations_payment CHECK (amount_paid <= total_fee)
);

-- Indexes for student registrations
CREATE INDEX idx_gce_registrations_tenant ON gce_student_registrations(tenant_id);
CREATE INDEX idx_gce_registrations_number ON gce_student_registrations(registration_number);
CREATE INDEX idx_gce_registrations_session ON gce_student_registrations(examination_session_id);
CREATE INDEX idx_gce_registrations_student ON gce_student_registrations(student_id);
CREATE INDEX idx_gce_registrations_school ON gce_student_registrations(school_id);
CREATE INDEX idx_gce_registrations_status ON gce_student_registrations(status);
CREATE INDEX idx_gce_registrations_exam_level ON gce_student_registrations(exam_level);
CREATE INDEX idx_gce_registrations_payment_status ON gce_student_registrations(payment_status);

-- =============================================================================
-- REGISTRATION SUBJECTS TABLE - Many-to-many relationship
-- =============================================================================
CREATE TABLE gce_registration_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES gce_student_registrations(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES gce_subjects(id) ON DELETE RESTRICT,
    
    -- Subject-specific details
    is_retake BOOLEAN NOT NULL DEFAULT false,
    previous_grade VARCHAR(5),
    previous_percentage DECIMAL(5,2),
    
    -- Fees
    subject_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    practical_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    late_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_reg_subjects_reg_subject UNIQUE (registration_id, subject_id)
);

-- Indexes for registration subjects
CREATE INDEX idx_gce_reg_subjects_registration ON gce_registration_subjects(registration_id);
CREATE INDEX idx_gce_reg_subjects_subject ON gce_registration_subjects(subject_id);
CREATE INDEX idx_gce_reg_subjects_retake ON gce_registration_subjects(is_retake);

-- =============================================================================
-- PAYMENTS TABLE
-- =============================================================================
CREATE TABLE gce_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Payment Details
    payment_reference VARCHAR(100) NOT NULL,
    registration_id UUID NOT NULL REFERENCES gce_student_registrations(id) ON DELETE RESTRICT,
    
    -- Amount Information
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    
    -- Payment Method
    payment_method VARCHAR(50) NOT NULL, -- cash, bank_transfer, mobile_money, card
    payment_provider VARCHAR(100), -- MTN, Orange, Express Union, etc.
    transaction_id VARCHAR(255),
    
    -- Status
    status payment_status_enum NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Receipt Information
    receipt_number VARCHAR(100),
    receipt_url VARCHAR(500),
    
    -- Verification
    verified_by UUID REFERENCES gce_users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Metadata
    payment_details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_payments_reference_tenant UNIQUE (payment_reference, tenant_id),
    CONSTRAINT chk_gce_payments_amount CHECK (amount > 0)
);

-- Indexes for payments
CREATE INDEX idx_gce_payments_tenant ON gce_payments(tenant_id);
CREATE INDEX idx_gce_payments_reference ON gce_payments(payment_reference);
CREATE INDEX idx_gce_payments_registration ON gce_payments(registration_id);
CREATE INDEX idx_gce_payments_status ON gce_payments(status);
CREATE INDEX idx_gce_payments_method ON gce_payments(payment_method);
CREATE INDEX idx_gce_payments_processed_at ON gce_payments(processed_at);

-- =============================================================================
-- EXAMINATION CENTERS TABLE
-- =============================================================================
CREATE TABLE gce_examination_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Center Information
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    school_id UUID REFERENCES gce_schools(id) ON DELETE SET NULL,
    
    -- Location
    region VARCHAR(100) NOT NULL,
    division VARCHAR(100),
    town VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    coordinates POINT,
    
    -- Capacity
    total_capacity INTEGER NOT NULL DEFAULT 0,
    current_allocation INTEGER NOT NULL DEFAULT 0,
    rooms_count INTEGER NOT NULL DEFAULT 0,
    
    -- Contact Information
    center_head_name VARCHAR(255),
    center_head_phone VARCHAR(20),
    center_head_email VARCHAR(255),
    
    -- Facilities
    facilities JSONB DEFAULT '{}', -- {has_electricity, has_generator, has_security, etc.}
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES gce_users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_exam_centers_code_tenant UNIQUE (code, tenant_id),
    CONSTRAINT chk_gce_exam_centers_capacity CHECK (current_allocation <= total_capacity)
);

-- Indexes for examination centers
CREATE INDEX idx_gce_exam_centers_tenant ON gce_examination_centers(tenant_id);
CREATE INDEX idx_gce_exam_centers_code ON gce_examination_centers(code);
CREATE INDEX idx_gce_exam_centers_region ON gce_examination_centers(region);
CREATE INDEX idx_gce_exam_centers_active ON gce_examination_centers(is_active);
CREATE INDEX idx_gce_exam_centers_approved ON gce_examination_centers(is_approved);

-- =============================================================================
-- CENTER ALLOCATIONS TABLE
-- =============================================================================
CREATE TABLE gce_center_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_session_id UUID NOT NULL REFERENCES gce_examination_sessions(id) ON DELETE CASCADE,
    examination_center_id UUID NOT NULL REFERENCES gce_examination_centers(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES gce_student_registrations(id) ON DELETE CASCADE,
    
    -- Allocation Details
    seat_number VARCHAR(20),
    room_number VARCHAR(20),
    
    -- Status
    is_confirmed BOOLEAN NOT NULL DEFAULT false,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES gce_users(id),
    
    -- Metadata
    allocation_method VARCHAR(50) DEFAULT 'automatic', -- automatic, manual
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_center_allocations_session_registration UNIQUE (examination_session_id, registration_id),
    CONSTRAINT uk_gce_center_allocations_center_seat UNIQUE (examination_center_id, examination_session_id, seat_number)
);

-- Indexes for center allocations
CREATE INDEX idx_gce_center_allocations_session ON gce_center_allocations(examination_session_id);
CREATE INDEX idx_gce_center_allocations_center ON gce_center_allocations(examination_center_id);
CREATE INDEX idx_gce_center_allocations_registration ON gce_center_allocations(registration_id);
CREATE INDEX idx_gce_center_allocations_confirmed ON gce_center_allocations(is_confirmed);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

CREATE TRIGGER tr_gce_exam_sessions_updated_at
    BEFORE UPDATE ON gce_examination_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_subjects_updated_at
    BEFORE UPDATE ON gce_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_registrations_updated_at
    BEFORE UPDATE ON gce_student_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_payments_updated_at
    BEFORE UPDATE ON gce_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_exam_centers_updated_at
    BEFORE UPDATE ON gce_examination_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE gce_examination_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_student_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_registration_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_examination_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_center_allocations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE gce_examination_sessions IS 'Examination sessions with dates, fees, and status tracking';
COMMENT ON TABLE gce_subjects IS 'Academic subjects with grading and examination details';
COMMENT ON TABLE gce_student_registrations IS 'Student registrations for examination sessions';
COMMENT ON TABLE gce_registration_subjects IS 'Many-to-many relationship between registrations and subjects';
COMMENT ON TABLE gce_payments IS 'Payment tracking for registration fees';
COMMENT ON TABLE gce_examination_centers IS 'Physical examination centers and their details';
COMMENT ON TABLE gce_center_allocations IS 'Student allocations to examination centers';
