-- Migration: 00244_assessment_audit.sql
-- Description: Delivery flags, navigation logs, session events, and security audit log

CREATE TABLE IF NOT EXISTS assessment_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    flag_reason VARCHAR(64) NOT NULL DEFAULT 'USER_FLAGGED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    from_question_id UUID,
    to_question_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    event_name VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES assessment_delivery_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
