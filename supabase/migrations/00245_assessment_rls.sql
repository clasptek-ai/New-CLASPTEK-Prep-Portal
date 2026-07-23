-- Migration: 00245_assessment_rls.sql
-- Description: Row-Level Security policies for delivery sessions, answers, results, timers, and audit logs

ALTER TABLE assessment_delivery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_timers ENABLE ROW LEVEL SECURITY;

-- Session RLS
CREATE POLICY "Student session access" ON assessment_delivery_sessions
    FOR ALL USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPER_ADMIN'));

-- Results RLS
CREATE POLICY "Student result access" ON assessment_results
    FOR SELECT USING (auth.uid() = student_id OR current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPER_ADMIN'));
