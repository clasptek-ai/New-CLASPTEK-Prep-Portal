-- Migration: 00119_curriculum_projections.sql
-- Description: Create curriculum_read schema and query-optimized projection tables

-- Create curriculum_read schema
CREATE SCHEMA IF NOT EXISTS curriculum_read;

-- Create curriculum_summary_projection
CREATE TABLE curriculum_read.curriculum_summary_projection (
    curriculum_id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    current_version_id UUID,
    current_version_no VARCHAR(50),
    total_modules INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 0,
    total_estimated_study_minutes INTEGER NOT NULL DEFAULT 0,
    default_locale VARCHAR(15) NOT NULL DEFAULT 'en',
    available_locales VARCHAR(15)[] NOT NULL DEFAULT '{}',
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create curriculum_coverage_projection
CREATE TABLE curriculum_read.curriculum_coverage_projection (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL,
    exam_product_id UUID NOT NULL,
    official_exam_component_ids UUID[] NOT NULL DEFAULT '{}',
    assessment_blueprint_ids UUID[] NOT NULL DEFAULT '{}',
    mapped_skills_count INTEGER NOT NULL DEFAULT 0,
    unmapped_skills_count INTEGER NOT NULL DEFAULT 0,
    coverage_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00
);

-- Create curriculum_publication_readiness_projection
CREATE TABLE curriculum_read.curriculum_publication_readiness_projection (
    curriculum_version_id UUID PRIMARY KEY,
    has_exam_product_mapped BOOLEAN NOT NULL DEFAULT false,
    has_blueprint_mapped BOOLEAN NOT NULL DEFAULT false,
    has_skills_mapped BOOLEAN NOT NULL DEFAULT false,
    all_modules_sequenced BOOLEAN NOT NULL DEFAULT false,
    all_lessons_sequenced BOOLEAN NOT NULL DEFAULT false,
    no_circular_dependencies BOOLEAN NOT NULL DEFAULT true,
    all_outcomes_measurable BOOLEAN NOT NULL DEFAULT false,
    all_required_locales_approved BOOLEAN NOT NULL DEFAULT false,
    is_ready BOOLEAN NOT NULL DEFAULT false,
    validation_messages_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Create curriculum_graph_projection
CREATE TABLE curriculum_read.curriculum_graph_projection (
    curriculum_version_id UUID PRIMARY KEY,
    graph_nodes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    graph_edges_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    has_cycles BOOLEAN NOT NULL DEFAULT false,
    critical_path_lessons UUID[] NOT NULL DEFAULT '{}'
);

-- Create lesson_tree_projection
CREATE TABLE curriculum_read.lesson_tree_projection (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL,
    language_code VARCHAR(15) NOT NULL,
    tree_structure_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    CONSTRAINT uq_lesson_tree UNIQUE (curriculum_version_id, language_code)
);
