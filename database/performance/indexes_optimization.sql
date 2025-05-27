-- GCE Database Performance - Indexes and Optimization
-- Version: 1.0
-- Description: Advanced indexing strategies and performance optimization

-- =============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =============================================================================

-- User authentication and session management
CREATE INDEX CONCURRENTLY idx_gce_users_email_tenant_status 
ON gce_users(email, tenant_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_gce_users_phone_tenant_status 
ON gce_users(phone, tenant_id, status) 
WHERE deleted_at IS NULL AND phone IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_gce_user_sessions_user_active_expires 
ON gce_user_sessions(user_id, is_active, expires_at) 
WHERE is_active = true;

-- Registration and examination queries
CREATE INDEX CONCURRENTLY idx_gce_registrations_session_level_status 
ON gce_student_registrations(examination_session_id, exam_level, status);

CREATE INDEX CONCURRENTLY idx_gce_registrations_school_session_status 
ON gce_student_registrations(school_id, examination_session_id, status);

CREATE INDEX CONCURRENTLY idx_gce_registrations_student_session 
ON gce_student_registrations(student_id, examination_session_id) 
WHERE status IN ('approved', 'submitted');

-- Subject and marking queries
CREATE INDEX CONCURRENTLY idx_gce_subjects_level_active_available 
ON gce_subjects(exam_level, is_active, is_available_for_registration) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_gce_marking_scores_examiner_finalized 
ON gce_marking_scores(examiner_id, is_finalized, created_at);

CREATE INDEX CONCURRENTLY idx_gce_script_allocations_examiner_status 
ON gce_script_allocations(examiner_id, status, allocated_at);

-- Results and certificates queries
CREATE INDEX CONCURRENTLY idx_gce_results_session_level_published 
ON gce_examination_results(examination_session_id, exam_level, is_published);

CREATE INDEX CONCURRENTLY idx_gce_results_school_session_published 
ON gce_examination_results(school_id, examination_session_id, is_published);

CREATE INDEX CONCURRENTLY idx_gce_certificates_student_type_status 
ON gce_certificates(student_id, certificate_type, status);

-- =============================================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- =============================================================================

-- Active records only
CREATE INDEX CONCURRENTLY idx_gce_schools_active_exam_center 
ON gce_schools(region, is_examination_center) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_gce_examiners_active_approved 
ON gce_examiners(tenant_id, is_approved) 
WHERE is_active = true AND is_approved = true;

-- Pending and in-progress items
CREATE INDEX CONCURRENTLY idx_gce_registrations_pending_payment 
ON gce_student_registrations(examination_session_id, created_at) 
WHERE payment_status = 'pending';

CREATE INDEX CONCURRENTLY idx_gce_marking_pending_verification 
ON gce_marking_scores(examiner_id, created_at) 
WHERE is_verified = false;

CREATE INDEX CONCURRENTLY idx_gce_scripts_in_progress 
ON gce_script_allocations(examiner_id, allocated_at) 
WHERE status IN ('pending', 'in_progress');

-- Published and available content
CREATE INDEX CONCURRENTLY idx_gce_results_published_recent 
ON gce_examination_results(examination_session_id, published_at) 
WHERE is_published = true;

CREATE INDEX CONCURRENTLY idx_gce_certificates_issued_recent 
ON gce_certificates(issued_at, certificate_type) 
WHERE status = 'issued';

-- =============================================================================
-- JSONB INDEXES FOR DOCUMENT QUERIES
-- =============================================================================

-- User preferences and metadata
CREATE INDEX CONCURRENTLY idx_gce_users_preferences_gin 
ON gce_users USING gin(preferences) 
WHERE preferences IS NOT NULL;

-- Subject grade boundaries
CREATE INDEX CONCURRENTLY idx_gce_subjects_grade_boundaries_gin 
ON gce_subjects USING gin(grade_boundaries);

-- Registration documents
CREATE INDEX CONCURRENTLY idx_gce_registrations_documents_gin 
ON gce_student_registrations USING gin(documents);

-- Examination results subjects
CREATE INDEX CONCURRENTLY idx_gce_results_subjects_gin 
ON gce_examination_results USING gin(subjects);

-- Certificate data
CREATE INDEX CONCURRENTLY idx_gce_certificates_data_gin 
ON gce_certificates USING gin(certificate_data);

-- Notification targeting
CREATE INDEX CONCURRENTLY idx_gce_notifications_target_users_gin 
ON gce_notifications USING gin(target_users);

CREATE INDEX CONCURRENTLY idx_gce_notifications_target_user_types_gin 
ON gce_notifications USING gin(target_user_types);

-- System configuration
CREATE INDEX CONCURRENTLY idx_gce_system_config_value_gin 
ON gce_system_config USING gin(config_value);

-- Audit log values
CREATE INDEX CONCURRENTLY idx_gce_audit_log_new_values_gin 
ON gce_audit_log USING gin(new_values) 
WHERE new_values IS NOT NULL;

-- =============================================================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================================================

-- User search
CREATE INDEX CONCURRENTLY idx_gce_users_search_gin 
ON gce_users USING gin(
    to_tsvector('english', 
        first_name || ' ' || 
        last_name || ' ' || 
        COALESCE(middle_name, '') || ' ' || 
        email
    )
);

-- School search
CREATE INDEX CONCURRENTLY idx_gce_schools_search_gin 
ON gce_schools USING gin(
    to_tsvector('english', 
        name || ' ' || 
        COALESCE(code, '') || ' ' || 
        COALESCE(region, '') || ' ' || 
        COALESCE(town, '')
    )
);

-- Subject search
CREATE INDEX CONCURRENTLY idx_gce_subjects_search_gin 
ON gce_subjects USING gin(
    to_tsvector('english', 
        name || ' ' || 
        code || ' ' || 
        COALESCE(full_name, '') || ' ' || 
        COALESCE(description, '')
    )
);

-- =============================================================================
-- COVERING INDEXES FOR QUERY OPTIMIZATION
-- =============================================================================

-- User lookup with basic info
CREATE INDEX CONCURRENTLY idx_gce_users_lookup_covering 
ON gce_users(id) 
INCLUDE (first_name, last_name, email, user_type, status);

-- Registration lookup with student info
CREATE INDEX CONCURRENTLY idx_gce_registrations_lookup_covering 
ON gce_student_registrations(registration_number) 
INCLUDE (student_id, student_name, exam_level, status);

-- Results lookup with performance data
CREATE INDEX CONCURRENTLY idx_gce_results_lookup_covering 
ON gce_examination_results(student_number) 
INCLUDE (student_name, average_percentage, subjects_passed, total_subjects);

-- =============================================================================
-- EXPRESSION INDEXES FOR COMPUTED QUERIES
-- =============================================================================

-- Lowercase email for case-insensitive searches
CREATE INDEX CONCURRENTLY idx_gce_users_email_lower 
ON gce_users(lower(email), tenant_id) 
WHERE deleted_at IS NULL;

-- Registration year extraction
CREATE INDEX CONCURRENTLY idx_gce_registrations_year 
ON gce_student_registrations(EXTRACT(YEAR FROM created_at), examination_session_id);

-- Results academic year
CREATE INDEX CONCURRENTLY idx_gce_results_academic_year 
ON gce_examination_results(EXTRACT(YEAR FROM created_at), exam_level);

-- Payment amount ranges
CREATE INDEX CONCURRENTLY idx_gce_payments_amount_range 
ON gce_payments(
    CASE 
        WHEN amount < 10000 THEN 'low'
        WHEN amount < 50000 THEN 'medium'
        ELSE 'high'
    END,
    status
);

-- =============================================================================
-- SPECIALIZED INDEXES FOR ANALYTICS
-- =============================================================================

-- Performance analytics
CREATE INDEX CONCURRENTLY idx_gce_results_performance_analytics 
ON gce_examination_results(
    exam_level, 
    examination_session_id, 
    average_percentage, 
    subjects_passed
) WHERE is_published = true;

-- Regional performance
CREATE INDEX CONCURRENTLY idx_gce_schools_regional_performance 
ON gce_schools(region, division, is_active) 
INCLUDE (name, student_capacity);

-- Examiner performance
CREATE INDEX CONCURRENTLY idx_gce_examiners_performance 
ON gce_examiners(
    total_scripts_marked, 
    quality_score, 
    consistency_score
) WHERE is_active = true;

-- Time-based activity analysis
CREATE INDEX CONCURRENTLY idx_gce_user_activities_time_analysis 
ON gce_user_activities(
    DATE_TRUNC('hour', activity_timestamp),
    activity_type,
    user_id
);

-- =============================================================================
-- UNIQUE INDEXES FOR DATA INTEGRITY
-- =============================================================================

-- Prevent duplicate active sessions per user
CREATE UNIQUE INDEX CONCURRENTLY idx_gce_user_sessions_unique_active 
ON gce_user_sessions(user_id, device_info) 
WHERE is_active = true;

-- Prevent duplicate registrations
CREATE UNIQUE INDEX CONCURRENTLY idx_gce_registrations_unique_student_session 
ON gce_student_registrations(student_id, examination_session_id) 
WHERE status NOT IN ('cancelled', 'rejected');

-- Prevent duplicate subject registrations
CREATE UNIQUE INDEX CONCURRENTLY idx_gce_reg_subjects_unique_active 
ON gce_registration_subjects(registration_id, subject_id) 
WHERE is_active = true;

-- Prevent duplicate script allocations
CREATE UNIQUE INDEX CONCURRENTLY idx_gce_script_allocations_unique 
ON gce_script_allocations(script_number, subject_id, paper_number);

-- =============================================================================
-- MAINTENANCE AND MONITORING INDEXES
-- =============================================================================

-- Backup and restore monitoring
CREATE INDEX CONCURRENTLY idx_gce_backup_jobs_monitoring 
ON gce_backup_jobs(status, started_at, backup_type) 
WHERE status IN ('running', 'pending');

CREATE INDEX CONCURRENTLY idx_gce_restore_jobs_monitoring 
ON gce_restore_jobs(status, started_at) 
WHERE status IN ('running', 'pending');

-- System health monitoring
CREATE INDEX CONCURRENTLY idx_gce_system_health_monitoring 
ON gce_system_health(overall_status, check_timestamp) 
WHERE overall_status IN ('warning', 'critical');

-- Notification delivery tracking
CREATE INDEX CONCURRENTLY idx_gce_notification_deliveries_tracking 
ON gce_notification_deliveries(status, sent_at, channel) 
WHERE status IN ('pending', 'failed');

-- =============================================================================
-- PARTITIONED TABLE INDEXES
-- =============================================================================

-- Audit log partitioned indexes (template for all partitions)
CREATE INDEX CONCURRENTLY idx_gce_audit_log_partition_template 
ON gce_audit_log(tenant_id, user_id, table_name, created_at);

-- User activities partitioned indexes
CREATE INDEX CONCURRENTLY idx_gce_user_activities_partition_template 
ON gce_user_activities(tenant_id, user_id, activity_type, activity_timestamp);

-- System health partitioned indexes
CREATE INDEX CONCURRENTLY idx_gce_system_health_partition_template 
ON gce_system_health(tenant_id, overall_status, check_timestamp);

-- =============================================================================
-- INDEX MAINTENANCE PROCEDURES
-- =============================================================================

-- Function to rebuild fragmented indexes
CREATE OR REPLACE FUNCTION rebuild_fragmented_indexes(fragmentation_threshold FLOAT DEFAULT 30.0)
RETURNS TABLE(index_name TEXT, action_taken TEXT) AS $$
DECLARE
    idx_record RECORD;
    fragmentation FLOAT;
BEGIN
    FOR idx_record IN 
        SELECT schemaname, tablename, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
    LOOP
        -- Calculate index fragmentation (simplified)
        SELECT 100.0 * (1.0 - (pg_relation_size(idx_record.indexname::regclass)::FLOAT / 
               GREATEST(pg_total_relation_size(idx_record.tablename::regclass)::FLOAT, 1)))
        INTO fragmentation;
        
        IF fragmentation > fragmentation_threshold THEN
            EXECUTE format('REINDEX INDEX CONCURRENTLY %I', idx_record.indexname);
            
            index_name := idx_record.indexname;
            action_taken := format('Rebuilt (fragmentation: %.2f%%)', fragmentation);
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS TABLE(table_name TEXT, rows_analyzed BIGINT) AS $$
DECLARE
    tbl_record RECORD;
    row_count BIGINT;
BEGIN
    FOR tbl_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'gce_%'
    LOOP
        EXECUTE format('ANALYZE %I', tbl_record.tablename);
        
        EXECUTE format('SELECT reltuples::BIGINT FROM pg_class WHERE relname = %L', tbl_record.tablename)
        INTO row_count;
        
        table_name := tbl_record.tablename;
        rows_analyzed := row_count;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================================================

-- View for index usage statistics
CREATE OR REPLACE VIEW v_gce_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 100 THEN 'Rarely used'
        WHEN idx_scan < 1000 THEN 'Moderately used'
        ELSE 'Frequently used'
    END AS usage_category,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- View for table statistics
CREATE OR REPLACE VIEW v_gce_table_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    CASE 
        WHEN n_live_tup > 0 THEN 
            ROUND(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
        ELSE 0 
    END AS dead_row_percentage,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC;

-- View for slow queries (requires pg_stat_statements extension)
CREATE OR REPLACE VIEW v_gce_slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE query LIKE '%gce_%'
ORDER BY mean_time DESC
LIMIT 20;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION rebuild_fragmented_indexes(FLOAT) IS 'Rebuilds indexes with fragmentation above threshold';
COMMENT ON FUNCTION update_table_statistics() IS 'Updates table statistics for query optimization';
COMMENT ON VIEW v_gce_index_usage IS 'Shows index usage statistics for performance monitoring';
COMMENT ON VIEW v_gce_table_stats IS 'Shows table statistics including dead row percentages';
COMMENT ON VIEW v_gce_slow_queries IS 'Shows slow queries for performance analysis';
