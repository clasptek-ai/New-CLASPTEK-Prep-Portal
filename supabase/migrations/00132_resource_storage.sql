-- Migration: 00132_resource_storage.sql
-- Description: Tables for storage objects, upload sessions, quota policies, reservations, and ledger.

-- Create upload_sessions table
CREATE TABLE public.upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    resource_version_id UUID NOT NULL, -- references resource_versions (added as index/FK to avoid dependency cycle if necessary)
    requested_format_id UUID NOT NULL REFERENCES public.resource_formats(id),
    original_filename VARCHAR(255) NOT NULL,
    declared_mime_type VARCHAR(255) NOT NULL,
    declared_size_bytes BIGINT NOT NULL,
    reserved_bytes BIGINT NOT NULL DEFAULT 0,
    target_bucket VARCHAR(100) NOT NULL,
    target_object_path VARCHAR(500) NOT NULL,
    signed_upload_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    upload_status VARCHAR(50) NOT NULL DEFAULT 'requested', -- requested, authorised, uploading, uploaded, expired, cancelled, failed
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status & Concurrency Columns
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Create storage_objects table
CREATE TABLE public.storage_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'supabase_storage', -- supabase_storage, s3_compatible, external_managed
    bucket_name VARCHAR(100) NOT NULL,
    object_path VARCHAR(500) NOT NULL,
    provider_object_id VARCHAR(500),
    original_filename VARCHAR(255) NOT NULL,
    detected_mime_type VARCHAR(255) NOT NULL,
    detected_extension VARCHAR(50) NOT NULL,
    size_bytes BIGINT NOT NULL,
    etag VARCHAR(255),
    storage_class VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    integrity_status VARCHAR(50) NOT NULL DEFAULT 'unchecked', -- unchecked, validated, failed
    security_status VARCHAR(50) NOT NULL DEFAULT 'unchecked', -- unchecked, scanning, validated_clear, quarantined, failed
    availability_status VARCHAR(50) NOT NULL DEFAULT 'unavailable', -- unavailable, available, archived, deletion_pending, deleted
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    validated_at TIMESTAMP WITH TIME ZONE,
    promoted_at TIMESTAMP WITH TIME ZONE,
    retention_until TIMESTAMP WITH TIME ZONE,
    
    -- Status & Concurrency Columns
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_storage_object_path UNIQUE (bucket_name, object_path)
);

-- Complete upload_sessions foreign keys
ALTER TABLE public.upload_sessions
ADD CONSTRAINT fk_us_resource_version FOREIGN KEY (resource_version_id) REFERENCES public.resource_versions(id) ON DELETE CASCADE;

-- Create resource_version_objects table
CREATE TABLE public.resource_version_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    storage_object_id UUID NOT NULL REFERENCES public.storage_objects(id) ON DELETE RESTRICT,
    object_role VARCHAR(50) NOT NULL DEFAULT 'primary', -- primary, source, supplementary, captions, transcript, poster, thumbnail, attachment
    display_order INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT true,
    
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

    CONSTRAINT uq_version_object_role UNIQUE (resource_version_id, storage_object_id, object_role)
);

-- Create resource_checksums table
CREATE TABLE public.resource_checksums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_object_id UUID NOT NULL REFERENCES public.storage_objects(id) ON DELETE CASCADE,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'SHA-256',
    checksum_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verification_source VARCHAR(100) NOT NULL DEFAULT 'server_ingest',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    CONSTRAINT uq_object_checksum UNIQUE (storage_object_id, algorithm)
);

-- Create storage_quota_policies table
CREATE TABLE public.storage_quota_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    policy_code VARCHAR(100) NOT NULL,
    maximum_total_bytes BIGINT NOT NULL DEFAULT 10737418240, -- 10GB default
    maximum_single_object_bytes BIGINT NOT NULL DEFAULT 104857600, -- 100MB
    maximum_monthly_ingest_bytes BIGINT NOT NULL DEFAULT 107374182400, -- 100GB
    warning_threshold_percentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    hard_limit_enabled BOOLEAN NOT NULL DEFAULT true,
    
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

    CONSTRAINT uq_org_quota_policy UNIQUE (organization_id)
);

-- Create storage_quota_reservations table
CREATE TABLE public.storage_quota_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    upload_session_id UUID NOT NULL REFERENCES public.upload_sessions(id) ON DELETE CASCADE,
    reserved_bytes BIGINT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' -- active, released, expired
);

-- Create storage_usage_ledger table
CREATE TABLE public.storage_usage_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    storage_object_id UUID REFERENCES public.storage_objects(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- upload, delete, promote, archive
    bytes_delta BIGINT NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    correlation_id UUID DEFAULT gen_random_uuid()
);
