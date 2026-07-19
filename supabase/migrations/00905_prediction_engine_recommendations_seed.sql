-- Migration: 00905_prediction_engine_recommendations_seed.sql
-- Bounded Context: Readiness & Prediction Engine
-- Created At: 2026-07-16

-- Seed Feature Catalogue
INSERT INTO prediction_feature_catalogue (id, feature_code, display_name, source_domain, normalization_method, default_weight, version, description, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'ACCURACY_RATE', 'Average Evaluation Accuracy Rate', 'AI Evaluation', 'None', 0.50, 'v1.0.0', 'Overall accuracy percentage across evaluated subjective/objective questions', CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000002', 'STUDY_VELOCITY', 'Learning Velocity', 'Student Learning', 'Log', 0.30, 'v1.0.0', 'Average competency items covered per week', CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000003', 'STUDY_MOMENTUM', 'Recent Study Momentum', 'Student Learning', 'None', 0.20, 'v1.0.0', 'Study hours logged in the last 7 days', CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000004', 'STREAK_COUNT', 'Current Study Streak', 'Student Learning', 'MinMax', 0.10, 'v1.0.0', 'Number of consecutive active study days', CURRENT_TIMESTAMP),
('f0000000-0000-0000-0000-000000000005', 'COMPETENCY_MASTERY', 'Overall Competency Mastery', 'Curriculum', 'None', 0.40, 'v1.0.0', 'Ratio of mastered competencies to target curriculum requirements', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Intervention Catalogue Templates
INSERT INTO prediction_intervention_catalogue (id, intervention_type, title, description, priority, target_resource_id, target_competency_code, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'GRAMMAR_DRILLS', 'Practice Grammar Fundamentals', 'Review auxiliary verbs and sentence structure.', 1, NULL, 'IELTS-GRM-1', CURRENT_TIMESTAMP),
('d0000000-0000-0000-0000-000000000002', 'SPEAKING_MOCK', 'Schedule Speaking Mock Exam', 'Practice real-time speech delivery with an instructor.', 2, NULL, NULL, CURRENT_TIMESTAMP),
('d0000000-0000-0000-0000-000000000003', 'READING_DRILLS', 'Execute Reading Comprehension Exercises', 'Improve scanning and skimming skills on dry articles.', 1, NULL, 'IELTS-RD-2', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
