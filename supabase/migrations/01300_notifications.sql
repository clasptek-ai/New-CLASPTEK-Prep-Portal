-- Migration: 01300_notifications.sql
-- Bounded Context: Communication & Notification Centre

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
    channel VARCHAR(32) NOT NULL DEFAULT 'IN_APP',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id VARCHAR(64) PRIMARY KEY,
    display_name VARCHAR(128) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO notification_channels (id, display_name, is_enabled)
VALUES
    ('IN_APP', 'In-App Notifications', true),
    ('EMAIL', 'Email Notifications', false),
    ('SMS', 'SMS Notifications', false),
    ('WHATSAPP', 'WhatsApp Messaging', false),
    ('PUSH', 'Push Notifications', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    audience_target JSONB NOT NULL DEFAULT '{"type": "ALL"}'::jsonb,
    effective_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    sent_by VARCHAR(255) NOT NULL,
    audience_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_recipients INT NOT NULL DEFAULT 0,
    broadcast_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
