-- Migration: 00261_provider_health.sql
-- Description: Create ai_provider_health table

CREATE TABLE IF NOT EXISTS ai_provider_health (
    provider TEXT PRIMARY KEY,
    is_healthy BOOLEAN NOT NULL DEFAULT TRUE,
    latency_ms INT NOT NULL DEFAULT 0,
    circuit_state TEXT NOT NULL DEFAULT 'CLOSED', -- 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    consecutive_failures INT NOT NULL DEFAULT 0,
    queue_backlog INT NOT NULL DEFAULT 0,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
