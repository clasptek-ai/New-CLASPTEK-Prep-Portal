'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import {
  adminSettingsService,
  AdminPlatformSettings,
} from '../../../services/admin/settings.service';
import { resetAllDemoData } from '@/lib/reset-demo-data';

export function SettingsScreen() {
  const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
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
      showBanner('Platform branding and academic settings saved successfully!');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Platform Settings</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Configure general portal branding, activate academic terms, and toggle feature flags
        </p>
      </div>

      {banner && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#2563eb20',
            border: '1px solid #2563eb40',
            borderRadius: '8px',
            color: '#60a5fa',
            fontSize: '0.85rem',
          }}
        >
          {banner}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <Card title="Portal General & Academic Settings">
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
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                }}
              >
                Portal Name
              </label>
              <input
                type="text"
                value={settings.portalName}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, portalName: e.target.value } : null))
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#cbd5e1',
                  border: '1px solid #232e48',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                }}
              >
                Active Academic Term
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
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#0b0f19',
                  color: '#cbd5e1',
                  border: '1px solid #232e48',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <Button type="submit">Save Configurations</Button>
          </form>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Academic Feature Flags">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#f8fafc',
                      display: 'block',
                    }}
                  >
                    AI Coach Integration
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Activate learning coach chat
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.featureFlags.enableAiCoach}
                  onChange={() => handleToggleFlag('enableAiCoach')}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #1e293b',
                  paddingTop: '1rem',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#f8fafc',
                      display: 'block',
                    }}
                  >
                    Prediction Engine
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Activate readiness trackers
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.featureFlags.enablePredictionEngine}
                  onChange={() => handleToggleFlag('enablePredictionEngine')}
                />
              </div>
            </div>
          </Card>

          {/* Reset Demo Data Action Card */}
          <Card title="System Maintenance & Demo Data Reset">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}
            >
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Flush all client-side cached demo datasets, practice sessions, mock history, and
                custom questions to restore the portal to its clean initial state.
              </p>
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to reset all demo data? This will clear practice history, mock sessions, and cached bank items.'
                    )
                  ) {
                    resetAllDemoData();
                    alert('All demo data reset successfully. Reloading page...');
                    window.location.reload();
                  }
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Reset All Demo Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default SettingsScreen;
