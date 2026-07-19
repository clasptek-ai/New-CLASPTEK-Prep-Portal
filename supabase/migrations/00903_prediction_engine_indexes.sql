-- Migration: 00903_prediction_engine_indexes
-- Description: Core indexes for high-performance retrieval in the Prediction Engine Domain
-- Created At: 2026-07-16

-- Primary aggregates lookups
CREATE INDEX idx_readiness_preds_student    ON readiness_predictions (student_id);
CREATE INDEX idx_readiness_preds_profile    ON readiness_predictions (profile_id);
CREATE INDEX idx_readiness_preds_version    ON readiness_predictions (model_version_id);
CREATE INDEX idx_readiness_preds_created    ON readiness_predictions (created_at DESC);

-- Partial index for active student lookups (matches RLS)
CREATE INDEX idx_readiness_preds_published  ON readiness_predictions (student_id) WHERE status = 'PUBLISHED';

-- Snapshots index lookups
CREATE INDEX idx_readiness_snaps_student    ON readiness_snapshots (student_id);
CREATE INDEX idx_pred_snaps_prediction      ON prediction_snapshots (prediction_id);
CREATE INDEX idx_pred_snaps_readiness_snap  ON prediction_snapshots (readiness_snapshot_id);

-- Features registry indexes
CREATE INDEX idx_pred_feat_sets_prediction  ON prediction_feature_sets (prediction_id);
CREATE INDEX idx_pred_inputs_prediction     ON prediction_inputs (prediction_id);
CREATE INDEX idx_pred_outputs_prediction    ON prediction_outputs (prediction_id);

-- Evidence & Explanation indexes
CREATE INDEX idx_pred_evidence_prediction   ON prediction_evidence (prediction_id);
CREATE INDEX idx_pred_expl_prediction       ON prediction_explanations (prediction_id);
CREATE INDEX idx_pred_trends_prediction     ON prediction_trends (prediction_id);

-- Interventions & Recommendations indexes
CREATE INDEX idx_pred_interv_prediction     ON prediction_interventions (prediction_id);
CREATE INDEX idx_pred_interv_student        ON prediction_interventions (student_id);
CREATE INDEX idx_pred_recs_intervention     ON prediction_recommendations (intervention_id);

-- Time-series history logging index
CREATE INDEX idx_pred_hist_student          ON prediction_history (student_id, recorded_at DESC);
CREATE INDEX idx_pred_hist_prediction       ON prediction_history (prediction_id);

-- Metrics & Audit logging indexes
CREATE INDEX idx_pred_metrics_prediction    ON prediction_metrics (prediction_id);
CREATE INDEX idx_pred_audit_prediction      ON prediction_audit_logs (prediction_id);

-- JSONB indexes for complex properties query search
CREATE INDEX idx_readiness_snaps_mastery    ON readiness_snapshots USING GIN (competency_mastery);
CREATE INDEX idx_pred_feat_sets_features    ON prediction_feature_sets USING GIN (features);
