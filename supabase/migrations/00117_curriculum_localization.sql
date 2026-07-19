-- Migration: 00117_curriculum_localization.sql
-- Description: Create language locales and translation tables for entities

-- Create curriculum_locales table
CREATE TABLE public.curriculum_locales (
    id UUID PRIMARY KEY,
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL, -- e.g., en, en-US, fr, ar
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_required_for_publication BOOLEAN NOT NULL DEFAULT false,
    translation_status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- not_started, draft, machine_translated, human_review_required, reviewed, approved
    display_order INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
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

    CONSTRAINT uq_curriculum_locale UNIQUE (curriculum_version_id, language_code)
);

-- Create helper function or duplicate tables to keep clean foreign key relations
CREATE TABLE public.curriculum_version_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_summary TEXT,
    localized_description TEXT,
    localized_instructions TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human',
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

    CONSTRAINT uq_curriculum_version_trans UNIQUE (parent_entity_id, language_code)
);

CREATE TABLE public.learning_module_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_summary TEXT,
    localized_description TEXT,
    localized_instructions TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human',
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

    CONSTRAINT uq_learning_module_trans UNIQUE (parent_entity_id, language_code)
);

CREATE TABLE public.lesson_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_summary TEXT,
    localized_description TEXT,
    localized_instructions TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human',
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

    CONSTRAINT uq_lesson_trans UNIQUE (parent_entity_id, language_code)
);

CREATE TABLE public.learning_outcome_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.learning_outcomes(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_summary TEXT,
    localized_description TEXT,
    localized_instructions TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human',
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

    CONSTRAINT uq_learning_outcome_trans UNIQUE (parent_entity_id, language_code)
);

CREATE TABLE public.learning_activity_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.learning_activities(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_summary TEXT,
    localized_description TEXT,
    localized_instructions TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human',
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

    CONSTRAINT uq_learning_activity_trans UNIQUE (parent_entity_id, language_code)
);

CREATE TABLE public.learning_assignment_translations (
    id UUID PRIMARY KEY,
    parent_entity_id UUID NOT NULL REFERENCES public.learning_assignments(id) ON DELETE CASCADE,
    language_code VARCHAR(15) NOT NULL,
    localized_name_or_title VARCHAR(255) NOT NULL,
    localized_summary TEXT,
    localized_description TEXT,
    localized_instructions TEXT,
    source_language_code VARCHAR(15) NOT NULL DEFAULT 'en',
    translation_method VARCHAR(50) NOT NULL DEFAULT 'human',
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

    CONSTRAINT uq_learning_assignment_trans UNIQUE (parent_entity_id, language_code)
);
