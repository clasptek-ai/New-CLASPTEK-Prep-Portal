'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '../../../components/ui/ui-components';

export function CommunicationScreen() {
  const [announcements, setAnnouncements] = useState([
    {
      date: '2026-07-16',
      title: 'Exam Diagnostic Session Scheduled',
      body: 'The IELTS mock exam starts on Wednesday morning.',
    },
  ]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setAnnouncements((prev) => [
      { date: new Date().toISOString().split('T')[0], title, body },
      ...prev,
    ]);
    setTitle('');
    setBody('');
    setNotification('Broadcast Announcement published successfully!');
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Communication Hub</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Broadcast classroom notices and chat with students
        </p>
      </div>

      {notification && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#10b98120',
            border: '1px solid #10b98140',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '0.85rem',
          }}
        >
          {notification}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Active Announcements Feed">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {announcements.map((ann, i) => (
                <div key={i} style={{ paddingBottom: '1rem', borderBottom: '1px solid #232e48' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#60a5fa' }}>{ann.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{ann.date}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>{ann.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Broadcast Announcement">
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <Input
              label="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                }}
              >
                Body Context
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                placeholder="Type your announcements messages here..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #232e48',
                  backgroundColor: '#0b0f19',
                  color: '#f8fafc',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <Button type="submit">Broadcast Notice</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
export default CommunicationScreen;
