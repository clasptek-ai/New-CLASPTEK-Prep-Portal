-- Migration: 01101_metric_catalog.sql
-- Bounded Context: Learning Analytics Enterprise Governance Catalog

CREATE TABLE IF NOT EXISTS analytics_metric_catalog (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    business_definition TEXT NOT NULL,
    owner_team VARCHAR(100) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    refresh_policy VARCHAR(50) NOT NULL,
    current_version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metric_catalog_code ON analytics_metric_catalog(code);
CREATE INDEX IF NOT EXISTS idx_metric_catalog_status ON analytics_metric_catalog(status);
