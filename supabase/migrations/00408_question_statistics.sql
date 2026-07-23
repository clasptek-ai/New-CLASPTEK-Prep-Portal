-- Migration: 00408_question_statistics.sql
-- Create question_statistics table for psychometrics and Item Response Theory (IRT)

CREATE TABLE IF NOT EXISTS public.question_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NOT NULL REFERENCES public.question_versions(id) ON DELETE CASCADE,
    facility_index NUMERIC(5,4) NOT NULL DEFAULT 1.0000,
    discrimination_index NUMERIC(5,4) NOT NULL DEFAULT 0.0000,
    point_biserial NUMERIC(5,4) NOT NULL DEFAULT 0.0000,
    guess_probability NUMERIC(5,4) NOT NULL DEFAULT 0.0000,
    irt_parameter_a NUMERIC(6,4) NOT NULL DEFAULT 1.0000, -- item discrimination
    irt_parameter_b NUMERIC(6,4) NOT NULL DEFAULT 0.0000, -- item difficulty
    irt_parameter_c NUMERIC(6,4) NOT NULL DEFAULT 0.0000, -- guessing probability
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_stats_per_version UNIQUE (question_version_id)
);

CREATE INDEX IF NOT EXISTS idx_question_statistics_version ON public.question_statistics(question_version_id);
