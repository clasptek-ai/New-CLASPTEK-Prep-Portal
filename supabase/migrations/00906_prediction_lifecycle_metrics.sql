-- Migration: 00906_prediction_lifecycle_metrics.sql
-- Bounded Context: Readiness & Prediction Engine
-- Created At: 2026-07-16

-- 1. Add feature_contribution_ranking to prediction_explanations
ALTER TABLE prediction_explanations ADD COLUMN feature_contribution_ranking JSONB NOT NULL DEFAULT '[]';

-- 2. Create prediction_lifecycle_metrics table
CREATE TABLE prediction_lifecycle_metrics (
  id UUID PRIMARY KEY,
  model_version_id UUID NOT NULL REFERENCES prediction_model_versions(id) ON DELETE CASCADE,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  generation_latency_ms NUMERIC(7,2) NOT NULL,
  prediction_acceptance_rate NUMERIC(5,2) NOT NULL,
  intervention_completion_rate NUMERIC(5,2) NOT NULL,
  intervention_effectiveness NUMERIC(5,2) NOT NULL,
  model_drift NUMERIC(5,2) NOT NULL,
  experiment_success_rate NUMERIC(5,2) NOT NULL
);

-- Enable RLS
ALTER TABLE prediction_lifecycle_metrics ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies
CREATE POLICY admin_all_lifecycle_metrics ON prediction_lifecycle_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY public_read_lifecycle_metrics ON prediction_lifecycle_metrics FOR SELECT USING (TRUE);
