-- Migration: 00410_question_dependencies.sql
-- Create question_dependencies table

CREATE TABLE IF NOT EXISTS public.question_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT uq_dependency_link UNIQUE (parent_id, child_id),
    CONSTRAINT chk_no_self_dependency CHECK (parent_id <> child_id)
);

CREATE INDEX IF NOT EXISTS idx_dependencies_parent ON public.question_dependencies(parent_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_child ON public.question_dependencies(child_id);
