-- Migration: 00272_result_history.sql
-- Results & Academic Progress Portal — Immutable Result History & Audit Log Table

CREATE TABLE IF NOT EXISTS result_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    result_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('PUBLISHED', 'UPDATED', 'ARCHIVED', 'REFRESHED')),
    snapshot JSONB NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by VARCHAR(255) NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_result_history_student ON result_history(student_id);
CREATE INDEX IF NOT EXISTS idx_result_history_result ON result_history(result_id);
CREATE INDEX IF NOT EXISTS idx_result_history_recorded ON result_history(recorded_at DESC);
