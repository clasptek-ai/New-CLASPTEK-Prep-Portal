-- Migration: 01431_seed_english_proficiency_writing_tasks.sql
-- Description: Idempotent seed data for English Proficiency Writing Tasks (Task 1: Letter Writing, Task 2: Essay Writing)

INSERT INTO public.writing_tasks (
  id, code, exam_type, task_number, title, prompt, instructions, min_words, time_recommended_minutes, tenant_id
) VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'ENG-WRIT-LETTER-01',
  'English Proficiency',
  1,
  'Letter Writing Task',
  'Write a formal letter (minimum 150 words) to your local council requesting improved street lighting in your residential area.',
  'Explain the current issues with street lighting and describe how it affects safety in your community.',
  150,
  15,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  prompt = EXCLUDED.prompt,
  instructions = EXCLUDED.instructions;

INSERT INTO public.writing_tasks (
  id, code, exam_type, task_number, title, prompt, instructions, min_words, time_recommended_minutes, tenant_id
) VALUES (
  'f0000000-0000-0000-0000-000000000002',
  'ENG-WRIT-ESSAY-02',
  'English Proficiency',
  2,
  'Essay Writing Task',
  'Discuss whether remote learning is as effective as traditional classroom education.',
  'Write a well-structured essay (minimum 250 words) discussing both sides with specific examples.',
  250,
  25,
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  prompt = EXCLUDED.prompt,
  instructions = EXCLUDED.instructions;
