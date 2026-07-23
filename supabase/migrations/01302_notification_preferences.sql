-- Migration: 01302_notification_preferences.sql
-- Bounded Context: Communication & Notification Centre

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    preset_profile VARCHAR(64) NOT NULL DEFAULT 'EVERYTHING',
    enabled_categories JSONB NOT NULL DEFAULT '["Academic", "System", "Achievement", "Security", "Administration"]'::jsonb,
    channel_settings JSONB NOT NULL DEFAULT '{"IN_APP": true, "EMAIL": false, "SMS": false}'::jsonb,
    digest_frequency VARCHAR(32) NOT NULL DEFAULT 'IMMEDIATE',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
