-- Migration: 00242_assessment_results.sql
-- Description: Assessment attempts and results tables with section scores and JSONB breakdown

CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS'
);

CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES assessment_attempts(id),
    student_id UUID NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    visibility_mode VARCHAR(32) NOT NULL DEFAULT 'FULL_REVIEW',
    section_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    skill_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    practice_recommendation JSONB,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_student ON assessment_results(student_id);
