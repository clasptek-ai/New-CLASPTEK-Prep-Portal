-- Migration: 00115_curriculum_activities.sql
-- Description: Create learning activities, assignments, types, and outcome link tables

-- Create activity_types table
CREATE TABLE public.activity_types (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'instructional',
    default_evidence_type_id UUID,
    supports_interaction BOOLEAN NOT NULL DEFAULT true,
    supports_collaboration BOOLEAN NOT NULL DEFAULT false,
    supports_external_resource BOOLEAN NOT NULL DEFAULT true,
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

-- Create learning_activities table
CREATE TABLE public.learning_activities (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    activity_type_id UUID NOT NULL REFERENCES public.activity_types(id) ON DELETE RESTRICT,
    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    sequence_no INTEGER NOT NULL DEFAULT 1,
    estimated_minutes INTEGER NOT NULL DEFAULT 0,
    delivery_mode VARCHAR(50) NOT NULL DEFAULT 'self_paced', -- self_paced, instructor_led, live_online, onsite, blended, collaborative
    interaction_mode VARCHAR(50) NOT NULL DEFAULT 'individual', -- individual, pair, group, instructor, peer_review, independent
    evidence_type_id UUID,
    difficulty_level_id UUID,
    cognitive_level_id UUID,
    is_required BOOLEAN NOT NULL DEFAULT true,
    completion_definition_json JSONB,
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

    CONSTRAINT uq_activity_code UNIQUE (lesson_id, code),
    CONSTRAINT chk_activity_minutes CHECK (estimated_minutes >= 0)
);

-- Create learning_activity_outcomes table
CREATE TABLE public.learning_activity_outcomes (
    id UUID PRIMARY KEY,
    learning_activity_id UUID NOT NULL REFERENCES public.learning_activities(id) ON DELETE CASCADE,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'develops',
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

    CONSTRAINT uq_activity_outcome UNIQUE (learning_activity_id, learning_outcome_id)
);

-- Create learning_assignments table
CREATE TABLE public.learning_assignments (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'written_task', -- written_task, speaking_task, listening_task, reading_task, worked_solution, research, presentation, reflection, project, portfolio_item, custom
    submission_mode VARCHAR(50) NOT NULL DEFAULT 'file', -- text, file, audio, video, link, in_person, external_platform, none
    evidence_type_id UUID,
    difficulty_level_id UUID,
    cognitive_level_id UUID,
    estimated_completion_minutes INTEGER NOT NULL DEFAULT 0,
    recommended_rubric_reference VARCHAR(255),
    is_required BOOLEAN NOT NULL DEFAULT true,
    allow_collaboration BOOLEAN NOT NULL DEFAULT false,
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

    CONSTRAINT uq_assignment_code UNIQUE (lesson_id, code),
    CONSTRAINT chk_assignment_minutes CHECK (estimated_completion_minutes >= 0)
);

-- Create learning_assignment_outcomes table
CREATE TABLE public.learning_assignment_outcomes (
    id UUID PRIMARY KEY,
    learning_assignment_id UUID NOT NULL REFERENCES public.learning_assignments(id) ON DELETE CASCADE,
    learning_outcome_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL DEFAULT 'develops',
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

    CONSTRAINT uq_assignment_outcome UNIQUE (learning_assignment_id, learning_outcome_id)
);
