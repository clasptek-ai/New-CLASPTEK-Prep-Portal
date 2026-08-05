'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui/ui-components';
import { SkeletonText } from '@/components/ui/skeleton';

export default function OperationsDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/observability/metrics');
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        setError(json.error?.message || 'Failed to load telemetry metrics');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching observability telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30_000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', color: '#f8fafc' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Admin Operations Dashboard
            </h1>
            <Badge variant="success">LIVE TELEMETRY</Badge>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
            System health, database performance, candidate activity, and production error logs.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {lastRefreshed && (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Refreshed: {lastRefreshed}</span>
          )}
          <Button onClick={fetchMetrics} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Telemetry'}
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            color: '#f87171',
            marginBottom: '2rem',
          }}
        >
          <strong>Observability Alert:</strong> {error}
        </div>
      )}

      {loading && !metrics ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} title="Loading Metric...">
              <SkeletonText lines={3} />
            </Card>
          ))}
        </div>
      ) : metrics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Top Status Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* System Status */}
            <Card title="System Status">
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#34d399',
                  marginBottom: '0.5rem',
                }}
              >
                {metrics.system.status}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                DB Latency:{' '}
                <strong style={{ color: '#f8fafc' }}>{metrics.system.dbLatencyMs}ms</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Database:{' '}
                <strong style={{ color: '#f8fafc' }}>{metrics.system.databaseName}</strong>
              </div>
            </Card>

            {/* Candidates */}
            <Card title="Candidate Registrations">
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#60a5fa',
                  marginBottom: '0.5rem',
                }}
              >
                {metrics.users.total} Total
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                New (Last 24h):{' '}
                <strong style={{ color: '#34d399' }}>+{metrics.users.newLast24h}</strong>
              </div>
            </Card>

            {/* Assessments */}
            <Card title="Assessment Lifecycle">
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#a78bfa',
                  marginBottom: '0.5rem',
                }}
              >
                {metrics.assessments.submitted} Submitted
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                In-Progress:{' '}
                <strong style={{ color: '#fbbf24' }}>{metrics.assessments.inProgress}</strong> |
                Last 24h:{' '}
                <strong style={{ color: '#f8fafc' }}>{metrics.assessments.last24h}</strong>
              </div>
            </Card>

            {/* Content Stratification */}
            <Card title="Question Bank Stratification">
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#f472b6',
                  marginBottom: '0.5rem',
                }}
              >
                {metrics.content.totalQuestions} Questions
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Found:{' '}
                <strong style={{ color: '#60a5fa' }}>
                  {metrics.content.stratification.foundation}
                </strong>{' '}
                | Inter:{' '}
                <strong style={{ color: '#a78bfa' }}>
                  {metrics.content.stratification.intermediate}
                </strong>{' '}
                | Adv:{' '}
                <strong style={{ color: '#f472b6' }}>
                  {metrics.content.stratification.advanced}
                </strong>
              </div>
            </Card>
          </div>

          {/* Performance & Score Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Card title="Assessment Performance Overview">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Average Candidate Score:
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                    {metrics.assessments.averageScore}%
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Placement Level Breakdown
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Advanced</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>
                        {metrics.assessments.levelBreakdown.advanced}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Intermediate</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa' }}>
                        {metrics.assessments.levelBreakdown.intermediate}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Foundation</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>
                        {metrics.assessments.levelBreakdown.foundation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Observability Telemetry">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ color: '#94a3b8' }}>Total Events Logged:</span>
                  <strong style={{ color: '#f8fafc' }}>
                    {metrics.telemetry.totalEventsLogged}
                  </strong>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ color: '#94a3b8' }}>Environment:</span>
                  <Badge variant="info">{metrics.system.environment}</Badge>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ color: '#94a3b8' }}>Database Ping:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>
                    {metrics.system.dbLatencyMs} ms
                  </span>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}
                >
                  <span style={{ color: '#94a3b8' }}>Sentry Status:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>
                    ACTIVE (structured logs)
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Error Logs Table */}
          <Card title="Recent Telemetry Events & Exceptions">
            {metrics.telemetry.recentErrors && metrics.telemetry.recentErrors.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #1e293b',
                        textAlign: 'left',
                        color: '#94a3b8',
                      }}
                    >
                      <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Event Type</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Attempt ID</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.telemetry.recentErrors.map((err: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #0f1729' }}>
                        <td
                          style={{
                            padding: '0.75rem 0.5rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {new Date(err.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <Badge variant="danger">{err.event_type}</Badge>
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 0.5rem',
                            fontFamily: 'monospace',
                            color: '#94a3b8',
                          }}
                        >
                          {err.attempt_id ? err.attempt_id.substring(0, 8) + '...' : 'N/A'}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 0.5rem',
                            fontFamily: 'monospace',
                            color: '#cbd5e1',
                          }}
                        >
                          {typeof err.event_payload === 'string'
                            ? err.event_payload.substring(0, 100)
                            : JSON.stringify(err.event_payload).substring(0, 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem 0',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                ✅ Zero recorded system exceptions or telemetry errors in the database log.
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
