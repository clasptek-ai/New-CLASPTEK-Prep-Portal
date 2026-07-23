-- Migration: 00404_solutions.sql
-- Create solutions table

CREATE TABLE IF NOT EXISTS public.solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NOT NULL REFERENCES public.question_versions(id) ON DELETE CASCADE,
    solution_type VARCHAR(32) NOT NULL,
    target_option_id UUID REFERENCES public.answer_options(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    CONSTRAINT chk_solution_type CHECK (solution_type IN ('explanation', 'hint', 'distractor_feedback'))
);

CREATE INDEX IF NOT EXISTS idx_solutions_version ON public.solutions(question_version_id);
