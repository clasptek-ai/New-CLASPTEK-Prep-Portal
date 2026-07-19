-- Migration: 00900_prediction_engine.sql
-- Bounded Context: Readiness & Prediction Engine
-- Created At: 2026-07-16

CREATE TABLE prediction_models (
  id UUID PRIMARY KEY,
  model_code VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  algorithm_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_model_versions (
  id UUID PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES prediction_models(id) ON DELETE CASCADE,
  version_string VARCHAR(50) NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (model_id, version_string)
);

CREATE TABLE prediction_profiles (
  id UUID PRIMARY KEY,
  profile_code VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  exam_context VARCHAR(50) NOT NULL,
  confidence_rules JSONB NOT NULL DEFAULT '{}',
  score_mappings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readiness_predictions (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES prediction_profiles(id),
  model_version_id UUID NOT NULL REFERENCES prediction_model_versions(id),
  status VARCHAR(50) NOT NULL,
  overall_readiness_score NUMERIC(5,2),
  confidence_value NUMERIC(3,2),
  confidence_interval_low NUMERIC(5,2),
  confidence_interval_high NUMERIC(5,2),
  lock_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE readiness_snapshots (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  learner_state JSONB NOT NULL,
  latest_evaluation_summaries JSONB NOT NULL,
  practice_statistics JSONB NOT NULL,
  study_streak JSONB NOT NULL,
  competency_mastery JSONB NOT NULL,
  forecast_window VARCHAR(50) NOT NULL,
  model_version_id UUID REFERENCES prediction_model_versions(id),
  snapshotted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_snapshots (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  readiness_snapshot_id UUID NOT NULL REFERENCES readiness_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_features (
  id UUID PRIMARY KEY,
  feature_code VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_feature_sets (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_inputs (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  raw_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_outputs (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  raw_outputs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_evidence (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  evidence_type VARCHAR(100) NOT NULL,
  evidence_source_id UUID NOT NULL,
  weight NUMERIC(3,2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_explanations (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  contributing_factors JSONB NOT NULL DEFAULT '[]',
  feature_importance JSONB NOT NULL DEFAULT '{}',
  confidence_explanation TEXT NOT NULL,
  evidence_references JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_calibration (
  id UUID PRIMARY KEY,
  model_version_id UUID NOT NULL REFERENCES prediction_model_versions(id) ON DELETE CASCADE,
  expected_score NUMERIC(5,2) NOT NULL,
  observed_score NUMERIC(5,2) NOT NULL,
  calibration_error NUMERIC(5,2) NOT NULL,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_trends (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  trend_type VARCHAR(50) NOT NULL,
  slope NUMERIC(5,2) NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_interventions (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  risk_score NUMERIC(5,2) NOT NULL,
  trigger_reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_recommendations (
  id UUID PRIMARY KEY,
  intervention_id UUID NOT NULL REFERENCES prediction_interventions(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) NOT NULL,
  priority INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_resource_id UUID,
  target_competency_code VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_experiments (
  id UUID PRIMARY KEY,
  experiment_code VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  control_model_version_id UUID NOT NULL REFERENCES prediction_model_versions(id),
  challenger_model_version_id UUID NOT NULL REFERENCES prediction_model_versions(id),
  traffic_split_percentage INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_quality_metrics (
  id UUID PRIMARY KEY,
  model_version_id UUID NOT NULL REFERENCES prediction_model_versions(id) ON DELETE CASCADE,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  prediction_accuracy NUMERIC(5,2) NOT NULL,
  calibration_error NUMERIC(5,2) NOT NULL,
  intervention_success_rate NUMERIC(5,2) NOT NULL,
  false_positive_rate NUMERIC(5,2) NOT NULL,
  false_negative_rate NUMERIC(5,2) NOT NULL,
  forecast_drift NUMERIC(5,2) NOT NULL,
  model_stability NUMERIC(5,2) NOT NULL
);

CREATE TABLE prediction_history (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  overall_readiness_score NUMERIC(5,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_metrics (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  latency_ms INTEGER NOT NULL,
  evidence_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_audit_logs (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_thresholds (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES prediction_profiles(id) ON DELETE CASCADE,
  threshold_name VARCHAR(255) NOT NULL,
  threshold_value NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
