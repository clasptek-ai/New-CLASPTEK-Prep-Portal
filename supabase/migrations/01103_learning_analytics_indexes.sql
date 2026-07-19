-- Migration: 01103_learning_analytics_indexes.sql
-- Bounded Context: Learning Analytics & Instructor Intelligence

CREATE INDEX IF NOT EXISTS idx_student_dash_proj_lookup ON student_analytics_dashboard_projections (student_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_learning_trends_date ON learning_trends (trend_date);
CREATE INDEX IF NOT EXISTS idx_report_executions_def ON report_executions (report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules (active);
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_status ON analytics_jobs (status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_expiry ON export_jobs (download_expiry);
