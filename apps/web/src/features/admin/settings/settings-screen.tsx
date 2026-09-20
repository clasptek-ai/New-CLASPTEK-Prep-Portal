'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { PageContainer, PageHeader, PageContent } from '../../../shared/ui/layout/PageContainer';
import { useTheme } from '../../../providers/ThemeProvider';
import {
  adminSettingsService,
  AdminPlatformSettings,
} from '../../../services/admin/settings.service';
import { resetAllDemoData } from '@/lib/reset-demo-data';
import { purgeDevelopmentData } from '@/lib/purge-development-data';
import {
  Sliders,
  Calendar,
  ToggleLeft,
  Palette,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

type SettingsTab = 'general' | 'academic' | 'flags' | 'branding' | 'notifications' | 'security';

export function SettingsScreen() {
  const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [banner, setBanner] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminSettingsService.getSettings();
        setSettings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleToggleFlag(key: keyof AdminPlatformSettings['featureFlags']) {
    if (!settings) return;
    const nextSettings = {
      ...settings,
      featureFlags: {
        ...settings.featureFlags,
        [key]: !settings.featureFlags[key],
      },
    };
    const success = await adminSettingsService.updateSettings(nextSettings);
    if (success) {
      setSettings(nextSettings);
      showBanner('Feature flag configuration successfully updated!');
    }
  }

  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const success = await adminSettingsService.updateSettings(settings);
    if (success) {
      showBanner('Platform configurations saved successfully!');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading || !settings) {
    return (
      <PageContainer>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>Loading platform config settings...</h3>
        </div>
      </PageContainer>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Sliders size={16} /> },
    { id: 'academic', label: 'Academic Terms', icon: <Calendar size={16} /> },
    { id: 'flags', label: 'Feature Flags', icon: <ToggleLeft size={16} /> },
    { id: 'branding', label: 'Branding & Theme', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Configure portal branding, academic terms, feature flags, notifications, and security policies."
      />

      <PageContent>
        {banner && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border, var(--border))',
              borderRadius: 'var(--radius-md)',
              color: 'var(--brand)',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{banner}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.25rem',
            overflowX: 'auto',
            marginBottom: '1.5rem',
          }}
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--surface-1)' : 'transparent',
                  color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--brand)' : '2px solid transparent',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'general' && (
            <Card title="Portal General Settings">
              <form
                onSubmit={handleSaveGeneral}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  marginTop: '0.5rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Portal Instance Name
                  </label>
                  <input
                    type="text"
                    value={settings.portalName}
                    onChange={(e) =>
                      setSettings((prev) => (prev ? { ...prev, portalName: e.target.value } : null))
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Support Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="support@clasptek.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Default Candidate Timezone
                  </label>
                  <input
                    type="text"
                    defaultValue="UTC+01:00 (West Africa Standard Time)"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <Button type="submit" variant="primary">
                    Save General Configuration
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'academic' && (
            <Card title="Academic Terms & Calendars">
              <form
                onSubmit={handleSaveGeneral}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  marginTop: '0.5rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Active Term Label
                  </label>
                  <input
                    type="text"
                    value={settings.activeAcademicTerm}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, activeAcademicTerm: e.target.value } : null
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
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
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Term Start Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-09-01"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Term End Date
                    </label>
                    <input
                      type="date"
                      defaultValue="2026-12-20"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <Button type="submit" variant="primary">
                    Update Academic Terms
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'flags' && (
            <Card title="Academic Feature Flags & Capabilities">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  marginTop: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'block',
                      }}
                    >
                      AI Coach Integration
                    </span>
                    <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                      Enable interactive AI learning assistant across candidate practice modules.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.featureFlags.enableAiCoach}
                    onChange={() => handleToggleFlag('enableAiCoach')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'block',
                      }}
                    >
                      Prediction Engine & Readiness Tracker
                    </span>
                    <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                      Compute predictive candidate exam readiness scores dynamically.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.featureFlags.enablePredictionEngine}
                    onChange={() => handleToggleFlag('enablePredictionEngine')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card title="Portal Branding & Visual Identity">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  marginTop: '0.5rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Active Portal Theme (System Authority)
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      const newTheme = e.target.value as 'light' | 'dark' | 'system';
                      setTheme(newTheme);
                      showBanner(`Theme preference updated to: ${newTheme.toUpperCase()}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="light">Light Mode (Clean Slate & Contrast Borders)</option>
                    <option value="dark">Dark Mode (Deep Slate & Semantic Surfaces)</option>
                    <option value="system">System (Automatic OS Match)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Brand Primary Accent
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--brand)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      CLASPTEK Canonical Blue (Derived from Semantic Design System)
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <Button
                    onClick={() => showBanner('Theme & branding preferences active and saved.')}
                    variant="primary"
                  >
                    Save Branding Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences & Email Alerts">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                {[
                  {
                    title: 'Candidate Registration Alerts',
                    desc: 'Receive notifications when new candidates register.',
                  },
                  {
                    title: 'Payment Processing Updates',
                    desc: 'Notify finance team on pending or completed payments.',
                  },
                  {
                    title: 'Assessment Completion Reports',
                    desc: 'Send summary reports upon mock exam submissions.',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card title="Security & Session Policy">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Session Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface-1)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </Card>

              <Card title="System Maintenance & Data Purge">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Purge transient test sessions while retaining master question bank and system
                    credentials.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (
                        confirm(
                          'Perform Selective Data Purge?\n\nThis will clear transient test sessions while PRESERVING your Master Question Bank (1,840+ items) and Master Admin Account (admin@clasptek.com).'
                        )
                      ) {
                        const res = purgeDevelopmentData();
                        alert(
                          `Data Purge Complete!\n\n• Students Cleared: ${res.clearedItems.studentsRemoved}\n• Preserved Question Bank Items: ${res.preservedItems.approvedQuestionsCount}`
                        );
                        window.location.reload();
                      }
                    }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Purge Transient Test Sessions
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Reset all demo data to initial state?')) {
                        resetAllDemoData();
                        alert('Data reset successfully. Reloading page...');
                        window.location.reload();
                      }
                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Reset All Demo Datasets
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}

export default SettingsScreen;
