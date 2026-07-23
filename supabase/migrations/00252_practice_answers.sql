-- Migration: 00252_practice_answers.sql
-- Description: Practice answers extension table with visit counts and time spent

CREATE TABLE IF NOT EXISTS practice_answers_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_delivery_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    selected_option_ids TEXT[] DEFAULT '{}',
    is_correct BOOLEAN NOT NULL DEFAULT false,
    confidence_level VARCHAR(32) DEFAULT 'MEDIUM',
    time_spent_seconds INT NOT NULL DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_answers_extended_session ON practice_answers_extended(session_id);
