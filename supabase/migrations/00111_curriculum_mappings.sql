-- Migration: 00111_curriculum_mappings.sql
-- Description: Create mapping tables linking Curriculum Version to Exam Products, Blueprints, Skills, etc.

-- Create curriculum_exam_product_map table
CREATE TABLE public.curriculum_exam_product_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    exam_product_id UUID NOT NULL REFERENCES public.exam_products(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'prepares_for', -- prepares_for, supports, prerequisite_for
    coverage_weight NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    is_required BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT uq_curriculum_exam_product UNIQUE (curriculum_version_id, exam_product_id)
);

-- Create curriculum_learning_path_map table
CREATE TABLE public.curriculum_learning_path_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL, -- Logical ID of target Learning Path
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'maps_to',
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

    CONSTRAINT uq_curriculum_learning_path UNIQUE (curriculum_version_id, learning_path_id)
);

-- Create curriculum_learning_path_node_map table
CREATE TABLE public.curriculum_learning_path_node_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    learning_path_node_id UUID NOT NULL, -- Logical ID of Learning Path Node
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'covers',
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

    CONSTRAINT uq_curriculum_lp_node UNIQUE (curriculum_version_id, learning_path_node_id)
);

-- Create curriculum_skill_map table
CREATE TABLE public.curriculum_skill_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    skill_framework_id UUID NOT NULL,
    skill_revision_id UUID NOT NULL REFERENCES public.skill_revisions(id) ON DELETE CASCADE,
    skill_level_id UUID REFERENCES public.skill_levels(id) ON DELETE SET NULL,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'teaches', -- teaches, prerequisite, supporting, enrichment, remediation
    target_mastery_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
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

    CONSTRAINT uq_curriculum_skill_mapping UNIQUE (curriculum_version_id, skill_revision_id, skill_level_id)
);

-- Create curriculum_exam_component_map table
CREATE TABLE public.curriculum_exam_component_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    official_exam_component_id UUID NOT NULL REFERENCES public.official_exam_components(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'prepares_for', -- prepares_for, supports, strategy_for, prerequisite_for
    coverage_weight NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    is_required BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT uq_curriculum_exam_component UNIQUE (curriculum_version_id, official_exam_component_id)
);

-- Create curriculum_blueprint_map table
CREATE TABLE public.curriculum_blueprint_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    assessment_blueprint_id UUID NOT NULL REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'covers',
    coverage_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    is_required BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT uq_curriculum_blueprint UNIQUE (curriculum_version_id, assessment_blueprint_id)
);

-- Create curriculum_blueprint_item_map table
CREATE TABLE public.curriculum_blueprint_item_map (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    assessment_blueprint_item_id UUID NOT NULL REFERENCES public.assessment_blueprint_items(id) ON DELETE CASCADE,
    learning_module_id UUID, -- References learning_modules (added via alter table in later migrations or logical reference)
    lesson_id UUID, -- References lessons (added via alter table or logical reference)
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'teaches_format', -- teaches_format, teaches_strategy, builds_skill_for, reinforces, revision
    coverage_weight NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    is_required BOOLEAN NOT NULL DEFAULT true,
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
    deleted_by UUID
);
