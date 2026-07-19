'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from './ui-components';

export type NotificationCategory = 'ANNOUNCEMENT' | 'AI_EVENT' | 'ASSESSMENT' | 'REMINDER' | 'INTERVENTION' | 'SYSTEM_ALERT';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenter({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === filter);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Card title="Workspace Notification Center" actions={<Button variant="ghost" onClick={markAllRead}>Mark all read</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'ANNOUNCEMENT', 'AI_EVENT', 'ASSESSMENT', 'REMINDER', 'INTERVENTION', 'SYSTEM_ALERT'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === cat ? '#2563eb' : '#1e293b',
                color: '#f8fafc',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No notifications logs present.
            </div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: n.read ? '#0f172a' : 'rgba(37,99,235,0.05)',
                  border: n.read ? '1px solid #232e48' : '1px solid rgba(37,99,235,0.2)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge variant={n.category === 'INTERVENTION' ? 'danger' : 'info'}>{n.category}</Badge>
                    <span style={{ fontSize: '0.85rem', fontWeight: n.read ? 600 : 700, color: '#f8fafc' }}>{n.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>{n.body}</p>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
                  aria-label="Delete notification"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
