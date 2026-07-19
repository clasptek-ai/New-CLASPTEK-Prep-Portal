-- Migration: 00138_resource_usage_projections.sql
-- Description: Create resource_read schema and build the 8 optimized read models.

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS resource_read;

-- 1. Create resource_summary_projection table
CREATE TABLE resource_read.resource_summary_projection (
    resource_id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(100) NOT NULL,
    category_name VARCHAR(255),
    default_language_code VARCHAR(15) NOT NULL,
    current_version_no INTEGER,
    published_version_id UUID,
    primary_object_path VARCHAR(500),
    primary_mime_type VARCHAR(255),
    primary_size_bytes BIGINT,
    sensitivity VARCHAR(50) NOT NULL,
    visibility VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create resource_search_projection table
CREATE TABLE resource_read.resource_search_projection (
    resource_id UUID PRIMARY KEY REFERENCES resource_read.resource_summary_projection(resource_id) ON DELETE CASCADE,
    search_vector TSVECTOR,
    tags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    category_hierarchy_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_public_delivery BOOLEAN NOT NULL DEFAULT false,
    sensitivity VARCHAR(50) NOT NULL DEFAULT 'normal'
);

-- Create GIN index for search_vector
CREATE INDEX idx_resource_search_vector ON resource_read.resource_search_projection USING GIN(search_vector);

-- 3. Create resource_usage_projection table (reverse usage references)
CREATE TABLE resource_read.resource_usage_projection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_resource_id UUID NOT NULL,
    resource_version_id UUID NOT NULL,
    consumer_domain VARCHAR(100) NOT NULL, -- e.g. curriculum, practice, mock
    consumer_entity_type VARCHAR(100) NOT NULL, -- e.g. lesson, activity, question
    consumer_entity_id UUID NOT NULL,
    consumer_display_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    attached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_resource_usage UNIQUE (resource_version_id, consumer_domain, consumer_entity_type, consumer_entity_id)
);

-- 4. Create resource_duplicate_projection table
CREATE TABLE resource_read.resource_duplicate_projection (
    checksum_value VARCHAR(255) PRIMARY KEY,
    storage_object_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    resource_version_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    duplicate_count INTEGER NOT NULL DEFAULT 1,
    potential_savings_bytes BIGINT NOT NULL DEFAULT 0
);

-- 5. Create resource_broken_link_projection table
CREATE TABLE resource_read.resource_broken_link_projection (
    external_location_id UUID PRIMARY KEY,
    resource_version_id UUID NOT NULL,
    title VARCHAR(255),
    broken_url VARCHAR(500) NOT NULL,
    http_status_code INTEGER,
    error_message TEXT,
    last_checked_at TIMESTAMP WITH TIME ZONE NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create resource_storage_health_projection table
CREATE TABLE resource_read.resource_storage_health_projection (
    organization_id UUID PRIMARY KEY,
    total_allowed_bytes BIGINT NOT NULL DEFAULT 10737418240,
    total_used_bytes BIGINT NOT NULL DEFAULT 0,
    remaining_bytes BIGINT NOT NULL DEFAULT 10737418240,
    ingested_bytes_30_days BIGINT NOT NULL DEFAULT 0,
    quarantined_bytes BIGINT NOT NULL DEFAULT 0,
    orphaned_bytes BIGINT NOT NULL DEFAULT 0,
    health_status VARCHAR(50) NOT NULL DEFAULT 'healthy' -- healthy, warning, over_limit
);

-- 7. Create resource_processing_queue_projection table
CREATE TABLE resource_read.resource_processing_queue_projection (
    job_id UUID PRIMARY KEY,
    resource_version_id UUID NOT NULL,
    file_name VARCHAR(255),
    size_bytes BIGINT,
    processor_name VARCHAR(100) NOT NULL,
    job_status VARCHAR(50) NOT NULL,
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    queued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- 8. Create resource_collection_tree_projection table
CREATE TABLE resource_read.resource_collection_tree_projection (
    collection_id UUID PRIMARY KEY,
    parent_collection_id UUID,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    hierarchy_depth INTEGER NOT NULL DEFAULT 0,
    path_ancestry VARCHAR(500) NOT NULL, -- e.g. /c1/c2
    resource_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL
);
