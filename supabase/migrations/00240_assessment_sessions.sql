-- Migration: 00240_assessment_sessions.sql
-- Description: Additive delivery views and delivery session tracking extensions for Assessment Delivery Domain

CREATE TABLE IF NOT EXISTS assessment_delivery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_code VARCHAR(64) UNIQUE NOT NULL,
    student_id UUID NOT NULL,
    assessment_instance_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
    attempt_number INT NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_delivery_sessions_student ON assessment_delivery_sessions(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_delivery_sessions_status ON assessment_delivery_sessions(status);
