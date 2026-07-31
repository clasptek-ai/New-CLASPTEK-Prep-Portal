-- Migration: 01403_assessment_sections.sql
-- Description: First-class assessment_sections entity mapping exam products to section structures

CREATE TABLE IF NOT EXISTS public.assessment_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    exam_type VARCHAR(64) NOT NULL DEFAULT 'IELTS Academic',
    name VARCHAR(128) NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    time_limit_minutes INT NOT NULL DEFAULT 60,
    passing_score_percent INT NOT NULL DEFAULT 60,
    instructions TEXT NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_sections_exam ON public.assessment_sections(exam_type);

-- Enable RLS
ALTER TABLE public.assessment_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_assessment_sections ON public.assessment_sections
    FOR SELECT USING (true);

CREATE POLICY manage_assessment_sections ON public.assessment_sections
    FOR ALL USING (true);
