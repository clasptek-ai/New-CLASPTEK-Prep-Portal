-- Migration: 00801_ai_evaluation_seed
-- Description: Seed data for AI Evaluation & Scoring Domain

-- ─────────────────────────────────────────────
-- AI MODEL REGISTRY SEEDS
-- ─────────────────────────────────────────────

INSERT INTO ai_models (id, provider, model_code, display_name, capabilities, is_active) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'OPENAI',        'gpt-4o',                  'OpenAI GPT-4o',              '["essay","writing","speaking","feedback","objective"]', TRUE),
  ('a0000001-0000-0000-0000-000000000002', 'OPENAI',        'gpt-4-turbo',             'OpenAI GPT-4 Turbo',         '["essay","writing","feedback"]',                        TRUE),
  ('a0000001-0000-0000-0000-000000000003', 'ANTHROPIC',     'claude-3-5-sonnet-latest','Anthropic Claude 3.5 Sonnet','["essay","writing","feedback"]',                        TRUE),
  ('a0000001-0000-0000-0000-000000000004', 'GOOGLE_GEMINI', 'gemini-2.0-flash',        'Google Gemini 2.0 Flash',    '["essay","writing","objective","feedback"]',             TRUE),
  ('a0000001-0000-0000-0000-000000000005', 'AZURE_OPENAI',  'gpt-4o-azure',            'Azure OpenAI GPT-4o',        '["essay","writing","speaking","feedback","objective"]', FALSE),
  ('a0000001-0000-0000-0000-000000000006', 'MOCK',          'mock-v1',                 'Mock AI Provider (CI/Test)', '["essay","writing","speaking","feedback","objective"]', TRUE)
ON CONFLICT (provider, model_code) DO NOTHING;

INSERT INTO model_versions (id, model_id, version_tag, is_current, created_at) VALUES
  ('a0000002-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'v1.0', TRUE,  CURRENT_TIMESTAMP),
  ('a0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'v1.0', TRUE,  CURRENT_TIMESTAMP),
  ('a0000002-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'v1.0', TRUE,  CURRENT_TIMESTAMP),
  ('a0000002-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'v1.0', TRUE,  CURRENT_TIMESTAMP),
  ('a0000002-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000006', 'v1.0', TRUE,  CURRENT_TIMESTAMP)
ON CONFLICT (model_id, version_tag) DO NOTHING;

-- ─────────────────────────────────────────────
-- EVALUATION PROFILES SEEDS  (Rec 4)
-- ─────────────────────────────────────────────

INSERT INTO evaluation_profiles (id, profile_code, display_name, exam_context, model_id, confidence_threshold, moderation_policy, is_active) VALUES
  ('a0000003-0000-0000-0000-000000000001', 'IELTS_WRITING',         'IELTS Writing Evaluation',         'IELTS',         'a0000001-0000-0000-0000-000000000001', 0.80, 'THRESHOLD_BASED', TRUE),
  ('a0000003-0000-0000-0000-000000000002', 'IELTS_SPEAKING',        'IELTS Speaking Evaluation',        'IELTS',         'a0000001-0000-0000-0000-000000000001', 0.75, 'THRESHOLD_BASED', TRUE),
  ('a0000003-0000-0000-0000-000000000003', 'TOEFL_WRITING',         'TOEFL Writing Evaluation',         'TOEFL',         'a0000001-0000-0000-0000-000000000003', 0.80, 'THRESHOLD_BASED', TRUE),
  ('a0000003-0000-0000-0000-000000000004', 'DIGITAL_SAT_ESSAY',     'Digital SAT Essay Evaluation',     'SAT',           'a0000001-0000-0000-0000-000000000001', 0.78, 'THRESHOLD_BASED', TRUE),
  ('a0000003-0000-0000-0000-000000000005', 'INTERNAL_ASSESSMENT',   'Internal Assessment Evaluation',   'INTERNAL',      'a0000001-0000-0000-0000-000000000004', 0.70, 'AUTO',            TRUE),
  ('a0000003-0000-0000-0000-000000000006', 'OBJECTIVE_DEFAULT',     'Objective Question Scoring',       'DEFAULT',       'a0000001-0000-0000-0000-000000000001', 0.99, 'AUTO',            TRUE)
ON CONFLICT (profile_code) DO NOTHING;

-- ─────────────────────────────────────────────
-- PROMPT TEMPLATE SEEDS  (Rec 2)
-- ─────────────────────────────────────────────

INSERT INTO prompt_templates (id, template_code, display_name, question_type, system_prompt, user_prompt_template, variables, is_active) VALUES
  (
    'a0000004-0000-0000-0000-000000000001',
    'IELTS_WRITING_TASK2',
    'IELTS Writing Task 2 Evaluator',
    'ESSAY',
    'You are an expert IELTS Writing Task 2 examiner with 10+ years of experience. You evaluate essays strictly according to the official IELTS band descriptors: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. Provide precise band scores (0-9) for each criterion and an overall band score. Be objective, consistent, and constructive.',
    'Evaluate the following IELTS Writing Task 2 response.\n\nQuestion: {{question}}\n\nStudent Response:\n{{response}}\n\nProvide:\n1. Band scores (0-9) for each criterion\n2. Overall band score\n3. Specific strengths\n4. Areas for improvement with examples from the text\n5. Next steps for the student',
    '["question","response"]',
    TRUE
  ),
  (
    'a0000004-0000-0000-0000-000000000002',
    'IELTS_SPEAKING_EVALUATION',
    'IELTS Speaking Evaluator',
    'SPEAKING',
    'You are an expert IELTS Speaking examiner. Evaluate speech transcripts against the official IELTS Speaking band descriptors: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation. Account for spoken language features and do not penalise natural disfluencies.',
    'Evaluate the following IELTS Speaking response transcript.\n\nPart: {{part}}\nQuestion: {{question}}\n\nTranscript:\n{{transcript}}\n\nProvide band scores (0-9) for each criterion and constructive feedback.',
    '["part","question","transcript"]',
    TRUE
  ),
  (
    'a0000004-0000-0000-0000-000000000003',
    'GENERAL_ESSAY_FEEDBACK',
    'General Essay Feedback Generator',
    'ESSAY',
    'You are an expert writing tutor. Evaluate the student essay and provide structured, actionable feedback to help the student improve.',
    'Evaluate the following essay response.\n\nQuestion: {{question}}\nRubric: {{rubric}}\n\nStudent Response:\n{{response}}\n\nProvide structured feedback.',
    '["question","rubric","response"]',
    TRUE
  ),
  (
    'a0000004-0000-0000-0000-000000000004',
    'MOCK_EVALUATION_TEMPLATE',
    'Mock Evaluation Template (CI/Test)',
    'ESSAY',
    'You are a mock AI evaluator for testing purposes. Return deterministic structured responses.',
    'Mock evaluation for: {{question}}\n\nResponse: {{response}}',
    '["question","response"]',
    TRUE
  )
ON CONFLICT (template_code) DO NOTHING;

INSERT INTO prompt_versions (id, template_id, version_number, system_prompt, user_prompt_template, prompt_hash, is_current, created_at) VALUES
  (
    'a0000005-0000-0000-0000-000000000001',
    'a0000004-0000-0000-0000-000000000001',
    1,
    'You are an expert IELTS Writing Task 2 examiner with 10+ years of experience. You evaluate essays strictly according to the official IELTS band descriptors: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. Provide precise band scores (0-9) for each criterion and an overall band score. Be objective, consistent, and constructive.',
    'Evaluate the following IELTS Writing Task 2 response.\n\nQuestion: {{question}}\n\nStudent Response:\n{{response}}\n\nProvide:\n1. Band scores (0-9) for each criterion\n2. Overall band score\n3. Specific strengths\n4. Areas for improvement with examples from the text\n5. Next steps for the student',
    'seed-hash-ielts-writing-v1',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'a0000005-0000-0000-0000-000000000002',
    'a0000004-0000-0000-0000-000000000002',
    1,
    'You are an expert IELTS Speaking examiner. Evaluate speech transcripts against the official IELTS Speaking band descriptors: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation. Account for spoken language features and do not penalise natural disfluencies.',
    'Evaluate the following IELTS Speaking response transcript.\n\nPart: {{part}}\nQuestion: {{question}}\n\nTranscript:\n{{transcript}}\n\nProvide band scores (0-9) for each criterion and constructive feedback.',
    'seed-hash-ielts-speaking-v1',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'a0000005-0000-0000-0000-000000000003',
    'a0000004-0000-0000-0000-000000000003',
    1,
    'You are an expert writing tutor. Evaluate the student essay and provide structured, actionable feedback to help the student improve.',
    'Evaluate the following essay response.\n\nQuestion: {{question}}\nRubric: {{rubric}}\n\nStudent Response:\n{{response}}\n\nProvide structured feedback.',
    'seed-hash-general-essay-v1',
    TRUE,
    CURRENT_TIMESTAMP
  ),
  (
    'a0000005-0000-0000-0000-000000000004',
    'a0000004-0000-0000-0000-000000000004',
    1,
    'You are a mock AI evaluator for testing purposes. Return deterministic structured responses.',
    'Mock evaluation for: {{question}}\n\nResponse: {{response}}',
    'seed-hash-mock-v1',
    TRUE,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (template_id, version_number) DO NOTHING;
