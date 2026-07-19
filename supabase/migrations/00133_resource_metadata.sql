-- Migration: 00133_resource_metadata.sql
-- Description: Tables for metadata definitions, values, and validation results.

-- Create resource_metadata_definitions table
CREATE TABLE public.resource_metadata_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace VARCHAR(100) NOT NULL DEFAULT 'custom', -- academic, audio, video, document, accessibility, copyright, curriculum
    metadata_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value_type VARCHAR(50) NOT NULL DEFAULT 'string', -- string, integer, float, boolean, json, date
    validation_schema_json JSONB,
    applies_to_resource_type_id UUID REFERENCES public.resource_types(id) ON DELETE SET NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_searchable BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    
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

    CONSTRAINT uq_metadata_def_key UNIQUE (namespace, metadata_key)
);

-- Create resource_metadata table
CREATE TABLE public.resource_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    metadata_definition_id UUID NOT NULL REFERENCES public.resource_metadata_definitions(id) ON DELETE CASCADE,
    metadata_value_json JSONB NOT NULL,
    
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

    CONSTRAINT uq_resource_version_metadata UNIQUE (resource_version_id, metadata_definition_id)
);

-- Create resource_validation_results table
CREATE TABLE public.resource_validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    storage_object_id UUID REFERENCES public.storage_objects(id) ON DELETE CASCADE,
    validation_type VARCHAR(100) NOT NULL, -- mime, extension, size, checksum, archive_structure, document_integrity, media_integrity, external_url, accessibility, preview_requirement, metadata_completeness, publication_readiness
    validator_name VARCHAR(255) NOT NULL,
    validator_version VARCHAR(50),
    result_status VARCHAR(50) NOT NULL, -- pass, warn, fail, skip
    severity VARCHAR(50) NOT NULL DEFAULT 'info', -- info, warning, blocking, security
    code VARCHAR(100),
    message TEXT NOT NULL,
    details_json JSONB,
    
    -- Audit Columns
    validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    correlation_id UUID DEFAULT gen_random_uuid()
);
