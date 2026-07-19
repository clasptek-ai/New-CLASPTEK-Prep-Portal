-- Migration: 00603_adaptive_practice_indexes
-- Description: Indexes for Adaptive Practice database performance optimization

-- B-tree indexes for fast identity lookups
CREATE INDEX IF NOT EXISTS idx_snapshots_student_id ON adaptive_snapshots (student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_student_id ON practice_recommendations (student_id);
CREATE INDEX IF NOT EXISTS idx_plans_student_id ON practice_plans (student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON practice_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_history_student_id ON practice_history (student_id);

-- Lookup index on active/pending statuses
CREATE INDEX IF NOT EXISTS idx_sessions_status ON practice_sessions (status)
    WHERE status IN ('ACTIVE', 'PAUSED');

CREATE INDEX IF NOT EXISTS idx_recommendations_status ON practice_recommendations (status)
    WHERE status = 'PENDING';

-- Composite index for session questions retrieval
CREATE INDEX IF NOT EXISTS idx_session_questions_lookup ON practice_session_questions (session_id, order_index);

-- BRIN indexes for chronological metrics logging
CREATE INDEX IF NOT EXISTS idx_sessions_started_at_brin ON practice_sessions USING BRIN (started_at);
CREATE INDEX IF NOT EXISTS idx_difficulty_history_recorded_at_brin ON practice_difficulty_history USING BRIN (recorded_at);
CREATE INDEX IF NOT EXISTS idx_history_completed_at_brin ON practice_history USING BRIN (completed_at);
