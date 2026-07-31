-- Migration: 01415_mock_canonical_consolidation.sql
-- Description: Consolidated Schema Extensions for Canonical Mock Exam Engine Runtime

-- 1. Extend mock_blueprints with exam_type, sections_payload, rules_payload
ALTER TABLE public.mock_blueprints
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(64) NULL DEFAULT 'IELTS Academic',
ADD COLUMN IF NOT EXISTS version_no INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS rules_payload JSONB NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sections_payload JSONB NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_mock_blueprints_exam ON public.mock_blueprints(exam_type, status);

-- 2. Extend mock_templates with exam_type, code, title
ALTER TABLE public.mock_templates
ADD COLUMN IF NOT EXISTS code VARCHAR(64) NULL,
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(64) NULL DEFAULT 'IELTS Academic',
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS sections_payload JSONB NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_mock_templates_exam ON public.mock_templates(exam_type, status);

-- 3. Extend mock_sessions with canonical timing, evaluation lifecycle, and score summary
ALTER TABLE public.mock_sessions
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(64) NULL DEFAULT 'IELTS Academic',
ADD COLUMN IF NOT EXISTS section_code VARCHAR(64) NULL DEFAULT 'Reading',
ADD COLUMN IF NOT EXISTS evaluation_state VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS section_started_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS score_percentage DECIMAL(5,2) NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS official_scaled_score DECIMAL(7,2) NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS official_score_label VARCHAR(64) NULL,
ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

CREATE INDEX IF NOT EXISTS idx_mock_sessions_student_status ON public.mock_sessions(student_id, status);

-- 4. Enable RLS and Policies for mock_blueprints, templates, sessions, results
ALTER TABLE public.mock_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_mock_blueprints ON public.mock_blueprints FOR SELECT USING (true);
CREATE POLICY manage_mock_blueprints ON public.mock_blueprints FOR ALL USING (true);

CREATE POLICY select_mock_templates ON public.mock_templates FOR SELECT USING (true);
CREATE POLICY manage_mock_templates ON public.mock_templates FOR ALL USING (true);

CREATE POLICY select_mock_sessions ON public.mock_sessions FOR SELECT USING (true);
CREATE POLICY manage_mock_sessions ON public.mock_sessions FOR ALL USING (true);

CREATE POLICY select_mock_results ON public.mock_results FOR SELECT USING (true);
CREATE POLICY manage_mock_results ON public.mock_results FOR ALL USING (true);
