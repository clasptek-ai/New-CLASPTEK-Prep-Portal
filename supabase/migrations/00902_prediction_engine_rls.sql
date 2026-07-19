-- Migration: 00902_prediction_engine_rls
-- Description: Row-Level Security policies for Readiness & Prediction Engine Domain
-- Created At: 2026-07-16

ALTER TABLE prediction_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_feature_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_thresholds ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- ADMIN: Full access to all tables
-- ─────────────────────────────────────────────

CREATE POLICY admin_all_pred_models       ON prediction_models            FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_versions     ON prediction_model_versions    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_profiles     ON prediction_profiles          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_readiness         ON readiness_predictions        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_readiness_snap    ON readiness_snapshots          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_snap         ON prediction_snapshots          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_features     ON prediction_features          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_feature_sets ON prediction_feature_sets      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_inputs       ON prediction_inputs            FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_outputs      ON prediction_outputs           FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_evidence     ON prediction_evidence          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_explanations ON prediction_explanations      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_calibration  ON prediction_calibration       FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_trends       ON prediction_trends            FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_interv       ON prediction_interventions     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_recs         ON prediction_recommendations   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_experiments  ON prediction_experiments       FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_quality      ON prediction_quality_metrics   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_history      ON prediction_history           FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_metrics      ON prediction_metrics           FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_audit        ON prediction_audit_logs        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY admin_all_pred_thresholds   ON prediction_thresholds        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ─────────────────────────────────────────────
-- REVIEWER: Full read, write to calibration, quality, and experiments
-- ─────────────────────────────────────────────

CREATE POLICY rev_all_pred_experiments ON prediction_experiments FOR ALL USING (auth.jwt() ->> 'role' = 'reviewer');
CREATE POLICY rev_all_pred_calibration ON prediction_calibration FOR ALL USING (auth.jwt() ->> 'role' = 'reviewer');
CREATE POLICY rev_all_pred_quality     ON prediction_quality_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'reviewer');
CREATE POLICY rev_read_readiness       ON readiness_predictions FOR SELECT USING (auth.jwt() ->> 'role' = 'reviewer');
CREATE POLICY rev_read_interv         ON prediction_interventions FOR SELECT USING (auth.jwt() ->> 'role' = 'reviewer');
CREATE POLICY rev_read_recs           ON prediction_recommendations FOR SELECT USING (auth.jwt() ->> 'role' = 'reviewer');

-- ─────────────────────────────────────────────
-- STUDENT: Read own published predictions and details
-- ─────────────────────────────────────────────

CREATE POLICY student_read_own_predictions ON readiness_predictions
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
    AND status = 'PUBLISHED'
  );

CREATE POLICY student_read_own_readiness_snap ON readiness_snapshots
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

CREATE POLICY student_read_own_pred_snap ON prediction_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM readiness_predictions rp
      WHERE rp.id = prediction_snapshots.prediction_id
        AND rp.student_id = (auth.jwt() ->> 'sub')::UUID
        AND rp.status = 'PUBLISHED'
    )
  );

CREATE POLICY student_read_own_feature_sets ON prediction_feature_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM readiness_predictions rp
      WHERE rp.id = prediction_feature_sets.prediction_id
        AND rp.student_id = (auth.jwt() ->> 'sub')::UUID
        AND rp.status = 'PUBLISHED'
    )
  );

CREATE POLICY student_read_own_evidence ON prediction_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM readiness_predictions rp
      WHERE rp.id = prediction_evidence.prediction_id
        AND rp.student_id = (auth.jwt() ->> 'sub')::UUID
        AND rp.status = 'PUBLISHED'
    )
  );

CREATE POLICY student_read_own_explanations ON prediction_explanations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM readiness_predictions rp
      WHERE rp.id = prediction_explanations.prediction_id
        AND rp.student_id = (auth.jwt() ->> 'sub')::UUID
        AND rp.status = 'PUBLISHED'
    )
  );

CREATE POLICY student_read_own_trends ON prediction_trends
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM readiness_predictions rp
      WHERE rp.id = prediction_trends.prediction_id
        AND rp.student_id = (auth.jwt() ->> 'sub')::UUID
        AND rp.status = 'PUBLISHED'
    )
  );

CREATE POLICY student_read_own_interventions ON prediction_interventions
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

CREATE POLICY student_read_own_recommendations ON prediction_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prediction_interventions pi
      WHERE pi.id = prediction_recommendations.intervention_id
        AND pi.student_id = (auth.jwt() ->> 'sub')::UUID
    )
  );

CREATE POLICY student_read_own_history ON prediction_history
  FOR SELECT USING (
    student_id = (auth.jwt() ->> 'sub')::UUID
  );

-- ─────────────────────────────────────────────
-- PUBLIC READ: Active models, versions, profiles, features, thresholds
-- ─────────────────────────────────────────────

CREATE POLICY public_read_pred_models ON prediction_models
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY public_read_pred_versions ON prediction_model_versions
  FOR SELECT USING (is_current = TRUE);

CREATE POLICY public_read_pred_profiles ON prediction_profiles
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY public_read_pred_features ON prediction_features
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY public_read_pred_thresholds ON prediction_thresholds
  FOR SELECT USING (TRUE);
