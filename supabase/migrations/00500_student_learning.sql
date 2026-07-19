-- Migration: 00500_student_learning
-- Description: Student Learning Journey Domain — core schema
-- Incorporates: Separate Enrollment aggregate, Event Stream Timeline, CompetencyHistory,
--               Extended StudySession, LearningPlanVersion, AchievementDefinition,
--               Generalized Bookmarks, JourneyHealth, Privacy model stubs

-- ═══════════════════════════════════════════════════════
-- Achievement Definition Catalogue (Rec 6)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon_key VARCHAR(200),
    unlock_criteria JSONB,
    achievement_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Student Learning Journey (Master Aggregate)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_learning_journeys (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'CREATED' NOT NULL
        CHECK (status IN ('CREATED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
    lock_version INT DEFAULT 0 NOT NULL,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    consistency_score DECIMAL(5,2) DEFAULT 0.00,
    completion_velocity DECIMAL(5,2) DEFAULT 0.00,
    inactivity_days INT DEFAULT 0,
    burnout_risk VARCHAR(50) DEFAULT 'LOW',
    recommendation_priority INT DEFAULT 0,
    consent_given BOOLEAN DEFAULT FALSE,
    data_retention_policy VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journey_health (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE UNIQUE,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    consistency_score DECIMAL(5,2) DEFAULT 0.00,
    completion_velocity DECIMAL(5,2) DEFAULT 0.00,
    inactivity_days INT DEFAULT 0,
    burnout_risk VARCHAR(50) DEFAULT 'LOW',
    recommendation_priority INT DEFAULT 0,
    last_calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Programme Enrollment (Separate Aggregate — Rec 1)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_programme_enrollments (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    programme_id UUID NOT NULL,
    programme_version_id UUID NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    enrollment_status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL
        CHECK (enrollment_status IN ('ACTIVE', 'WITHDRAWN', 'SUSPENDED', 'COMPLETED')),
    delivery_mode VARCHAR(100),
    cohort_id UUID,
    intake_date DATE,
    payment_verified BOOLEAN DEFAULT FALSE,
    instructor_id UUID,
    completion_certificate_id UUID,
    withdrawn_at TIMESTAMPTZ,
    withdrawal_reason TEXT,
    completed_at TIMESTAMPTZ,
    lock_version INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE (journey_id, programme_id)
);

-- ═══════════════════════════════════════════════════════
-- Learning Plans (Versioned — Rec 5)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    title VARCHAR(200),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL
        CHECK (status IN ('ACTIVE', 'ARCHIVED', 'SUPERSEDED')),
    lock_version INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS learning_plan_versions (
    id UUID PRIMARY KEY,
    learning_plan_id UUID REFERENCES learning_plans(id) ON DELETE CASCADE,
    version_no VARCHAR(50) NOT NULL,
    source VARCHAR(100), -- 'AI_GENERATED', 'INSTRUCTOR', 'STUDENT'
    goals JSONB,
    schedule JSONB,
    notes TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (learning_plan_id, version_no)
);

-- ═══════════════════════════════════════════════════════
-- Learning Goals
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS learning_goals (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    programme_id UUID,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    goal_priority VARCHAR(50) DEFAULT 'MEDIUM'
        CHECK (goal_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    target_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════
-- Learning Milestones
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS learning_milestones (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    programme_enrollment_id UUID REFERENCES student_programme_enrollments(id),
    title VARCHAR(300) NOT NULL,
    milestone_type VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Competency Progress + History (Rec 3)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS competency_progress (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL,
    mastery_score DECIMAL(5,2) DEFAULT 0.00
        CHECK (mastery_score >= 0 AND mastery_score <= 100),
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (journey_id, competency_id)
);

CREATE TABLE IF NOT EXISTS competency_progress_history (
    id UUID PRIMARY KEY,
    competency_progress_id UUID REFERENCES competency_progress(id) ON DELETE CASCADE,
    previous_score DECIMAL(5,2),
    new_score DECIMAL(5,2) NOT NULL,
    source VARCHAR(100),
    actor_id UUID,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Module & Lesson Progress
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS module_progress (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    programme_enrollment_id UUID REFERENCES student_programme_enrollments(id),
    module_id UUID NOT NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00
        CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    status VARCHAR(50) DEFAULT 'NOT_STARTED'
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (journey_id, module_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    module_progress_id UUID REFERENCES module_progress(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    duration_ms INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (journey_id, lesson_id)
);

-- ═══════════════════════════════════════════════════════
-- Study Sessions (Extended — Rec 4)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    programme_id UUID,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_ms INT,
    device_type VARCHAR(100),
    platform VARCHAR(100),
    ip_hash VARCHAR(256),
    timezone VARCHAR(100),
    interruption_count INT DEFAULT 0,
    idle_time_ms INT DEFAULT 0,
    completion_reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Study Streaks
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS study_streaks (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_study_date DATE,
    streak_started_at DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Achievements (Definition + Earned — Rec 6)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES achievement_definitions(id),
    achievement_type VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Generalized Bookmarks (Rec 7)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL
        CHECK (resource_type IN ('LESSON', 'MODULE', 'QUESTION', 'RESOURCE', 'PROGRAMME')),
    resource_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (journey_id, resource_type, resource_id)
);

-- ═══════════════════════════════════════════════════════
-- Learning Preferences
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS learning_preferences (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (journey_id, preference_key)
);

-- ═══════════════════════════════════════════════════════
-- Journey Event Stream (Append-only — Rec 2)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS journey_events (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE,
    event_name VARCHAR(200) NOT NULL,
    event_version INT DEFAULT 1,
    payload JSONB,
    actor_id UUID,
    occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Journey Statistics (Analytics Readiness)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS journey_statistics (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE UNIQUE,
    total_study_time_ms BIGINT DEFAULT 0,
    average_session_duration_ms INT DEFAULT 0,
    learning_velocity DECIMAL(8,4) DEFAULT 0.0,
    competency_growth DECIMAL(5,2) DEFAULT 0.00,
    programme_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    goal_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Student Dashboard Projection (Read Model — Rec 10)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS student_dashboard_projections (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE UNIQUE,
    student_id UUID NOT NULL UNIQUE,
    active_programme_id UUID,
    active_programme_name VARCHAR(300),
    overall_progress DECIMAL(5,2) DEFAULT 0.00,
    current_goal_id UUID,
    current_goal_title VARCHAR(300),
    current_streak INT DEFAULT 0,
    next_milestone_id UUID,
    next_milestone_title VARCHAR(300),
    recommendation_payload JSONB,
    last_projected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- Privacy & Compliance Stubs (Rec 12)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS journey_privacy_records (
    id UUID PRIMARY KEY,
    journey_id UUID REFERENCES student_learning_journeys(id) ON DELETE CASCADE UNIQUE,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_given_at TIMESTAMPTZ,
    data_retention_months INT DEFAULT 84,
    deletion_requested_at TIMESTAMPTZ,
    deletion_executed_at TIMESTAMPTZ,
    export_requested_at TIMESTAMPTZ,
    last_audit_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
