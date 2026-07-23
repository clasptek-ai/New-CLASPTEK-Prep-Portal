'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

export function IncidentWorkspace({ incidentId }: { incidentId?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'ROOT_CAUSE' | 'RECOVERY'>(
    'OVERVIEW'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            Incident Workspace {incidentId && `#${incidentId}`}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Badge variant="danger">SEVERITY 1</Badge>
            <Badge>OPEN INCIDENT</Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin/observability')}>
          Back to Operations
        </Button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '0.5rem',
        }}
      >
        {(['OVERVIEW', 'TIMELINE', 'ROOT_CAUSE', 'RECOVERY'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              backgroundColor: activeTab === tab ? '#ef4444' : 'transparent',
              color: activeTab === tab ? '#f8fafc' : '#94a3b8',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <Card title="Incident Details Summary">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Description: **API Gateway reported 5xx timeouts**. Impacted Services:
            **ai-provider-service**.
          </p>
        </Card>
      )}

      {activeTab === 'TIMELINE' && (
        <Card title="Incident Response Timeline">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            T+0: Alert fired. T+5m: Incident opened. T+12m: Cache cleared.
          </p>
        </Card>
      )}

      {activeTab === 'ROOT_CAUSE' && (
        <Card title="Root Cause Analysis">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            OpenAI API response timing exceeded the client timeout configuration threshold.
          </p>
        </Card>
      )}

      {activeTab === 'RECOVERY' && (
        <Card title="Recovery mitigation actions">
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            Replayed webhooks and updated rate-limit configurations profiles.
          </p>
        </Card>
      )}
    </div>
  );
}
export default IncidentWorkspace;
