-- Migration: 00274_reports.sql
-- Results & Academic Progress Portal — Downloadable Reports Storage Table

CREATE TABLE IF NOT EXISTS downloadable_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('STUDENT_PROGRESS', 'ASSESSMENT_SUMMARY', 'PRACTICE_SUMMARY', 'MOCK_SUMMARY', 'AI_SUMMARY', 'TRANSCRIPT')),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED')),
    file_format VARCHAR(20) NOT NULL DEFAULT 'JSON' CHECK (file_format IN ('JSON', 'PDF', 'CSV', 'HTML')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    file_url TEXT DEFAULT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_student ON downloadable_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON downloadable_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated ON downloadable_reports(generated_at DESC);
