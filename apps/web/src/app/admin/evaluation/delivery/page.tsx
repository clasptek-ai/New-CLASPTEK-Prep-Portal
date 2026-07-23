import React from 'react';
import { OperationsConsole } from '@/features/operations-console/operations-console';
import { ProviderHealth } from '@/features/provider-health/provider-health';
import { QueueMonitor } from '@/features/queue-monitor/queue-monitor';
import { CostMonitor } from '@/features/cost-monitor/cost-monitor';
import { EvaluationSettings } from '@/features/evaluation-settings/evaluation-settings';

export default function AdminEvaluationDeliveryPage() {
  const stats = { queuedCount: 2, runningCount: 1, completedToday: 45, failedCount: 0 };
  const healthRecords = [
    { provider: 'OpenAI', isHealthy: true, latencyMs: 120, circuitState: 'CLOSED' },
    { provider: 'Anthropic', isHealthy: true, latencyMs: 150, circuitState: 'CLOSED' },
  ];
  const queueJobs = [
    { jobId: 'job-101', source: 'MOCK', priority: 1, status: 'RUNNING' },
    { jobId: 'job-102', source: 'PRACTICE', priority: 5, status: 'QUEUED' },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-white p-8 space-y-6">
      <h1 className="text-2xl font-bold text-sky-400">AI Evaluation Delivery Console</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OperationsConsole stats={stats} />
        <ProviderHealth healthRecords={healthRecords} />
        <QueueMonitor queueJobs={queueJobs} />
        <CostMonitor dailySpend={12.45} monthlySpend={340.5} monthlyLimit={3000.0} />
        <EvaluationSettings maxRetries={3} timeoutMs={30000} />
      </div>
    </div>
  );
}
