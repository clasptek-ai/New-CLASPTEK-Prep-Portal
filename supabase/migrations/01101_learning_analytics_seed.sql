-- Migration: 01101_learning_analytics_seed.sql
-- Bounded Context: Learning Analytics & Instructor Intelligence

INSERT INTO metric_definitions (id, code, display_name, formula, owner, refresh_frequency, unit, target) VALUES
('1e57c6b0-7dfd-4b82-aa2d-05bb846a815a', 'COMPLETION_RATE', 'Completion Rate', 'CompletedTasks / TotalTasks', 'Academic Operations', 'DAILY', '%', '90.00'),
('3ea17972-ccf2-4bc4-b778-d4508492211e', 'READINESS_SCORE', 'Readiness Score', 'Weighted average of mastery levels', 'Student Journey Team', 'DAILY', 'points', '75.00'),
('81b7e411-4f9b-44ae-932d-304c45bb2aa0', 'AVERAGE_STUDY_TIME', 'Average Study Time', 'Sum(StudyMinutes) / ActiveDays', 'Product Analytics', 'DAILY', 'minutes', '45.00'),
('cb173420-74cb-4467-9c98-d14210c4d872', 'PREDICTION_ACCURACY', 'Prediction Accuracy', '1 - (MAE / Range)', 'Prediction Engine Team', 'WEEKLY', '%', '85.00'),
('f8bb1a40-3a1b-419b-a010-82a1b0cd93a1', 'INTERVENTION_SUCCESS_RATE', 'Intervention Success Rate', 'CompletedInterventions / InitiatedInterventions', 'Student Success', 'WEEKLY', '%', '80.00')
ON CONFLICT (code) DO NOTHING;

INSERT INTO widget_definitions (id, widget_type, display_name, default_config) VALUES
('91b2c4d0-4fa2-43bb-a5a5-9df084da82fa', 'READINESS_DIAL', 'Readiness Score Indicator', '{"theme": "gauge", "color": "blue"}'),
('e31b79f0-2cc4-43ff-a1a1-cfcd84b91aa1', 'COMPETENCY_HEATMAP', 'Competency Strength Heatmap', '{"theme": "grid", "color": "heatmap"}'),
('22ffc3a0-7ff2-499b-bcba-f481cba908d0', 'STUDY_TIME_BAR', 'Study Time distribution', '{"theme": "bar", "color": "green"}'),
('bba8cc40-8dd2-4bbf-a9ee-ffb17ba918da', 'COHORT_RISK_MATRIX', 'Risk and Intervention Matrix', '{"theme": "scatter", "color": "red_yellow_green"}')
ON CONFLICT (widget_type) DO NOTHING;

INSERT INTO report_definitions (id, code, name, template_json) VALUES
('b31d4ee0-cd24-411a-a1b1-ffbba7c80da0', 'WEEKLY_STUDENT_STATUS', 'Weekly Student Progress Report', '{"format": "PDF", "sections": ["Overview", "Readiness", "Actions"]}')
ON CONFLICT (code) DO NOTHING;
