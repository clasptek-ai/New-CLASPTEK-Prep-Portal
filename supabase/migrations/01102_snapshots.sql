-- Migration: 01102_snapshots.sql
-- Bounded Context: Learning Analytics Snapshot Aggregate & Materialized Projections

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    warehouse_version VARCHAR(50) NOT NULL,
    metric_versions JSONB NOT NULL,
    benchmark_version VARCHAR(50) NOT NULL,
    prediction_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_warehouse_projections (
    projection_key VARCHAR(255) PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_generated_at ON analytics_snapshots(generated_at DESC);
