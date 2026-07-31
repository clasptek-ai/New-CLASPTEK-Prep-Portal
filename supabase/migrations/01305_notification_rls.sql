-- Migration: 01305_notification_rls.sql
-- Bounded Context: Communication & Notification Centre

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_view_own_notifications ON notifications;
DROP POLICY IF EXISTS user_update_own_notifications ON notifications;
DROP POLICY IF EXISTS user_manage_own_preferences ON notification_preferences;
DROP POLICY IF EXISTS user_view_published_announcements ON announcements;
DROP POLICY IF EXISTS admin_manage_announcements ON announcements;

CREATE POLICY notifications_all ON notifications FOR ALL USING (true);
CREATE POLICY notification_preferences_all ON notification_preferences FOR ALL USING (true);
CREATE POLICY announcements_all ON announcements FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status, effective_at);
