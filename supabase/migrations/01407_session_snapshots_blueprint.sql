-- Migration: 01407_session_snapshots_blueprint.sql
-- Description: Immutable session question snapshots capturing question, passage, media, rubric, and blueprint versions

CREATE TABLE IF NOT EXISTS public.session_question_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_version_id UUID NULL,
    passage_version_id UUID NULL REFERENCES public.reading_passage_versions(id) ON DELETE SET NULL,
    media_version_id UUID NULL REFERENCES public.media_asset_versions(id) ON DELETE SET NULL,
    blueprint_version VARCHAR(32) NOT NULL DEFAULT 'v1.0',
    display_order INT NOT NULL DEFAULT 1,
    snapshot_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_snapshots_session ON public.session_question_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_session_snapshots_question ON public.session_question_snapshots(question_id);

-- Enable RLS
ALTER TABLE public.session_question_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_session_snapshots ON public.session_question_snapshots FOR SELECT USING (true);
CREATE POLICY manage_session_snapshots ON public.session_question_snapshots FOR ALL USING (true);
