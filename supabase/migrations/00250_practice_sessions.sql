-- Migration: 00250_practice_sessions.sql
-- Description: Additive delivery views and session tracking extensions for Practice Delivery Domain

CREATE TABLE IF NOT EXISTS practice_delivery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_code VARCHAR(64) UNIQUE NOT NULL,
    student_id UUID NOT NULL,
    practice_plan_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    attempt_number INT NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_delivery_sessions_student ON practice_delivery_sessions(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_practice_delivery_sessions_status ON practice_delivery_sessions(status);
