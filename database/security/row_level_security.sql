-- GCE Database Security - Row Level Security Policies
-- Version: 1.0
-- Description: Comprehensive RLS policies for multi-tenant data isolation and access control

-- =============================================================================
-- DATABASE ROLES AND PERMISSIONS
-- =============================================================================

-- Create application roles
CREATE ROLE gce_app_admin;
CREATE ROLE gce_app_examiner;
CREATE ROLE gce_app_teacher;
CREATE ROLE gce_app_student;
CREATE ROLE gce_app_readonly;

-- Grant basic permissions to application roles
GRANT CONNECT ON DATABASE gce_system TO gce_app_admin, gce_app_examiner, gce_app_teacher, gce_app_student, gce_app_readonly;
GRANT USAGE ON SCHEMA public TO gce_app_admin, gce_app_examiner, gce_app_teacher, gce_app_student, gce_app_readonly;

-- Admin role permissions (full access)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gce_app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gce_app_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO gce_app_admin;

-- Examiner role permissions
GRANT SELECT, INSERT, UPDATE ON gce_users, gce_user_sessions TO gce_app_examiner;
GRANT SELECT, INSERT, UPDATE ON gce_examiners, gce_script_allocations, gce_marking_scores TO gce_app_examiner;
GRANT SELECT, INSERT, UPDATE ON gce_double_marking_verifications TO gce_app_examiner;
GRANT SELECT ON gce_examination_sessions, gce_subjects, gce_marking_schemes TO gce_app_examiner;
GRANT SELECT, INSERT, UPDATE ON gce_examination_results TO gce_app_examiner;
GRANT SELECT ON gce_student_registrations, gce_schools TO gce_app_examiner;

-- Teacher role permissions
GRANT SELECT, INSERT, UPDATE ON gce_users, gce_user_sessions TO gce_app_teacher;
GRANT SELECT ON gce_schools, gce_examination_sessions, gce_subjects TO gce_app_teacher;
GRANT SELECT ON gce_student_registrations, gce_examination_results TO gce_app_teacher;
GRANT SELECT, INSERT, UPDATE ON gce_user_roles TO gce_app_teacher;

-- Student role permissions
GRANT SELECT, UPDATE ON gce_users, gce_user_sessions TO gce_app_student;
GRANT SELECT ON gce_schools, gce_examination_sessions, gce_subjects TO gce_app_student;
GRANT SELECT, INSERT, UPDATE ON gce_student_registrations, gce_registration_subjects TO gce_app_student;
GRANT SELECT ON gce_examination_results, gce_certificates TO gce_app_student;
GRANT SELECT, INSERT ON gce_payments TO gce_app_student;

-- Read-only role permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gce_app_readonly;

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =============================================================================

-- Function to get current user's tenant ID
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_tenant_id', true)::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_user_id', true)::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user type
CREATE OR REPLACE FUNCTION get_current_user_type()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_user_type', true),
        'anonymous'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_type() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access school data
CREATE OR REPLACE FUNCTION can_access_school(school_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID := get_current_user_id();
    user_type TEXT := get_current_user_type();
BEGIN
    -- Admins can access all schools
    IF user_type = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has role in this school
    RETURN EXISTS (
        SELECT 1 FROM gce_user_roles ur
        WHERE ur.user_id = user_id 
        AND ur.school_id = school_id 
        AND ur.is_active = true
        AND (ur.valid_until IS NULL OR ur.valid_until >= CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TENANT ISOLATION POLICIES
-- =============================================================================

-- Tenants table - only admins can see all tenants
CREATE POLICY tenant_isolation ON gce_tenants
FOR ALL TO PUBLIC
USING (
    is_admin() OR 
    id = get_current_tenant_id()
);

-- Users table - tenant isolation with user-specific access
CREATE POLICY user_tenant_isolation ON gce_users
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        id = get_current_user_id() OR
        get_current_user_type() IN ('examiner', 'teacher')
    )
);

-- Schools table - tenant isolation with school-specific access
CREATE POLICY school_tenant_isolation ON gce_schools
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        can_access_school(id) OR
        get_current_user_type() IN ('examiner', 'teacher', 'student')
    )
);

-- =============================================================================
-- EXAMINATION AND REGISTRATION POLICIES
-- =============================================================================

-- Examination sessions - tenant isolation
CREATE POLICY exam_session_tenant_isolation ON gce_examination_sessions
FOR ALL TO PUBLIC
USING (tenant_id = get_current_tenant_id());

-- Subjects - tenant isolation
CREATE POLICY subject_tenant_isolation ON gce_subjects
FOR ALL TO PUBLIC
USING (tenant_id = get_current_tenant_id());

-- Student registrations - complex access control
CREATE POLICY registration_access_control ON gce_student_registrations
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        get_current_user_type() = 'examiner' OR
        (get_current_user_type() = 'student' AND student_id = get_current_user_id()) OR
        (get_current_user_type() = 'teacher' AND can_access_school(school_id))
    )
);

-- Registration subjects - follows registration access
CREATE POLICY registration_subjects_access ON gce_registration_subjects
FOR ALL TO PUBLIC
USING (
    EXISTS (
        SELECT 1 FROM gce_student_registrations sr
        WHERE sr.id = registration_id
        AND sr.tenant_id = get_current_tenant_id()
        AND (
            is_admin() OR
            get_current_user_type() = 'examiner' OR
            (get_current_user_type() = 'student' AND sr.student_id = get_current_user_id()) OR
            (get_current_user_type() = 'teacher' AND can_access_school(sr.school_id))
        )
    )
);

-- Payments - student and admin access
CREATE POLICY payment_access_control ON gce_payments
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        EXISTS (
            SELECT 1 FROM gce_student_registrations sr
            WHERE sr.id = registration_id
            AND (
                (get_current_user_type() = 'student' AND sr.student_id = get_current_user_id()) OR
                (get_current_user_type() = 'teacher' AND can_access_school(sr.school_id))
            )
        )
    )
);

-- =============================================================================
-- MARKING AND GRADING POLICIES
-- =============================================================================

-- Marking schemes - examiner and admin access
CREATE POLICY marking_scheme_access ON gce_marking_schemes
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        get_current_user_type() = 'examiner'
    )
);

-- Examiners - self and admin access
CREATE POLICY examiner_access_control ON gce_examiners
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        (get_current_user_type() = 'examiner' AND user_id = get_current_user_id())
    )
);

-- Script allocations - examiner specific access
CREATE POLICY script_allocation_access ON gce_script_allocations
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        (get_current_user_type() = 'examiner' AND 
         EXISTS (
             SELECT 1 FROM gce_examiners e
             WHERE e.id = examiner_id AND e.user_id = get_current_user_id()
         ))
    )
);

-- Marking scores - examiner specific access
CREATE POLICY marking_score_access ON gce_marking_scores
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        (get_current_user_type() = 'examiner' AND 
         EXISTS (
             SELECT 1 FROM gce_examiners e
             WHERE e.id = examiner_id AND e.user_id = get_current_user_id()
         ))
    )
);

-- Double marking verifications - examiner and admin access
CREATE POLICY double_marking_access ON gce_double_marking_verifications
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        get_current_user_type() = 'examiner'
    )
);

-- =============================================================================
-- RESULTS AND CERTIFICATES POLICIES
-- =============================================================================

-- Examination results - role-based access
CREATE POLICY result_access_control ON gce_examination_results
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        get_current_user_type() = 'examiner' OR
        (get_current_user_type() = 'student' AND student_id = get_current_user_id() AND is_published = true) OR
        (get_current_user_type() = 'teacher' AND can_access_school(school_id))
    )
);

-- Certificates - student and admin access
CREATE POLICY certificate_access_control ON gce_certificates
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        (get_current_user_type() = 'student' AND student_id = get_current_user_id()) OR
        (get_current_user_type() = 'teacher' AND 
         EXISTS (
             SELECT 1 FROM gce_examination_results er
             WHERE er.id = result_id AND can_access_school(er.school_id)
         ))
    )
);

-- =============================================================================
-- ADMINISTRATIVE POLICIES
-- =============================================================================

-- System configuration - admin only
CREATE POLICY system_config_admin_only ON gce_system_config
FOR ALL TO PUBLIC
USING (
    (tenant_id IS NULL OR tenant_id = get_current_tenant_id()) AND
    is_admin()
);

-- Audit logs - admin and limited user access
CREATE POLICY audit_log_access ON gce_audit_log
FOR SELECT TO PUBLIC
USING (
    (tenant_id IS NULL OR tenant_id = get_current_tenant_id()) AND (
        is_admin() OR
        (user_id = get_current_user_id() AND category NOT IN ('security', 'system_config'))
    )
);

-- User activities - admin and self access
CREATE POLICY user_activity_access ON gce_user_activities
FOR ALL TO PUBLIC
USING (
    (tenant_id IS NULL OR tenant_id = get_current_tenant_id()) AND (
        is_admin() OR
        user_id = get_current_user_id()
    )
);

-- Notifications - role-based access
CREATE POLICY notification_access ON gce_notifications
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        (
            status = 'sent' AND (
                get_current_user_type() = ANY(SELECT jsonb_array_elements_text(target_user_types)) OR
                get_current_user_id()::TEXT = ANY(SELECT jsonb_array_elements_text(target_users))
            )
        )
    )
);

-- Notification deliveries - user specific
CREATE POLICY notification_delivery_access ON gce_notification_deliveries
FOR ALL TO PUBLIC
USING (
    is_admin() OR
    user_id = get_current_user_id()
);

-- Backup jobs - admin only
CREATE POLICY backup_job_admin_only ON gce_backup_jobs
FOR ALL TO PUBLIC
USING (
    (tenant_id IS NULL OR tenant_id = get_current_tenant_id()) AND
    is_admin()
);

-- Restore jobs - admin only
CREATE POLICY restore_job_admin_only ON gce_restore_jobs
FOR ALL TO PUBLIC
USING (
    (tenant_id IS NULL OR tenant_id = get_current_tenant_id()) AND
    is_admin()
);

-- System health - admin and examiner read access
CREATE POLICY system_health_access ON gce_system_health
FOR SELECT TO PUBLIC
USING (
    (tenant_id IS NULL OR tenant_id = get_current_tenant_id()) AND
    get_current_user_type() IN ('admin', 'examiner')
);

-- Reports - access control based on permissions
CREATE POLICY report_access_control ON gce_reports
FOR ALL TO PUBLIC
USING (
    tenant_id = get_current_tenant_id() AND (
        is_admin() OR
        is_public = true OR
        get_current_user_type() = ANY(SELECT jsonb_array_elements_text(allowed_roles)) OR
        get_current_user_id()::TEXT = ANY(SELECT jsonb_array_elements_text(allowed_users)) OR
        created_by = get_current_user_id()
    )
);

-- Report executions - follows report access
CREATE POLICY report_execution_access ON gce_report_executions
FOR ALL TO PUBLIC
USING (
    EXISTS (
        SELECT 1 FROM gce_reports r
        WHERE r.id = report_id
        AND r.tenant_id = get_current_tenant_id()
        AND (
            is_admin() OR
            r.is_public = true OR
            get_current_user_type() = ANY(SELECT jsonb_array_elements_text(r.allowed_roles)) OR
            get_current_user_id()::TEXT = ANY(SELECT jsonb_array_elements_text(r.allowed_users)) OR
            r.created_by = get_current_user_id() OR
            created_by = get_current_user_id()
        )
    )
);

-- =============================================================================
-- USER ROLES AND PERMISSIONS POLICIES
-- =============================================================================

-- User roles - self and admin access
CREATE POLICY user_role_access ON gce_user_roles
FOR ALL TO PUBLIC
USING (
    is_admin() OR
    user_id = get_current_user_id() OR
    (get_current_user_type() = 'teacher' AND 
     EXISTS (
         SELECT 1 FROM gce_user_roles ur2
         WHERE ur2.user_id = get_current_user_id()
         AND ur2.school_id = school_id
         AND ur2.is_active = true
     ))
);

-- User sessions - self and admin access
CREATE POLICY user_session_access ON gce_user_sessions
FOR ALL TO PUBLIC
USING (
    is_admin() OR
    user_id = get_current_user_id()
);

-- =============================================================================
-- EXAMINATION CENTER POLICIES
-- =============================================================================

-- Examination centers - tenant isolation
CREATE POLICY exam_center_tenant_isolation ON gce_examination_centers
FOR ALL TO PUBLIC
USING (tenant_id = get_current_tenant_id());

-- Center allocations - role-based access
CREATE POLICY center_allocation_access ON gce_center_allocations
FOR ALL TO PUBLIC
USING (
    is_admin() OR
    get_current_user_type() = 'examiner' OR
    EXISTS (
        SELECT 1 FROM gce_student_registrations sr
        WHERE sr.id = registration_id
        AND (
            (get_current_user_type() = 'student' AND sr.student_id = get_current_user_id()) OR
            (get_current_user_type() = 'teacher' AND can_access_school(sr.school_id))
        )
    )
);

-- =============================================================================
-- SECURITY FUNCTIONS FOR APPLICATION USE
-- =============================================================================

-- Function to set application context
CREATE OR REPLACE FUNCTION set_application_context(
    p_user_id UUID,
    p_tenant_id UUID,
    p_user_type TEXT,
    p_session_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', p_user_id::TEXT, true);
    PERFORM set_config('app.current_tenant_id', p_tenant_id::TEXT, true);
    PERFORM set_config('app.current_user_type', p_user_type, true);
    
    IF p_session_id IS NOT NULL THEN
        PERFORM set_config('app.current_session_id', p_session_id::TEXT, true);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear application context
CREATE OR REPLACE FUNCTION clear_application_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', '', true);
    PERFORM set_config('app.current_tenant_id', '', true);
    PERFORM set_config('app.current_user_type', '', true);
    PERFORM set_config('app.current_session_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION get_current_tenant_id() IS 'Returns the current tenant ID from application context';
COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current user ID from application context';
COMMENT ON FUNCTION get_current_user_type() IS 'Returns the current user type from application context';
COMMENT ON FUNCTION is_admin() IS 'Checks if the current user is an administrator';
COMMENT ON FUNCTION can_access_school(UUID) IS 'Checks if the current user can access a specific school';
COMMENT ON FUNCTION set_application_context(UUID, UUID, TEXT, UUID) IS 'Sets the application security context for RLS policies';
COMMENT ON FUNCTION clear_application_context() IS 'Clears the application security context';
