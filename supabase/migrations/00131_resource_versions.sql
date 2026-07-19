-- Migration: 00131_resource_versions.sql
-- Description: Tables for resource versions, publish history, licenses, and external URL resources.

-- Create resource_licenses table
CREATE TABLE public.resource_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    license_type VARCHAR(100) NOT NULL DEFAULT 'proprietary',
    license_url VARCHAR(500),
    allows_distribution BOOLEAN NOT NULL DEFAULT false,
    allows_modification BOOLEAN NOT NULL DEFAULT false,
    requires_attribution BOOLEAN NOT NULL DEFAULT true,
    expires TIMESTAMP WITH TIME ZONE,
    
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

    CONSTRAINT uq_resource_license_code UNIQUE (code)
);

-- Create resource_versions table
CREATE TABLE public.resource_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_variant_id UUID NOT NULL REFERENCES public.resource_variants(id) ON DELETE CASCADE,
    version_no INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, uploading, validating, quarantined, processing, review, published, retired, archived, failed
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_format_id UUID NOT NULL REFERENCES public.resource_formats(id),
    version_label VARCHAR(100),
    change_summary TEXT,
    source_attribution TEXT,
    copyright_owner VARCHAR(255),
    copyright_year INTEGER,
    license_id UUID REFERENCES public.resource_licenses(id),
    estimated_study_minutes INTEGER NOT NULL DEFAULT 0,
    requires_preview BOOLEAN NOT NULL DEFAULT false,
    allows_download BOOLEAN NOT NULL DEFAULT true,
    allows_streaming BOOLEAN NOT NULL DEFAULT false,
    effective_from TIMESTAMP WITH TIME ZONE,
    effective_to TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID,
    retired_at TIMESTAMP WITH TIME ZONE,
    retired_by UUID,
    
    -- Status & Concurrency Columns
    version_no_concurrency INTEGER NOT NULL DEFAULT 1, -- Avoid name conflict with version_no identifier
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_resource_version UNIQUE (resource_variant_id, version_no),
    CONSTRAINT chk_study_minutes CHECK (estimated_study_minutes >= 0),
    CONSTRAINT chk_effective_dates CHECK (effective_from IS NULL OR effective_to IS NULL OR effective_from <= effective_to)
);

-- Circular references mapping update on resource_variants
ALTER TABLE public.resource_variants 
ADD CONSTRAINT fk_rv_published_version FOREIGN KEY (current_published_version_id) REFERENCES public.resource_versions(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- Create resource_publish_history table
CREATE TABLE public.resource_publish_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    resource_variant_id UUID NOT NULL REFERENCES public.resource_variants(id) ON DELETE CASCADE,
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- submitted_for_review, returned_to_draft, quarantined, cleared, published, retired, archived
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    publication_number INTEGER,
    validation_snapshot_json JSONB,
    security_snapshot_json JSONB,
    storage_snapshot_json JSONB,
    
    -- Audit Columns
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    performed_by UUID,
    correlation_id UUID DEFAULT gen_random_uuid()
);

-- Create resource_version_dependencies table
CREATE TABLE public.resource_version_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    dependent_resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE RESTRICT,
    dependency_type VARCHAR(100) NOT NULL, -- captions, transcript, answer_key, supplementary_package
    is_required BOOLEAN NOT NULL DEFAULT true,
    minimum_status VARCHAR(50) NOT NULL DEFAULT 'published',
    
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

    CONSTRAINT uq_version_dependency UNIQUE (resource_version_id, dependent_resource_version_id),
    CONSTRAINT chk_no_self_dependency CHECK (resource_version_id <> dependent_resource_version_id)
);

-- Create external_resource_locations table
CREATE TABLE public.external_resource_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    canonical_url VARCHAR(500) NOT NULL,
    display_url VARCHAR(500),
    provider_name VARCHAR(100),
    provider_resource_id VARCHAR(255),
    allowed_domains_policy JSONB NOT NULL DEFAULT '[]'::jsonb,
    open_in_new_window BOOLEAN NOT NULL DEFAULT true,
    requires_authentication BOOLEAN NOT NULL DEFAULT false,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    last_http_status INTEGER,
    last_content_type VARCHAR(255),
    
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
    deleted_by UUID
);
