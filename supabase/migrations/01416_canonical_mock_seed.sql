-- Migration: 01416_canonical_mock_seed.sql
-- Description: Idempotent Seed Data for Canonical Mock Blueprints across the 6 Supported Products

-- 1. IELTS Academic Mock Blueprint
INSERT INTO public.mock_blueprints (id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload) VALUES
(
  'mb000000-0000-0000-0000-000000000001',
  'IELTS-ACAD-FULL',
  'IELTS Academic Official Examination Simulation',
  'Full-length official simulation covering Reading, Writing, Listening, and Speaking sections.',
  'IELTS',
  'PUBLISHED',
  'IELTS Academic',
  1,
  '[
    {"name": "Listening", "orderIndex": 1, "timeLimitMinutes": 30, "questionCount": 40},
    {"name": "Reading", "orderIndex": 2, "timeLimitMinutes": 60, "questionCount": 40},
    {"name": "Writing", "orderIndex": 3, "timeLimitMinutes": 60, "questionCount": 2},
    {"name": "Speaking", "orderIndex": 4, "timeLimitMinutes": 15, "questionCount": 3}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  sections_payload = EXCLUDED.sections_payload;

-- 2. IELTS General Training Mock Blueprint
INSERT INTO public.mock_blueprints (id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload) VALUES
(
  'mb000000-0000-0000-0000-000000000002',
  'IELTS-GEN-FULL',
  'IELTS General Training Official Examination Simulation',
  'Full-length simulation covering General Reading, General Writing, Listening, and Speaking sections.',
  'IELTS',
  'PUBLISHED',
  'IELTS General Training',
  1,
  '[
    {"name": "Listening", "orderIndex": 1, "timeLimitMinutes": 30, "questionCount": 40},
    {"name": "Reading", "orderIndex": 2, "timeLimitMinutes": 60, "questionCount": 40},
    {"name": "Writing", "orderIndex": 3, "timeLimitMinutes": 60, "questionCount": 2},
    {"name": "Speaking", "orderIndex": 4, "timeLimitMinutes": 15, "questionCount": 3}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  sections_payload = EXCLUDED.sections_payload;

-- 3. TOEFL iBT Mock Blueprint
INSERT INTO public.mock_blueprints (id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload) VALUES
(
  'mb000000-0000-0000-0000-000000000003',
  'TOEFL-IBT-FULL',
  'TOEFL iBT Official Examination Simulation',
  'Full-length simulation covering Reading, Listening, Speaking, and Writing sections.',
  'TOEFL',
  'PUBLISHED',
  'TOEFL iBT',
  1,
  '[
    {"name": "Reading", "orderIndex": 1, "timeLimitMinutes": 35, "questionCount": 20},
    {"name": "Listening", "orderIndex": 2, "timeLimitMinutes": 36, "questionCount": 28},
    {"name": "Speaking", "orderIndex": 3, "timeLimitMinutes": 16, "questionCount": 4},
    {"name": "Writing", "orderIndex": 4, "timeLimitMinutes": 29, "questionCount": 2}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  sections_payload = EXCLUDED.sections_payload;

-- 4. Digital SAT Mock Blueprint (Strictly Reading & Writing, Math — No Listening / Speaking)
INSERT INTO public.mock_blueprints (id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload) VALUES
(
  'mb000000-0000-0000-0000-000000000004',
  'SAT-DIGITAL-FULL',
  'Digital SAT Official Examination Simulation',
  'Digital SAT adaptive simulation covering Reading & Writing and Math modules.',
  'SAT',
  'PUBLISHED',
  'SAT',
  1,
  '[
    {"name": "Reading and Writing", "orderIndex": 1, "timeLimitMinutes": 64, "questionCount": 54},
    {"name": "Math", "orderIndex": 2, "timeLimitMinutes": 70, "questionCount": 44}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  sections_payload = EXCLUDED.sections_payload;

-- 5. CELPIP General Mock Blueprint
INSERT INTO public.mock_blueprints (id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload) VALUES
(
  'mb000000-0000-0000-0000-000000000005',
  'CELPIP-GEN-FULL',
  'CELPIP General Official Examination Simulation',
  'Full-length simulation covering Listening, Reading, Writing, and Speaking sections.',
  'CELPIP',
  'PUBLISHED',
  'CELPIP',
  1,
  '[
    {"name": "Listening", "orderIndex": 1, "timeLimitMinutes": 50, "questionCount": 38},
    {"name": "Reading", "orderIndex": 2, "timeLimitMinutes": 55, "questionCount": 38},
    {"name": "Writing", "orderIndex": 3, "timeLimitMinutes": 53, "questionCount": 2},
    {"name": "Speaking", "orderIndex": 4, "timeLimitMinutes": 20, "questionCount": 8}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  sections_payload = EXCLUDED.sections_payload;

-- 6. English Proficiency Progress Mock Blueprint
INSERT INTO public.mock_blueprints (id, exam_code, title, description, scoring_strategy, status, exam_type, version_no, sections_payload) VALUES
(
  'mb000000-0000-0000-0000-000000000006',
  'ENG-PROF-PROGRESS-MOCK',
  'English Proficiency Progress Examination',
  'Comprehensive 5-skill progress assessment for Foundation & Intermediate learners.',
  'CUSTOM',
  'PUBLISHED',
  'English Proficiency',
  1,
  '[
    {"name": "Grammar", "orderIndex": 1, "timeLimitMinutes": 15, "questionCount": 10},
    {"name": "Reading", "orderIndex": 2, "timeLimitMinutes": 15, "questionCount": 10},
    {"name": "Writing", "orderIndex": 3, "timeLimitMinutes": 15, "questionCount": 1},
    {"name": "Listening", "orderIndex": 4, "timeLimitMinutes": 15, "questionCount": 10},
    {"name": "Speaking", "orderIndex": 5, "timeLimitMinutes": 15, "questionCount": 1}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  sections_payload = EXCLUDED.sections_payload;
