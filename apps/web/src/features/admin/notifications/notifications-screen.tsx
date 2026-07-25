'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import {
  studentNotificationsService,
  NotificationItem,
} from '../../../services/student/notifications.service';
import { Bell, Send, CheckCircle2, Megaphone, Users, ShieldCheck, Sparkles } from 'lucide-react';

export function NotificationsScreen() {
  const [announcements, setAnnouncements] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationItem['type']>('SYSTEM_ANNOUNCEMENT');
  const [targetCohort, setTargetCohort] = useState('All Enrolled Students');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentNotificationsService.getNotifications();
        setAnnouncements(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await studentNotificationsService.publishAnnouncement({
      title,
      content,
      type,
      targetCohort,
    });

    const updated = await studentNotificationsService.getNotifications();
    setAnnouncements(updated);
    setTitle('');
    setContent('');
    showBanner('Announcement published live to Student Portal inboxes!');
  };

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3500);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading announcement channels...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header Banner */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Platform Announcements & Communication Center
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
          Publish live system announcements, mock availability alerts, and study notices directly to student dashboards.
        </p>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{banner}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Left Column: Form to Compose Announcement */}
        <Card style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: '#151d30', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={20} color="#38bdf8" />
            Compose Broadcast Announcement
          </div>

          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Announcement Headline / Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Mock Examination Released for IELTS Prep"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#ffffff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Alert Type Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#ffffff', fontSize: '0.825rem' }}
                >
                  <option value="SYSTEM_ANNOUNCEMENT">System Announcement</option>
                  <option value="MOCK_AVAILABLE">Mock Exam Available</option>
                  <option value="ASSIGNMENT_PUBLISHED">Assignment Published</option>
                  <option value="INSTRUCTOR_NOTE">Academic Guidance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Target Audience
                </label>
                <select
                  value={targetCohort}
                  onChange={(e) => setTargetCohort(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#ffffff', fontSize: '0.825rem' }}
                >
                  <option value="All Enrolled Students">All Enrolled Students</option>
                  <option value="IELTS Academic Cohort">IELTS Academic Cohort</option>
                  <option value="TOEFL iBT Cohort">TOEFL iBT Cohort</option>
                  <option value="SAT Cohort">SAT Cohort</option>
                  <option value="CELPIP Cohort">CELPIP Cohort</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Announcement Body Content *
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter detailed announcement message broadcast to student portals..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#ffffff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', gap: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={16} />
              <span>Broadcast Announcement to Student Portals</span>
            </Button>
          </form>
        </Card>

        {/* Right Column: Published Broadcast Feed */}
        <Card style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: '#151d30', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="#34d399" />
            Live Broadcast Feed ({announcements.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '480px', overflowY: 'auto' }}>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant="info">{ann.type}</Badge>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{ann.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>{ann.content}</div>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                  Audience: {ann.targetCohort || 'All Enrolled Students'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default NotificationsScreen;
