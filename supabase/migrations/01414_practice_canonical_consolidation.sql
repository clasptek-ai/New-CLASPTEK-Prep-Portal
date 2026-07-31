-- Migration: 01414_practice_canonical_consolidation.sql
-- Description: Consolidated Schema Extensions for Canonical Practice Engine Runtime

-- 1. Extend practice_sessions with canonical metadata & delivery summary columns
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(64) NULL DEFAULT 'English Proficiency',
ADD COLUMN IF NOT EXISTS section_code VARCHAR(64) NULL DEFAULT 'Grammar',
ADD COLUMN IF NOT EXISTS skill_code VARCHAR(64) NULL DEFAULT 'General',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(32) NULL DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS total_questions INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS answered_questions INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_questions INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS band_or_scale VARCHAR(64) NULL,
ADD COLUMN IF NOT EXISTS mode VARCHAR(32) NOT NULL DEFAULT 'IMMEDIATE_FEEDBACK',
ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

CREATE INDEX IF NOT EXISTS idx_practice_sessions_exam_sec ON public.practice_sessions(exam_type, section_code);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_student_status ON public.practice_sessions(student_id, status);

-- 2. Extend practice_session_questions to store user_answer and response_payload
ALTER TABLE public.practice_session_questions
ADD COLUMN IF NOT EXISTS user_answer TEXT NULL,
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN NULL,
ADD COLUMN IF NOT EXISTS response_payload JSONB NULL DEFAULT '{}'::jsonb;

-- 3. Enable RLS and Policies for practice_sessions & questions
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_session_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_practice_sessions ON public.practice_sessions FOR SELECT USING (true);
CREATE POLICY manage_practice_sessions ON public.practice_sessions FOR ALL USING (true);

CREATE POLICY select_practice_session_questions ON public.practice_session_questions FOR SELECT USING (true);
CREATE POLICY manage_practice_session_questions ON public.practice_session_questions FOR ALL USING (true);
