-- Migration: 01413_canonical_assessment_seed.sql
-- Description: Idempotent Seed Data for Canonical Assessment Definitions, Sections, Blueprints and Placement Rules

-- 1. Seed Canonical Assessment Definitions for the 6 Supported Products
INSERT INTO public.assessment_definitions (id, code, exam_type, title, assessment_type) VALUES
('ad000000-0000-0000-0000-000000000001', 'ENG-PROF-DIAG', 'English Proficiency', 'English Proficiency Placement Diagnostic', 'DIAGNOSTIC'),
('ad000000-0000-0000-0000-000000000002', 'IELTS-AC-DIAG', 'IELTS Academic', 'IELTS Academic Readiness Diagnostic', 'DIAGNOSTIC'),
('ad000000-0000-0000-0000-000000000003', 'IELTS-GT-DIAG', 'IELTS General Training', 'IELTS General Training Readiness Diagnostic', 'DIAGNOSTIC'),
('ad000000-0000-0000-0000-000000000004', 'TOEFL-IBT-DIAG', 'TOEFL iBT', 'TOEFL iBT Readiness Diagnostic', 'DIAGNOSTIC'),
('ad000000-0000-0000-0000-000000000005', 'SAT-DIGITAL-DIAG', 'SAT', 'Digital SAT Readiness Diagnostic', 'DIAGNOSTIC'),
('ad000000-0000-0000-0000-000000000006', 'CELPIP-GEN-DIAG', 'CELPIP', 'CELPIP General Readiness Diagnostic', 'DIAGNOSTIC')
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  assessment_type = EXCLUDED.assessment_type,
  exam_type = EXCLUDED.exam_type;

-- 2. Seed Blueprint Versions for English Proficiency
INSERT INTO public.blueprint_versions (id, blueprint_id, version_no, version_label, title, exam_type, scoring_method, rules_payload, sections_payload, status) VALUES
(
  'bp000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  1,
  'v1.0',
  'English Proficiency 5-Skill Blueprint',
  'English Proficiency',
  'MULTI_SKILL_PERCENTAGE',
  '[{"rule": "SECTION_EQUAL_WEIGHT", "weight": 0.2}]'::jsonb,
  '[
    {"code": "Grammar", "name": "Grammar & Structure", "order": 1, "timeLimitMinutes": 10},
    {"code": "Reading", "name": "Reading Comprehension", "order": 2, "timeLimitMinutes": 10},
    {"code": "Writing", "name": "Writing Expression", "order": 3, "timeLimitMinutes": 10},
    {"code": "Listening", "name": "Listening Comprehension", "order": 4, "timeLimitMinutes": 10},
    {"code": "Speaking", "name": "Oral Communication", "order": 5, "timeLimitMinutes": 10}
  ]'::jsonb,
  'published'
)
ON CONFLICT (blueprint_id, version_no) DO UPDATE SET
  title = EXCLUDED.title,
  sections_payload = EXCLUDED.sections_payload,
  status = EXCLUDED.status;

-- 3. Seed Published Assessment Version for English Proficiency
INSERT INTO public.assessment_versions (id, assessment_id, version_no, blueprint_version_id, title, status) VALUES
(
  'av000000-0000-0000-0000-000000000001',
  'ad000000-0000-0000-0000-000000000001',
  1,
  'bp000000-0000-0000-0000-000000000001',
  'English Proficiency Placement Diagnostic Form A (5-Skill)',
  'published'
)
ON CONFLICT (assessment_id, version_no) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status;

-- 4. Seed Assessment Sections for English Proficiency (5 Core Skills)
INSERT INTO public.assessment_sections (id, code, exam_type, name, display_order, time_limit_minutes, instructions) VALUES
('sec00000-0000-0000-0000-000000000001', 'ENG-PROF-GRAMMAR', 'English Proficiency', 'Grammar & Structure', 1, 10, 'Answer all grammar, tenses, and sentence structure questions.'),
('sec00000-0000-0000-0000-000000000002', 'ENG-PROF-READING', 'English Proficiency', 'Reading Comprehension', 2, 10, 'Read the passage carefully and answer the questions that follow.'),
('sec00000-0000-0000-0000-000000000003', 'ENG-PROF-WRITING', 'English Proficiency', 'Writing Expression', 3, 10, 'Compose a well-structured essay response adhering to prompt requirements.'),
('sec00000-0000-0000-0000-000000000004', 'ENG-PROF-LISTENING', 'English Proficiency', 'Listening Comprehension', 4, 10, 'Listen to the audio track and select the best response for each question.'),
('sec00000-0000-0000-0000-000000000005', 'ENG-PROF-SPEAKING', 'English Proficiency', 'Speaking & Oral Delivery', 5, 10, 'Record or submit your oral response to the cue card prompt.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  instructions = EXCLUDED.instructions;

-- 5. Seed Placement Threshold Rules for English Proficiency
INSERT INTO public.placement_threshold_rules (id, assessment_definition_id, placement_level, min_overall_score, max_overall_score, required_skill_minimums, priority) VALUES
('ptr00000-0000-0000-0000-000000000001', 'ad000000-0000-0000-0000-000000000001', 'INTERMEDIATE', 50.00, 100.00, '{"Grammar": 40.0, "Reading": 40.0}'::jsonb, 2),
('ptr00000-0000-0000-0000-000000000002', 'ad000000-0000-0000-0000-000000000001', 'FOUNDATION', 0.00, 49.99, '{}'::jsonb, 1)
ON CONFLICT (id) DO UPDATE SET
  placement_level = EXCLUDED.placement_level,
  min_overall_score = EXCLUDED.min_overall_score,
  max_overall_score = EXCLUDED.max_overall_score,
  priority = EXCLUDED.priority;

-- 6. Seed Listening Track
INSERT INTO public.listening_tracks (id, code, title, url, duration_seconds, transcript, exam_type, status) VALUES
('lt000000-0000-0000-0000-000000000001', 'ENG-PROF-AUDIO-1', 'English Proficiency Conversation Audio', 'https://cdn.clasptek.com/audio/eng-prof-diagnostic-track-1.mp3', 180, 'Speaker 1: Welcome to the orientation seminar...', 'English Proficiency', 'published')
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  url = EXCLUDED.url;

-- 7. Seed Reading Passage
INSERT INTO public.reading_passages (id, code, title, content, exam_type, section, word_count, status) VALUES
('rp000000-0000-0000-0000-000000000001', 'ENG-PROF-PASSAGE-1', 'The Evolution of Maritime Trade', 'Maritime trade has served as the backbone of international commerce for over two millennia. Early seafaring merchants established trade routes across the Mediterranean and Indian Oceans...', 'English Proficiency', 'Reading', 145, 'published')
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content;

-- 8. Seed Writing Task
INSERT INTO public.writing_tasks (id, code, exam_type, task_number, title, prompt, instructions, min_words) VALUES
('wt000000-0000-0000-0000-000000000001', 'ENG-PROF-TASK-1', 'English Proficiency', 1, 'Education Essay Prompt', 'Discuss whether remote learning is as effective as traditional classroom education.', 'Write a well-structured essay discussing both sides.', 150)
ON CONFLICT (code) DO UPDATE SET
  prompt = EXCLUDED.prompt;

-- 9. Seed Speaking Task
INSERT INTO public.speaking_tasks (id, code, exam_type, part_number, title, prompt, preparation_seconds, response_seconds) VALUES
('st000000-0000-0000-0000-000000000001', 'ENG-PROF-CUE-1', 'English Proficiency', 2, 'Memorable Journey Cue Card', 'Describe a memorable journey you have taken. Speak for 1-2 minutes.', 60, 120)
ON CONFLICT (code) DO UPDATE SET
  prompt = EXCLUDED.prompt;

