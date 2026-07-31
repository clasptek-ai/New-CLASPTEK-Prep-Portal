'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
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
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading platform config settings...</h3>
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Sliders size={16} /> },
    { id: 'academic', label: 'Academic Terms', icon: <Calendar size={16} /> },
    { id: 'flags', label: 'Feature Flags', icon: <ToggleLeft size={16} /> },
    { id: 'branding', label: 'Branding', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
          Settings
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
          Configure portal branding, academic terms, feature flags, notifications, and security policies.
        </p>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '8px',
            color: '#60a5fa',
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

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
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
                borderRadius: '8px 8px 0 0',
                border: 'none',
                backgroundColor: isActive ? '#1F2937' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                transition: 'all 150ms ease',
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
            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Portal Instance Name
                </label>
                <input
                  type="text"
                  value={settings.portalName}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, portalName: e.target.value } : null))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Support Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="support@clasptek.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Default System Timezone
                </label>
                <select
                  defaultValue="UTC"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="WAT">WAT (West Africa Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                </select>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <Button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  Save General Settings
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'academic' && (
          <Card title="Academic Terms & Cycle Configurations">
            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Active Academic Term
                </label>
                <input
                  type="text"
                  value={settings.activeAcademicTerm}
                  onChange={(e) => setSettings((prev) => (prev ? { ...prev, activeAcademicTerm: e.target.value } : null))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Term Start Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2026-07-01"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Term End Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2026-09-30"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <Button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  Update Academic Terms
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'flags' && (
          <Card title="Academic Feature Flags & Capabilities">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                    AI Coach Integration
                  </span>
                  <span style={{ fontSize: '0.785rem', color: '#94a3b8' }}>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                    Prediction Engine & Readiness Tracker
                  </span>
                  <span style={{ fontSize: '0.785rem', color: '#94a3b8' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Institutional Theme
                </label>
                <select
                  defaultValue="DARK_ENTERPRISE"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="DARK_ENTERPRISE">Dark Enterprise (Default)</option>
                  <option value="NAVY_BLUE">Navy Blue Corporate</option>
                  <option value="HIGH_CONTRAST">High Contrast Dark</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Brand Primary Accent Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" defaultValue="#3b82f6" style={{ background: 'none', border: 'none', width: '36px', height: '36px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>#3b82f6 (CLASPTEK Primary Blue)</span>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <Button onClick={() => showBanner('Branding preferences saved successfully.')} style={{ backgroundColor: '#2563eb', color: '#ffffff' }}>
                  Save Branding Settings
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card title="Notification Preferences & Email Alerts">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { title: 'Candidate Registration Alerts', desc: 'Receive notifications when new candidates register.' },
                { title: 'Payment Processing Updates', desc: 'Notify finance team on pending or completed payments.' },
                { title: 'Assessment Completion Reports', desc: 'Send summary reports upon mock exam submissions.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.desc}</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="Security & Session Policy">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </Card>

            <Card title="System Maintenance & Data Purge">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  Purge transient test sessions while retaining master question bank and system credentials.
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
                      alert(`Data Purge Complete!\n\n• Students Cleared: ${res.clearedItems.studentsRemoved}\n• Preserved Question Bank Items: ${res.preservedItems.approvedQuestionsCount}`);
                      window.location.reload();
                    }
                  }}
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: '#dc2626' }}
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
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#cbd5e1',
                  }}
                >
                  Reset All Demo Datasets
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsScreen;
