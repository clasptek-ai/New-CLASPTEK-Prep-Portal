-- Migration: 01103_quality_logs.sql
-- Bounded Context: Learning Analytics Quality Assurance & Pipeline Monitoring

CREATE TABLE IF NOT EXISTS analytics_quality_logs (
    id UUID PRIMARY KEY,
    issue_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    source_component VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_logs_status ON analytics_quality_logs(status);
CREATE INDEX IF NOT EXISTS idx_quality_checks_component ON analytics_quality_checks(component);
