-- Migration: 00230_mock_delivery.sql
-- Description: Create mock_delivery_sessions table

CREATE TABLE IF NOT EXISTS mock_delivery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    template_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    current_section_index INT NOT NULL DEFAULT 0,
    time_remaining_seconds INT NOT NULL DEFAULT 0,
    warning_count INT NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_del_sess_student ON mock_delivery_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_del_sess_status ON mock_delivery_sessions(status);
