-- Migration: 00407_question_workflow_history.sql
-- Create question_workflow_history table for auditing workflow events

CREATE TABLE IF NOT EXISTS public.question_workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    comments TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_history_question ON public.question_workflow_history(question_id);
