-- Seed Data for Question Bank Domain

-- 1. Seed Question Schemas
INSERT INTO question_schema_registry (schema_name, schema_version, validator, renderer, migration_strategy, deprecated)
VALUES 
('SINGLE_CHOICE', '1.0.0', '{"type": "object", "properties": {"prompt": {"type": "string"}}}', 'choice-renderer', 'none', false),
('ESSAY', '1.0.0', '{"type": "object", "properties": {"prompt": {"type": "string"}}}', 'essay-renderer', 'none', false),
('CODING', '1.0.0', '{"type": "object", "properties": {"prompt": {"type": "string"}}}', 'coding-renderer', 'none', false)
ON CONFLICT DO NOTHING;

-- 2. Seed Sample Question (MCQ)
INSERT INTO questions (id, code, exam_product_id, curriculum_module_id, status, lock_version, created_at, updated_at)
VALUES (
    'd2000000-0000-0000-0000-000000000001',
    'IELTS-LIS-Q1',
    'e9999999-9999-9999-9999-999999999999', -- Exam ID placeholder
    'b1000000-0000-0000-0000-000000000001', -- Module ID placeholder
    'PUBLISHED',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

INSERT INTO question_versions (id, question_id, version_no, status, title, payload, digital_signature, lock_version)
VALUES (
    'd3000000-0000-0000-0000-000000000001',
    'd2000000-0000-0000-0000-000000000001',
    '1.0.0',
    'PUBLISHED',
    'Listening Choice Question 1',
    '{"prompt": "What is the primary keyword mentioned in Section 1?"}',
    'sig-12345',
    1
) ON CONFLICT DO NOTHING;

INSERT INTO answer_options (id, question_version_id, code, text_content, is_correct, display_order)
VALUES 
('d4000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', 'A', 'First Option', false, 1),
('d4000000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000001', 'B', 'Second Option', true, 2),
('d4000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000001', 'C', 'Third Option', false, 3)
ON CONFLICT DO NOTHING;

INSERT INTO solutions (id, question_version_id, explanation, incorrect_explanation, hint, reference_url, teaching_note)
VALUES (
    'd5000000-0000-0000-0000-000000000001',
    'd3000000-0000-0000-0000-000000000001',
    'Option B is correct because the audio mentions it explicitly.',
    'Option A and C are incorrect because they refer to Section 2 details.',
    'Listen for the spelling of the name.',
    'https://clasptek.com/ielts/listening/part1',
    'Ensure students note down synonyms.'
) ON CONFLICT DO NOTHING;

INSERT INTO rubrics (id, question_version_id, criteria, max_points, description)
VALUES (
    'd6000000-0000-0000-0000-000000000001',
    'd3000000-0000-0000-0000-000000000001',
    'Correct answers score 1 point.',
    1,
    'Standard binary marking rubric.'
) ON CONFLICT DO NOTHING;

INSERT INTO question_ownership (id, question_id, copyright_holder, license, source, reuse_policy, expiration_date)
VALUES (
    'd7000000-0000-0000-0000-000000000001',
    'd2000000-0000-0000-0000-000000000001',
    'Clasptek Academic Board',
    'PROPRIETARY',
    'Original content',
    'Reuse permitted in diagnostic and mock exams',
    '2030-12-31 23:59:59+00'
) ON CONFLICT DO NOTHING;

INSERT INTO question_statistics (id, question_id, times_used, times_answered, correct_rate, facility_index, discrimination_index, guess_probability, average_duration_ms, median_duration_ms, skip_rate, last_used)
VALUES (
    'd8000000-0000-0000-0000-000000000001',
    'd2000000-0000-0000-0000-000000000001',
    100,
    95,
    75.00,
    0.75,
    0.45,
    0.25,
    45000,
    42000,
    5.00,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;
