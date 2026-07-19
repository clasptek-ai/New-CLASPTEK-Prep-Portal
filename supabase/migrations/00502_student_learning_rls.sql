-- Migration: 00502_student_learning_rls
-- Description: Row Level Security for Student Learning Journey Domain
-- Student isolation: students can only access their own rows

ALTER TABLE student_learning_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_programme_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_dashboard_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_privacy_records ENABLE ROW LEVEL SECURITY;

-- Student isolation policies: students access only their own journeys
CREATE POLICY student_journey_isolation ON student_learning_journeys
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY student_enrollment_isolation ON student_programme_enrollments
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY student_plans_isolation ON learning_plans
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY student_goals_isolation ON learning_goals
    FOR ALL USING (
        journey_id IN (
            SELECT id FROM student_learning_journeys WHERE student_id = auth.uid()
        )
    );

CREATE POLICY student_sessions_isolation ON study_sessions
    FOR ALL USING (
        journey_id IN (
            SELECT id FROM student_learning_journeys WHERE student_id = auth.uid()
        )
    );

CREATE POLICY student_dashboard_isolation ON student_dashboard_projections
    FOR ALL USING (student_id = auth.uid());

-- Admin bypass policies
CREATE POLICY admin_journey_bypass ON student_learning_journeys
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor', 'academic_reviewer'));

CREATE POLICY admin_enrollment_bypass ON student_programme_enrollments
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor'));

CREATE POLICY admin_dashboard_bypass ON student_dashboard_projections
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'instructor'));

-- Achievement definitions are public read
CREATE POLICY achievement_definitions_public_read ON achievement_definitions
    FOR SELECT USING (status = 'ACTIVE');
