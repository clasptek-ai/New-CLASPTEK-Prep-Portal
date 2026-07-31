-- Migration: 01400_reading_passages.sql
-- Description: Dedicated reading passage storage with word count, source, exam product mapping, and status

CREATE TABLE IF NOT EXISTS public.reading_passages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    exam_type VARCHAR(64) NOT NULL DEFAULT 'IELTS Academic',
    section VARCHAR(64) NOT NULL DEFAULT 'Reading',
    source VARCHAR(255) NULL,
    word_count INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_passages_exam_sec ON public.reading_passages(exam_type, section);
CREATE INDEX IF NOT EXISTS idx_reading_passages_code ON public.reading_passages(code);

-- Enable RLS
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_reading_passages ON public.reading_passages
    FOR SELECT USING (true);

CREATE POLICY manage_reading_passages ON public.reading_passages
    FOR ALL USING (true);
