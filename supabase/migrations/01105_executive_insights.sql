-- Migration: 01105_executive_insights.sql
-- Bounded Context: Learning Analytics Executive Findings & Insights

CREATE TABLE IF NOT EXISTS analytics_executive_findings (
    id UUID PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    finding_statement TEXT NOT NULL,
    evidence JSONB NOT NULL,
    confidence JSONB NOT NULL,
    snapshot_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_executive_insights (
    id UUID PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    presentation_narrative TEXT NOT NULL,
    primary_finding_id UUID REFERENCES analytics_executive_findings(id),
    supporting_finding_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_findings_topic ON analytics_executive_findings(topic);
CREATE INDEX IF NOT EXISTS idx_insights_category ON analytics_executive_insights(category);
