-- Migration: 00711_mock_examination_rls
-- Description: Row Level Security for Sprint 2.7 Mock Examination Engine tables

ALTER TABLE mock_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_section_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_statistics ENABLE ROW LEVEL SECURITY;

-- Student Isolation Policies
CREATE POLICY mock_sessions_student_isolation ON mock_sessions
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY mock_attempts_student_isolation ON mock_attempts
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY mock_results_student_isolation ON mock_results
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY mock_reports_student_isolation ON mock_reports
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY mock_readiness_student_isolation ON mock_readiness
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY mock_statistics_student_isolation ON mock_statistics
    FOR ALL USING (student_id = auth.uid());

-- Template Read Policies for Authenticated Students
CREATE POLICY mock_templates_student_read ON mock_templates
    FOR SELECT TO authenticated USING (status = 'PUBLISHED');

CREATE POLICY mock_sections_student_read ON mock_template_sections
    FOR SELECT TO authenticated USING (TRUE);

-- Admin / Instructor Bypass Policies
CREATE POLICY admin_blueprints_bypass ON mock_blueprints
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_templates_bypass ON mock_templates
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_mock_sessions_bypass ON mock_sessions
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_mock_results_bypass ON mock_results
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));
