-- Migration: 01433_fix_diagnostic_attempts_status_constraint.sql
-- Description: Fix status check constraint on diagnostic_attempts to permit NOT_STARTED, IN_PROGRESS, SUBMITTED, COMPLETED, ABANDONED

-- 1. Drop old constraint first so we can normalize existing rows
ALTER TABLE public.diagnostic_attempts DROP CONSTRAINT IF EXISTS diagnostic_attempts_status_check;
ALTER TABLE public.diagnostic_attempts DROP CONSTRAINT IF EXISTS chk_diagnostic_attempts_status;

-- 2. Normalize existing legacy status rows
UPDATE public.diagnostic_attempts 
SET status = 'IN_PROGRESS' 
WHERE status NOT IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'ABANDONED') OR status IS NULL;

-- 3. Add updated constraint
ALTER TABLE public.diagnostic_attempts 
ADD CONSTRAINT diagnostic_attempts_status_check 
CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'ABANDONED'));
