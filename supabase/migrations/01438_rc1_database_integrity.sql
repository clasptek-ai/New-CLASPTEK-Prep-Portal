-- Migration: 01438_rc1_database_integrity.sql
-- RC1 Production Hardening — Database Integrity
-- Phase 7 + Phase 9: Performance indexes and foreign key verifications

-- 1. Add index on assessment_attempts(student_id, status) for active attempt lookup
CREATE INDEX IF NOT EXISTS idx_aa_student_status 
  ON public.assessment_attempts(student_id, status);

-- 2. Add index on assessment_attempts(student_id, status, expires_at) for timer-scoped queries
CREATE INDEX IF NOT EXISTS idx_aa_student_active 
  ON public.assessment_attempts(student_id, status, expires_at)
  WHERE status = 'IN_PROGRESS';

-- 3. Add index on assessment_attempt_events(attempt_id, created_at) for ordered event retrieval
CREATE INDEX IF NOT EXISTS idx_aae_attempt_time 
  ON public.assessment_attempt_events(attempt_id, created_at);

-- 4. Add index on assessment_attempt_answers(attempt_id, updated_at) for latest answer retrieval
CREATE INDEX IF NOT EXISTS idx_aaa_attempt_updated 
  ON public.assessment_attempt_answers(attempt_id, updated_at);

-- 5. Ensure assessment_attempts has a unique constraint on id (if not already primary key)
-- This prevents duplicate id inserts in race conditions
-- (primary key already guarantees this, but confirming)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_indexes WHERE tablename = 'assessment_attempts' AND indexname = 'assessment_attempts_pkey'
  ) THEN
    ALTER TABLE public.assessment_attempts ADD PRIMARY KEY (id);
  END IF;
END $$;

-- 6. Idempotency note: assessment_attempts.id is PRIMARY KEY = unique.
--    No duplicate attempt IDs possible via INSERT even in concurrent race conditions.
