-- Migration: 01435_unify_assessment_attempts_schema.sql
-- Description: Ensure public.assessment_attempts possesses all unified production columns and constraints

ALTER TABLE public.assessment_attempts ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS catalog_id UUID;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 45;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS score DECIMAL(5,2);
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS paper_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Drop old status check constraint if present and enforce unified constraint
ALTER TABLE public.assessment_attempts DROP CONSTRAINT IF EXISTS assessment_attempts_status_check;
ALTER TABLE public.assessment_attempts DROP CONSTRAINT IF EXISTS chk_assessment_attempts_status;

ALTER TABLE public.assessment_attempts 
ADD CONSTRAINT assessment_attempts_status_check 
CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'ABANDONED'));

-- Sync legacy rows from diagnostic_attempts into assessment_attempts if diagnostic_attempts exists as table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diagnostic_attempts') THEN
        INSERT INTO public.assessment_attempts (
            id, student_id, catalog_id, status, started_at, closed_at, score, tenant_id, created_at, updated_at, deleted_at, expires_at, duration_minutes, paper_snapshot
        )
        SELECT 
            id, student_id, catalog_id, status, started_at, closed_at, score, tenant_id, created_at, updated_at, deleted_at, expires_at, duration_minutes, paper_snapshot
        FROM public.diagnostic_attempts
        ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            paper_snapshot = EXCLUDED.paper_snapshot,
            expires_at = EXCLUDED.expires_at,
            updated_at = EXCLUDED.updated_at;

        -- Drop legacy table so diagnostic_attempts becomes a view
        DROP TABLE public.diagnostic_attempts CASCADE;
        CREATE OR REPLACE VIEW public.diagnostic_attempts AS SELECT * FROM public.assessment_attempts;
    END IF;
END $$;
