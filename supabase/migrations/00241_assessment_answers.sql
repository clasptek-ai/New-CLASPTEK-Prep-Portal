-- Migration: 00241_assessment_answers.sql
-- Description: Delivery answers tracking with flag & navigation state

CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    selected_option_ids TEXT[] DEFAULT '{}',
    text_answer TEXT,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    visit_count INT NOT NULL DEFAULT 1,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_session ON assessment_answers(session_id);
