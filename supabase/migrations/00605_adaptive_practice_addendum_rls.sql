-- Migration: 00605_adaptive_practice_addendum_rls
-- Description: Row Level Security for Sprint 2.6 Addendum tables

ALTER TABLE practice_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_motivation ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_analytics_projections ENABLE ROW LEVEL SECURITY;

-- Student Isolation Policies
CREATE POLICY practice_goals_isolation ON practice_goals
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY retention_profiles_isolation ON retention_profiles
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY daily_goals_isolation ON daily_goals
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY practice_motivation_isolation ON practice_motivation
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY practice_analytics_isolation ON practice_analytics_projections
    FOR ALL USING (student_id = auth.uid());

-- Admin / Instructor Bypass Policies
CREATE POLICY admin_practice_goals_bypass ON practice_goals
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_retention_bypass ON retention_profiles
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_daily_goals_bypass ON daily_goals
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_motivation_bypass ON practice_motivation
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_analytics_bypass ON practice_analytics_projections
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));
