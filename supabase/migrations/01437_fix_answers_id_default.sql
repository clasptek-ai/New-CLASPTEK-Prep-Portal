-- Migration: 01437_fix_answers_id_default.sql
-- Description: The assessment_attempt_answers.id column has no default value (gen_random_uuid()).
-- This causes NULL constraint violations in INSERT statements that omit the id column.
-- This was uncovered by production acceptance test Phase 5 (autosave persistence).

ALTER TABLE public.assessment_attempt_answers
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
