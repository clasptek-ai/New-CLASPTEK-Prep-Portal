-- Idempotent Seed Data for Canonical Exam Product Domain V3
-- Milestone 1 to 5 Seeding

-- 1. Seed Core Products
INSERT INTO exam_products (id, code, slug, name, description, product_family, status, current_version_no) VALUES
('e0000000-0000-0000-0000-000000000001', 'ENG-PROF', 'english-proficiency', 'English Proficiency', 'General English Proficiency Examination', 'language_proficiency', 'PUBLISHED', '1.0.0'),
('e0000000-0000-0000-0000-000000000002', 'IELTS-AC', 'ielts-academic', 'IELTS Academic', 'International English Language Testing System - Academic', 'language_proficiency', 'PUBLISHED', '1.0.0'),
('e0000000-0000-0000-0000-000000000003', 'IELTS-GT', 'ielts-general-training', 'IELTS General Training', 'International English Language Testing System - General Training', 'language_proficiency', 'PUBLISHED', '1.0.0'),
('e0000000-0000-0000-0000-000000000004', 'TOEFL-IBT', 'toefl-ibt', 'TOEFL iBT', 'Test of English as a Foreign Language internet-Based Test', 'language_proficiency', 'PUBLISHED', '1.0.0'),
('e0000000-0000-0000-0000-000000000005', 'CELPIP-GEN', 'celpip-general', 'CELPIP General', 'Canadian English Language Proficiency Index Program - General', 'language_proficiency', 'PUBLISHED', '1.0.0'),
('e0000000-0000-0000-0000-000000000006', 'SAT-DIGITAL', 'sat-digital', 'Digital SAT', 'Scholastic Assessment Test - Digital Format', 'academic_aptitude', 'PUBLISHED', '1.0.0')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  product_family = EXCLUDED.product_family,
  status = EXCLUDED.status,
  current_version_no = EXCLUDED.current_version_no;

-- 2. Seed Product Versions
INSERT INTO exam_product_versions (id, exam_product_id, version_no, status, name, description, official_board_name, official_board_code, official_website, duration_minutes, validity_period_months, primary_language_code, exam_type, effective_from) VALUES
('e0000000-0000-0000-0000-000000000101', 'e0000000-0000-0000-0000-000000000001', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Standard English proficiency structure', 'Cambridge Assessment', 'CAM-ENG', 'https://www.cambridgeenglish.org', 120, 24, 'en', 'LINEAR', '2026-01-01 00:00:00+00'),
('e0000000-0000-0000-0000-000000000102', 'e0000000-0000-0000-0000-000000000002', '1.0.0', 'PUBLISHED', 'Version 1.0', 'IELTS Academic standard structure', 'IDP & British Council', 'IELTS-BOARD', 'https://www.ielts.org', 165, 24, 'en', 'LINEAR', '2026-01-01 00:00:00+00'),
('e0000000-0000-0000-0000-000000000103', 'e0000000-0000-0000-0000-000000000003', '1.0.0', 'PUBLISHED', 'Version 1.0', 'IELTS General Training standard structure', 'IDP & British Council', 'IELTS-BOARD', 'https://www.ielts.org', 165, 24, 'en', 'LINEAR', '2026-01-01 00:00:00+00'),
('e0000000-0000-0000-0000-000000000104', 'e0000000-0000-0000-0000-000000000004', '1.0.0', 'PUBLISHED', 'Version 1.0', 'TOEFL iBT standard structure', 'ETS', 'ETS-TOEFL', 'https://www.ets.org/toefl', 120, 24, 'en', 'LINEAR', '2026-01-01 00:00:00+00'),
('e0000000-0000-0000-0000-000000000105', 'e0000000-0000-0000-0000-000000000005', '1.0.0', 'PUBLISHED', 'Version 1.0', 'CELPIP General standard structure', 'Prometric', 'CELPIP-PRO', 'https://www.celpip.ca', 180, 24, 'en', 'LINEAR', '2026-01-01 00:00:00+00'),
('e0000000-0000-0000-0000-000000000106', 'e0000000-0000-0000-0000-000000000006', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Digital SAT standard structure', 'College Board', 'CB-SAT', 'https://satsuite.collegeboard.org', 134, 60, 'en', 'ADAPTIVE', '2026-01-01 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET
  exam_product_id = EXCLUDED.exam_product_id,
  version_no = EXCLUDED.version_no,
  status = EXCLUDED.status,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_board_name = EXCLUDED.official_board_name,
  official_board_code = EXCLUDED.official_board_code,
  official_website = EXCLUDED.official_website,
  duration_minutes = EXCLUDED.duration_minutes,
  validity_period_months = EXCLUDED.validity_period_months,
  primary_language_code = EXCLUDED.primary_language_code,
  exam_type = EXCLUDED.exam_type,
  effective_from = EXCLUDED.effective_from;

-- Update current version associations
UPDATE exam_products SET current_version_id = 'e0000000-0000-0000-0000-000000000101' WHERE id = 'e0000000-0000-0000-0000-000000000001';
UPDATE exam_products SET current_version_id = 'e0000000-0000-0000-0000-000000000102' WHERE id = 'e0000000-0000-0000-0000-000000000002';
UPDATE exam_products SET current_version_id = 'e0000000-0000-0000-0000-000000000103' WHERE id = 'e0000000-0000-0000-0000-000000000003';
UPDATE exam_products SET current_version_id = 'e0000000-0000-0000-0000-000000000104' WHERE id = 'e0000000-0000-0000-0000-000000000004';
UPDATE exam_products SET current_version_id = 'e0000000-0000-0000-0000-000000000105' WHERE id = 'e0000000-0000-0000-0000-000000000005';
UPDATE exam_products SET current_version_id = 'e0000000-0000-0000-0000-000000000106' WHERE id = 'e0000000-0000-0000-0000-000000000006';

-- 3. Seed Structure Configurations
INSERT INTO official_exam_structures (id, exam_product_id, exam_product_version_id, code, name, board_structure_version, description, is_current_official_structure, status) VALUES
('e0000000-0000-0000-0000-000000000201', 'e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000101', 'ENG-PROF-STRUCT', 'English Proficiency Structure', 'V1', 'Standard structure consisting of four core components', true, 'ACTIVE'),
('e0000000-0000-0000-0000-000000000202', 'e0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000102', 'IELTS-AC-STRUCT', 'IELTS Academic Structure', 'V1', 'Standard Academic structure consisting of four components', true, 'ACTIVE'),
('e0000000-0000-0000-0000-000000000203', 'e0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000103', 'IELTS-GT-STRUCT', 'IELTS General Training Structure', 'V1', 'Standard General structure consisting of four components', true, 'ACTIVE'),
('e0000000-0000-0000-0000-000000000204', 'e0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000104', 'TOEFL-STRUCT', 'TOEFL iBT Structure', 'V1', 'TOEFL format consisting of Reading, Listening, Speaking, Writing', true, 'ACTIVE'),
('e0000000-0000-0000-0000-000000000205', 'e0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000105', 'CELPIP-STRUCT', 'CELPIP General Structure', 'V1', 'CELPIP format consisting of Listening, Reading, Writing, Speaking', true, 'ACTIVE'),
('e0000000-0000-0000-0000-000000000206', 'e0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000106', 'SAT-DIGITAL-STRUCT', 'Digital SAT Structure', 'V1', 'Digital format consisting of Reading & Writing, and Math', true, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  board_structure_version = EXCLUDED.board_structure_version,
  description = EXCLUDED.description,
  is_current_official_structure = EXCLUDED.is_current_official_structure,
  status = EXCLUDED.status;

-- 4. Seed Component Hierarchy
INSERT INTO official_exam_components (id, official_exam_structure_id, parent_component_id, code, name, description, component_type, display_order, is_required, is_scored, is_timed, duration_minutes, weight_percentage) VALUES
-- IELTS Academic Components
('e0000000-0000-0000-0000-000000000301', 'e0000000-0000-0000-0000-000000000202', null, 'IELTS-AC-LISTENING', 'Listening Component', 'Audio evaluation paper', 'PAPER', 1, true, true, true, 30, 25.00),
('e0000000-0000-0000-0000-000000000302', 'e0000000-0000-0000-0000-000000000202', null, 'IELTS-AC-READING', 'Reading Component', 'Text evaluation paper', 'PAPER', 2, true, true, true, 60, 25.00),
('e0000000-0000-0000-0000-000000000303', 'e0000000-0000-0000-0000-000000000203', null, 'IELTS-AC-WRITING', 'Writing Component', 'Essay assessment paper', 'PAPER', 3, true, true, true, 60, 25.00),
('e0000000-0000-0000-0000-000000000304', 'e0000000-0000-0000-0000-000000000202', null, 'IELTS-AC-SPEAKING', 'Speaking Component', 'Interview and oral evaluation', 'PAPER', 4, true, true, true, 15, 25.00),
-- Digital SAT Components
('e0000000-0000-0000-0000-000000000305', 'e0000000-0000-0000-0000-000000000206', null, 'SAT-DIGITAL-RW', 'Reading & Writing Section', 'Evaluating textual literacy', 'SECTION', 1, true, true, true, 64, 50.00),
('e0000000-0000-0000-0000-000000000306', 'e0000000-0000-0000-0000-000000000206', null, 'SAT-DIGITAL-MATH', 'Math Section', 'Evaluating quantitative skills', 'SECTION', 2, true, true, true, 70, 50.00)
ON CONFLICT (id) DO UPDATE SET
  parent_component_id = EXCLUDED.parent_component_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  component_type = EXCLUDED.component_type,
  display_order = EXCLUDED.display_order,
  is_required = EXCLUDED.is_required,
  is_scored = EXCLUDED.is_scored,
  is_timed = EXCLUDED.is_timed,
  duration_minutes = EXCLUDED.duration_minutes,
  weight_percentage = EXCLUDED.weight_percentage;

-- 5. Seed Assessment Item Types
INSERT INTO assessment_item_types (id, code, name, description, response_mode, scoring_mode, supports_partial_credit, requires_stimulus, requires_media, allows_multiple_responses) VALUES
('b0000000-0000-0000-0000-000000000001', 'multiple_choice_single', 'Multiple Choice (Single Answer)', 'Select one correct answer from a list of options.', 'SELECTION', 'OBJECTIVE', false, false, false, false),
('b0000000-0000-0000-0000-000000000002', 'multiple_choice_multiple', 'Multiple Choice (Multiple Answers)', 'Select all correct answers from a list.', 'SELECTION', 'OBJECTIVE', true, false, false, true),
('b0000000-0000-0000-0000-000000000003', 'matching_headings', 'Matching Headings', 'Match list of headings to paragraphs.', 'MATCHING', 'OBJECTIVE', true, true, false, false),
('b0000000-0000-0000-0000-000000000004', 'true_false_not_given', 'True/False/Not Given', 'Identify if information is true, false, or not given in passage.', 'SELECTION', 'OBJECTIVE', false, true, false, false),
('b0000000-0000-0000-0000-000000000005', 'sentence_completion', 'Sentence Completion', 'Fill in the blanks inside a sentence.', 'INPUT', 'OBJECTIVE', false, false, false, false),
('b0000000-0000-0000-0000-000000000006', 'essay', 'Extended Writing Essay', 'Construct a long-form textual answer.', 'INPUT', 'SUBJECTIVE', true, true, false, false),
('b0000000-0000-0000-0000-000000000007', 'audio_response', 'Audio Oral Response', 'Record speech response.', 'AUDIO', 'SUBJECTIVE', true, false, false, false)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  response_mode = EXCLUDED.response_mode,
  scoring_mode = EXCLUDED.scoring_mode,
  supports_partial_credit = EXCLUDED.supports_partial_credit,
  requires_stimulus = EXCLUDED.requires_stimulus,
  requires_media = EXCLUDED.requires_media,
  allows_multiple_responses = EXCLUDED.allows_multiple_responses;

-- 6. Seed Global Skill Framework
INSERT INTO skill_frameworks (id, code, name, description, status, current_version_no) VALUES
('f0000000-0000-0000-0000-000000000001', 'CLASPTEK-CORE-SKILLS', 'Clasptek Core Skill Framework', 'Universal skill definitions across Lang and Aptitude exams', 'PUBLISHED', '1.0.0')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  current_version_no = EXCLUDED.current_version_no;

INSERT INTO skill_framework_versions (id, skill_framework_id, version_no, status, name, description, effective_from) VALUES
('f0000000-0000-0000-0000-000000000101', 'f0000000-0000-0000-0000-000000000001', '1.0.0', 'PUBLISHED', 'V1 Baseline Framework', 'Initial framework setup', '2026-01-01 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET
  skill_framework_id = EXCLUDED.skill_framework_id,
  version_no = EXCLUDED.version_no,
  status = EXCLUDED.status,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

UPDATE skill_frameworks SET current_version_id = 'f0000000-0000-0000-0000-000000000101' WHERE id = 'f0000000-0000-0000-0000-000000000001';

-- 7. Seed Skill Levels (CEFR scale equivalent)
INSERT INTO skill_levels (id, skill_framework_version_id, code, name, description, ordinal_position, minimum_mastery_percentage, maximum_mastery_percentage, equivalent_framework, equivalent_level) VALUES
('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000101', 'FOUNDATION', 'Foundation', 'Basic user - matching CEFR A1/A2 range', 0, 0.00, 39.99, 'CEFR', 'A2'),
('c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000101', 'INTERMEDIATE', 'Intermediate', 'Independent user - matching CEFR B1/B2 range', 1, 40.00, 69.99, 'CEFR', 'B2'),
('c0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000101', 'ADVANCED', 'Advanced', 'Proficient user - matching CEFR C1 range', 2, 70.00, 89.99, 'CEFR', 'C1'),
('c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000101', 'MASTERY', 'Mastery', 'Expert user - matching CEFR C2 range', 3, 90.00, 100.00, 'CEFR', 'C2')
ON CONFLICT (id) DO UPDATE SET
  skill_framework_version_id = EXCLUDED.skill_framework_version_id,
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  ordinal_position = EXCLUDED.ordinal_position,
  minimum_mastery_percentage = EXCLUDED.minimum_mastery_percentage,
  maximum_mastery_percentage = EXCLUDED.maximum_mastery_percentage,
  equivalent_framework = EXCLUDED.equivalent_framework,
  equivalent_level = EXCLUDED.equivalent_level;
