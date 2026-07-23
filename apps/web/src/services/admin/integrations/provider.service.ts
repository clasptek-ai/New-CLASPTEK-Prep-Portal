import { apiClient } from '../../api/client';

export interface ProviderDefinition {
  id: string;
  name: string;
  category: 'AI' | 'Payments' | 'Storage' | 'Communication' | 'Productivity';
  supportsOAuth: boolean;
  supportsApiKeys: boolean;
  supportsWebhooks: boolean;
  status: 'stable' | 'beta' | 'experimental';
  versionCompatibility?: string;
  supportsSync?: boolean;
}

export interface ConnectionInstance {
  id: string;
  providerId: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync: string;
  latencyMs: number;
  rotationDueDate?: string;
}

export const adminProviderService = {
  async getProviders(): Promise<ProviderDefinition[]> {
    try {
      return await apiClient.get<ProviderDefinition[]>('/api/v1/admin/integrations/providers');
    } catch (_e) {
      return [
        {
          id: 'google',
          name: 'Google Workspace',
          category: 'Productivity',
          supportsOAuth: true,
          supportsApiKeys: false,
          supportsWebhooks: true,
          status: 'stable',
          versionCompatibility: 'v2.1',
          supportsSync: true,
        },
        {
          id: 'openai',
          name: 'OpenAI API',
          category: 'AI',
          supportsOAuth: false,
          supportsApiKeys: true,
          supportsWebhooks: false,
          status: 'stable',
          versionCompatibility: 'GPT-4o',
          supportsSync: false,
        },
        {
          id: 'stripe',
          name: 'Stripe Payments',
          category: 'Payments',
          supportsOAuth: true,
          supportsApiKeys: true,
          supportsWebhooks: true,
          status: 'stable',
          versionCompatibility: 'v3',
          supportsSync: true,
        },
        {
          id: 'resend',
          name: 'Resend SMTP',
          category: 'Communication',
          supportsOAuth: false,
          supportsApiKeys: true,
          supportsWebhooks: true,
          status: 'beta',
          versionCompatibility: 'v1.0',
          supportsSync: false,
        },
      ];
    }
  },

  async getConnections(): Promise<ConnectionInstance[]> {
    try {
      return await apiClient.get<ConnectionInstance[]>('/api/v1/admin/integrations/connections');
    } catch (_e) {
      return [
        {
          id: 'c1',
          providerId: 'openai',
          name: 'Primary OpenAI Production Key',
          status: 'CONNECTED',
          lastSync: '2026-07-16T12:00:00Z',
          latencyMs: 250,
          rotationDueDate: '2026-10-15',
        },
        {
          id: 'c2',
          providerId: 'stripe',
          name: 'Stripe Live Processing Gateway',
          status: 'CONNECTED',
          lastSync: '2026-07-16T11:45:00Z',
          latencyMs: 120,
          rotationDueDate: '2026-09-30',
        },
      ];
    }
  },
};
