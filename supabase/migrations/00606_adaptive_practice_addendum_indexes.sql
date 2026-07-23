-- Migration: 00606_adaptive_practice_addendum_indexes
-- Description: Performance indexes for Sprint 2.6 Addendum tables

-- practice_goals
CREATE INDEX IF NOT EXISTS idx_pg_student_id ON practice_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_pg_status ON practice_goals(status);

-- retention_profiles
CREATE INDEX IF NOT EXISTS idx_rp_student_id ON retention_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_rp_next_review ON retention_profiles(next_review_date);
CREATE INDEX IF NOT EXISTS idx_rp_priority ON retention_profiles(review_priority);

-- daily_goals
CREATE INDEX IF NOT EXISTS idx_dg_student_date ON daily_goals(student_id, target_date);
CREATE INDEX IF NOT EXISTS idx_dg_status ON daily_goals(status);

-- practice_motivation
CREATE INDEX IF NOT EXISTS idx_pm_student_id ON practice_motivation(student_id);
CREATE INDEX IF NOT EXISTS idx_pm_xp ON practice_motivation(xp DESC);

-- practice_analytics_projections
CREATE INDEX IF NOT EXISTS idx_pap_student_id ON practice_analytics_projections(student_id);
