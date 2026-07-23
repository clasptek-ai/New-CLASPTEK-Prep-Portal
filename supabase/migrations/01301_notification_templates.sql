-- Migration: 01301_notification_templates.sql
-- Bounded Context: Communication & Notification Centre

CREATE TABLE IF NOT EXISTS notification_templates (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(128) NOT NULL REFERENCES notification_templates(id) ON DELETE CASCADE,
    version INT NOT NULL,
    language VARCHAR(16) NOT NULL DEFAULT 'en',
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_template_version_lang UNIQUE (template_id, version, language)
);
