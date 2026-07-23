'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

export function MetricsExplorerScreen() {
  const [viewMode, setViewMode] = useState<'LINE' | 'BAR' | 'HEATMAP'>('LINE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Metrics Explorer</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Switch layout visualizations to inspect latencies, CPU metrics, and traffic loads
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {(['LINE', 'BAR', 'HEATMAP'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'primary' : 'secondary'}
              onClick={() => setViewMode(mode)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {mode} VIEW
            </Button>
          ))}
        </div>
      </div>

      <Card title={`Visualizing metrics: ${viewMode} Mode`}>
        <div
          style={{
            padding: '3rem',
            border: '1px dashed #1e293b',
            borderRadius: '8px',
            backgroundColor: '#020617',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            [Interactive Charts Canvas Mock representing **{viewMode}** diagram maps]
          </p>
        </div>
      </Card>
    </div>
  );
}
export default MetricsExplorerScreen;
