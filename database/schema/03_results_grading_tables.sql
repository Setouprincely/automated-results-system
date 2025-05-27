-- GCE Database Schema - Results and Grading Tables
-- Version: 1.0
-- Description: Tables for examination results, grading, marking, and certificates

-- Create grading-specific types
CREATE TYPE marking_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'verified', 'moderated', 'finalized');
CREATE TYPE grade_enum AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'U', 'X');
CREATE TYPE result_status_enum AS ENUM ('draft', 'provisional', 'final', 'published', 'withheld', 'cancelled');
CREATE TYPE certificate_status_enum AS ENUM ('pending', 'generated', 'printed', 'issued', 'collected', 'cancelled');
CREATE TYPE certificate_type_enum AS ENUM ('original', 'duplicate', 'replacement', 'verification');

-- =============================================================================
-- MARKING SCHEMES TABLE
-- =============================================================================
CREATE TABLE gce_marking_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Scheme Information
    subject_id UUID NOT NULL REFERENCES gce_subjects(id) ON DELETE RESTRICT,
    examination_session_id UUID NOT NULL REFERENCES gce_examination_sessions(id) ON DELETE RESTRICT,
    paper_number INTEGER NOT NULL DEFAULT 1,
    
    -- Marking Details
    total_marks INTEGER NOT NULL,
    sections JSONB NOT NULL, -- Array of sections with marks allocation
    grade_boundaries JSONB NOT NULL, -- {A: 80, B: 70, C: 60, D: 50, E: 40, F: 0}
    
    -- Instructions
    marking_instructions TEXT,
    special_instructions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES gce_users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Version Control
    version INTEGER NOT NULL DEFAULT 1,
    previous_version_id UUID REFERENCES gce_marking_schemes(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_marking_schemes_subject_session_paper UNIQUE (subject_id, examination_session_id, paper_number, version)
);

-- Indexes for marking schemes
CREATE INDEX idx_gce_marking_schemes_tenant ON gce_marking_schemes(tenant_id);
CREATE INDEX idx_gce_marking_schemes_subject ON gce_marking_schemes(subject_id);
CREATE INDEX idx_gce_marking_schemes_session ON gce_marking_schemes(examination_session_id);
CREATE INDEX idx_gce_marking_schemes_approved ON gce_marking_schemes(is_approved);

-- =============================================================================
-- EXAMINERS TABLE
-- =============================================================================
CREATE TABLE gce_examiners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Examiner Information
    user_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE RESTRICT,
    examiner_code VARCHAR(50) NOT NULL,
    
    -- Qualifications
    qualifications JSONB NOT NULL, -- Array of qualification objects
    experience_years INTEGER NOT NULL DEFAULT 0,
    specialization JSONB DEFAULT '[]', -- Array of subject areas
    
    -- Assignment Details
    subjects JSONB DEFAULT '[]', -- Array of subject IDs examiner can mark
    maximum_scripts_per_day INTEGER DEFAULT 50,
    preferred_marking_hours JSONB DEFAULT '{}', -- {start: "08:00", end: "17:00"}
    
    -- Performance Metrics
    total_scripts_marked INTEGER DEFAULT 0,
    average_marking_time INTEGER DEFAULT 0, -- in minutes
    quality_score DECIMAL(5,2) DEFAULT 0.00,
    consistency_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES gce_users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Availability
    available_from DATE,
    available_until DATE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_examiners_code_tenant UNIQUE (examiner_code, tenant_id),
    CONSTRAINT uk_gce_examiners_user_tenant UNIQUE (user_id, tenant_id)
);

-- Indexes for examiners
CREATE INDEX idx_gce_examiners_tenant ON gce_examiners(tenant_id);
CREATE INDEX idx_gce_examiners_user ON gce_examiners(user_id);
CREATE INDEX idx_gce_examiners_code ON gce_examiners(examiner_code);
CREATE INDEX idx_gce_examiners_active ON gce_examiners(is_active);
CREATE INDEX idx_gce_examiners_approved ON gce_examiners(is_approved);

-- =============================================================================
-- SCRIPT ALLOCATIONS TABLE
-- =============================================================================
CREATE TABLE gce_script_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Allocation Details
    registration_id UUID NOT NULL REFERENCES gce_student_registrations(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES gce_subjects(id) ON DELETE RESTRICT,
    examiner_id UUID NOT NULL REFERENCES gce_examiners(id) ON DELETE RESTRICT,
    marking_scheme_id UUID NOT NULL REFERENCES gce_marking_schemes(id) ON DELETE RESTRICT,
    
    -- Script Information
    script_number VARCHAR(50) NOT NULL,
    paper_number INTEGER NOT NULL DEFAULT 1,
    
    -- Allocation Details
    allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    allocated_by UUID NOT NULL REFERENCES gce_users(id),
    
    -- Marking Status
    status marking_status_enum NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    
    -- Metadata
    allocation_method VARCHAR(50) DEFAULT 'automatic', -- automatic, manual
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_gce_script_allocations_script_paper UNIQUE (script_number, paper_number, subject_id)
);

-- Indexes for script allocations
CREATE INDEX idx_gce_script_allocations_tenant ON gce_script_allocations(tenant_id);
CREATE INDEX idx_gce_script_allocations_registration ON gce_script_allocations(registration_id);
CREATE INDEX idx_gce_script_allocations_subject ON gce_script_allocations(subject_id);
CREATE INDEX idx_gce_script_allocations_examiner ON gce_script_allocations(examiner_id);
CREATE INDEX idx_gce_script_allocations_status ON gce_script_allocations(status);
CREATE INDEX idx_gce_script_allocations_script ON gce_script_allocations(script_number);

-- =============================================================================
-- MARKING SCORES TABLE
-- =============================================================================
CREATE TABLE gce_marking_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Score Details
    script_allocation_id UUID NOT NULL REFERENCES gce_script_allocations(id) ON DELETE CASCADE,
    examiner_id UUID NOT NULL REFERENCES gce_examiners(id) ON DELETE RESTRICT,
    
    -- Marks
    section_scores JSONB NOT NULL, -- {section1: 15, section2: 20, etc.}
    total_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    grade grade_enum NOT NULL,
    
    -- Marking Details
    marking_time JSONB, -- {start_time, end_time, total_minutes, breaks}
    marking_notes TEXT,
    
    -- Quality Control
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES gce_examiners(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Moderation
    is_moderated BOOLEAN NOT NULL DEFAULT false,
    moderated_by UUID REFERENCES gce_examiners(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_adjustment DECIMAL(5,2) DEFAULT 0.00,
    moderation_notes TEXT,
    
    -- Final Status
    is_finalized BOOLEAN NOT NULL DEFAULT false,
    finalized_by UUID REFERENCES gce_users(id),
    finalized_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT chk_gce_marking_scores_percentage CHECK (percentage >= 0 AND percentage <= 100),
    CONSTRAINT chk_gce_marking_scores_total_score CHECK (total_score >= 0)
);

-- Indexes for marking scores
CREATE INDEX idx_gce_marking_scores_tenant ON gce_marking_scores(tenant_id);
CREATE INDEX idx_gce_marking_scores_allocation ON gce_marking_scores(script_allocation_id);
CREATE INDEX idx_gce_marking_scores_examiner ON gce_marking_scores(examiner_id);
CREATE INDEX idx_gce_marking_scores_grade ON gce_marking_scores(grade);
CREATE INDEX idx_gce_marking_scores_verified ON gce_marking_scores(is_verified);
CREATE INDEX idx_gce_marking_scores_finalized ON gce_marking_scores(is_finalized);

-- =============================================================================
-- DOUBLE MARKING VERIFICATIONS TABLE
-- =============================================================================
CREATE TABLE gce_double_marking_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Verification Details
    script_allocation_id UUID NOT NULL REFERENCES gce_script_allocations(id) ON DELETE CASCADE,
    first_marking_id UUID NOT NULL REFERENCES gce_marking_scores(id) ON DELETE CASCADE,
    second_marking_id UUID NOT NULL REFERENCES gce_marking_scores(id) ON DELETE CASCADE,
    
    -- Discrepancy Analysis
    score_difference INTEGER NOT NULL,
    percentage_difference DECIMAL(5,2) NOT NULL,
    grade_difference INTEGER NOT NULL, -- Difference in grade levels
    is_significant_discrepancy BOOLEAN NOT NULL DEFAULT false,
    
    -- Resolution
    final_score INTEGER,
    final_percentage DECIMAL(5,2),
    final_grade grade_enum,
    resolution_method VARCHAR(100), -- average, third_marker, senior_examiner
    resolved_by UUID REFERENCES gce_users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Quality Metrics
    marking_consistency DECIMAL(5,2), -- Consistency score between markers
    quality_assessment JSONB, -- Detailed quality metrics
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_double_marking_script UNIQUE (script_allocation_id)
);

-- Indexes for double marking verifications
CREATE INDEX idx_gce_double_marking_tenant ON gce_double_marking_verifications(tenant_id);
CREATE INDEX idx_gce_double_marking_script ON gce_double_marking_verifications(script_allocation_id);
CREATE INDEX idx_gce_double_marking_significant ON gce_double_marking_verifications(is_significant_discrepancy);
CREATE INDEX idx_gce_double_marking_resolved ON gce_double_marking_verifications(resolved_at);

-- =============================================================================
-- EXAMINATION RESULTS TABLE
-- =============================================================================
CREATE TABLE gce_examination_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Result Details
    registration_id UUID NOT NULL REFERENCES gce_student_registrations(id) ON DELETE RESTRICT,
    examination_session_id UUID NOT NULL REFERENCES gce_examination_sessions(id) ON DELETE RESTRICT,
    
    -- Student Information (denormalized for performance)
    student_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE RESTRICT,
    student_name VARCHAR(255) NOT NULL,
    student_number VARCHAR(50) NOT NULL,
    school_id UUID NOT NULL REFERENCES gce_schools(id) ON DELETE RESTRICT,
    school_name VARCHAR(255) NOT NULL,
    center_code VARCHAR(50),
    
    -- Academic Details
    exam_level exam_level_enum NOT NULL,
    
    -- Subject Results
    subjects JSONB NOT NULL, -- Array of subject result objects
    
    -- Overall Performance
    total_subjects INTEGER NOT NULL,
    subjects_passed INTEGER NOT NULL DEFAULT 0,
    subjects_failed INTEGER NOT NULL DEFAULT 0,
    average_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    overall_grade VARCHAR(10),
    classification VARCHAR(100), -- Pass, Credit, Distinction, etc.
    
    -- Status
    status result_status_enum NOT NULL DEFAULT 'draft',
    
    -- Publication
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES gce_users(id),
    
    -- Verification
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES gce_users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Special Cases
    is_withheld BOOLEAN NOT NULL DEFAULT false,
    withhold_reason TEXT,
    withheld_by UUID REFERENCES gce_users(id),
    withheld_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit Trail
    audit_trail JSONB DEFAULT '[]', -- Array of audit events
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_results_registration UNIQUE (registration_id),
    CONSTRAINT chk_gce_results_subjects CHECK (subjects_passed + subjects_failed = total_subjects)
);

-- Partition results by examination session for performance
CREATE TABLE gce_examination_results_2025 PARTITION OF gce_examination_results
FOR VALUES IN ('2025');

-- Indexes for examination results
CREATE INDEX idx_gce_results_tenant ON gce_examination_results(tenant_id);
CREATE INDEX idx_gce_results_registration ON gce_examination_results(registration_id);
CREATE INDEX idx_gce_results_session ON gce_examination_results(examination_session_id);
CREATE INDEX idx_gce_results_student ON gce_examination_results(student_id);
CREATE INDEX idx_gce_results_school ON gce_examination_results(school_id);
CREATE INDEX idx_gce_results_student_number ON gce_examination_results(student_number);
CREATE INDEX idx_gce_results_status ON gce_examination_results(status);
CREATE INDEX idx_gce_results_published ON gce_examination_results(is_published);
CREATE INDEX idx_gce_results_exam_level ON gce_examination_results(exam_level);

-- =============================================================================
-- CERTIFICATES TABLE
-- =============================================================================
CREATE TABLE gce_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES gce_tenants(id) ON DELETE RESTRICT,
    
    -- Certificate Details
    certificate_number VARCHAR(100) NOT NULL,
    result_id UUID NOT NULL REFERENCES gce_examination_results(id) ON DELETE RESTRICT,
    certificate_type certificate_type_enum NOT NULL DEFAULT 'original',
    
    -- Student Information (denormalized)
    student_id UUID NOT NULL REFERENCES gce_users(id) ON DELETE RESTRICT,
    student_name VARCHAR(255) NOT NULL,
    student_number VARCHAR(50) NOT NULL,
    
    -- Certificate Content
    certificate_data JSONB NOT NULL, -- Complete certificate data
    template_version VARCHAR(50) NOT NULL,
    
    -- Generation Details
    status certificate_status_enum NOT NULL DEFAULT 'pending',
    generated_at TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES gce_users(id),
    
    -- Printing and Issuance
    printed_at TIMESTAMP WITH TIME ZONE,
    printed_by UUID REFERENCES gce_users(id),
    print_batch_id VARCHAR(100),
    
    -- Issuance Details
    issued_at TIMESTAMP WITH TIME ZONE,
    issued_by UUID REFERENCES gce_users(id),
    issued_to VARCHAR(255), -- Person who collected
    collection_method VARCHAR(50), -- in_person, postal, courier
    
    -- Digital Certificate
    digital_signature TEXT,
    verification_code VARCHAR(100),
    qr_code_data TEXT,
    pdf_url VARCHAR(500),
    
    -- Security Features
    security_features JSONB DEFAULT '{}', -- Watermarks, holograms, etc.
    
    -- Replacement/Duplicate Information
    original_certificate_id UUID REFERENCES gce_certificates(id),
    replacement_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES gce_users(id),
    updated_by UUID REFERENCES gce_users(id),
    
    CONSTRAINT uk_gce_certificates_number_tenant UNIQUE (certificate_number, tenant_id),
    CONSTRAINT uk_gce_certificates_verification_code UNIQUE (verification_code)
);

-- Indexes for certificates
CREATE INDEX idx_gce_certificates_tenant ON gce_certificates(tenant_id);
CREATE INDEX idx_gce_certificates_number ON gce_certificates(certificate_number);
CREATE INDEX idx_gce_certificates_result ON gce_certificates(result_id);
CREATE INDEX idx_gce_certificates_student ON gce_certificates(student_id);
CREATE INDEX idx_gce_certificates_student_number ON gce_certificates(student_number);
CREATE INDEX idx_gce_certificates_status ON gce_certificates(status);
CREATE INDEX idx_gce_certificates_type ON gce_certificates(certificate_type);
CREATE INDEX idx_gce_certificates_verification ON gce_certificates(verification_code);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

CREATE TRIGGER tr_gce_marking_schemes_updated_at
    BEFORE UPDATE ON gce_marking_schemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_examiners_updated_at
    BEFORE UPDATE ON gce_examiners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_marking_scores_updated_at
    BEFORE UPDATE ON gce_marking_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_double_marking_updated_at
    BEFORE UPDATE ON gce_double_marking_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_results_updated_at
    BEFORE UPDATE ON gce_examination_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_gce_certificates_updated_at
    BEFORE UPDATE ON gce_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE gce_marking_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_examiners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_script_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_marking_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_double_marking_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_examination_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gce_certificates ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE gce_marking_schemes IS 'Marking schemes and grade boundaries for subjects';
COMMENT ON TABLE gce_examiners IS 'Examiner profiles with qualifications and performance metrics';
COMMENT ON TABLE gce_script_allocations IS 'Allocation of scripts to examiners for marking';
COMMENT ON TABLE gce_marking_scores IS 'Individual marking scores with quality control';
COMMENT ON TABLE gce_double_marking_verifications IS 'Double marking verification and discrepancy resolution';
COMMENT ON TABLE gce_examination_results IS 'Final examination results with overall performance';
COMMENT ON TABLE gce_certificates IS 'Digital and physical certificates with security features';
