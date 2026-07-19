-- Migration: 00136_resource_localization.sql
-- Description: Localization locale codes and translatable metadata tables.

-- Create resource_locales table
CREATE TABLE public.resource_locales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_required_for_publication BOOLEAN NOT NULL DEFAULT false,
    translation_status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- not_started, draft, human_review_required, reviewed, approved
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

    CONSTRAINT uq_resource_locale UNIQUE (learning_resource_id, language_code)
);

-- Create resource_localizations table
CREATE TABLE public.resource_localizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_entity_id UUID NOT NULL REFERENCES public.resource_versions(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_title VARCHAR(255) NOT NULL,
    localized_description TEXT,
    localized_change_summary TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human', -- human, machine, hybrid
    translation_status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
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

    CONSTRAINT uq_version_translation UNIQUE (parent_entity_id, language_code)
);

-- Create resource_variant_localizations table
CREATE TABLE public.resource_variant_localizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_variant_id UUID NOT NULL REFERENCES public.resource_variants(id) ON DELETE CASCADE,
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

    CONSTRAINT uq_variant_translation UNIQUE (resource_variant_id, language_code)
);
