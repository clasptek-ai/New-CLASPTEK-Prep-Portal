-- Migration: 00251_practice_attempts.sql
-- Description: Practice attempts table

CREATE TABLE IF NOT EXISTS practice_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS'
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_session ON practice_attempts(session_id);
