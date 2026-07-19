-- Migration: 00134_resource_tags_collections.sql
-- Description: Tables for tagging and collection hierarchies.

-- Create resource_tags table
CREATE TABLE public.resource_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tag_group VARCHAR(100),
    
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

    CONSTRAINT uq_resource_tag_code UNIQUE (code)
);

-- Create resource_tag_map table
CREATE TABLE public.resource_tag_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    resource_tag_id UUID NOT NULL REFERENCES public.resource_tags(id) ON DELETE CASCADE,
    
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

    CONSTRAINT uq_resource_tag_mapping UNIQUE (learning_resource_id, resource_tag_id)
);

-- Create resource_collections table
CREATE TABLE public.resource_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_collection_id UUID REFERENCES public.resource_collections(id) ON DELETE SET NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    
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

    CONSTRAINT uq_resource_collection_code UNIQUE (code)
);

-- Create resource_collection_translations table
CREATE TABLE public.resource_collection_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_collection_id UUID NOT NULL REFERENCES public.resource_collections(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name VARCHAR(255) NOT NULL,
    localized_description TEXT,
    
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

    CONSTRAINT uq_collection_translation UNIQUE (resource_collection_id, language_code)
);

-- Create collection_resources table
CREATE TABLE public.collection_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_collection_id UUID NOT NULL REFERENCES public.resource_collections(id) ON DELETE CASCADE,
    learning_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
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

    CONSTRAINT uq_collection_resource_map UNIQUE (resource_collection_id, learning_resource_id)
);
