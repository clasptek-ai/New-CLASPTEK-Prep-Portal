-- Migration: 01417_subjective_evaluation_pipeline.sql
-- Description: Canonical Subjective Evaluation Pipeline Schema for Shared Writing and Speaking Evaluation

-- 1. Create subjective_evaluations table
CREATE TABLE IF NOT EXISTS public.subjective_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    assessment_type VARCHAR(32) NOT NULL CHECK (assessment_type IN ('DIAGNOSTIC', 'PRACTICE', 'MOCK')),
    session_id UUID NOT NULL,
    response_id VARCHAR(128) NOT NULL,
    question_id UUID NULL,
    question_version_id UUID NULL,
    skill VARCHAR(32) NOT NULL CHECK (skill IN ('Writing', 'Speaking')),
    evaluation_method VARCHAR(32) NOT NULL DEFAULT 'AI' CHECK (evaluation_method IN ('AI', 'HUMAN', 'HYBRID')),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'QUEUED', 'EVALUATING', 'COMPLETED', 'FAILED', 'REQUIRES_REVIEW')),
    rubric_id UUID NULL,
    raw_response_reference TEXT NULL,
    transcript TEXT NULL,
    overall_score DECIMAL(5,2) NULL,
    score_label VARCHAR(64) NULL,
    feedback TEXT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    last_error TEXT NULL,
    reviewed_by UUID NULL,
    reviewed_at TIMESTAMPTZ NULL,
    review_notes TEXT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    queued_at TIMESTAMPTZ NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    failed_at TIMESTAMPTZ NULL,
    CONSTRAINT unq_subjective_eval_response UNIQUE (session_id, response_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_eval_student ON public.subjective_evaluations(student_id, status);
CREATE INDEX IF NOT EXISTS idx_sub_eval_session ON public.subjective_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_sub_eval_status ON public.subjective_evaluations(status);

-- 2. Create subjective_evaluation_criteria table
CREATE TABLE IF NOT EXISTS public.subjective_evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES public.subjective_evaluations(id) ON DELETE CASCADE,
    criterion_name VARCHAR(128) NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 9.00,
    feedback TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_eval_crit_eval_id ON public.subjective_evaluation_criteria(evaluation_id);

-- 3. Enable RLS and Policies
ALTER TABLE public.subjective_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjective_evaluation_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_subjective_evaluations ON public.subjective_evaluations FOR SELECT USING (true);
CREATE POLICY manage_subjective_evaluations ON public.subjective_evaluations FOR ALL USING (true);

CREATE POLICY select_subjective_eval_criteria ON public.subjective_evaluation_criteria FOR SELECT USING (true);
CREATE POLICY manage_subjective_eval_criteria ON public.subjective_evaluation_criteria FOR ALL USING (true);
