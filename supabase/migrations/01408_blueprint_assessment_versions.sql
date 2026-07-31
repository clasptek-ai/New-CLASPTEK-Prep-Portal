-- Migration: 01408_blueprint_assessment_versions.sql
-- Description: First-class Blueprint Versions, Assessment Versions, Exam Editions, Rule Engine, and Selection Audit

-- 1. Exam Editions (e.g. IELTS Academic 2026 Edition vs 2027 Edition)
CREATE TABLE IF NOT EXISTS public.exam_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    exam_type VARCHAR(64) NOT NULL,
    edition_label VARCHAR(64) NOT NULL, -- e.g., '2026 Edition'
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Blueprint Versions
CREATE TABLE IF NOT EXISTS public.blueprint_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID NOT NULL,
    version_no INT NOT NULL DEFAULT 1,
    version_label VARCHAR(32) NOT NULL DEFAULT 'v1.0',
    title VARCHAR(255) NOT NULL,
    exam_type VARCHAR(64) NOT NULL,
    scoring_method VARCHAR(64) NOT NULL DEFAULT 'BAND_SCALE_CONVERSION',
    rules_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
    sections_payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_blueprint_version UNIQUE (blueprint_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_bp_versions_bp ON public.blueprint_versions(blueprint_id);

-- 3. Assessment Definitions & Versions
CREATE TABLE IF NOT EXISTS public.assessment_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    exam_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    edition_id UUID NULL REFERENCES public.exam_editions(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessment_definitions(id) ON DELETE CASCADE,
    version_no INT NOT NULL DEFAULT 1,
    blueprint_version_id UUID NOT NULL REFERENCES public.blueprint_versions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_assessment_version UNIQUE (assessment_id, version_no)
);

-- 4. Selection Audit Logs
CREATE TABLE IF NOT EXISTS public.selection_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    rule_name VARCHAR(128) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT true,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_selection_audit_session ON public.selection_audit_logs(session_id);

-- Enable RLS
ALTER TABLE public.exam_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_exam_editions ON public.exam_editions FOR SELECT USING (true);
CREATE POLICY manage_exam_editions ON public.exam_editions FOR ALL USING (true);

CREATE POLICY select_blueprint_versions ON public.blueprint_versions FOR SELECT USING (true);
CREATE POLICY manage_blueprint_versions ON public.blueprint_versions FOR ALL USING (true);

CREATE POLICY select_assessment_defs ON public.assessment_definitions FOR SELECT USING (true);
CREATE POLICY manage_assessment_defs ON public.assessment_definitions FOR ALL USING (true);

CREATE POLICY select_assessment_vers ON public.assessment_versions FOR SELECT USING (true);
CREATE POLICY manage_assessment_vers ON public.assessment_versions FOR ALL USING (true);

CREATE POLICY select_selection_audit ON public.selection_audit_logs FOR SELECT USING (true);
CREATE POLICY manage_selection_audit ON public.selection_audit_logs FOR ALL USING (true);
