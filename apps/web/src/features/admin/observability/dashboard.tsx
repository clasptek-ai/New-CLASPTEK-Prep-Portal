'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import {
  MetricCard,
  ServiceDependencyGraph,
  AlertCard,
} from '../../../components/admin/observability/observability-components';
import { DashboardLayout, Row, Column } from '../../../components/layouts/layout-engine';

export function OperationsDashboardScreen() {
  const router = useRouter();
  const nodes = [
    { id: 'web-gateway', latencyMs: 12, status: 'HEALTHY' },
    { id: 'auth-service', latencyMs: 35, status: 'HEALTHY' },
    { id: 'database-engine', latencyMs: 45, status: 'HEALTHY' },
    { id: 'ai-provider-service', latencyMs: 300, status: 'HEALTHY' },
  ];

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
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Operations Dashboard</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Monitor latency spikes, alert levels, database pools, and request traces
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button onClick={() => router.push('/admin/observability/metrics')}>
            Metrics Explorer
          </Button>
          <Button variant="secondary" onClick={() => router.push('/admin/observability/traces')}>
            Traces Timeline
          </Button>
          <Button variant="secondary" onClick={() => router.push('/admin/observability/alerts')}>
            Alert Center
          </Button>
        </div>
      </div>

      <DashboardLayout>
        <MetricCard name="API Response Latency" value={42} unit="ms" status="HEALTHY" />
        <MetricCard name="HTTP Traffic Error Rate" value={0.12} unit="%" status="HEALTHY" />
        <MetricCard name="Worker Queue Load" value={0} unit="jobs" status="HEALTHY" />
        <MetricCard name="DB Pool Active Connections" value={5} unit="conns" status="HEALTHY" />
      </DashboardLayout>

      <Row>
        <Column span={6}>
          <ServiceDependencyGraph nodes={nodes} />
        </Column>

        <Column span={6}>
          <Card title="Operational Alerts Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <AlertCard
                severity="WARNING"
                category="INFRA"
                message="Database connection count exceeds average by 10%"
                timestamp="10m ago"
              />
              <AlertCard
                severity="INFO"
                category="DEPLOY"
                message="Staging deployment verification successful"
                timestamp="1h ago"
              />
            </div>
          </Card>
        </Column>
      </Row>
    </div>
  );
}
export default OperationsDashboardScreen;
