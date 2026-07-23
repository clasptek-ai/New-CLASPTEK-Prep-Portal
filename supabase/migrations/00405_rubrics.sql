-- Migration: 00405_rubrics.sql
-- Create rubrics table

CREATE TABLE IF NOT EXISTS public.rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NOT NULL REFERENCES public.question_versions(id) ON DELETE CASCADE,
    criterion_name VARCHAR(128) NOT NULL,
    max_points INTEGER NOT NULL,
    description TEXT NOT NULL,
    grading_guidelines JSONB NOT NULL,
    CONSTRAINT chk_rubric_max_pts CHECK (max_points > 0)
);

CREATE INDEX IF NOT EXISTS idx_rubrics_version ON public.rubrics(question_version_id);
