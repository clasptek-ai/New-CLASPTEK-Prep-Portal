-- Migration: 00116_curriculum_resources.sql
-- Description: Create resource references and their associations to lessons, activities, and assignments

-- Create resource_references table
CREATE TABLE public.resource_references (
    id UUID PRIMARY KEY,
    provider_type VARCHAR(50) NOT NULL DEFAULT 'learning_resource_domain', -- learning_resource_domain, media_library, document_library, external_url, external_platform, embedded_reference
    provider_resource_id VARCHAR(255),
    resource_domain VARCHAR(100),
    resource_uri VARCHAR(500),
    resource_version_id VARCHAR(100),
    title_snapshot VARCHAR(255),
    mime_type_snapshot VARCHAR(100),
    checksum VARCHAR(100),
    availability_status VARCHAR(50) NOT NULL DEFAULT 'available',
    is_external BOOLEAN NOT NULL DEFAULT false,
    external_provider VARCHAR(100),
    external_url VARCHAR(500),
    license_code VARCHAR(100),
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

-- Create lesson_resources table
CREATE TABLE public.lesson_resources (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    resource_reference_id UUID NOT NULL REFERENCES public.resource_references(id) ON DELETE RESTRICT,
    usage_type VARCHAR(50) NOT NULL DEFAULT 'primary_content', -- primary_content, supplementary, worksheet, example, template, reference, transcript, slide_deck, instructor_guide
    sequence_no INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT true,
    availability_policy VARCHAR(50) NOT NULL DEFAULT 'available_immediately',
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

    CONSTRAINT uq_lesson_resource UNIQUE (lesson_id, resource_reference_id)
);

-- Create activity_resources table
CREATE TABLE public.activity_resources (
    id UUID PRIMARY KEY,
    learning_activity_id UUID NOT NULL REFERENCES public.learning_activities(id) ON DELETE CASCADE,
    resource_reference_id UUID NOT NULL REFERENCES public.resource_references(id) ON DELETE RESTRICT,
    usage_type VARCHAR(50) NOT NULL DEFAULT 'primary_content',
    sequence_no INTEGER NOT NULL DEFAULT 1,
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

    CONSTRAINT uq_activity_resource UNIQUE (learning_activity_id, resource_reference_id)
);

-- Create assignment_resources table
CREATE TABLE public.assignment_resources (
    id UUID PRIMARY KEY,
    learning_assignment_id UUID NOT NULL REFERENCES public.learning_assignments(id) ON DELETE CASCADE,
    resource_reference_id UUID NOT NULL REFERENCES public.resource_references(id) ON DELETE RESTRICT,
    usage_type VARCHAR(50) NOT NULL DEFAULT 'primary_content',
    sequence_no INTEGER NOT NULL DEFAULT 1,
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

    CONSTRAINT uq_assignment_resource UNIQUE (learning_assignment_id, resource_reference_id)
);
