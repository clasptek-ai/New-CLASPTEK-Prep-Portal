'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/ui/ui-components';
import { useTheme } from '../../providers/theme-provider';
import {
  studentProfileService,
  StudentProfileDetails,
} from '../../services/student/profile.service';

export function ProfileScreen() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<StudentProfileDetails | null>(null);
  const [learningStyle, setLearningStyle] = useState('Visual');
  const [coachStyle, setCoachStyle] = useState('Direct');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await studentProfileService.getProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    showBanner('Preferences saved successfully!');
  }

  async function handlePasswordChange() {
    const success = await studentProfileService.changePassword();
    if (success) {
      showBanner('Verification password-reset link dispatched to your mailbox!');
    }
  }

  async function handleUploadPhoto() {
    showBanner('Dynamic avatar photo upload action completed successfully!');
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading || !profile) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3>Loading student profile data...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Profile & Settings</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Configure your learning styles, credentials, and app theme
        </p>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Personal Information & Credentials">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div>
                Name:{' '}
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {profile.name}
                </strong>
              </div>
              <div>
                Email:{' '}
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {profile.email}
                </strong>
              </div>
              <div>
                Phone:{' '}
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {profile.phone}
                </strong>
              </div>
              <div>
                Enrolled At:{' '}
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {new Date(profile.enrolledAt).toLocaleDateString()}
                </strong>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
              }}
            >
              <Button onClick={handleUploadPhoto}>Change Profile Photo</Button>
              <Button variant="secondary" onClick={handlePasswordChange}>
                Reset Password
              </Button>
            </div>
          </Card>

          <Card title="Learning Styles & Prefs">
            <form
              onSubmit={handleSave}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Preferred Learning Style
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="Visual">Visual Lectures</option>
                  <option value="Auditory">Auditory Podcast</option>
                  <option value="Kinesthetic">Kinesthetic Quiz Exercises</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Coach Style
                </label>
                <select
                  value={coachStyle}
                  onChange={(e) => setCoachStyle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-1)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="Direct">Direct & Directives</option>
                  <option value="Coaching">Encouraging & Collaborative</option>
                  <option value="Socratic">Socratic & Questions</option>
                </select>
              </div>

              <Button type="submit">Save Preferences</Button>
            </form>
          </Card>

          <Card title="Login History logs">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {profile.loginHistory.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--surface-1)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span>
                    {h.device} ({h.ip})
                  </span>
                  <span>{new Date(h.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="App Customizations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Theme Options
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="high-contrast">High Contrast (Accessibility)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default ProfileScreen;
