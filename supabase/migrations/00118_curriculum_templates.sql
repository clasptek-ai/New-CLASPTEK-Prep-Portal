-- Migration: 00118_curriculum_templates.sql
-- Description: Create templates, template versions, translations, and usage history tables

-- Create curriculum_templates table
CREATE TABLE public.curriculum_templates (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Concurrency & Audit Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Create curriculum_template_versions table
CREATE TABLE public.curriculum_template_versions (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES public.curriculum_templates(id) ON DELETE CASCADE,
    version_no VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    structure_snapshot_json JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, retired
    
    -- Concurrency & Audit Columns
    version_no_concurrency INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_template_version UNIQUE (template_id, version_no)
);

-- Create curriculum_template_translations table
CREATE TABLE public.curriculum_template_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.curriculum_template_versions(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_description TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Concurrency & Audit Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_template_translation UNIQUE (parent_entity_id, language_code)
);

-- Create curriculum_template_usage table
CREATE TABLE public.curriculum_template_usage (
    id UUID PRIMARY KEY,
    template_version_id UUID NOT NULL REFERENCES public.curriculum_template_versions(id) ON DELETE RESTRICT,
    instantiated_curriculum_id UUID NOT NULL REFERENCES public.curricula(id) ON DELETE RESTRICT,
    instantiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    instantiated_by UUID,
    
    -- Concurrency & Audit Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);
