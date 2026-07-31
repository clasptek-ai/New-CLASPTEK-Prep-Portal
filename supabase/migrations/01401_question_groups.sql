-- Migration: 01401_question_groups.sql
-- Description: Groups of questions sharing a reading passage, listening section, or grammar set

CREATE TABLE IF NOT EXISTS public.question_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    passage_id UUID NULL REFERENCES public.reading_passages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    question_type VARCHAR(64) NOT NULL DEFAULT 'MCQ',
    display_order INT NOT NULL DEFAULT 1,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_groups_passage ON public.question_groups(passage_id);
CREATE INDEX IF NOT EXISTS idx_question_groups_code ON public.question_groups(code);

-- Enable RLS
ALTER TABLE public.question_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_question_groups ON public.question_groups
    FOR SELECT USING (true);

CREATE POLICY manage_question_groups ON public.question_groups
    FOR ALL USING (true);
