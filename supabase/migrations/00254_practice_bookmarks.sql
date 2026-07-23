-- Migration: 00254_practice_bookmarks.sql
-- Description: Bookmarks, wrong answer queue, review queue, statistics & session events

CREATE TABLE IF NOT EXISTS practice_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    category VARCHAR(64) DEFAULT 'GENERAL',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_wrong_answer_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    skill_id VARCHAR(64),
    mastery_count INT NOT NULL DEFAULT 0,
    retry_count INT NOT NULL DEFAULT 0,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    is_reviewed BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_delivery_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL,
    current_streak INT NOT NULL DEFAULT 0,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    mastery_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    average_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    weak_skill_ids TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES practice_delivery_sessions(id) ON DELETE CASCADE,
    event_name VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
