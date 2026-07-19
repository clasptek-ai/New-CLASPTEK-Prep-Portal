'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { ConnectionStatus } from '../../../components/integrations/integration-components';

export function ConnectionWorkspace({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONFIGURATION' | 'SYNCHRONIZATION' | 'HEALTH'>('OVERVIEW');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Connection Workspace: {connectionId}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <ConnectionStatus status="CONNECTED" latencyMs={150} />
            <Badge>OAUTH2 ENABLED</Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin/integrations')}>Back to Directory</Button>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
        {(['OVERVIEW', 'CONFIGURATION', 'SYNCHRONIZATION', 'HEALTH'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
              color: activeTab === tab ? '#f8fafc' : '#94a3b8',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <Card title="Connection Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <p>Sync Engine Mode: **AUTOMATIC WORKFLOWS**</p>
            <p>Credentials Status: **Masked secrets locked. Expiry: 11 months**</p>
            <p>Permissions scope granted: **Read/Write Curricula, POST webhooks**</p>
          </div>
        </Card>
      )}

      {activeTab === 'CONFIGURATION' && (
        <Card title="Dynamic Configuration Properties">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Retry Sync Count: **3 times**. Rate limits threshold: **5000 requests/hour**.
          </p>
        </Card>
      )}

      {activeTab === 'SYNCHRONIZATION' && (
        <Card title="Sync Log History">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Last sync triggered: **Successful 10m ago**. Records synchronized: **24 items**.
          </p>
        </Card>
      )}

      {activeTab === 'HEALTH' && (
        <Card title="Diagnostics Latencies & Success Rates">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Latency Average: **150 ms**. API Health score: **99.98% success**.
          </p>
        </Card>
      )}
    </div>
  );
}
export default ConnectionWorkspace;
