-- Migration: 00231_mock_sessions.sql
-- Description: Create mock_attempt_history table

CREATE TABLE IF NOT EXISTS mock_attempt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_att_hist_sess ON mock_attempt_history(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_att_hist_student ON mock_attempt_history(student_id);
