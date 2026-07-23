-- Migration: 00234_mock_results.sql
-- Description: Create mock_delivery_results and mock_subjective_evaluation_queue tables

CREATE TABLE IF NOT EXISTS mock_delivery_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    overall_raw_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    official_scaled_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    official_score_label TEXT NOT NULL,
    percentile NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'SCORED',
    section_scores_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_subjective_evaluation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mock_delivery_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    section_type TEXT NOT NULL, -- 'WRITING' | 'SPEAKING'
    submission_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    assigned_evaluator_id UUID,
    evaluated_at TIMESTAMPTZ,
    evaluation_result_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_res_sess ON mock_delivery_results(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_res_student ON mock_delivery_results(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_subj_queue_status ON mock_subjective_evaluation_queue(status);
