'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '../ui/ui-components';
import { useNotification } from '../../providers/notification-provider';
import { ProviderDefinition } from '../../services/admin/integrations/provider.service';

// ─── Integration Card ───────────────────────────────────────────────
export function IntegrationCard({ provider, onConfigure }: { provider: ProviderDefinition; onConfigure: (p: ProviderDefinition) => void }) {
  return (
    <Card title={provider.name} actions={<Badge>{provider.category}</Badge>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
        <p style={{ margin: 0, color: '#cbd5e1' }}>
          Supports: {provider.supportsOAuth && 'OAuth2 '} {provider.supportsApiKeys && 'API-Keys '} {provider.supportsWebhooks && 'Webhooks'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Release Status: **{provider.status.toUpperCase()}**</span>
          <Button onClick={() => onConfigure(provider)}>Configure Connect</Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Connection Status Badge ────────────────────────────────────────
export function ConnectionStatus({ status, latencyMs }: { status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'; latencyMs?: number }) {
  const color = status === 'CONNECTED' ? '#10b981' : status === 'ERROR' ? '#ef4444' : '#64748b';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
        {status} {latencyMs && <span style={{ color: '#64748b', fontWeight: 500 }}>({latencyMs}ms)</span>}
      </span>
    </div>
  );
}

// ─── Dynamic Connection Wizard Modal ───────────────────────────────
export function ConnectionWizard({ provider, onClose, onSave }: { provider: ProviderDefinition; onClose: () => void; onSave: (data: any) => void }) {
  const { showSuccess } = useNotification();
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ apiKey, clientId, clientSecret });
    showSuccess(`Configuration saved for ${provider.name}!`);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '8px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Connect to {provider.name}</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {provider.supportsApiKeys && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Private Secret API Key</label>
              <Input type="password" placeholder="sk_live_..." value={apiKey} onChange={e => setApiKey(e.target.value)} required />
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.65rem', color: '#64748b' }}>Secrets are masked and hidden after creation.</p>
            </div>
          )}

          {provider.supportsOAuth && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Client ID</label>
                <Input placeholder="Enter oauth client id..." value={clientId} onChange={e => setClientId(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Client Secret</label>
                <Input type="password" placeholder="Enter oauth client secret..." value={clientSecret} onChange={e => setClientSecret(e.target.value)} required />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">Establish Connection</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default IntegrationCard;
