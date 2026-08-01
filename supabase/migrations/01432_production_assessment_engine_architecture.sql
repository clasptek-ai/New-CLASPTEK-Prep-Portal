-- Migration: 01432_production_assessment_engine_architecture.sql
-- Description: Production Assessment Engine Architecture (Unified Assessment Definitions, Blueprint Sections, Programme Assignments & Frozen Paper Snapshots)

-- 1. Extend assessment_definitions with full engine fields
ALTER TABLE public.assessment_definitions 
ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 45,
ADD COLUMN IF NOT EXISTS instructions TEXT NULL,
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS shuffle_answers BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS sections_config JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL;

-- Relax status constraint if any
ALTER TABLE public.assessment_definitions DROP CONSTRAINT IF EXISTS chk_assessment_def_status;
ALTER TABLE public.assessment_definitions ADD CONSTRAINT chk_assessment_def_status 
CHECK (status IN ('DRAFT', 'INVENTORY_VERIFIED', 'READY', 'PUBLISHED', 'ARCHIVED'));

-- 2. Programme Assessment Assignment Layer
CREATE TABLE IF NOT EXISTS public.programme_assessment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id VARCHAR(128) NOT NULL, -- e.g. 'English Proficiency', 'IELTS Academic'
    assessment_definition_id UUID NOT NULL REFERENCES public.assessment_definitions(id) ON DELETE CASCADE,
    assessment_type VARCHAR(32) NOT NULL DEFAULT 'DIAGNOSTIC',
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    CONSTRAINT unq_prog_assessment_type UNIQUE (programme_id, assessment_type, is_active)
);

CREATE INDEX IF NOT EXISTS idx_prog_assess_assign_lookup 
ON public.programme_assessment_assignments(programme_id, assessment_type, is_active);

-- 3. Extend diagnostic_attempts with frozen paper snapshot
ALTER TABLE public.diagnostic_attempts 
ADD COLUMN IF NOT EXISTS paper_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Enable RLS for programme_assessment_assignments
ALTER TABLE public.programme_assessment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_prog_assess_assign ON public.programme_assessment_assignments FOR SELECT USING (true);
CREATE POLICY manage_prog_assess_assign ON public.programme_assessment_assignments FOR ALL USING (true);

-- 4. Idempotently Seed Canonical Assessment Definitions
INSERT INTO public.assessment_definitions (
  id, code, exam_type, title, assessment_type, duration_minutes, status, instructions, sections_config, published_at
) VALUES 
(
  'a0000000-0000-0000-0000-000000000001',
  'ENG-PROF-DIAG',
  'English Proficiency',
  'English Proficiency Placement Assessment',
  'DIAGNOSTIC',
  45,
  'PUBLISHED',
  'Complete all three core modules (Grammar & Structure, Reading Comprehension, and Writing Expression) within 45 minutes.',
  '[
    {"code": "GRAMMAR", "name": "Grammar & Structure", "questionCount": 30, "selection": "BALANCED"},
    {"code": "READING", "name": "Reading Comprehension", "passages": 1},
    {"code": "WRITING", "name": "Writing Expression", "tasks": ["ESSAY", "LETTER"]}
  ]'::jsonb,
  now()
),
(
  'a0000000-0000-0000-0000-000000000002',
  'IELTS-AC-DIAG',
  'IELTS Academic',
  'IELTS Academic Readiness Diagnostic',
  'DIAGNOSTIC',
  60,
  'PUBLISHED',
  'Complete the IELTS Academic readiness assessment evaluating Reading, Writing, and Listening skills.',
  '[
    {"code": "LISTENING", "name": "Listening", "parts": 4},
    {"code": "READING", "name": "Academic Reading", "passages": 3},
    {"code": "WRITING", "name": "Academic Writing", "tasks": ["TASK1", "TASK2"]}
  ]'::jsonb,
  now()
)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  duration_minutes = EXCLUDED.duration_minutes,
  status = EXCLUDED.status,
  instructions = EXCLUDED.instructions,
  sections_config = EXCLUDED.sections_config,
  published_at = EXCLUDED.published_at;

-- 5. Seed Programme Assignments
INSERT INTO public.programme_assessment_assignments (
  programme_id, assessment_definition_id, assessment_type, is_active
) VALUES (
  'English Proficiency',
  'a0000000-0000-0000-0000-000000000001',
  'DIAGNOSTIC',
  true
), (
  'IELTS Academic',
  'a0000000-0000-0000-0000-000000000002',
  'DIAGNOSTIC',
  true
)
ON CONFLICT (programme_id, assessment_type, is_active) DO UPDATE SET
  assessment_definition_id = EXCLUDED.assessment_definition_id,
  assigned_at = now();
