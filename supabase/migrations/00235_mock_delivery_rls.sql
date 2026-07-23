-- Migration: 00235_mock_delivery_rls.sql
-- Description: Row-level security for mock delivery tables

ALTER TABLE mock_delivery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_attempt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_delivery_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_delivery_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_delivery_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_delivery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_subjective_evaluation_queue ENABLE ROW LEVEL SECURITY;

-- Student Policies
CREATE POLICY mock_delivery_sessions_student_policy ON mock_delivery_sessions
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY mock_attempt_history_student_policy ON mock_attempt_history
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY mock_delivery_answers_student_policy ON mock_delivery_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mock_delivery_sessions s
            WHERE s.id = mock_delivery_answers.session_id
            AND s.student_id = auth.uid()
        )
    );

CREATE POLICY mock_delivery_progress_student_policy ON mock_delivery_progress
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY mock_delivery_checkpoints_student_policy ON mock_delivery_checkpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mock_delivery_sessions s
            WHERE s.id = mock_delivery_checkpoints.session_id
            AND s.student_id = auth.uid()
        )
    );

CREATE POLICY mock_delivery_results_student_policy ON mock_delivery_results
    FOR ALL USING (auth.uid() = student_id);
