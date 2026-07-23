-- Migration: 00604_adaptive_practice_addendum
-- Description: Database schema extensions for Sprint 2.6 Addendum (Practice Goals, Retention Profiles, Daily Goals, Motivation, Analytics Projections, Confidence Tracking)

-- ═══════════════════════════════════════════════════════
-- 1. Practice Goals (Enhancement 1)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_goals (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    journey_id UUID,
    goal_type VARCHAR(100) NOT NULL,
    goal_title VARCHAR(200) NOT NULL,
    goal_description TEXT,
    target_value DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 2. Knowledge Retention Profiles (Enhancement 2)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS retention_profiles (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    competency_id UUID NOT NULL,
    last_reviewed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    retention_score DECIMAL(5,2) DEFAULT 100.00 NOT NULL
        CHECK (retention_score >= 0 AND retention_score <= 100),
    review_interval INT DEFAULT 24 NOT NULL, -- Hours
    next_review_date TIMESTAMPTZ NOT NULL,
    review_priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL
        CHECK (review_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (student_id, competency_id)
);

-- ═══════════════════════════════════════════════════════
-- 3. Confidence Tracking Alteration (Enhancement 4)
-- ═══════════════════════════════════════════════════════
ALTER TABLE practice_session_questions
    ADD COLUMN IF NOT EXISTS confidence_level VARCHAR(50) DEFAULT 'MEDIUM'
        CHECK (confidence_level IN ('LOW', 'MEDIUM', 'HIGH', 'EXPERT')),
    ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.50
        CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0);

-- ═══════════════════════════════════════════════════════
-- 4. Adaptive Daily Goals (Enhancement 7)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_goals (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    target_date DATE DEFAULT CURRENT_DATE NOT NULL,
    target_questions INT DEFAULT 15 NOT NULL,
    target_passages INT DEFAULT 2 NOT NULL,
    timed_practice_required BOOLEAN DEFAULT FALSE NOT NULL,
    vocabulary_review_required BOOLEAN DEFAULT FALSE NOT NULL,
    completed_questions INT DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL
        CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED')),
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (student_id, target_date)
);

-- ═══════════════════════════════════════════════════════
-- 5. Motivation Engine Persistence (Enhancement 9)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_motivation (
    id UUID PRIMARY KEY,
    student_id UUID UNIQUE NOT NULL,
    daily_streak INT DEFAULT 0 NOT NULL,
    weekly_streak INT DEFAULT 0 NOT NULL,
    longest_streak INT DEFAULT 0 NOT NULL,
    practice_points INT DEFAULT 0 NOT NULL,
    xp INT DEFAULT 0 NOT NULL,
    badges JSONB DEFAULT '[]'::jsonb NOT NULL,
    achievements JSONB DEFAULT '[]'::jsonb NOT NULL,
    milestones JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════
-- 6. Practice Analytics Projections (Enhancement 5 & 8)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS practice_analytics_projections (
    id UUID PRIMARY KEY,
    student_id UUID UNIQUE NOT NULL,
    accuracy_trend JSONB DEFAULT '[]'::jsonb NOT NULL,
    speed_trend JSONB DEFAULT '[]'::jsonb NOT NULL,
    mastery_trend JSONB DEFAULT '[]'::jsonb NOT NULL,
    retention_trend JSONB DEFAULT '[]'::jsonb NOT NULL,
    weak_skills JSONB DEFAULT '[]'::jsonb NOT NULL,
    strong_skills JSONB DEFAULT '[]'::jsonb NOT NULL,
    practice_frequency DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    consistency_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    total_study_time_ms BIGINT DEFAULT 0 NOT NULL,
    total_questions_answered INT DEFAULT 0 NOT NULL,
    hints_used INT DEFAULT 0 NOT NULL,
    skipped_questions INT DEFAULT 0 NOT NULL,
    bookmark_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
