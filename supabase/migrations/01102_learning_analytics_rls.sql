-- Migration: 01102_learning_analytics_rls.sql
-- Bounded Context: Learning Analytics & Instructor Intelligence

ALTER TABLE student_analytics_dashboard_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_projections ENABLE ROW LEVEL SECURITY;

-- Student Security Policy
CREATE POLICY student_view_own_dashboard ON student_analytics_dashboard_projections
    FOR SELECT TO public
    USING (student_id = auth.uid());

CREATE POLICY student_view_own_risk ON risk_projections
    FOR SELECT TO public
    USING (student_id = auth.uid());

-- Instructor Security Policy
CREATE POLICY instructor_view_all_dashboards ON student_analytics_dashboard_projections
    FOR ALL TO public
    USING (auth.jwt() ->> 'role' IN ('INSTRUCTOR', 'ADMIN'));

CREATE POLICY instructor_view_all_risk ON risk_projections
    FOR ALL TO public
    USING (auth.jwt() ->> 'role' IN ('INSTRUCTOR', 'ADMIN'));
