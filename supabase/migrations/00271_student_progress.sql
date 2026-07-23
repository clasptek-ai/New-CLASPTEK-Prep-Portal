-- Migration: 00271_student_progress.sql
-- Results & Academic Progress Portal — Student Academic Summary & Progress Table

CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    academic_status VARCHAR(50) NOT NULL DEFAULT 'ON_TRACK' CHECK (academic_status IN ('ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK', 'EXCELLING')),
    performance_trend VARCHAR(50) NOT NULL DEFAULT 'STABLE' CHECK (performance_trend IN ('IMPROVING', 'STABLE', 'DECLINING', 'VOLATILE')),
    total_assessments INT NOT NULL DEFAULT 0,
    total_practices INT NOT NULL DEFAULT 0,
    total_mocks INT NOT NULL DEFAULT 0,
    total_evaluations INT NOT NULL DEFAULT 0,
    average_band_score VARCHAR(20) DEFAULT NULL,
    strongest_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    weakest_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON student_progress(academic_status);
CREATE INDEX IF NOT EXISTS idx_student_progress_trend ON student_progress(performance_trend);
