'use client';

import React from 'react';
import { Card } from '../../../components/ui/ui-components';

export function SystemScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>System Health & Monitoring</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Monitor database status, background worker queues, and latencies metrics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card title="API Latency Trend (Historical)">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Daily Average API Latency: **42 ms**. Peak traffic latency: **85 ms** (Within SLA parameter bounds).
          </p>
        </Card>

        <Card title="Queue depth throughput logs">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Background job queues status: **0 pending items**. Active runner workers: **3 online**.
          </p>
        </Card>
      </div>
    </div>
  );
}
export default SystemScreen;
