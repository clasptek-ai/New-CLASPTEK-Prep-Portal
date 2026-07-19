-- Migration: 00140_resource_seed.sql
-- Description: Seed initial resource types, formats, type-format rules, and categories.

-- 1. Seed Resource Types
INSERT INTO public.resource_types (id, code, name, description, category, default_sensitivity, requires_preview, requires_download)
VALUES
    ('a90e8400-e29b-41d4-a716-446655440001', 'worksheet', 'Worksheet', 'Lesson worksheets and exercises', 'educational', 'normal', false, true),
    ('a90e8400-e29b-41d4-a716-446655440002', 'grammar_note', 'Grammar Note', 'Grammar guides and explanations', 'educational', 'normal', false, true),
    ('a90e8400-e29b-41d4-a716-446655440003', 'vocabulary_list', 'Vocabulary List', 'Word lists and definitions', 'educational', 'normal', false, true),
    ('a90e8400-e29b-41d4-a716-446655440004', 'reading_passage', 'Reading Passage', 'Authoritative IELTS reading texts', 'educational', 'normal', true, false),
    ('a90e8400-e29b-41d4-a716-446655440005', 'listening_audio', 'Listening Audio', 'Audio recordings for listening tests', 'educational', 'normal', false, false),
    ('a90e8400-e29b-41d4-a716-446655440006', 'writing_sample', 'Writing Sample', 'Sample essays or writing task files', 'educational', 'normal', false, true),
    ('a90e8400-e29b-41d4-a716-446655440007', 'speaking_cue_card', 'Speaking Cue Card', 'Cue cards and speaking prompt files', 'educational', 'normal', false, true),
    ('a90e8400-e29b-41d4-a716-446655440008', 'teacher_guide', 'Teacher Guide', 'Instructor-only guides and lesson plans', 'educational', 'instructor_only', false, true),
    ('a90e8400-e29b-41d4-a716-446655440009', 'answer_key', 'Answer Key', 'Official answer sheets and explanations', 'educational', 'instructor_only', false, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Resource Formats
INSERT INTO public.resource_formats (id, code, name, format_family, canonical_mime_type, allowed_extensions_json, supports_preview, supports_streaming, supports_download)
VALUES
    ('b90e8400-e29b-41d4-a716-446655440001', 'pdf', 'PDF Document', 'document', 'application/pdf', '["pdf"]'::jsonb, true, false, true),
    ('b90e8400-e29b-41d4-a716-446655440002', 'video', 'MP4 Video', 'video', 'video/mp4', '["mp4", "webm"]'::jsonb, true, true, true),
    ('b90e8400-e29b-41d4-a716-446655440003', 'audio', 'MP3 Audio', 'audio', 'audio/mpeg', '["mp3", "wav"]'::jsonb, false, true, true),
    ('b90e8400-e29b-41d4-a716-446655440004', 'image', 'PNG/JPEG Image', 'image', 'image/png', '["png", "jpg", "jpeg"]'::jsonb, true, false, true),
    ('b90e8400-e29b-41d4-a716-446655440005', 'external_url', 'External Link URL', 'external_link', 'text/html', '[]'::jsonb, false, false, false)
ON CONFLICT (code) DO NOTHING;

-- 3. Seed Rule mappings
INSERT INTO public.resource_type_format_rules (resource_type_id, resource_format_id, is_allowed, is_recommended, requires_preview)
SELECT rt.id, rf.id, true, true, rt.requires_preview
FROM public.resource_types rt, public.resource_formats rf
WHERE (rt.code = 'reading_passage' AND rf.code = 'pdf')
   OR (rt.code = 'listening_audio' AND rf.code = 'audio')
   OR (rt.code = 'answer_key' AND rf.code = 'pdf')
   OR (rt.code = 'grammar_note' AND rf.code = 'pdf')
   OR (rt.code = 'worksheet' AND rf.code = 'pdf')
   OR (rt.code = 'speaking_cue_card' AND rf.code = 'external_url')
ON CONFLICT (resource_type_id, resource_format_id) DO NOTHING;

-- 4. Seed Category
INSERT INTO public.resource_categories (id, parent_category_id, code, name, description, display_order)
VALUES
    ('c90e8400-e29b-41d4-a716-446655440001', null, 'ielts', 'IELTS Materials', 'All materials targeting IELTS exam preparation', 1),
    ('c90e8400-e29b-41d4-a716-446655440002', 'c90e8400-e29b-41d4-a716-446655440001', 'ielts-listening', 'IELTS Listening', 'Listening mock tests, lecture notes, transcripts', 1),
    ('c90e8400-e29b-41d4-a716-446655440003', 'c90e8400-e29b-41d4-a716-446655440001', 'ielts-reading', 'IELTS Reading', 'Reading mock tests and explanations', 2)
ON CONFLICT (code) DO NOTHING;
