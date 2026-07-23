-- Migration: 00264_evaluation_rls.sql
-- Description: Row-Level Security for evaluation tables

ALTER TABLE evaluation_job_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluation_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluation_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_sla_metrics ENABLE ROW LEVEL SECURITY;

-- Student access to own queued jobs and cost records
CREATE POLICY evaluation_job_queues_student_policy ON evaluation_job_queues
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY ai_evaluation_costs_student_policy ON ai_evaluation_costs
    FOR ALL USING (auth.uid() = student_id);

-- Health, Budgets and SLAs are restricted to Admin view or system context
CREATE POLICY ai_provider_health_admin_policy ON ai_provider_health
    FOR SELECT USING (TRUE); -- Allow read-only for transparency in student apps
