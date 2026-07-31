-- Migration: 00506_student_learning_addendum_indexes
-- Description: Performance indexes for Sprint 2.5 Addendum tables

DO $$
BEGIN
    -- student_learning_profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_learning_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_learning_profiles' AND column_name = 'student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_slp_student_id ON student_learning_profiles(student_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_learning_profiles' AND column_name = 'learning_pace') THEN
            CREATE INDEX IF NOT EXISTS idx_slp_pace ON student_learning_profiles(learning_pace);
        END IF;
    END IF;

    -- student_programme_enrollments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_programme_enrollments') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_programme_enrollments' AND column_name = 'target_exam_date') THEN
            CREATE INDEX IF NOT EXISTS idx_spe_target_date ON student_programme_enrollments(target_exam_date);
        END IF;
    END IF;

    -- student_progress
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'journey_id') THEN
            CREATE INDEX IF NOT EXISTS idx_sp_journey_id ON student_progress(journey_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_sp_student_id ON student_progress(student_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'readiness_score') THEN
            CREATE INDEX IF NOT EXISTS idx_sp_readiness ON student_progress(readiness_score DESC);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'readiness_level') THEN
            CREATE INDEX IF NOT EXISTS idx_sp_readiness_level ON student_progress(readiness_level);
        END IF;
    END IF;

    -- student_interventions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_interventions') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_interventions' AND column_name = 'journey_id') THEN
            CREATE INDEX IF NOT EXISTS idx_si_journey_id ON student_interventions(journey_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_interventions' AND column_name = 'student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_si_student_id ON student_interventions(student_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_interventions' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_si_status ON student_interventions(status);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_interventions' AND column_name = 'intervention_type') THEN
            CREATE INDEX IF NOT EXISTS idx_si_type ON student_interventions(intervention_type);
        END IF;
    END IF;

    -- intervention_history
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intervention_history') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervention_history' AND column_name = 'intervention_id') THEN
            CREATE INDEX IF NOT EXISTS idx_ih_intervention_id ON intervention_history(intervention_id);
        END IF;
    END IF;

    -- student_alerts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_alerts') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_alerts' AND column_name = 'student_id') THEN
            CREATE INDEX IF NOT EXISTS idx_sa_student_id ON student_alerts(student_id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_alerts' AND column_name = 'is_read') THEN
            CREATE INDEX IF NOT EXISTS idx_sa_read ON student_alerts(student_id, is_read);
        END IF;
    END IF;
END $$;
