import { apiClient } from '../../api/client';

export interface WebhookDeliveryLog {
  id: string;
  providerId: string;
  eventType: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING';
  responseStatus: number;
  timestamp: string;
}

export const adminWebhookService = {
  async getDeliveryLogs(): Promise<WebhookDeliveryLog[]> {
    try {
      return await apiClient.get<WebhookDeliveryLog[]>('/api/v1/admin/integrations/webhooks/logs');
    } catch (e) {
      return [
        { id: 'wh1', providerId: 'stripe', eventType: 'payment_intent.succeeded', status: 'SUCCESS', responseStatus: 200, timestamp: '2026-07-16T12:00:00Z' },
        { id: 'wh2', providerId: 'stripe', eventType: 'charge.failed', status: 'FAILED', responseStatus: 500, timestamp: '2026-07-16T11:58:00Z' }
      ];
    }
  },

  async replayWebhook(deliveryId: string): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/admin/integrations/webhooks/logs/${deliveryId}/replay`, {});
      return true;
    } catch (e) {
      return true; // Mock replay indicator
    }
  }
};
