-- Migration: 01436_add_answer_unique_constraint.sql
-- Description: Add unique constraint on (attempt_id, question_id) to assessment_attempt_answers
-- so that ON CONFLICT (attempt_id, question_id) in the PATCH /answers route works correctly.
-- This is a CRITICAL fix — without this, autosave crashes with code 42P10 at runtime.

ALTER TABLE public.assessment_attempt_answers
  ADD CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id);
