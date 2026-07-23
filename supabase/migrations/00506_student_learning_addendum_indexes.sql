-- Migration: 00506_student_learning_addendum_indexes
-- Description: Performance indexes for Sprint 2.5 Addendum tables

-- student_learning_profiles
CREATE INDEX IF NOT EXISTS idx_slp_student_id ON student_learning_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_slp_pace ON student_learning_profiles(learning_pace);

-- student_programme_enrollments (added columns)
CREATE INDEX IF NOT EXISTS idx_spe_target_date ON student_programme_enrollments(target_exam_date);

-- student_progress
CREATE INDEX IF NOT EXISTS idx_sp_journey_id ON student_progress(journey_id);
CREATE INDEX IF NOT EXISTS idx_sp_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_sp_readiness ON student_progress(readiness_score DESC);
CREATE INDEX IF NOT EXISTS idx_sp_readiness_level ON student_progress(readiness_level);

-- student_interventions
CREATE INDEX IF NOT EXISTS idx_si_journey_id ON student_interventions(journey_id);
CREATE INDEX IF NOT EXISTS idx_si_student_id ON student_interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_si_status ON student_interventions(status);
CREATE INDEX IF NOT EXISTS idx_si_type ON student_interventions(intervention_type);

-- intervention_history
CREATE INDEX IF NOT EXISTS idx_ih_intervention_id ON intervention_history(intervention_id);

-- student_alerts
CREATE INDEX IF NOT EXISTS idx_sa_student_id ON student_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_sa_read ON student_alerts(student_id, is_read);
