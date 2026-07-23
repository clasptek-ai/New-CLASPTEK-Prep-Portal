-- Migration: 00243_assessment_timers.sql
-- Description: Server-side timer state, drift tracking, and heartbeat timestamps

CREATE TABLE IF NOT EXISTS assessment_timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES assessment_delivery_sessions(id) ON DELETE CASCADE,
    allocated_seconds INT NOT NULL,
    remaining_seconds INT NOT NULL,
    state VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    drift_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_timers_session ON assessment_timers(session_id);
