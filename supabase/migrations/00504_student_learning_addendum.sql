-- Migration: 00504_student_learning_addendum
-- Description: Schema additions for Sprint 2.5 Addendum (Learning Pace, Target Exam Date, Readiness Engine, Intervention Engine)

-- ═══════════════════════════════════════════════════════
-- 1. Student Learning Profiles (Enhancement 1)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_learning_profiles (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL UNIQUE,
    learning_pace VARCHAR(50) DEFAULT 'Standard' NOT NULL
        CHECK (learning_pace IN ('Accelerated', 'Standard', 'Flexible', 'Intensive', 'Self-Paced')),
    weekly_study_hours DECIMAL(5,2) DEFAULT 10.00 NOT NULL,
    estimated_completion_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 2. Target Exam Date & Score Alterations (Enhancement 2)
-- ═══════════════════════════════════════════════════════
ALTER TABLE student_programme_enrollments
    ADD COLUMN IF NOT EXISTS target_exam_date DATE,
    ADD COLUMN IF NOT EXISTS target_score DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS exam_registration_status VARCHAR(50) DEFAULT 'NOT_REGISTERED'
        CHECK (exam_registration_status IN ('NOT_REGISTERED', 'REGISTERED', 'CONFIRMED', 'PASSED', 'DEFERRED'));

-- ═══════════════════════════════════════════════════════
-- 3. Student Progress & Readiness Engine (Enhancement 3)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE UNIQUE,
    student_id UUID NOT NULL UNIQUE,
    readiness_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL
        CHECK (readiness_score >= 0 AND readiness_score <= 100),
    readiness_level VARCHAR(50) DEFAULT 'HIGH_RISK' NOT NULL
        CHECK (readiness_level IN ('HIGH_RISK', 'NEEDS_IMPROVEMENT', 'NEARLY_READY', 'EXAM_READY')),
    last_readiness_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 4. Intervention Engine Tables (Enhancement 4)
-- ═══════════════════════════════════════════════════════

-- Intervention Rules Catalogue
CREATE TABLE IF NOT EXISTS intervention_rules (
    id UUID PRIMARY KEY,
    rule_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    condition_type VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(10,2),
    action_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Student Interventions Aggregate
CREATE TABLE IF NOT EXISTS student_interventions (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    rule_code VARCHAR(100) REFERENCES intervention_rules(rule_code),
    intervention_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL
        CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    trigger_reason VARCHAR(200) NOT NULL,
    action_recommended VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- Intervention History
CREATE TABLE IF NOT EXISTS intervention_history (
    id UUID PRIMARY KEY,
    intervention_id UUID REFERENCES student_interventions(id) ON DELETE CASCADE,
    actor_id UUID,
    action_taken VARCHAR(100) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Student Alerts
CREATE TABLE IF NOT EXISTS student_alerts (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL
        CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
