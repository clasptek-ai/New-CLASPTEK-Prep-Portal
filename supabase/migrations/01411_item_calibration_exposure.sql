-- Migration: 01411_item_calibration_exposure.sql
-- Description: Item Response Theory (IRT) Calibration Statistics and Question Exposure Logs

-- 1. Item Calibration Statistics (IRT Facility & Discrimination Index)
CREATE TABLE IF NOT EXISTS public.item_calibration_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_version_id UUID NULL,
    total_attempts INT NOT NULL DEFAULT 0,
    correct_attempts INT NOT NULL DEFAULT 0,
    facility_index NUMERIC(4,3) NOT NULL DEFAULT 0.500, -- (p-value: 0.000 to 1.000)
    discrimination_index NUMERIC(4,3) NOT NULL DEFAULT 0.300, -- (Point Biserial: -1.000 to +1.000)
    irt_b_difficulty NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- (-3.0 to +3.0)
    irt_a_discrimination NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    last_calibrated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_item_calibration UNIQUE (question_id)
);

CREATE INDEX IF NOT EXISTS idx_item_calib_q ON public.item_calibration_statistics(question_id);

-- 2. Question Exposure Logs & Control
CREATE TABLE IF NOT EXISTS public.question_exposure_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    exposure_count INT NOT NULL DEFAULT 0,
    max_exposure_limit INT NOT NULL DEFAULT 500,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    retirement_date TIMESTAMPTZ NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_question_exposure UNIQUE (question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_exposure_q ON public.question_exposure_logs(question_id);

-- Enable RLS
ALTER TABLE public.item_calibration_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_exposure_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_item_calibration ON public.item_calibration_statistics FOR SELECT USING (true);
CREATE POLICY manage_item_calibration ON public.item_calibration_statistics FOR ALL USING (true);

CREATE POLICY select_question_exposure ON public.question_exposure_logs FOR SELECT USING (true);
CREATE POLICY manage_question_exposure ON public.question_exposure_logs FOR ALL USING (true);
