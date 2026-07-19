'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { adminWebhookService, WebhookDeliveryLog } from '../../../services/admin/integrations/webhook.service';
import { useNotification } from '../../../providers/notification-provider';

export function WebhooksScreen() {
  const router = useRouter();
  const { showSuccess } = useNotification();
  const [logs, setLogs] = useState<WebhookDeliveryLog[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminWebhookService.getDeliveryLogs();
      setLogs(data);
    }
    load();
  }, []);

  const handleReplay = async (id: string) => {
    const success = await adminWebhookService.replayWebhook(id);
    if (success) {
      showSuccess(`Webhook event delivery replayed successfully for ID ${id}!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Webhook Delivery Explorer</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Inspect payloads, retry failed messages, and replay events manually</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin/integrations')}>Back to Directory</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {logs.map((log) => (
          <Card key={log.id} title={log.eventType} actions={<Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'}>{log.status}</Badge>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div style={{ color: '#cbd5e1' }}>
                <p style={{ margin: '0 0 0.25rem 0' }}>Provider: **{log.providerId}**</p>
                <p style={{ margin: 0 }}>Response Code: **{log.responseStatus}** | Timestamp: {log.timestamp}</p>
              </div>
              <Button onClick={() => handleReplay(log.id)}>
                Replay Event
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default WebhooksScreen;
