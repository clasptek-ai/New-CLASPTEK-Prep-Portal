-- Migration: 01406_passage_media_versioning.sql
-- Description: Immutable versioning for Reading Passages and Media Assets + Provenance metadata

-- 1. Passage Versions
CREATE TABLE IF NOT EXISTS public.reading_passage_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
    version_no INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    word_count INT NOT NULL DEFAULT 0,
    author VARCHAR(255) NULL,
    publication VARCHAR(255) NULL,
    copyright VARCHAR(255) NULL,
    license VARCHAR(128) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_passage_version UNIQUE (passage_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_passage_versions_passage ON public.reading_passage_versions(passage_id);

-- 2. Media Asset Versions
CREATE TABLE IF NOT EXISTS public.media_asset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    version_no INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    bucket_path VARCHAR(512) NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_media_version UNIQUE (media_asset_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_media_versions_asset ON public.media_asset_versions(media_asset_id);

-- 3. Rich Group & Section Metadata Extensions
ALTER TABLE public.question_groups
    ADD COLUMN IF NOT EXISTS shuffle_policy VARCHAR(64) NOT NULL DEFAULT 'STRICT_ORDER',
    ADD COLUMN IF NOT EXISTS estimated_time_seconds INT NOT NULL DEFAULT 600,
    ADD COLUMN IF NOT EXISTS skill_focus VARCHAR(128) NULL,
    ADD COLUMN IF NOT EXISTS difficulty_profile VARCHAR(32) NOT NULL DEFAULT 'MEDIUM';

ALTER TABLE public.assessment_sections
    ADD COLUMN IF NOT EXISTS shuffle_allowed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS navigation_mode VARCHAR(64) NOT NULL DEFAULT 'FREE', -- FREE, LINEAR, NO_BACKTRACK
    ADD COLUMN IF NOT EXISTS review_allowed BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS scoring_strategy VARCHAR(64) NOT NULL DEFAULT 'BAND_SCALE_CONVERSION';

-- Enable RLS
ALTER TABLE public.reading_passage_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_asset_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_passage_versions ON public.reading_passage_versions FOR SELECT USING (true);
CREATE POLICY manage_passage_versions ON public.reading_passage_versions FOR ALL USING (true);

CREATE POLICY select_media_versions ON public.media_asset_versions FOR SELECT USING (true);
CREATE POLICY manage_media_versions ON public.media_asset_versions FOR ALL USING (true);
