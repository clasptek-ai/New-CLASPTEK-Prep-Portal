-- Migration: 00275_results_rls.sql
-- Results & Academic Progress Portal — Row Level Security Policies

ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloadable_reports ENABLE ROW LEVEL SECURITY;

-- student_results Policies
CREATE POLICY student_results_student_select ON student_results
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

CREATE POLICY student_results_admin_all ON student_results
    FOR ALL USING (current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

-- student_progress Policies
CREATE POLICY student_progress_student_select ON student_progress
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

CREATE POLICY student_progress_admin_all ON student_progress
    FOR ALL USING (current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

-- result_history Policies
CREATE POLICY result_history_student_select ON result_history
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

CREATE POLICY result_history_admin_all ON result_history
    FOR ALL USING (current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

-- performance_statistics Policies
CREATE POLICY perf_stats_student_select ON performance_statistics
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

CREATE POLICY perf_stats_admin_all ON performance_statistics
    FOR ALL USING (current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

-- progress_snapshots Policies
CREATE POLICY progress_snapshots_student_select ON progress_snapshots
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

CREATE POLICY progress_snapshots_admin_all ON progress_snapshots
    FOR ALL USING (current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

-- downloadable_reports Policies
CREATE POLICY downloadable_reports_student_select ON downloadable_reports
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('admin', 'service_role'));

CREATE POLICY downloadable_reports_admin_all ON downloadable_reports
    FOR ALL USING (current_setting('app.current_user_role', true) IN ('admin', 'service_role'));
