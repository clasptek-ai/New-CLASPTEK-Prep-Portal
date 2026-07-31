-- Migration: 01419_diagnostic_server_timer_45mins.sql
-- Description: Server-authoritative timer extension for English Proficiency Diagnostic Assessment (45 minutes, 33 items)

ALTER TABLE public.diagnostic_attempts
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 45;

-- Update any existing diagnostic attempts to set expires_at = started_at + INTERVAL '45 minutes'
UPDATE public.diagnostic_attempts
SET expires_at = started_at + INTERVAL '45 minutes'
WHERE expires_at IS NULL;
