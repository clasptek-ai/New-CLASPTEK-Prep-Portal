-- Migration: 00402_answer_options.sql
-- Create answer_options table

CREATE TABLE IF NOT EXISTS public.answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NOT NULL REFERENCES public.question_versions(id) ON DELETE CASCADE,
    option_code VARCHAR(16) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL,
    CONSTRAINT uq_option_per_version UNIQUE (question_version_id, option_code)
);

CREATE INDEX IF NOT EXISTS idx_answer_options_version ON public.answer_options(question_version_id);
