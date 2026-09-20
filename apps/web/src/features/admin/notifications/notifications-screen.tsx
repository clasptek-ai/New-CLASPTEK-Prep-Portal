'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { PageContainer, PageHeader, PageContent } from '../../../shared/ui/layout/PageContainer';
import {
  adminNotificationsService,
  AdminNotification,
} from '../../../services/admin/notifications.service';
import { Megaphone, Send, Bell, CheckCircle2 } from 'lucide-react';

export function NotificationsScreen() {
  const [announcements, setAnnouncements] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<AdminNotification['type']>('SYSTEM_ANNOUNCEMENT');
  const [targetCohort, setTargetCohort] = useState('ALL');
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminNotificationsService.getAnnouncements();
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

    const created = await adminNotificationsService.createAnnouncement({
      title,
      content,
      type,
      targetCohort: targetCohort === 'ALL' ? undefined : targetCohort,
    });

    setAnnouncements([created, ...announcements]);
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
      <PageContainer>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>Loading announcement channels...</h3>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Platform Announcements & Communication Center"
        description="Publish live system announcements, mock availability alerts, and study notices directly to student dashboards."
      />

      <PageContent>
        {banner && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--success-subtle)',
              border: '1px solid var(--success-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{banner}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Left Column: Form to Compose Announcement */}
          <Card style={{ padding: '1.75rem' }}>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Megaphone size={20} color="var(--brand)" />
              <span>Compose Broadcast Announcement</span>
            </div>

            <form
              onSubmit={handlePublish}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Announcement Headline / Title *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Mock Examination Released for IELTS Prep"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Channel Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AdminNotification['type'])}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="SYSTEM_ANNOUNCEMENT">System Announcement</option>
                    <option value="MOCK_RELEASE">Mock Exam Release</option>
                    <option value="STUDY_TIP">Curriculum Study Tip</option>
                    <option value="MAINTENANCE">Maintenance Notice</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Target Audience Cohort
                  </label>
                  <select
                    value={targetCohort}
                    onChange={(e) => setTargetCohort(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="ALL">All Enrolled Candidates</option>
                    <option value="IELTS_ACADEMIC">IELTS Academic Track</option>
                    <option value="IELTS_GENERAL">IELTS General Track</option>
                    <option value="TOEFL_IBT">TOEFL iBT Candidates</option>
                    <option value="DIGITAL_SAT">Digital SAT Cohort</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Announcement Body Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed announcement message broadcast to student portals..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                style={{
                  gap: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} />
                <span>Broadcast Announcement to Student Portals</span>
              </Button>
            </form>
          </Card>

          {/* Right Column: Published Broadcast Feed */}
          <Card style={{ padding: '1.5rem' }}>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Bell size={18} color="var(--brand)" />
              <span>Live Broadcast Feed ({announcements.length})</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                maxHeight: '480px',
                overflowY: 'auto',
              }}
            >
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Badge variant="info">{ann.type}</Badge>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  >
                    {ann.title}
                  </div>
                  <div
                    style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}
                  >
                    {ann.content}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--brand)', marginTop: '0.2rem' }}>
                    Audience: {ann.targetCohort || 'All Enrolled Students'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}

export default NotificationsScreen;
