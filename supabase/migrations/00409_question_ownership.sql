-- Migration: 00409_question_ownership.sql
-- Create question_ownership table

CREATE TABLE IF NOT EXISTS public.question_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    owner_org_id UUID NOT NULL,
    license_type VARCHAR(64) NOT NULL,
    copyright_year INTEGER NOT NULL,
    attribution_text TEXT NULL,
    CONSTRAINT uq_ownership_per_question UNIQUE (question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_ownership_question ON public.question_ownership(question_id);
