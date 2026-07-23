-- Migration: 00505_student_learning_addendum_rls
-- Description: Row Level Security for Sprint 2.5 Addendum tables

ALTER TABLE student_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_alerts ENABLE ROW LEVEL SECURITY;

-- Student Isolation Policies
CREATE POLICY student_profile_isolation ON student_learning_profiles
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY student_progress_isolation ON student_progress
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY student_interventions_isolation ON student_interventions
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY student_alerts_isolation ON student_alerts
    FOR ALL USING (student_id = auth.uid());

-- Intervention Rules: Public read active rules, Admin write
CREATE POLICY intervention_rules_public_read ON intervention_rules
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY admin_intervention_rules_bypass ON intervention_rules
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'academic_reviewer'));

-- Admin / Facilitator Bypass Policies
CREATE POLICY admin_profile_bypass ON student_learning_profiles
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_progress_bypass ON student_progress
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_interventions_bypass ON student_interventions
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_history_bypass ON intervention_history
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));
