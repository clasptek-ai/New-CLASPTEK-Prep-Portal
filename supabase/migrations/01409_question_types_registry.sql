-- Migration: 01409_question_types_registry.sql
-- Description: Dynamic, configuration-driven Question Types Registry Table

CREATE TABLE IF NOT EXISTS public.question_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    display_name VARCHAR(128) NOT NULL,
    renderer_key VARCHAR(128) NOT NULL,
    validator_key VARCHAR(128) NOT NULL,
    scoring_strategy_key VARCHAR(128) NOT NULL,
    supports_passage BOOLEAN NOT NULL DEFAULT false,
    supports_media BOOLEAN NOT NULL DEFAULT false,
    supports_rubric BOOLEAN NOT NULL DEFAULT false,
    supports_timing BOOLEAN NOT NULL DEFAULT true,
    metadata_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed standard Question Types
INSERT INTO public.question_types (code, display_name, renderer_key, validator_key, scoring_strategy_key, supports_passage, supports_media, supports_rubric)
VALUES
    ('MCQ', 'Multiple Choice Question', 'McqRenderer', 'McqValidator', 'ExactMatchScoring', true, true, false),
    ('MULTIPLE_RESPONSE', 'Multiple Response MCQ', 'MultipleResponseRenderer', 'MultipleResponseValidator', 'PartialCreditScoring', true, true, false),
    ('TRUE_FALSE_NOT_GIVEN', 'True / False / Not Given', 'TfngRenderer', 'TfngValidator', 'ExactMatchScoring', true, false, false),
    ('YES_NO_NOT_GIVEN', 'Yes / No / Not Given', 'YnngRenderer', 'YnngValidator', 'ExactMatchScoring', true, false, false),
    ('MATCHING', 'Matching Headings / Features', 'MatchingRenderer', 'MatchingValidator', 'ExactMatchScoring', true, false, false),
    ('SUMMARY_COMPLETION', 'Summary / Note Completion', 'CompletionRenderer', 'CompletionValidator', 'ExactMatchScoring', true, false, false),
    ('FILL_IN_BLANK', 'Fill in the Blank', 'CompletionRenderer', 'CompletionValidator', 'ExactMatchScoring', true, false, false),
    ('ESSAY', 'Extended Essay / Writing Task', 'WritingTaskRenderer', 'WritingTaskValidator', 'RubricBandScoring', true, true, true),
    ('SPEAKING_PROMPT', 'Speaking Cue Card / Prompt', 'SpeakingTaskRenderer', 'SpeakingTaskValidator', 'RubricBandScoring', false, true, true)
ON CONFLICT (code) DO NOTHING;

-- Enable RLS
ALTER TABLE public.question_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_question_types ON public.question_types FOR SELECT USING (true);
CREATE POLICY manage_question_types ON public.question_types FOR ALL USING (true);
