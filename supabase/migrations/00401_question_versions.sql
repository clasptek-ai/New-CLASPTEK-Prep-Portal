-- Migration: 00401_question_versions.sql
-- Create question_versions table and immutability lock triggers

CREATE TABLE IF NOT EXISTS public.question_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    version_no INTEGER NOT NULL,
    version_label VARCHAR(64) NULL,
    prompt TEXT NOT NULL,
    payload JSONB NOT NULL,
    explanation TEXT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    lock_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_version_no_positive CHECK (version_no > 0),
    CONSTRAINT uq_question_version_no UNIQUE (question_id, version_no),
    CONSTRAINT chk_version_status CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'deprecated', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_question_versions_lookup ON public.question_versions(question_id, version_no);

-- Add foreign key back to questions now that table exists
ALTER TABLE public.questions 
ADD CONSTRAINT fk_questions_current_version 
FOREIGN KEY (current_version_id) REFERENCES public.question_versions(id) ON DELETE SET NULL;

-- Trigger to prevent updates to published question versions
CREATE OR REPLACE FUNCTION public.fn_prevent_published_version_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'published' THEN
        RAISE EXCEPTION 'Cannot modify an immutable published question version';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_published_version_updates
BEFORE UPDATE ON public.question_versions
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_published_version_updates();
