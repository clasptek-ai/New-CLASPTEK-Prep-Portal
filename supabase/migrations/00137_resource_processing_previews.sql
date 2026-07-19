-- Migration: 00137_resource_processing_previews.sql
-- Description: Processing queues, quarantine records, previews, and link checks.

-- Create resource_ingestion_jobs table
CREATE TABLE public.resource_ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_session_id UUID NOT NULL REFERENCES public.upload_sessions(id) ON DELETE CASCADE,
    storage_object_id UUID REFERENCES public.storage_objects(id) ON DELETE SET NULL,
    job_status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
    steps_completed_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_processing_jobs table
CREATE TABLE public.resource_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    storage_object_id UUID NOT NULL REFERENCES public.storage_objects(id) ON DELETE CASCADE,
    processor_name VARCHAR(100) NOT NULL, -- thumbnail, transcript, captions, low_bandwidth_mp4
    job_status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, running, completed, failed
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    error_log TEXT,
    
    -- Status & Concurrency Columns
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create resource_security_scan_results table
CREATE TABLE public.resource_security_scan_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_object_id UUID NOT NULL REFERENCES public.storage_objects(id) ON DELETE CASCADE,
    scanner_name VARCHAR(100) NOT NULL, -- virus_total, clam_av, custom_checksum
    scanner_version VARCHAR(50),
    scan_status VARCHAR(50) NOT NULL DEFAULT 'scanning', -- scanning, clear, infected, error
    threats_found_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    quarantined_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit Columns
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    correlation_id UUID DEFAULT gen_random_uuid()
);

-- Create resource_previews table
CREATE TABLE public.resource_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_version_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    preview_type VARCHAR(50) NOT NULL DEFAULT 'thumbnail', -- thumbnail, pdf_preview, video_clip, audio_clip, text_snippet
    page_number INTEGER,
    start_time_seconds DECIMAL(6,2),
    end_time_seconds DECIMAL(6,2),
    
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

-- Create resource_preview_objects table
CREATE TABLE public.resource_preview_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_preview_id UUID NOT NULL REFERENCES public.resource_previews(id) ON DELETE CASCADE,
    storage_object_id UUID NOT NULL REFERENCES public.storage_objects(id) ON DELETE RESTRICT,
    
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

    CONSTRAINT uq_preview_object UNIQUE (resource_preview_id, storage_object_id)
);

-- Create external_link_checks table
CREATE TABLE public.external_link_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_resource_location_id UUID NOT NULL REFERENCES public.external_resource_locations(id) ON DELETE CASCADE,
    http_status_code INTEGER,
    response_time_ms INTEGER,
    redirects_followed_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_reachable BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    
    -- Audit Columns
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
