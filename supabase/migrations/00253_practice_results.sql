-- Migration: 00253_practice_results.sql
-- Description: Practice results table with skill scores & accuracy JSONB

CREATE TABLE IF NOT EXISTS practice_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES practice_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    accuracy_percentage NUMERIC(5,2) NOT NULL,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    skill_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    practice_recommendations JSONB NOT NULL DEFAULT '{}'::jsonb,
    bookmark_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_results_student ON practice_results(student_id);
