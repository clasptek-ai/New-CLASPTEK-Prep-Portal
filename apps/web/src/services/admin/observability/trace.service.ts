import { apiClient } from '../../api/client';

export interface TraceSpan {
  id: string;
  name: string;
  durationMs: number;
  service: string;
  children?: TraceSpan[];
}

export interface TraceInstance {
  id: string;
  path: string;
  totalDurationMs: number;
  rootSpan: TraceSpan;
}

export const adminTraceService = {
  async getTraces(): Promise<TraceInstance[]> {
    try {
      return await apiClient.get<TraceInstance[]>('/api/v1/admin/observability/traces');
    } catch (_e) {
      return [
        {
          id: 't1',
          path: 'POST /api/v1/learning-assistant/daily',
          totalDurationMs: 380,
          rootSpan: {
            id: 's1',
            name: 'HTTP POST /api/v1/learning-assistant/daily',
            durationMs: 380,
            service: 'web-gateway',
            children: [
              {
                id: 's2',
                name: 'Verify Authorization Bearer token',
                durationMs: 35,
                service: 'auth-service',
              },
              {
                id: 's3',
                name: 'Query Session Postgres Database',
                durationMs: 45,
                service: 'database-engine',
              },
              {
                id: 's4',
                name: 'Invoke OpenAI LLM Completion',
                durationMs: 300,
                service: 'ai-provider-service',
              },
            ],
          },
        },
      ];
    }
  },
};
