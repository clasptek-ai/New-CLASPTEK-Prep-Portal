-- Migration: 01305_notification_rls.sql
-- Bounded Context: Communication & Notification Centre

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- User Policies
CREATE POLICY user_view_own_notifications ON notifications
    FOR SELECT TO public
    USING (recipient_id = auth.uid());

CREATE POLICY user_update_own_notifications ON notifications
    FOR UPDATE TO public
    USING (recipient_id = auth.uid());

CREATE POLICY user_manage_own_preferences ON notification_preferences
    FOR ALL TO public
    USING (user_id = auth.uid());

CREATE POLICY user_view_published_announcements ON announcements
    FOR SELECT TO public
    USING (status = 'PUBLISHED');

-- Admin & System Policies
CREATE POLICY admin_manage_announcements ON announcements
    FOR ALL TO public
    USING (auth.jwt() ->> 'role' IN ('ADMIN', 'SYSTEM'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status, effective_at);
