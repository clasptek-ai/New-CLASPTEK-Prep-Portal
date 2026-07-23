-- Migration: 00233_mock_progress.sql
-- Description: Create mock_delivery_progress and mock_delivery_checkpoints tables

CREATE TABLE IF NOT EXISTS mock_delivery_progress (
    session_id UUID PRIMARY KEY REFERENCES mock_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    current_section_index INT NOT NULL DEFAULT 0,
    time_remaining_seconds INT NOT NULL DEFAULT 0,
    answers_count INT NOT NULL DEFAULT 0,
    flagged_count INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_delivery_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_delivery_sessions(id) ON DELETE CASCADE,
    checkpoint_version INT NOT NULL DEFAULT 1,
    snapshot_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_cp_sess ON mock_delivery_checkpoints(session_id);
