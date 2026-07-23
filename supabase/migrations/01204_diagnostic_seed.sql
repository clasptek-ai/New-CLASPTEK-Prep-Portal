-- Migration: 01204_diagnostic_seed.sql
-- Description: Idempotent Seed Data for Diagnostic catalog structures

-- Seed default English Foundation Diagnostic Catalog
INSERT INTO diagnostic_catalogs (id, exam_product_id, code, name, description, status, version_no) VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001', -- English Proficiency Exam ID reference
  'ENG-PROF-DIAG',
  'English Proficiency Placement Diagnostic',
  'Baseline placement assessment measuring English vocabulary, grammar, and sentence structure.',
  'PUBLISHED',
  1
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- Seed standard assessment form mapping
INSERT INTO assessment_forms (id, catalog_id, code, name, description, duration_minutes, total_questions, blueprint_config) VALUES
(
  'd0000000-0000-0000-0000-000000000101',
  'd0000000-0000-0000-0000-000000000001',
  'ENG-PROF-DIAG-FORM-1',
  'Placement Diagnostic Form A',
  'Standard placement form containing 20 curated diagnostic items.',
  30,
  20,
  '{
    "blueprintObjectives": [
      {"code": "Grammar", "weight": 0.3},
      {"code": "Vocabulary", "weight": 0.3},
      {"code": "Sentence Structure", "weight": 0.2},
      {"code": "Reading Mechanics", "weight": 0.1},
      {"code": "Writing Mechanics", "weight": 0.1}
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  total_questions = EXCLUDED.total_questions,
  blueprint_config = EXCLUDED.blueprint_config;
