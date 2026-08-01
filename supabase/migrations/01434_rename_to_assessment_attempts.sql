-- Migration: 01434_rename_to_assessment_attempts.sql
-- Description: Universal Assessment Engine Domain Consistency (Rename diagnostic_attempts to assessment_attempts, diagnostic_responses to assessment_attempt_answers, and create assessment_attempt_events)

-- 1. Rename or setup assessment_attempts table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diagnostic_attempts') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_attempts') THEN
        ALTER TABLE public.diagnostic_attempts RENAME TO assessment_attempts;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    catalog_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' NOT NULL CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'ABANDONED')),
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    duration_minutes INT DEFAULT 45 NOT NULL,
    score DECIMAL(5,2),
    paper_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Backward compatibility view if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diagnostic_attempts') 
       AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_attempts') THEN
        -- Legacy table exists separately; keep both aligned
        NULL;
    ELSIF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diagnostic_attempts') THEN
        CREATE OR REPLACE VIEW public.diagnostic_attempts AS SELECT * FROM public.assessment_attempts;
    END IF;
END $$;

-- 2. Rename or setup assessment_attempt_answers table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diagnostic_responses') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessment_attempt_answers') THEN
        ALTER TABLE public.diagnostic_responses RENAME TO assessment_attempt_answers;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.assessment_attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    question_version_id UUID NOT NULL,
    response_payload JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_ms INT DEFAULT 0 NOT NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Create Append-Only Audit Event Log Table
CREATE TABLE IF NOT EXISTS public.assessment_attempt_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL, -- e.g. ATTEMPT_CREATED, QUESTION_OPENED, ANSWER_CHANGED, AUTO_SAVE, RESUMED, SUBMITTED, TIME_EXPIRED
    event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_events_attempt ON public.assessment_attempt_events(attempt_id);

-- Enable RLS
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempt_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_assessment_attempts ON public.assessment_attempts FOR SELECT USING (true);
CREATE POLICY manage_assessment_attempts ON public.assessment_attempts FOR ALL USING (true);

CREATE POLICY select_assessment_answers ON public.assessment_attempt_answers FOR SELECT USING (true);
CREATE POLICY manage_assessment_answers ON public.assessment_attempt_answers FOR ALL USING (true);

CREATE POLICY select_assessment_events ON public.assessment_attempt_events FOR SELECT USING (true);
CREATE POLICY manage_assessment_events ON public.assessment_attempt_events FOR ALL USING (true);
