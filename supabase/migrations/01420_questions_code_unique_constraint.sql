-- Migration: 01420_questions_code_unique_constraint.sql
-- Description: Canonical Unique Constraint on public.questions(code) for Question Bank Upsert Resolution

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unq_questions_code'
    ) THEN
        ALTER TABLE public.questions ADD CONSTRAINT unq_questions_code UNIQUE (code);
    END IF;
END $$;
