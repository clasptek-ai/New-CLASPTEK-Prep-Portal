-- Migration: 00602_adaptive_practice_rls
-- Description: Row Level Security for Adaptive Practice tables

-- Enable RLS
ALTER TABLE adaptive_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_difficulty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_statistics ENABLE ROW LEVEL SECURITY;

-- Disable RLS / Public Read for strategy registry
ALTER TABLE practice_strategy_registry ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════

-- Strategy registry public read
CREATE POLICY public_read_strategies ON practice_strategy_registry
    FOR SELECT TO authenticated USING (TRUE);

-- Adaptive Snapshots: own access
CREATE POLICY student_own_snapshots ON adaptive_snapshots
    FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Practice Recommendations: own access
CREATE POLICY student_own_recommendations ON practice_recommendations
    FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Practice Plans: own access
CREATE POLICY student_own_plans ON practice_plans
    FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Practice Sessions: own access
CREATE POLICY student_own_sessions ON practice_sessions
    FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Practice Session Questions: join check via sessions
CREATE POLICY student_own_session_questions ON practice_session_questions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM practice_sessions s
            WHERE s.id = practice_session_questions.session_id AND s.student_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_sessions s
            WHERE s.id = practice_session_questions.session_id AND s.student_id = auth.uid()
        )
    );

-- Difficulty History: join check via sessions
CREATE POLICY student_own_difficulty_history ON practice_difficulty_history
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM practice_sessions s
            WHERE s.id = practice_difficulty_history.session_id AND s.student_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_sessions s
            WHERE s.id = practice_difficulty_history.session_id AND s.student_id = auth.uid()
        )
    );

-- Practice Feedback: join check via sessions
CREATE POLICY student_own_feedback ON practice_feedback
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM practice_sessions s
            WHERE s.id = practice_feedback.session_id AND s.student_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_sessions s
            WHERE s.id = practice_feedback.session_id AND s.student_id = auth.uid()
        )
    );

-- Practice History: own access
CREATE POLICY student_own_history ON practice_history
    FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Practice Statistics: own access
CREATE POLICY student_own_statistics ON practice_statistics
    FOR ALL TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
