-- Migration: 01106_institutional_benchmarks.sql
-- Bounded Context: Learning Analytics Institutional Benchmarking

CREATE TABLE IF NOT EXISTS analytics_institutional_benchmarks (
    id UUID PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    metric_code VARCHAR(100) NOT NULL,
    institutional_average NUMERIC(5,2) NOT NULL,
    top_decile_score NUMERIC(5,2) NOT NULL,
    cohort_percentiles JSONB NOT NULL DEFAULT '[]'::jsonb,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_category ON analytics_institutional_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_benchmarks_metric_code ON analytics_institutional_benchmarks(metric_code);
