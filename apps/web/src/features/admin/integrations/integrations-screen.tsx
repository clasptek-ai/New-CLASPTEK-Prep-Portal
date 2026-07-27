'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '../../../components/ui/ui-components';
import {
  IntegrationCard,
  ConnectionWizard,
  ConnectionStatus,
} from '../../../components/integrations/integration-components';
import {
  adminProviderService,
  ProviderDefinition,
  ConnectionInstance,
} from '../../../services/admin/integrations/provider.service';

export function IntegrationsScreen() {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderDefinition[]>([]);
  const [connections, setConnections] = useState<ConnectionInstance[]>([]);
  const [activeConfigure, setActiveConfigure] = useState<ProviderDefinition | null>(null);

  useEffect(() => {
    async function load() {
      const p = await adminProviderService.getProviders();
      const c = await adminProviderService.getConnections();
      setProviders(p);
      setConnections(c);
    }
    load();
  }, []);

  const handleSave = (_credentials: any) => {
    if (!activeConfigure) return;
    setConnections((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        providerId: activeConfigure.id,
        name: `${activeConfigure.name} Live Connector`,
        status: 'CONNECTED',
        lastSync: new Date().toISOString(),
        latencyMs: 150,
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Integrations Platform</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Connect external LLM AI systems, notification webhooks, and SMTP SMTP services
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button onClick={() => router.push('/admin/integrations/webhooks')}>
            Webhook Explorer
          </Button>
          <Button variant="secondary" onClick={() => router.push('/admin/integrations/automation')}>
            Automation Workflows
          </Button>
        </div>
      </div>

      {/* Connected active channels list */}
      <Card title="Active Connection Connections Instances">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {connections.length === 0 ? (
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              No connections configured yet.
            </p>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #1e293b',
                }}
              >
                <div>
                  <span
                    style={{ fontWeight: 600, color: '#60a5fa', cursor: 'pointer' }}
                    onClick={() => router.push(`/admin/integrations/${conn.id}`)}
                  >
                    {conn.name}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                    Last Synchronized: {conn.lastSync}
                  </span>
                </div>
                <ConnectionStatus status={conn.status} latencyMs={conn.latencyMs} />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Configuration-driven providers directory */}
      <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
        Supported Integration Providers
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {providers.map((p) => (
          <IntegrationCard key={p.id} provider={p} onConfigure={setActiveConfigure} />
        ))}
      </div>

      {activeConfigure && (
        <ConnectionWizard
          provider={activeConfigure}
          onClose={() => setActiveConfigure(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
export default IntegrationsScreen;
