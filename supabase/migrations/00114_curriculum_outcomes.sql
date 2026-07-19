-- Migration: 00114_curriculum_outcomes.sql
-- Description: Create learning_outcomes, outcome skill/exam mappings, and module/lesson link tables

-- Create learning_outcomes table
CREATE TABLE public.learning_outcomes (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    statement TEXT NOT NULL,
    description TEXT,
    outcome_type VARCHAR(50) NOT NULL DEFAULT 'skill', -- knowledge, skill, strategy, performance, communication, problem_solving, creation, reflection
    cognitive_level_id UUID, -- References cognitive levels in framework
    difficulty_level_id UUID, -- References difficulty levels in framework
    evidence_type_id UUID, -- References evidence types
    minimum_mastery_percentage NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    estimated_evidence_minutes INTEGER NOT NULL DEFAULT 0,
    is_measurable BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_outcome_code UNIQUE (curriculum_version_id, code),
    CONSTRAINT chk_outcome_mastery CHECK (minimum_mastery_percentage >= 0.00 AND minimum_mastery_percentage <= 100.00),
    CONSTRAINT chk_outcome_evidence_time CHECK (estimated_evidence_minutes >= 0)
);

-- Create learning_outcome_skill_map table
CREATE TABLE public.learning_outcome_skill_map (
    id UUID PRIMARY KEY,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    skill_revision_id UUID NOT NULL REFERENCES public.skill_revisions(id) ON DELETE CASCADE,
    skill_level_id UUID REFERENCES public.skill_levels(id) ON DELETE SET NULL,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'develops', -- develops, demonstrates, reinforces, integrates, prerequisite
    importance_weight NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    target_mastery_percentage NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_outcome_skill_mapping UNIQUE (learning_outcome_id, skill_revision_id, skill_level_id)
);

-- Create learning_outcome_exam_component_map table
CREATE TABLE public.learning_outcome_exam_component_map (
    id UUID PRIMARY KEY,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    official_exam_component_id UUID NOT NULL REFERENCES public.official_exam_components(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'prepares_for',
    importance_weight NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_outcome_exam_component UNIQUE (learning_outcome_id, official_exam_component_id)
);

-- Create learning_outcome_blueprint_item_map table
CREATE TABLE public.learning_outcome_blueprint_item_map (
    id UUID PRIMARY KEY,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    assessment_blueprint_item_id UUID NOT NULL REFERENCES public.assessment_blueprint_items(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'teaches_format',
    importance_weight NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_outcome_blueprint_item UNIQUE (learning_outcome_id, assessment_blueprint_item_id)
);

-- Create module_learning_outcomes table
CREATE TABLE public.module_learning_outcomes (
    id UUID PRIMARY KEY,
    learning_module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    sequence_no INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_module_outcome UNIQUE (learning_module_id, learning_outcome_id)
);

-- Create lesson_learning_outcomes table
CREATE TABLE public.lesson_learning_outcomes (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    sequence_no INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_lesson_outcome UNIQUE (lesson_id, learning_outcome_id)
);
