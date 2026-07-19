-- Migration: 00400_question_bank
-- Description: Create tables for Question Bank Domain

CREATE TABLE IF NOT EXISTS question_schema_registry (
    schema_name VARCHAR(100) NOT NULL,
    schema_version VARCHAR(50) NOT NULL,
    validator TEXT,
    renderer VARCHAR(100),
    migration_strategy TEXT,
    deprecated BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (schema_name, schema_version)
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    exam_product_id UUID,
    curriculum_module_id UUID,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    lock_version INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS question_versions (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    version_no VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    title TEXT NOT NULL,
    payload JSONB,
    digital_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lock_version INT DEFAULT 0 NOT NULL,
    UNIQUE (question_id, version_no)
);

CREATE TABLE IF NOT EXISTS question_translations (
    id UUID PRIMARY KEY,
    question_version_id UUID REFERENCES question_versions(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    title TEXT,
    payload JSONB,
    solution TEXT,
    rubric TEXT,
    UNIQUE (question_version_id, language)
);

CREATE TABLE IF NOT EXISTS question_media (
    id UUID PRIMARY KEY,
    question_version_id UUID REFERENCES question_versions(id) ON DELETE CASCADE,
    provider VARCHAR(50),
    bucket VARCHAR(100),
    object_key TEXT,
    checksum VARCHAR(256),
    mime_type VARCHAR(100),
    file_size BIGINT,
    duration_seconds INT,
    transcript TEXT,
    caption TEXT,
    thumbnail_key TEXT,
    alt_text TEXT
);

CREATE TABLE IF NOT EXISTS answer_options (
    id UUID PRIMARY KEY,
    question_version_id UUID REFERENCES question_versions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    text_content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE NOT NULL,
    display_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS solutions (
    id UUID PRIMARY KEY,
    question_version_id UUID REFERENCES question_versions(id) ON DELETE CASCADE,
    explanation TEXT,
    incorrect_explanation TEXT,
    hint TEXT,
    reference_url TEXT,
    teaching_note TEXT
);

CREATE TABLE IF NOT EXISTS rubrics (
    id UUID PRIMARY KEY,
    question_version_id UUID REFERENCES question_versions(id) ON DELETE CASCADE,
    criteria TEXT,
    max_points INT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS question_blueprint_mappings (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    blueprint_code VARCHAR(100) NOT NULL,
    section_code VARCHAR(50) NOT NULL,
    question_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS question_dependencies (
    id UUID PRIMARY KEY,
    parent_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    child_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL,
    UNIQUE (parent_question_id, child_question_id)
);

CREATE TABLE IF NOT EXISTS question_ownership (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
    copyright_holder VARCHAR(255) NOT NULL,
    license VARCHAR(100) NOT NULL,
    source TEXT,
    reuse_policy TEXT,
    expiration_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS question_statistics (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
    times_used INT DEFAULT 0 NOT NULL,
    times_answered INT DEFAULT 0 NOT NULL,
    correct_rate NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    facility_index NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    discrimination_index NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    guess_probability NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    average_duration_ms INT DEFAULT 0 NOT NULL,
    median_duration_ms INT DEFAULT 0 NOT NULL,
    skip_rate NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    last_used TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS question_reviews (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL,
    reviewer_role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'UNDER_REVIEW' NOT NULL,
    comments TEXT,
    validation_report JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS question_workflow_history (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    actor_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comments TEXT,
    evidence JSONB,
    digital_signature TEXT
);
