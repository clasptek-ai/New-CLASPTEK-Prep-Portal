-- Migration: 00130_resource_core.sql
-- Description: Core tables for Learning Resource catalogue, types, formats, categories, variants, and relationships.

-- Create resource_types table
CREATE TABLE public.resource_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    default_sensitivity VARCHAR(50) NOT NULL DEFAULT 'normal', -- normal, internal, instructor_only, restricted, confidential
    requires_preview BOOLEAN NOT NULL DEFAULT false,
    requires_download BOOLEAN NOT NULL DEFAULT true,
    
    -- Status & Optimistic Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_resource_type_code UNIQUE (code)
);

-- Create resource_formats table
CREATE TABLE public.resource_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    format_family VARCHAR(100) NOT NULL, -- document, video, audio, presentation, image, package, external_link
    canonical_mime_type VARCHAR(255) NOT NULL,
    allowed_extensions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    supports_preview BOOLEAN NOT NULL DEFAULT false,
    supports_streaming BOOLEAN NOT NULL DEFAULT false,
    supports_download BOOLEAN NOT NULL DEFAULT true,
    maximum_size_bytes BIGINT NOT NULL DEFAULT 104857600, -- 100MB
    security_profile VARCHAR(100) NOT NULL DEFAULT 'default',
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_resource_format_code UNIQUE (code)
);

-- Create resource_type_format_rules table
CREATE TABLE public.resource_type_format_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type_id UUID NOT NULL REFERENCES public.resource_types(id) ON DELETE CASCADE,
    resource_format_id UUID NOT NULL REFERENCES public.resource_formats(id) ON DELETE CASCADE,
    is_allowed BOOLEAN NOT NULL DEFAULT true,
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    requires_preview BOOLEAN NOT NULL DEFAULT false,
    requires_security_scan BOOLEAN NOT NULL DEFAULT true,
    maximum_size_override_bytes BIGINT,
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_type_format_rule UNIQUE (resource_type_id, resource_format_id)
);

-- Create resource_categories table
CREATE TABLE public.resource_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_category_id UUID REFERENCES public.resource_categories(id) ON DELETE SET NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_resource_category_code UNIQUE (code)
);

-- Create learning_resources table
CREATE TABLE public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    canonical_title VARCHAR(255) NOT NULL,
    canonical_description TEXT,
    resource_type_id UUID NOT NULL REFERENCES public.resource_types(id),
    primary_category_id UUID REFERENCES public.resource_categories(id),
    sensitivity VARCHAR(50) NOT NULL DEFAULT 'normal', -- normal, internal, instructor_only, restricted, confidential
    visibility VARCHAR(50) NOT NULL DEFAULT 'authenticated', -- private, organization, authenticated, controlled_public
    owner_organization_id UUID,
    default_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    current_default_variant_id UUID, -- Will references resource_variants after creation
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, active, archived
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_learning_resource_code UNIQUE (code),
    CONSTRAINT uq_learning_resource_slug UNIQUE (slug)
);

-- Create resource_variants table
CREATE TABLE public.resource_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    region_code VARCHAR(10),
    accessibility_profile VARCHAR(100) NOT NULL DEFAULT 'none',
    variant_purpose VARCHAR(50) NOT NULL DEFAULT 'standard', -- standard, translation, accessible, low_bandwidth, instructor, student, print, screen, custom
    is_default BOOLEAN NOT NULL DEFAULT false,
    current_published_version_id UUID, -- Will references resource_versions after creation
    current_version_no INTEGER NOT NULL DEFAULT 0,
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_resource_variant_code UNIQUE (learning_resource_id, code)
);

-- Complete circular reference mapping on learning_resources
ALTER TABLE public.learning_resources 
ADD CONSTRAINT fk_lr_default_variant FOREIGN KEY (current_default_variant_id) REFERENCES public.resource_variants(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Create resource_relationships table
CREATE TABLE public.resource_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    target_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- companion_to, transcript_of, answer_key_for, sample_response_for, teacher_guide_for, student_version_of, translation_family, replaces, derived_from, prerequisite_resource, supplementary_to
    is_directional BOOLEAN NOT NULL DEFAULT true,
    rationale TEXT,
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT chk_no_self_relationship CHECK (source_resource_id <> target_resource_id),
    CONSTRAINT uq_resource_relationship UNIQUE (source_resource_id, target_resource_id, relationship_type)
);
