-- Migration: 00403_question_media.sql
-- Create question_media table referencing external Learning Resource assets

CREATE TABLE IF NOT EXISTS public.question_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_version_id UUID NOT NULL REFERENCES public.question_versions(id) ON DELETE CASCADE,
    storage_asset_id UUID NOT NULL, -- Logical reference to StorageAsset inside Learning Resource context
    association_type VARCHAR(64) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT chk_media_assoc_type CHECK (association_type IN ('listening_audio', 'passage_image', 'illustration', 'supporting_doc'))
);

CREATE INDEX IF NOT EXISTS idx_question_media_version ON public.question_media(question_version_id);
