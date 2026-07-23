-- Migration: 00710_mock_examination
-- Description: Mock Examination Engine Domain schema (blueprints, templates, sections, sessions, attempts, answers, section_scores, results, reports, readiness, statistics)

-- 1. Mock Blueprints (Authoring Aggregate)
CREATE TABLE IF NOT EXISTS mock_blueprints (
    id UUID PRIMARY KEY,
    exam_code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scoring_strategy VARCHAR(50) DEFAULT 'CUSTOM' NOT NULL
        CHECK (scoring_strategy IN ('IELTS', 'TOEFL', 'CELPIP', 'SAT', 'CUSTOM')),
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL
        CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Mock Templates (Execution Aggregate)
CREATE TABLE IF NOT EXISTS mock_templates (
    id UUID PRIMARY KEY,
    blueprint_id UUID REFERENCES mock_blueprints(id) ON DELETE CASCADE,
    version INT DEFAULT 1 NOT NULL,
    parent_template_id UUID,
    published_at TIMESTAMPTZ,
    published_by UUID,
    total_duration_minutes INT DEFAULT 180 NOT NULL,
    passing_score DECIMAL(5,2) DEFAULT 70.00 NOT NULL,
    scoring_strategy VARCHAR(50) DEFAULT 'CUSTOM' NOT NULL,
    status VARCHAR(50) DEFAULT 'PUBLISHED' NOT NULL
        CHECK (status IN ('PUBLISHED', 'DEPRECATED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Mock Template Sections
CREATE TABLE IF NOT EXISTS mock_template_sections (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES mock_templates(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL,
    order_index INT NOT NULL,
    duration_minutes INT DEFAULT 45 NOT NULL,
    question_count INT DEFAULT 20 NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.00 NOT NULL,
    lock_on_complete BOOLEAN DEFAULT TRUE NOT NULL,
    break_after_minutes INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Mock Sessions (Student Active Execution)
CREATE TABLE IF NOT EXISTS mock_sessions (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    template_id UUID NOT NULL REFERENCES mock_templates(id),
    version INT DEFAULT 1 NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED' NOT NULL
        CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'SECTION_PAUSED', 'SUBMITTED', 'EXPIRED')),
    current_section_index INT DEFAULT 0 NOT NULL,
    time_remaining_seconds INT DEFAULT 10800 NOT NULL,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Mock Attempts (Answers and Auto-save State)
CREATE TABLE IF NOT EXISTS mock_attempts (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES mock_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    current_question_index INT DEFAULT 0 NOT NULL,
    answers_count INT DEFAULT 0 NOT NULL,
    flagged_questions JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Mock Attempt Answers
CREATE TABLE IF NOT EXISTS mock_attempt_answers (
    id UUID PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES mock_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    section_id UUID NOT NULL,
    answer_payload JSONB NOT NULL,
    time_spent_ms INT DEFAULT 0 NOT NULL,
    confidence_level VARCHAR(50) DEFAULT 'MEDIUM',
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Mock Section Scores
CREATE TABLE IF NOT EXISTS mock_section_scores (
    id UUID PRIMARY KEY,
    result_id UUID NOT NULL,
    section_id UUID NOT NULL,
    raw_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    scaled_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00 NOT NULL,
    accuracy_pct DECIMAL(5,2) DEFAULT 0.00 NOT NULL
);

-- 8. Mock Results (Scoring Aggregate)
CREATE TABLE IF NOT EXISTS mock_results (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES mock_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    overall_raw_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    official_scaled_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    official_score_label VARCHAR(100) DEFAULT 'IELTS 0.0' NOT NULL,
    percentile DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL
        CHECK (status IN ('PENDING', 'SCORED', 'PUBLISHED')),
    scored_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Mock Reports (Diagnostic Output)
CREATE TABLE IF NOT EXISTS mock_reports (
    id UUID PRIMARY KEY,
    result_id UUID NOT NULL REFERENCES mock_results(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    weak_areas JSONB DEFAULT '[]'::jsonb NOT NULL,
    strong_areas JSONB DEFAULT '[]'::jsonb NOT NULL,
    study_recommendations JSONB DEFAULT '[]'::jsonb NOT NULL,
    report_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Mock Readiness (Readiness Calculation)
CREATE TABLE IF NOT EXISTS mock_readiness (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    result_id UUID REFERENCES mock_results(id) ON DELETE CASCADE,
    overall_readiness_pct DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    pass_probability_pct DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    recommended_study_hours INT DEFAULT 0 NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Mock Statistics Projections
CREATE TABLE IF NOT EXISTS mock_statistics (
    id UUID PRIMARY KEY,
    student_id UUID UNIQUE NOT NULL,
    total_mocks_taken INT DEFAULT 0 NOT NULL,
    average_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    highest_score DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    improvement_velocity DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
