'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import {
  studentNotificationsService,
  NotificationItem,
  NotificationPreferences,
} from '../../services/student/notifications.service';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentNotificationsService.getNotifications();
        setNotifications(data);
        const p = await studentNotificationsService.getPreferences();
        setPrefs(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleMarkRead(id: string) {
    const success = await studentNotificationsService.markAsRead(id);
    if (success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      showBanner('Notification marked as read!');
    }
  }

  async function handlePreferenceToggle(key: keyof NotificationPreferences) {
    if (!prefs) return;
    const nextPrefs = { ...prefs, [key]: !prefs[key] };
    const success = await studentNotificationsService.updatePreferences(nextPrefs);
    if (success) {
      setPrefs(nextPrefs);
      showBanner('Alert preferences updated successfully!');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading || !prefs) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3>Loading student alert notifications...</h3>
      </div>
    );
  }

  const filtered = notifications.filter((n) => activeFilter === 'ALL' || !n.read);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Notification Inbox</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Audit assignment publications, mock result logs, and system announcements
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant={activeFilter === 'ALL' ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter('ALL')}
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'UNREAD' ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter('UNREAD')}
            >
              Unread
            </Button>
          </div>
        </div>

        {banner && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--brand-light)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {banner}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((notif) => (
            <Card
              key={notif.id}
              title={notif.title}
              actions={
                <Badge variant={notif.read ? undefined : 'info'}>
                  {notif.read ? 'Read' : 'New'}
                </Badge>
              }
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <p style={{ margin: 0 }}>{notif.content}</p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Logged: {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  {!notif.read && (
                    <Button onClick={() => handleMarkRead(notif.id)}>Mark as Read</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Card title="Alert Channel Settings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'block',
                  }}
                >
                  Email Summaries
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Receive alerts via email logs
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailAlerts}
                onChange={() => handlePreferenceToggle('emailAlerts')}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'block',
                  }}
                >
                  Browser Push Alerts
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Receive instant notifications
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.pushNotifications}
                onChange={() => handlePreferenceToggle('pushNotifications')}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'block',
                  }}
                >
                  Weekly Synthesis digest
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Receive readiness aggregates
                </span>
              </div>
              <input
                type="checkbox"
                checked={prefs.weeklySummary}
                onChange={() => handlePreferenceToggle('weeklySummary')}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default NotificationsScreen;
