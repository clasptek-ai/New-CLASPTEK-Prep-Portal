-- Migration: 01402_question_group_items.sql
-- Description: Junction mapping question_group -> question (with display_order)

CREATE TABLE IF NOT EXISTS public.question_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.question_groups(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_group_item UNIQUE (group_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_group_items_group ON public.question_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_group_items_question ON public.question_group_items(question_id);

-- Enable RLS
ALTER TABLE public.question_group_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_question_group_items ON public.question_group_items
    FOR SELECT USING (true);

CREATE POLICY manage_question_group_items ON public.question_group_items
    FOR ALL USING (true);
