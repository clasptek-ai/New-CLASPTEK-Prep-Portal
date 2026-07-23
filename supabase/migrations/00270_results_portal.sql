-- Migration: 00270_results_portal.sql
-- Results & Academic Progress Portal — Unified Read-Model Results Projection Table

CREATE TABLE IF NOT EXISTS student_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    result_type VARCHAR(50) NOT NULL CHECK (result_type IN ('ASSESSMENT', 'PRACTICE', 'MOCK', 'WRITING_EVALUATION', 'SPEAKING_EVALUATION')),
    source_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    score NUMERIC(8,2) DEFAULT NULL,
    max_score NUMERIC(8,2) DEFAULT NULL,
    band_score VARCHAR(20) DEFAULT NULL,
    percentage NUMERIC(5,2) DEFAULT NULL,
    is_passing BOOLEAN DEFAULT NULL,
    summary_feedback TEXT DEFAULT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_results_source UNIQUE (student_id, result_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_student_results_student_id ON student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_type ON student_results(result_type);
CREATE INDEX IF NOT EXISTS idx_student_results_published ON student_results(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_results_student_type ON student_results(student_id, result_type);
