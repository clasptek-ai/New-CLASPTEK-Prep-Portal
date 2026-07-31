-- Migration: 01418_json_import_export_pipeline.sql
-- Description: Schema Extensions for Universal Question Bank JSON Import, Export, Batch Tracking, and Grammar Proficiency Levels

-- 1. Create question_import_batches table
CREATE TABLE IF NOT EXISTS public.question_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code VARCHAR(64) NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    schema_version VARCHAR(16) NOT NULL DEFAULT '1.0',
    exam_type VARCHAR(64) NOT NULL DEFAULT 'English Proficiency',
    uploaded_by UUID NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'READY'
        CHECK (status IN ('VALIDATING', 'READY', 'IMPORTING', 'COMPLETED', 'PARTIAL', 'FAILED', 'ROLLED_BACK')),
    total_records INT NOT NULL DEFAULT 0,
    successful_records INT NOT NULL DEFAULT 0,
    failed_records INT NOT NULL DEFAULT 0,
    warning_count INT NOT NULL DEFAULT 0,
    error_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    rolled_back_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_import_batches_code ON public.question_import_batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON public.question_import_batches(status);

-- 2. Extend questions and question_versions with import_batch_id, proficiency_level, grammar_topic, grammar_subtopic
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS import_batch_id UUID NULL REFERENCES public.question_import_batches(id) ON DELETE SET NULL;

ALTER TABLE public.question_versions
ADD COLUMN IF NOT EXISTS import_batch_id UUID NULL REFERENCES public.question_import_batches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS proficiency_level VARCHAR(32) NULL CHECK (proficiency_level IN ('FOUNDATION', 'INTERMEDIATE', 'ADVANCED')),
ADD COLUMN IF NOT EXISTS grammar_topic VARCHAR(128) NULL,
ADD COLUMN IF NOT EXISTS grammar_subtopic VARCHAR(128) NULL;

CREATE INDEX IF NOT EXISTS idx_question_versions_prof_level ON public.question_versions(proficiency_level);
CREATE INDEX IF NOT EXISTS idx_question_versions_grammar ON public.question_versions(grammar_topic, grammar_subtopic);
CREATE INDEX IF NOT EXISTS idx_question_versions_batch ON public.question_versions(import_batch_id);

-- 3. Enable RLS and Policies
ALTER TABLE public.question_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_import_batches ON public.question_import_batches FOR SELECT USING (true);
CREATE POLICY manage_import_batches ON public.question_import_batches FOR ALL USING (true);
