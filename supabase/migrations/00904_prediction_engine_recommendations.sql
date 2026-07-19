-- Migration: 00904_prediction_engine_recommendations.sql
-- Bounded Context: Readiness & Prediction Engine
-- Created At: 2026-07-16

-- 1. Create prediction_feature_catalogue
CREATE TABLE prediction_feature_catalogue (
  id UUID PRIMARY KEY,
  feature_code VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  source_domain VARCHAR(255) NOT NULL,
  normalization_method VARCHAR(255) NOT NULL,
  default_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create prediction_outcomes (closing the loop on accuracy)
CREATE TABLE prediction_outcomes (
  id UUID PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES readiness_predictions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  predicted_score NUMERIC(5,2) NOT NULL,
  actual_score NUMERIC(5,2) NOT NULL,
  variance NUMERIC(5,2) NOT NULL,
  calibration_delta NUMERIC(5,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create prediction_intervention_catalogue
CREATE TABLE prediction_intervention_catalogue (
  id UUID PRIMARY KEY,
  intervention_type VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  target_resource_id UUID,
  target_competency_code VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create prediction_learning_velocity_history
CREATE TABLE prediction_learning_velocity_history (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  active_hours NUMERIC(5,2) NOT NULL,
  questions_answered INTEGER NOT NULL,
  acceleration_rate NUMERIC(5,2) NOT NULL,
  stagnation_indicator BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Alter prediction_model_versions to include lineage fields
ALTER TABLE prediction_model_versions
  ADD COLUMN supersedes_version_id UUID REFERENCES prediction_model_versions(id),
  ADD COLUMN trained_from_dataset VARCHAR(255),
  ADD COLUMN calibration_dataset_ref VARCHAR(255),
  ADD COLUMN deployment_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN retirement_date TIMESTAMP WITH TIME ZONE;

-- 6. Alter prediction_explanations to include explainability scores and competency mapping
ALTER TABLE prediction_explanations
  ADD COLUMN certainty_score NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN top_influencing_competencies JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN strongest_risk_indicators JSONB NOT NULL DEFAULT '[]';

-- 7. Enable Row-Level Security
ALTER TABLE prediction_feature_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_intervention_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_learning_velocity_history ENABLE ROW LEVEL SECURITY;

-- 8. Define Row-Level Security Policies

-- prediction_feature_catalogue
CREATE POLICY admin_all_pred_feat_cat ON prediction_feature_catalogue FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY public_read_pred_feat_cat ON prediction_feature_catalogue FOR SELECT USING (TRUE);

-- prediction_outcomes
CREATE POLICY admin_all_pred_outcomes ON prediction_outcomes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY student_read_own_outcomes ON prediction_outcomes FOR SELECT USING (student_id = (auth.jwt() ->> 'sub')::UUID);
CREATE POLICY rev_read_outcomes ON prediction_outcomes FOR SELECT USING (auth.jwt() ->> 'role' = 'reviewer');

-- prediction_intervention_catalogue
CREATE POLICY admin_all_pred_interv_cat ON prediction_intervention_catalogue FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY public_read_pred_interv_cat ON prediction_intervention_catalogue FOR SELECT USING (TRUE);

-- prediction_learning_velocity_history
CREATE POLICY admin_all_pred_velocity ON prediction_learning_velocity_history FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY student_read_own_velocity ON prediction_learning_velocity_history FOR SELECT USING (student_id = (auth.jwt() ->> 'sub')::UUID);
