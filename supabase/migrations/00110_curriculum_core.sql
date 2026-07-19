-- Migration: 00110_curriculum_core.sql
-- Description: Create core tables for Curriculum Bounded Context

-- Create curricula table
CREATE TABLE public.curricula (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    current_version_id UUID,
    current_version_no VARCHAR(50),
    
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

-- Create curriculum_versions table
CREATE TABLE public.curriculum_versions (
    id UUID PRIMARY KEY,
    curriculum_id UUID NOT NULL REFERENCES public.curricula(id) ON DELETE CASCADE,
    version_no VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_until TIMESTAMP WITH TIME ZONE,
    superseded_by UUID,
    breaking_change BOOLEAN NOT NULL DEFAULT false,
    migration_notes TEXT,
    
    -- Optimistic Concurrency Columns
    version_no_concurrency INTEGER NOT NULL DEFAULT 1, -- Avoid column name collision
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_curriculum_version UNIQUE (curriculum_id, version_no)
);

-- Complete curricula foreign key constraint on current_version_id
ALTER TABLE public.curricula 
ADD CONSTRAINT fk_curricula_current_version 
FOREIGN KEY (current_version_id) REFERENCES public.curriculum_versions(id) ON DELETE SET NULL;

-- Create curriculum_dependency_locks table
CREATE TABLE public.curriculum_dependency_locks (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    dependency_type VARCHAR(100) NOT NULL, -- e.g. 'exam_structure', 'blueprint', 'skills_framework'
    dependency_id UUID NOT NULL,
    locked_version_no VARCHAR(50) NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
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

    CONSTRAINT uq_dependency_lock UNIQUE (curriculum_version_id, dependency_type, dependency_id)
);

-- Create curriculum_publish_history table
CREATE TABLE public.curriculum_publish_history (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    published_by UUID,
    version_snapshot_json JSONB NOT NULL,
    
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

-- Create curriculum_metadata table
CREATE TABLE public.curriculum_metadata (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    meta_key VARCHAR(100) NOT NULL,
    meta_value TEXT,
    
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

    CONSTRAINT uq_curriculum_metadata UNIQUE (curriculum_version_id, meta_key)
);
