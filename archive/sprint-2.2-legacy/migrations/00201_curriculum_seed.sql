-- Migration: 00201_curriculum_seed.sql
-- Seed initial Curricula, Programmes, and child entities

-- 1. Seed Curricula
INSERT INTO curricula (id, code, slug, name, description, status, current_version_no) VALUES
('c0000000-0000-0000-0000-000000000002', 'IELTS-AC-CURRICULUM', 'ielts-academic-curriculum', 'IELTS Academic Curriculum', 'Teaching curriculum for IELTS Academic prep', 'PUBLISHED', '1.0.0'),
('c0000000-0000-0000-0000-000000000003', 'IELTS-GT-CURRICULUM', 'ielts-general-curriculum', 'IELTS General Curriculum', 'Teaching curriculum for IELTS General Training prep', 'PUBLISHED', '1.0.0'),
('c0000000-0000-0000-0000-000000000004', 'TOEFL-IBT-CURRICULUM', 'toefl-ibt-curriculum', 'TOEFL iBT Curriculum', 'Teaching curriculum for TOEFL iBT prep', 'PUBLISHED', '1.0.0'),
('c0000000-0000-0000-0000-000000000006', 'SAT-DIGITAL-CURRICULUM', 'sat-digital-curriculum', 'Digital SAT Curriculum', 'Teaching curriculum for Digital SAT prep', 'PUBLISHED', '1.0.0')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Curriculum Versions
INSERT INTO curriculum_versions (id, curriculum_id, version_no, status, name, description, effective_from, breaking_change) VALUES
('c1000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000002', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline IELTS Academic Curriculum version', '2026-01-01 00:00:00+00', false),
('c1000000-0000-0000-0000-000000000103', 'c0000000-0000-0000-0000-000000000003', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline IELTS General Curriculum version', '2026-01-01 00:00:00+00', false),
('c1000000-0000-0000-0000-000000000104', 'c0000000-0000-0000-0000-000000000004', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline TOEFL iBT Curriculum version', '2026-01-01 00:00:00+00', false),
('c1000000-0000-0000-0000-000000000106', 'c0000000-0000-0000-0000-000000000006', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline Digital SAT Curriculum version', '2026-01-01 00:00:00+00', false)
ON CONFLICT (curriculum_id, version_no) DO NOTHING;

UPDATE curricula SET current_version_id = 'c1000000-0000-0000-0000-000000000102' WHERE id = 'c0000000-0000-0000-0000-000000000002';
UPDATE curricula SET current_version_id = 'c1000000-0000-0000-0000-000000000103' WHERE id = 'c0000000-0000-0000-0000-000000000003';
UPDATE curricula SET current_version_id = 'c1000000-0000-0000-0000-000000000104' WHERE id = 'c0000000-0000-0000-0000-000000000004';
UPDATE curricula SET current_version_id = 'c1000000-0000-0000-0000-000000000106' WHERE id = 'c0000000-0000-0000-0000-000000000006';

-- 3. Seed Programmes
INSERT INTO programmes (id, exam_product_id, code, slug, name, description, status) VALUES
('a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'IELTS-AC-PREP', 'ielts-academic-prep', 'IELTS Academic Preparation Programme', 'Prep classes structure for academic English proficiency', 'PUBLISHED'),
('a0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'IELTS-GT-PREP', 'ielts-general-prep', 'IELTS General Training Prep Programme', 'Prep classes structure for general training English proficiency', 'PUBLISHED'),
('a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'TOEFL-IBT-PREP', 'toefl-ibt-prep', 'TOEFL iBT Prep Programme', 'Prep classes structure for TOEFL internet-Based Test', 'PUBLISHED'),
('a0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'SAT-DIGITAL-PREP', 'sat-digital-prep', 'Digital SAT Prep Programme', 'Prep classes structure for Digital SAT', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Programme Versions
INSERT INTO programme_versions (id, programme_id, version_no, status, name, description, effective_from, breaking_change) VALUES
('a1000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000002', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline IELTS Academic Programme version', '2026-01-01 00:00:00+00', false),
('a1000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000003', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline IELTS General Programme version', '2026-01-01 00:00:00+00', false),
('a1000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000004', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline TOEFL iBT Programme version', '2026-01-01 00:00:00+00', false),
('a1000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000006', '1.0.0', 'PUBLISHED', 'Version 1.0', 'Baseline Digital SAT Programme version', '2026-01-01 00:00:00+00', false)
ON CONFLICT (programme_id, version_no) DO NOTHING;

UPDATE programmes SET current_version_id = 'a1000000-0000-0000-0000-000000000102' WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE programmes SET current_version_id = 'a1000000-0000-0000-0000-000000000103' WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE programmes SET current_version_id = 'a1000000-0000-0000-0000-000000000104' WHERE id = 'a0000000-0000-0000-0000-000000000004';
UPDATE programmes SET current_version_id = 'a1000000-0000-0000-0000-000000000106' WHERE id = 'a0000000-0000-0000-0000-000000000006';

-- 5. Seed Mappings
INSERT INTO curriculum_programme_version_mappings (curriculum_version_id, programme_id, programme_version_id, display_order) VALUES
('c1000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000102', 1),
('c1000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000103', 1),
('c1000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000104', 1),
('c1000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000106', 1)
ON CONFLICT DO NOTHING;

-- 6. Seed Courses (Standard Preparation Course)
INSERT INTO courses (id, programme_version_id, name, description, display_order) VALUES
('c2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000102', 'IELTS Academic Master Course', 'Complete preparation course covering all modules', 1),
('c2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000106', 'Digital SAT Elite Prep Course', 'Complete prep course for math and verbal adaptive sections', 1)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Subjects (Listening, Reading, Writing, Speaking)
INSERT INTO subjects (id, course_id, name, description, display_order) VALUES
('e1000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000002', 'Listening Subject', 'Focused academic listening preparation', 1),
('e1000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'Reading Subject', 'Focused academic reading preparation', 2),
('e1000000-0000-0000-0000-000000000003', 'c2000000-0000-0000-0000-000000000002', 'Writing Subject', 'Focused academic writing preparation', 3),
('e1000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000002', 'Speaking Subject', 'Focused oral English training', 4)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Modules
INSERT INTO modules (id, subject_id, name, description, display_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Listening Section 1 Strategy', 'Form filling and spelling numbers strategy', 1)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Competencies
INSERT INTO competencies (id, module_id, code, name, description, display_order) VALUES
('c3000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000001', 'IELTS-LIS-C1', 'Factual Data Spelling', 'Spelling names, codes, and numerical details accurately', 1)
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Learning Objectives
INSERT INTO learning_objectives (id, competency_id, code, description, display_order) VALUES
('d0000000-0000-0000-0000-000000000201', 'c3000000-0000-0000-0000-000000000101', 'IELTS-LIS-O1', 'Recognize telephone numbers and spelling variations in fast speech', 1)
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Learning Outcomes
INSERT INTO learning_outcomes (id, learning_objective_id, code, description, display_order) VALUES
('d1000000-0000-0000-0000-000000000301', 'd0000000-0000-0000-0000-000000000201', 'IELTS-LIS-T1', 'Identify and write numeric phone digits in practice sheets with 90% accuracy', 1)
ON CONFLICT (id) DO NOTHING;
