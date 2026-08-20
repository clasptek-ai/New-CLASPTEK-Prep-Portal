-- Migration: 01440_ielts_reading_canonical_types.sql
-- Description: Register canonical IELTS Reading question types and extend question_groups metadata

-- 1. Extend question_groups with content_title, content_type, shared_data
ALTER TABLE public.question_groups
    ADD COLUMN IF NOT EXISTS content_title VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS content_type VARCHAR(64) NULL,
    ADD COLUMN IF NOT EXISTS shared_data JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Register canonical Question Types for IELTS Reading
INSERT INTO public.question_types (code, display_name, renderer_key, validator_key, scoring_strategy_key, supports_passage, supports_media, supports_rubric)
VALUES
    ('MATCHING_HEADINGS', 'Matching Headings', 'MatchingHeadingsRenderer', 'MatchingHeadingsValidator', 'ExactMatchScoring', true, false, false),
    ('MATCHING_INFORMATION', 'Matching Information', 'MatchingInfoRenderer', 'MatchingInfoValidator', 'ExactMatchScoring', true, false, false),
    ('MATCHING_FEATURES', 'Matching Features', 'MatchingFeaturesRenderer', 'MatchingFeaturesValidator', 'ExactMatchScoring', true, false, false),
    ('COMPLETION', 'Sentence / Note Completion', 'CompletionRenderer', 'CompletionValidator', 'ExactMatchScoring', true, false, false),
    ('NOTE_COMPLETION', 'Note Completion', 'NoteCompletionRenderer', 'CompletionValidator', 'ExactMatchScoring', true, false, false),
    ('SHORT_ANSWER', 'Short Answer Question', 'ShortAnswerRenderer', 'ShortAnswerValidator', 'ExactMatchScoring', true, false, false),
    ('MULTIPLE_CHOICE', 'Multiple Choice Question', 'McqRenderer', 'McqValidator', 'ExactMatchScoring', true, false, false)
ON CONFLICT (code) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    renderer_key = EXCLUDED.renderer_key,
    validator_key = EXCLUDED.validator_key,
    supports_passage = EXCLUDED.supports_passage;
