-- Migration: 01104_research_exports.sql
-- Bounded Context: Learning Analytics Zero-PII Research Export Pipeline

CREATE TABLE IF NOT EXISTS analytics_research_export_jobs (
    id UUID PRIMARY KEY,
    requested_by VARCHAR(255) NOT NULL,
    dataset_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    is_anonymized BOOLEAN NOT NULL DEFAULT TRUE,
    record_count INT NOT NULL DEFAULT 0,
    file_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_research_export_requested_by ON analytics_research_export_jobs(requested_by);
CREATE INDEX IF NOT EXISTS idx_research_export_status ON analytics_research_export_jobs(status);
