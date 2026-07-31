-- Migration: 01404_media_assets.sql
-- Description: Reusable Media Library (Images, Audio, Diagrams, PDFs) with question_media_links junction

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'IMAGE', -- IMAGE, AUDIO, PDF, PASSAGE
    url VARCHAR(1024) NOT NULL,
    bucket_path VARCHAR(512) NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    exam_type VARCHAR(64) NOT NULL DEFAULT 'IELTS Academic',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_exam ON public.media_assets(exam_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(type);

-- Junction table mapping question_versions to media_assets
CREATE TABLE IF NOT EXISTS public.question_media_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    association_type VARCHAR(64) NOT NULL DEFAULT 'STIMULUS', -- STIMULUS, DIAGRAM, AUDIO_PROMPT, SOLUTION_EXPLANATION
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_question_media UNIQUE (question_id, media_asset_id, association_type)
);

CREATE INDEX IF NOT EXISTS idx_q_media_links_q ON public.question_media_links(question_id);
CREATE INDEX IF NOT EXISTS idx_q_media_links_m ON public.question_media_links(media_asset_id);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_media_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_media_assets ON public.media_assets FOR SELECT USING (true);
CREATE POLICY manage_media_assets ON public.media_assets FOR ALL USING (true);

CREATE POLICY select_question_media_links ON public.question_media_links FOR SELECT USING (true);
CREATE POLICY manage_question_media_links ON public.question_media_links FOR ALL USING (true);
