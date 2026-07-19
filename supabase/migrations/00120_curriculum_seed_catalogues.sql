-- Migration: 00120_curriculum_seed_catalogues.sql
-- Description: Seed catalog data for activity types and default IELTS curriculum template

-- Seed activity types
INSERT INTO public.activity_types (id, code, name, description, category, supports_interaction, supports_collaboration, supports_external_resource) VALUES
('b3310001-c89b-449e-b9b2-3c81e3a10001', 'reading', 'Reading Study', 'Instructional reading material', 'instructional', false, false, true),
('b3310002-c89b-449e-b9b2-3c81e3a10002', 'video', 'Video Lecture', 'Instructional video session', 'instructional', false, false, true),
('b3310003-c89b-449e-b9b2-3c81e3a10003', 'audio', 'Audio Listening', 'Instructional listening practice', 'instructional', false, false, true),
('b3310004-c89b-449e-b9b2-3c81e3a10004', 'demonstration', 'Teacher Demonstration', 'Live or recorded demonstration of a technique', 'instructional', true, false, false),
('b3310005-c89b-449e-b9b2-3c81e3a10005', 'guided_example', 'Guided Practice Example', 'Step-by-step walkthrough of a sample problem', 'practice', true, false, true),
('b3310006-c89b-449e-b9b2-3c81e3a10006', 'worked_solution', 'Worked Solution Review', 'Self-paced review of completed worked solution DDL', 'practice', false, false, true),
('b3310007-c89b-449e-b9b2-3c81e3a10007', 'discussion', 'Peer Group Discussion', 'Collaborative peer group analysis', 'collaborative', true, true, false),
('b3310008-c89b-449e-b9b2-3c81e3a10008', 'reflection', 'Self Reflection Journal', 'Individual learning journal entry', 'reflective', false, false, false),
('b3310009-c89b-449e-b9b2-3c81e3a10009', 'note_taking', 'Active Note Taking', 'Structured note taking task', 'instructional', false, false, false),
('b3310010-c89b-449e-b9b2-3c81e3a10010', 'drill', 'Exam Style Drill', 'Time-limited concept testing drill', 'practice', false, false, true),
('b3310011-c89b-449e-b9b2-3c81e3a10011', 'role_play', 'Speaking Role Play', 'Simulated interactive role play session', 'interactive', true, true, false),
('b3310012-c89b-449e-b9b2-3c81e3a10012', 'speaking_rehearsal', 'Speaking Practice Recording', 'Self-recorded mock interview speaking practice', 'practice', true, false, true),
('b3310013-c89b-449e-b9b2-3c81e3a10013', 'writing_workshop', 'Writing Essay Workshop', 'Drafting and revision essay task', 'practice', true, false, true),
('b3310014-c89b-449e-b9b2-3c81e3a10014', 'mathematical_practice', 'Quantitative Problem Drill', 'Quantitative concept problem drill', 'practice', false, false, true),
('b3310015-c89b-449e-b9b2-3c81e3a10015', 'project', 'Applied Learning Project', 'Mini-project assignment task', 'collaborative', true, true, true),
('b3310016-c89b-449e-b9b2-3c81e3a10016', 'external_tool', 'External Integration Tool', 'Interactive task via LTI or external frame', 'practice', true, true, true),
('b3310017-c89b-449e-b9b2-3c81e3a10017', 'custom', 'Custom Teacher Activity', 'Custom teacher designed learning activity', 'instructional', true, true, true)
ON CONFLICT (code) DO NOTHING;

-- Seed default IELTS Template
INSERT INTO public.curriculum_templates (id, code, slug, name, description, status) VALUES
('a5510001-c89b-449e-b9b2-3c81e3a10001', 'IELTS-STANDARD', 'ielts-standard-template', 'IELTS Academic Standard Template', 'Outlines standard four modules: Listening, Reading, Writing, Speaking', 'published')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.curriculum_template_versions (id, template_id, version_no, name, description, structure_snapshot_json, status) VALUES
('a5520001-c89b-449e-b9b2-3c81e3a10001', 'a5510001-c89b-449e-b9b2-3c81e3a10001', '1.0.0', 'Standard Curriculum Outline V1', 'Initial template framework', '{"modules": [{"code": "MOD-L", "name": "Listening"}, {"code": "MOD-R", "name": "Reading"}, {"code": "MOD-W", "name": "Writing"}, {"code": "MOD-S", "name": "Speaking"}]}'::jsonb, 'published')
ON CONFLICT (template_id, version_no) DO NOTHING;

-- Seed default curriculum
INSERT INTO public.curricula (id, code, slug, name, description, status) VALUES
('c1000000-0000-0000-0000-000000000001', 'IELTS-L-R-W-S', 'ielts-listening-reading-writing-speaking', 'IELTS Standard Prep Course', 'IELTS Preparation Curriculum', 'published')
ON CONFLICT (code) DO NOTHING;

-- Seed default version
INSERT INTO public.curriculum_versions (id, curriculum_id, version_no, status, name, description, breaking_change) VALUES
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '1.0.0', 'published', 'IELTS Prep Version 1', 'Baseline curriculum version', false)
ON CONFLICT (curriculum_id, version_no) DO NOTHING;

-- Update curricula to point to version
UPDATE public.curricula 
SET current_version_id = 'd1000000-0000-0000-0000-000000000001', current_version_no = '1.0.0'
WHERE id = 'c1000000-0000-0000-0000-000000000001';

-- Seed default module referenced by learning_resources
INSERT INTO public.learning_modules (id, curriculum_version_id, code, slug, name, description, module_type, default_sequence_no, estimated_study_minutes, minimum_study_minutes, maximum_study_minutes, is_required, completion_policy, status) VALUES
('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'IELTS-LIS', 'ielts-listening-module', 'IELTS Listening Module', 'Listening module section', 'core', 1, 120, 90, 180, true, 'all_activities', 'published')
ON CONFLICT (curriculum_version_id, code) DO NOTHING;
