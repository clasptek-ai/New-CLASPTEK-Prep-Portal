-- Migration: 00232_mock_answers.sql
-- Description: Create mock_delivery_answers table

CREATE TABLE IF NOT EXISTS mock_delivery_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_delivery_sessions(id) ON DELETE CASCADE,
    attempt_id UUID NOT NULL,
    question_id UUID NOT NULL,
    section_id TEXT NOT NULL,
    answer_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    time_spent_ms INT NOT NULL DEFAULT 0,
    confidence_level TEXT,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_mock_del_ans_sess ON mock_delivery_answers(session_id);
