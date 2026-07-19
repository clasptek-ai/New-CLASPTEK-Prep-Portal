-- Migration: 00901_prediction_engine_seed.sql
-- Bounded Context: Readiness & Prediction Engine
-- Created At: 2026-07-16

-- Seed Prediction Models
INSERT INTO prediction_models (id, model_code, display_name, algorithm_type, is_active, created_at, updated_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'BAYESIAN_PREDICTOR', 'Bayesian Knowledge Tracing Predictor', 'BAYESIAN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000002', 'REGRESSION_PREDICTOR', 'Linear & Logistic Regression Predictor', 'REGRESSION', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000003', 'ENSEMBLE_PREDICTOR', 'Ensemble Random Forest Predictor', 'ENSEMBLE', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000004', 'WEIGHTED_RUBRIC_PREDICTOR', 'Weighted Academic Rubric Predictor', 'WEIGHTED_RUBRIC', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000005', 'MOCK_PREDICTOR', 'Deterministic Mock Predictor for CI/Tests', 'MOCK', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Prediction Model Versions
INSERT INTO prediction_model_versions (id, model_id, version_string, configuration, is_current, trained_at, created_at) VALUES
('b0000000-0000-0000-0000-000000000101', 'b0000000-0000-0000-0000-000000000001', 'v1.0.0', '{"p_init": 0.5, "p_transit": 0.1, "p_slip": 0.1, "p_guess": 0.2}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000102', 'b0000000-0000-0000-0000-000000000002', 'v1.0.0', '{"weights": {"velocity": 0.3, "accuracy": 0.5, "momentum": 0.2}}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000103', 'b0000000-0000-0000-0000-000000000003', 'v1.0.0', '{"n_estimators": 100, "max_depth": 10}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000104', 'b0000000-0000-0000-0000-000000000004', 'v1.0.0', '{"weights": {"writing": 0.4, "speaking": 0.3, "listening": 0.15, "reading": 0.15}}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000105', 'b0000000-0000-0000-0000-000000000005', 'v1.0.0', '{"mock_score": 75.0, "mock_confidence": 0.90}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Prediction Profiles
INSERT INTO prediction_profiles (id, profile_code, display_name, exam_context, confidence_rules, score_mappings, is_active, created_at) VALUES
('b0000000-0000-0000-0000-000000000201', 'IELTS_ACADEMIC', 'IELTS Academic Readiness Profile', 'IELTS', '{"min_evidence": 5, "min_days": 14}', '{"target": 7.5, "scale": "band"}', TRUE, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000202', 'TOEFL_IBT', 'TOEFL iBT Readiness Profile', 'TOEFL', '{"min_evidence": 8, "min_days": 21}', '{"target": 100, "scale": "points"}', TRUE, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000203', 'SAT_DIGITAL', 'Digital SAT Readiness Profile', 'SAT', '{"min_evidence": 10, "min_days": 30}', '{"target": 1400, "scale": "points"}', TRUE, CURRENT_TIMESTAMP),
('b0000000-0000-0000-0000-000000000204', 'INTERNAL_PREP', 'Internal Diagnostic Readiness Profile', 'Internal', '{"min_evidence": 3, "min_days": 7}', '{"target": 80, "scale": "percentage"}', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Prediction Features (Rec 2)
INSERT INTO prediction_features (id, feature_code, display_name, data_type, description, is_active, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'ACCURACY_RATE', 'Average Evaluation Accuracy Rate', 'FLOAT', 'Overall accuracy percentage across evaluated subjective/objective questions', TRUE, CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000002', 'STUDY_VELOCITY', 'Learning Velocity', 'FLOAT', 'Average competency items covered per week', TRUE, CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000003', 'STUDY_MOMENTUM', 'Recent Study Momentum', 'FLOAT', 'Study hours logged in the last 7 days', TRUE, CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000004', 'STREAK_COUNT', 'Current Study Streak', 'INTEGER', 'Number of consecutive active study days', TRUE, CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000005', 'COMPETENCY_MASTERY', 'Overall Competency Mastery', 'FLOAT', 'Ratio of mastered competencies to target curriculum requirements', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Prediction Thresholds
INSERT INTO prediction_thresholds (id, profile_id, threshold_name, threshold_value, created_at) VALUES
('e9000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000201', 'PASSING_SCORE', 6.5, CURRENT_TIMESTAMP),
('e9000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000201', 'TARGET_SCORE', 7.5, CURRENT_TIMESTAMP),
('e9000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000202', 'PASSING_SCORE', 80.0, CURRENT_TIMESTAMP),
('e9000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000202', 'TARGET_SCORE', 100.0, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
