-- Migration: 01412_diagnostic_canonical_consolidation.sql
-- Description: Canonical schema extension consolidating diagnostic placement with unified assessment sessions and assessment definitions

-- 1. Add assessment_type to canonical assessment_definitions
ALTER TABLE public.assessment_definitions 
ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(32) NOT NULL DEFAULT 'MOCK' CHECK (assessment_type IN ('DIAGNOSTIC', 'PRACTICE', 'MOCK'));

-- 2. Link placement_results to canonical assessment_sessions (in addition to legacy attempt_id)
ALTER TABLE public.placement_results 
ADD COLUMN IF NOT EXISTS assessment_session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
ALTER COLUMN attempt_id DROP NOT NULL;

-- Relax placement_stage constraint to allow dynamic stage names from database configuration
ALTER TABLE public.placement_results DROP CONSTRAINT IF EXISTS placement_results_placement_stage_check;

-- 3. Link student_skill_profiles to canonical assessment_sessions
ALTER TABLE public.student_skill_profiles 
ADD COLUMN IF NOT EXISTS assessment_session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE SET NULL;

-- Relax computed_stage constraint to allow dynamic stage names
ALTER TABLE public.student_skill_profiles DROP CONSTRAINT IF EXISTS student_skill_profiles_computed_stage_check;

-- 4. Create diagnostic_section_scores for granular multi-skill diagnostic evaluation
CREATE TABLE IF NOT EXISTS public.diagnostic_section_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    section_code VARCHAR(64) NOT NULL,
    section_name VARCHAR(128) NOT NULL,
    total_questions INT NOT NULL DEFAULT 0,
    answered_questions INT NOT NULL DEFAULT 0,
    correct_questions INT NOT NULL DEFAULT 0,
    score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    computed_level VARCHAR(64) NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_session_section UNIQUE (assessment_session_id, section_code)
);

CREATE INDEX IF NOT EXISTS idx_diag_sec_scores_session ON public.diagnostic_section_scores(assessment_session_id);
CREATE INDEX IF NOT EXISTS idx_diag_sec_scores_student ON public.diagnostic_section_scores(student_id);

-- 5. Create placement_threshold_rules for database-driven placement calculation
CREATE TABLE IF NOT EXISTS public.placement_threshold_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_definition_id UUID NOT NULL REFERENCES public.assessment_definitions(id) ON DELETE CASCADE,
    placement_level VARCHAR(64) NOT NULL, -- e.g. 'FOUNDATION', 'INTERMEDIATE', 'ADVANCED', 'EXAM_READY'
    min_overall_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    max_overall_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    required_skill_minimums JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"Grammar": 40.0, "Reading": 40.0}
    priority INT NOT NULL DEFAULT 1,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_to TIMESTAMPTZ NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_placement_rules_def ON public.placement_threshold_rules(assessment_definition_id);

-- Enable RLS
ALTER TABLE public.diagnostic_section_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_threshold_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_diag_sec_scores ON public.diagnostic_section_scores FOR SELECT USING (true);
CREATE POLICY manage_diag_sec_scores ON public.diagnostic_section_scores FOR ALL USING (true);

CREATE POLICY select_placement_rules ON public.placement_threshold_rules FOR SELECT USING (true);
CREATE POLICY manage_placement_rules ON public.placement_threshold_rules FOR ALL USING (true);
