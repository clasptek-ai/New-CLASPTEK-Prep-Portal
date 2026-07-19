-- Migration: 00503_student_learning_indexes
-- Description: Performance indexes for Student Learning Journey Domain
-- Targets: <150ms journey retrieval, <250ms dashboard, <200ms progress, <300ms timeline

-- student_learning_journeys
CREATE INDEX IF NOT EXISTS idx_slj_student_id ON student_learning_journeys(student_id);
CREATE INDEX IF NOT EXISTS idx_slj_status ON student_learning_journeys(status);
CREATE INDEX IF NOT EXISTS idx_slj_student_status ON student_learning_journeys(student_id, status);
CREATE INDEX IF NOT EXISTS idx_slj_created_at ON student_learning_journeys(created_at DESC);

-- student_programme_enrollments
CREATE INDEX IF NOT EXISTS idx_spe_journey_id ON student_programme_enrollments(journey_id);
CREATE INDEX IF NOT EXISTS idx_spe_student_id ON student_programme_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_spe_programme_id ON student_programme_enrollments(programme_id);
CREATE INDEX IF NOT EXISTS idx_spe_student_programme ON student_programme_enrollments(student_id, programme_id);
CREATE INDEX IF NOT EXISTS idx_spe_status ON student_programme_enrollments(enrollment_status);

-- learning_goals
CREATE INDEX IF NOT EXISTS idx_lg_journey_id ON learning_goals(journey_id);
CREATE INDEX IF NOT EXISTS idx_lg_status ON learning_goals(status);
CREATE INDEX IF NOT EXISTS idx_lg_journey_status ON learning_goals(journey_id, status);
CREATE INDEX IF NOT EXISTS idx_lg_programme_id ON learning_goals(programme_id);

-- study_sessions
CREATE INDEX IF NOT EXISTS idx_ss_journey_id ON study_sessions(journey_id);
CREATE INDEX IF NOT EXISTS idx_ss_programme_id ON study_sessions(programme_id);
CREATE INDEX IF NOT EXISTS idx_ss_started_at ON study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ss_journey_started ON study_sessions(journey_id, started_at DESC);

-- competency_progress
CREATE INDEX IF NOT EXISTS idx_cp_journey_id ON competency_progress(journey_id);
CREATE INDEX IF NOT EXISTS idx_cp_competency_id ON competency_progress(competency_id);
CREATE INDEX IF NOT EXISTS idx_cph_competency_id ON competency_progress_history(competency_progress_id);

-- module_progress
CREATE INDEX IF NOT EXISTS idx_mp_journey_id ON module_progress(journey_id);
CREATE INDEX IF NOT EXISTS idx_mp_enrollment_id ON module_progress(programme_enrollment_id);

-- lesson_progress
CREATE INDEX IF NOT EXISTS idx_lp_journey_id ON lesson_progress(journey_id);
CREATE INDEX IF NOT EXISTS idx_lp_module_progress ON lesson_progress(module_progress_id);

-- journey_events (event stream)
CREATE INDEX IF NOT EXISTS idx_je_journey_id ON journey_events(journey_id);
CREATE INDEX IF NOT EXISTS idx_je_occurred_at ON journey_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_je_event_name ON journey_events(event_name);
CREATE INDEX IF NOT EXISTS idx_je_journey_occurred ON journey_events(journey_id, occurred_at DESC);

-- achievements
CREATE INDEX IF NOT EXISTS idx_ach_journey_id ON achievements(journey_id);
CREATE INDEX IF NOT EXISTS idx_ach_type ON achievements(achievement_type);

-- bookmarks
CREATE INDEX IF NOT EXISTS idx_bm_journey_id ON bookmarks(journey_id);
CREATE INDEX IF NOT EXISTS idx_bm_resource_type ON bookmarks(resource_type);

-- dashboard projection
CREATE INDEX IF NOT EXISTS idx_sdp_student_id ON student_dashboard_projections(student_id);

-- milestones
CREATE INDEX IF NOT EXISTS idx_lm_journey_id ON learning_milestones(journey_id);
CREATE INDEX IF NOT EXISTS idx_lm_completed ON learning_milestones(completed);
