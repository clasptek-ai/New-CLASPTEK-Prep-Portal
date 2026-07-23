-- Migration: 00263_evaluation_sla.sql
-- Description: Create evaluation_sla_metrics table

CREATE TABLE IF NOT EXISTS evaluation_sla_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    evaluation_type TEXT NOT NULL, -- 'WRITING' | 'SPEAKING'
    latency_seconds INT NOT NULL,
    target_seconds INT NOT NULL,
    is_breached BOOLEAN NOT NULL DEFAULT FALSE,
    severity TEXT NOT NULL DEFAULT 'LOW', -- 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_sla_breached ON evaluation_sla_metrics(is_breached);
