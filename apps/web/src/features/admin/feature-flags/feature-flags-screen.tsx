'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../../../components/ui/ui-components';
import { useNotification } from '../../../providers/notification-provider';

export function FeatureFlagsScreen() {
  const { showSuccess } = useNotification();
  const [flags, setFlags] = useState([
    { id: '1', name: 'betaFeatures', category: 'Beta', status: 'DISABLED', rollout: '0%' },
    { id: '2', name: 'aiCapabilities', category: 'AI Tools', status: 'ENABLED', rollout: '100%' },
    {
      id: '3',
      name: 'experimentalDashboards',
      category: 'Analytics',
      status: 'ENABLED',
      rollout: '50%',
    },
  ]);

  const handleToggle = (id: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: f.status === 'ENABLED' ? 'DISABLED' : 'ENABLED',
              rollout: f.status === 'ENABLED' ? '0%' : '100%',
            }
          : f
      )
    );
    showSuccess('Feature flag toggled successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Feature Flags Console</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Staged rollouts, experimental AI switches, and beta release configurations
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {flags.map((flag) => (
          <Card key={flag.id} title={flag.name} actions={<Badge>{flag.category}</Badge>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p style={{ margin: '0 0 0.25rem 0' }}>Rollout Percentage: **{flag.rollout}**</p>
                <p style={{ margin: 0 }}>
                  Status:{' '}
                  <strong style={{ color: flag.status === 'ENABLED' ? '#10b981' : '#ef4444' }}>
                    {flag.status}
                  </strong>
                </p>
              </div>
              <Button onClick={() => handleToggle(flag.id)}>Toggle Flag</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default FeatureFlagsScreen;
