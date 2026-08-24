-- Migration: 01441_speaking_recordings_persistence.sql
-- Description: Creates the speaking_recordings table for server-side persistence of IELTS candidate audio recordings.

CREATE TABLE IF NOT EXISTS public.speaking_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id UUID NOT NULL,
    student_id UUID NOT NULL,
    question_id UUID NOT NULL,
    part_number INTEGER NOT NULL CHECK (part_number BETWEEN 1 AND 3),
    audio_url TEXT NOT NULL,
    mime_type VARCHAR(64) NOT NULL DEFAULT 'audio/webm',
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast query and integrity
CREATE INDEX IF NOT EXISTS idx_speaking_recordings_session_student
    ON public.speaking_recordings (session_id, student_id);

CREATE INDEX IF NOT EXISTS idx_speaking_recordings_question
    ON public.speaking_recordings (question_id);

CREATE INDEX IF NOT EXISTS idx_speaking_recordings_tenant
    ON public.speaking_recordings (tenant_id);

-- Enable RLS
ALTER TABLE public.speaking_recordings ENABLE ROW LEVEL SECURITY;

-- Student Isolation Policy
CREATE POLICY speaking_recordings_student_isolation ON public.speaking_recordings
    FOR ALL USING (student_id = auth.uid());
