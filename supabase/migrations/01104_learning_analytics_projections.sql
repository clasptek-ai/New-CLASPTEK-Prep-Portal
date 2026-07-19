-- Migration: 01104_learning_analytics_projections.sql
-- Bounded Context: Learning Analytics & Instructor Intelligence

CREATE OR REPLACE VIEW view_active_cohort_risk_summary AS
SELECT 
    cohort_id,
    COUNT(*) as total_students,
    COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_risk_count,
    COUNT(CASE WHEN risk_level = 'MEDIUM' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN risk_level = 'LOW' THEN 1 END) as low_risk_count
FROM cohort_analytics
CROSS JOIN LATERAL jsonb_to_record(risk_distribution) as rd(risk_level VARCHAR(50))
GROUP BY cohort_id;
