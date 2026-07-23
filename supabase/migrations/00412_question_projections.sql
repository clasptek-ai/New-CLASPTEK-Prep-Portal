-- Migration: 00412_question_projections.sql
-- Create question_read schema and query projections with automated synchronization triggers

CREATE SCHEMA IF NOT EXISTS question_read;

-- 1. Create materialized_questions projection table
CREATE TABLE IF NOT EXISTS question_read.materialized_questions (
    id UUID PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    prompt TEXT NOT NULL,
    payload JSONB NOT NULL,
    explanation TEXT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty_rating VARCHAR(32) NOT NULL DEFAULT 'medium',
    tenant_id UUID NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mat_questions_tenant ON question_read.materialized_questions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mat_questions_code ON question_read.materialized_questions(code);

-- Enable RLS on projection
ALTER TABLE question_read.materialized_questions ENABLE ROW LEVEL SECURITY;

-- Read policy for select
CREATE POLICY select_materialized_questions ON question_read.materialized_questions
    FOR SELECT TO authenticated
    USING (true);

-- 2. Define trigger function to sync version publish status
CREATE OR REPLACE FUNCTION public.sync_materialized_question_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' THEN
        INSERT INTO question_read.materialized_questions (
            id, code, prompt, payload, explanation, tags, difficulty_rating, tenant_id, updated_at
        )
        VALUES (
            NEW.question_id,
            (SELECT code FROM public.questions WHERE id = NEW.question_id),
            NEW.prompt,
            NEW.payload,
            NEW.explanation,
            COALESCE(NEW.payload->'tags', '[]'::jsonb),
            COALESCE(NEW.payload->>'difficulty', 'medium'),
            (SELECT tenant_id FROM public.questions WHERE id = NEW.question_id),
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            code = EXCLUDED.code,
            prompt = EXCLUDED.prompt,
            payload = EXCLUDED.payload,
            explanation = EXCLUDED.explanation,
            tags = EXCLUDED.tags,
            difficulty_rating = EXCLUDED.difficulty_rating,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_materialized_question
    AFTER INSERT OR UPDATE ON public.question_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_materialized_question_fn();
