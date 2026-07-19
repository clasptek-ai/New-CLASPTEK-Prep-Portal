-- Migration: 00112_curriculum_modules.sql
-- Description: Create learning_modules and related mapping tables

-- Create learning_modules table
CREATE TABLE public.learning_modules (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(50) NOT NULL DEFAULT 'core', -- foundation, core, advanced, mastery, remediation, revision, exam_strategy, project, orientation, custom
    default_sequence_no INTEGER NOT NULL DEFAULT 1,
    estimated_study_minutes INTEGER NOT NULL DEFAULT 0,
    minimum_study_minutes INTEGER NOT NULL DEFAULT 0,
    maximum_study_minutes INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT true,
    completion_policy VARCHAR(50) NOT NULL DEFAULT 'all_activities',
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

    CONSTRAINT uq_module_code UNIQUE (curriculum_version_id, code),
    CONSTRAINT uq_module_slug UNIQUE (curriculum_version_id, slug),
    CONSTRAINT chk_module_estimated_time CHECK (estimated_study_minutes >= 0),
    CONSTRAINT chk_module_sequence_no CHECK (default_sequence_no >= 0)
);

-- Alter blueprint item mapping to reference modules
ALTER TABLE public.curriculum_blueprint_item_map
ADD CONSTRAINT fk_blueprint_item_map_module
FOREIGN KEY (learning_module_id) REFERENCES public.learning_modules(id) ON DELETE SET NULL;

-- Create module_sequences table
CREATE TABLE public.module_sequences (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    source_module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    target_module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL DEFAULT 'next', -- next, recommended_next, alternative, remediation, advancement, branch
    priority INTEGER NOT NULL DEFAULT 1,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    condition_json JSONB,
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

    CONSTRAINT uq_module_sequence UNIQUE (curriculum_version_id, source_module_id, target_module_id)
);

-- Create module_prerequisites table
CREATE TABLE public.module_prerequisites (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    prerequisite_module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    prerequisite_type VARCHAR(50) NOT NULL DEFAULT 'module_completion', -- module_completion, outcome_mastery, skill_mastery, diagnostic_clearance, learning_path_entry, custom
    minimum_completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    minimum_mastery_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    required_skill_revision_id UUID REFERENCES public.skill_revisions(id) ON DELETE SET NULL,
    required_skill_level_id UUID REFERENCES public.skill_levels(id) ON DELETE SET NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    rationale TEXT,
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

    CONSTRAINT uq_module_prerequisite UNIQUE (module_id, prerequisite_module_id),
    CONSTRAINT chk_module_prereq_self CHECK (module_id <> prerequisite_module_id)
);
