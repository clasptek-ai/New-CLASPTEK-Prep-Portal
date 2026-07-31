-- Migration: 01405_listening_infrastructure.sql
-- Description: Dedicated infrastructure for Listening Audio Tracks, Sections, and Section Boundaries

CREATE TABLE IF NOT EXISTS public.listening_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    transcript TEXT NULL,
    exam_type VARCHAR(64) NOT NULL DEFAULT 'IELTS Academic',
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listening_tracks_exam ON public.listening_tracks(exam_type);

CREATE TABLE IF NOT EXISTS public.listening_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL REFERENCES public.listening_tracks(id) ON DELETE CASCADE,
    section_number INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    start_seconds INT NOT NULL DEFAULT 0,
    end_seconds INT NOT NULL DEFAULT 0,
    instructions TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_track_section UNIQUE (track_id, section_number)
);

CREATE INDEX IF NOT EXISTS idx_listening_sections_track ON public.listening_sections(track_id);

-- Link question_groups to listening_sections
ALTER TABLE public.question_groups ADD COLUMN IF NOT EXISTS listening_section_id UUID NULL REFERENCES public.listening_sections(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.listening_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_listening_tracks ON public.listening_tracks;
DROP POLICY IF EXISTS manage_listening_tracks ON public.listening_tracks;
DROP POLICY IF EXISTS select_listening_sections ON public.listening_sections;
DROP POLICY IF EXISTS manage_listening_sections ON public.listening_sections;

CREATE POLICY select_listening_tracks ON public.listening_tracks FOR SELECT USING (true);
CREATE POLICY manage_listening_tracks ON public.listening_tracks FOR ALL USING (true);

CREATE POLICY select_listening_sections ON public.listening_sections FOR SELECT USING (true);
CREATE POLICY manage_listening_sections ON public.listening_sections FOR ALL USING (true);
