-- Migration: 00600_adaptive_practice
-- Description: Adaptive Practice Domain — core schema
-- Incorporates: PracticePlan separation, Strategy Registry, Recommendation Audits,
--               AdaptiveSnapshots, Spaced Repetition (SpacingPolicy),
--               Expanded Feedback, and Analytics Readiness metrics.

-- ═══════════════════════════════════════════════════════
-- 1. Strategy Registry (Rec 2)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_strategy_registry (
    strategy_code VARCHAR(100) PRIMARY KEY,
    display_name VARCHAR(200) NOT NULL,
    algorithm_version VARCHAR(50) NOT NULL,
    configuration_schema JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'DEPRECATED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 2. Adaptive Snapshots (Rec 4)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS adaptive_snapshots (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    competency_levels JSONB NOT NULL, -- Map of competencyId -> masteryScore
    difficulty_profile JSONB NOT NULL, -- Contains minLevel, maxLevel, progressionRate
    weak_areas JSONB NOT NULL, -- Array of weak competency IDs
    strengths JSONB NOT NULL, -- Array of strong competency IDs
    recommendation_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════
-- 3. Practice Recommendations (Rec 3, 7)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_recommendations (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    recommendation_rules JSONB,
    recommendation_source VARCHAR(100) NOT NULL, -- e.g. 'AI_GENERATED', 'INSTRUCTOR', 'SYSTEM'
    priority VARCHAR(50) NOT NULL
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    priority_weight DECIMAL(5,2) DEFAULT 1.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL
        CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    -- Audit trail for AI transparency (Rec 3)
    input_snapshot JSONB NOT NULL,
    algorithm_version VARCHAR(50) NOT NULL,
    decision_trace JSONB NOT NULL,
    output_payload JSONB NOT NULL,
    lock_version INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════
-- 4. Practice Plans (Rec 1, 5, 11)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_plans (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    recommendation_id UUID REFERENCES practice_recommendations(id) ON DELETE SET NULL,
    title VARCHAR(200),
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL
        CHECK (status IN ('DRAFT', 'GENERATED', 'SCHEDULED', 'DISCARDED')),
    selection_rules JSONB NOT NULL, -- Selection blueprints (Rec 5)
    targeted_competencies JSONB NOT NULL, -- Competency target constraints
    spacing_policy JSONB NOT NULL, -- Review intervals, expansion factors (Rec 11)
    lock_version INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════
-- 5. Practice Sessions (Rec 1)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    plan_id UUID REFERENCES practice_plans(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL
        CHECK (status IN ('DRAFT', 'GENERATED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_ms INT DEFAULT 0,
    lock_version INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════
-- 6. Practice Session Questions
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_session_questions (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_version_id UUID NOT NULL,
    order_index INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL
        CHECK (status IN ('PENDING', 'COMPLETED', 'SKIPPED')),
    accuracy DECIMAL(5,2), -- e.g. 100.00 for correct, 0.00 for incorrect, null if skipped
    time_spent_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 7. Difficulty Progression Audit (Rec 6)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_difficulty_history (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    previous_level VARCHAR(50) NOT NULL,
    current_level VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    promotion_reason TEXT,
    demotion_reason TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 8. Practice Feedback (Rec 12)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_feedback (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    difficulty_perception VARCHAR(100), -- 'TOO_EASY', 'EASY', 'JUST_RIGHT', 'HARD', 'TOO_HARD'
    confidence VARCHAR(100), -- 'LOW', 'MEDIUM', 'HIGH'
    satisfaction VARCHAR(100), -- perceived satisfaction
    usefulness VARCHAR(100), -- perceived usefulness
    technical_issue BOOLEAN DEFAULT FALSE,
    recommendation_quality VARCHAR(100),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 9. Analytics Readiness & Historical Stats (Rec 16)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_history (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    competency_coverage_achieved JSONB NOT NULL,
    average_question_difficulty DECIMAL(5,2) NOT NULL,
    recommendation_acceptance_rate DECIMAL(5,2) NOT NULL,
    abandoned_sessions INT DEFAULT 0 NOT NULL,
    regeneration_count INT DEFAULT 0 NOT NULL,
    average_adaptation_confidence DECIMAL(5,2) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_statistics (
    id UUID PRIMARY KEY,
    student_id UUID UNIQUE NOT NULL,
    total_sessions_completed INT DEFAULT 0 NOT NULL,
    total_questions_answered INT DEFAULT 0 NOT NULL,
    overall_accuracy DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    recommendations_accepted INT DEFAULT 0 NOT NULL,
    recommendations_rejected INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
