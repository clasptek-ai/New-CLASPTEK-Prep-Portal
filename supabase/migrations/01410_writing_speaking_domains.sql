-- Migration: 01410_writing_speaking_domains.sql
-- Description: Dedicated Domain Entities for Writing Tasks (Rubrics, Model Answers) & Speaking Tasks (Parts 1-3, Cue Cards)

-- 1. Writing Tasks Domain Entity
CREATE TABLE IF NOT EXISTS public.writing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    exam_type VARCHAR(64) NOT NULL DEFAULT 'IELTS Academic',
    task_number INT NOT NULL DEFAULT 1, -- e.g., Task 1 (Graph/Chart) vs Task 2 (Essay)
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    instructions TEXT NOT NULL,
    min_words INT NOT NULL DEFAULT 150,
    max_words INT NULL,
    time_recommended_minutes INT NOT NULL DEFAULT 20,
    model_answer TEXT NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_band_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.writing_tasks(id) ON DELETE CASCADE,
    criterion VARCHAR(64) NOT NULL, -- e.g. 'TASK_ACHIEVEMENT', 'COHERENCE_COHESION', 'LEXICAL_RESOURCE', 'GRAMMATICAL_RANGE'
    band_score NUMERIC(3,1) NOT NULL, -- e.g. 7.0, 8.0
    descriptor TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_writing_rubric UNIQUE (task_id, criterion, band_score)
);

-- 2. Speaking Tasks Domain Entity
CREATE TABLE IF NOT EXISTS public.speaking_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    exam_type VARCHAR(64) NOT NULL DEFAULT 'IELTS Academic',
    part_number INT NOT NULL DEFAULT 1, -- Part 1 (Intro), Part 2 (Cue Card), Part 3 (Discussion)
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    preparation_seconds INT NOT NULL DEFAULT 60,
    response_seconds INT NOT NULL DEFAULT 120,
    audio_prompt_url VARCHAR(1024) NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_cue_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    speaking_task_id UUID NOT NULL REFERENCES public.speaking_tasks(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    bullet_points JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["You should say what it is", "Where it happened", "Why it matters"]
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.writing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_band_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_cue_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_writing_tasks ON public.writing_tasks FOR SELECT USING (true);
CREATE POLICY manage_writing_tasks ON public.writing_tasks FOR ALL USING (true);

CREATE POLICY select_writing_rubrics ON public.writing_band_rubrics FOR SELECT USING (true);
CREATE POLICY manage_writing_rubrics ON public.writing_band_rubrics FOR ALL USING (true);

CREATE POLICY select_speaking_tasks ON public.speaking_tasks FOR SELECT USING (true);
CREATE POLICY manage_speaking_tasks ON public.speaking_tasks FOR ALL USING (true);

CREATE POLICY select_speaking_cue_cards ON public.speaking_cue_cards FOR SELECT USING (true);
CREATE POLICY manage_speaking_cue_cards ON public.speaking_cue_cards FOR ALL USING (true);
