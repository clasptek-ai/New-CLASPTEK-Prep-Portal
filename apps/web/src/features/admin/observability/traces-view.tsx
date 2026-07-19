'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '../../../components/ui/ui-components';
import { TraceTimeline } from '../../../components/admin/observability/observability-components';
import { adminTraceService, TraceInstance } from '../../../services/admin/observability/trace.service';

export function TracesViewScreen() {
  const router = useRouter();
  const [traces, setTraces] = useState<TraceInstance[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminTraceService.getTraces();
      setTraces(data);
    }
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Distributed Tracing Timeline</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Inspect nested spans breakdowns and correlation parameters</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/admin/observability')}>Back to Dashboard</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {traces.map(t => (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Card title={`${t.path} (${t.id})`}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Total Request Duration: **{t.totalDurationMs} ms**</span>
            </Card>
            <TraceTimeline rootSpan={t.rootSpan} />
          </div>
        ))}
      </div>
    </div>
  );
}
export default TracesViewScreen;
