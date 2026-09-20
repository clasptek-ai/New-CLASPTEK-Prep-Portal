'use client';

import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { PageContainer, PageContent } from '@/shared/ui/layout/PageContainer';

export function ProfileScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionLogs] = useState([
    { ip: '127.0.0.1', device: 'Desktop Chrome', time: '2026-07-17 10:00:00' },
    { ip: '192.168.1.5', device: 'Mobile Safari', time: '2026-07-16 15:45:00' },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Instructor password changed successfully!');
    setTimeout(() => setNotification(null), 3000);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <PageContainer>
      <PageContent>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', width: '100%' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                Instructor Profile & Settings
              </h1>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Update security credentials and manage alerts parameters
              </p>
            </div>

            {notification && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: 'var(--status-success)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {notification}
              </div>
            )}

            <Card title="Change Security Password">
              <form
                onSubmit={handlePasswordChange}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Old Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--surface-0)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--surface-0)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </Card>

            <Card title="Notification Alert Preferences">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
                Enable email notifications for new mock submissions and at-risk student warnings
              </label>
            </Card>
          </div>

          <div>
            <Card title="Active Login Sessions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sessionLogs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderLeft: '3px solid var(--status-warning)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div>
                      Device: <strong style={{ color: 'var(--text-primary)' }}>{log.device}</strong>
                    </div>
                    <div>IP: {log.ip}</div>
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      Logged at {log.time}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
export default ProfileScreen;
