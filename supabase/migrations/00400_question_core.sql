-- Migration: 00400_question_core.sql
-- Create core questions and imports tables

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL,
    parent_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    current_version_id UUID, -- reference is populated after question_versions is created
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT chk_status_enum CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'deprecated', 'archived'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_code ON public.questions(code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_questions_parent ON public.questions(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_questions_tenant ON public.questions(tenant_id);

CREATE TABLE IF NOT EXISTS public.question_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    format VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    total_records INTEGER NOT NULL DEFAULT 0,
    error_details TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_import_status CHECK (status IN ('pending', 'imported', 'failed', 'rolled_back'))
);

CREATE TABLE IF NOT EXISTS public.duplicate_hashes (
    hash_value VARCHAR(64) PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
