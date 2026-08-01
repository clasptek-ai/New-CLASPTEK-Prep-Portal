-- Migration: 01439_assessment_results_first_class_domain.sql
-- Description: Ensure public.assessment_results has all columns and unique constraint on attempt_id.

ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS exam_type VARCHAR(100) DEFAULT 'English Proficiency';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS assessment_category VARCHAR(50) DEFAULT 'DIAGNOSTIC';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS placement_level VARCHAR(50) DEFAULT 'FOUNDATION';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS cefr_level VARCHAR(10) DEFAULT 'B1';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS predicted_band VARCHAR(50) DEFAULT 'Band 6.0';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS weaknesses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS recommended_course VARCHAR(255) DEFAULT 'Foundation Pathway';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS recommended_duration VARCHAR(50) DEFAULT '5 Weeks';
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS ai_feedback JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make session_id nullable if it was NOT NULL in legacy schema
ALTER TABLE public.assessment_results ALTER COLUMN session_id DROP NOT NULL;

-- Unique constraint on attempt_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_assessment_results_attempt_unique ON public.assessment_results(attempt_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessment_results_student ON public.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_category ON public.assessment_results(assessment_category);
