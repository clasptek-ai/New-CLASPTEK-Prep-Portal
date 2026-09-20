'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui/ui-components';
import { SkeletonText } from '@/components/ui/skeleton';
import { PageContainer, PageContent } from '@/shared/ui/layout/PageContainer';

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
    <PageContainer>
      <PageContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary)',
                  }}
                >
                  Admin Operations Dashboard
                </h1>
                <Badge variant="success">LIVE TELEMETRY</Badge>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
                System health, database performance, candidate activity, and production error logs.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {lastRefreshed && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Refreshed: {lastRefreshed}
                </span>
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
                color: 'var(--status-danger)',
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
                      color: 'var(--status-success)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {metrics.system.status}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    DB Latency:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {metrics.system.dbLatencyMs}ms
                    </strong>
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem',
                    }}
                  >
                    Database:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {metrics.system.databaseName}
                    </strong>
                  </div>
                </Card>

                {/* Candidates */}
                <Card title="Candidate Registrations">
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--brand-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {metrics.users.total} Total
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    New (Last 24h):{' '}
                    <strong style={{ color: 'var(--status-success)' }}>
                      +{metrics.users.newLast24h}
                    </strong>
                  </div>
                </Card>

                {/* Assessments */}
                <Card title="Assessment Lifecycle">
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--brand-secondary, #a78bfa)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {metrics.assessments.submitted} Submitted
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    In-Progress:{' '}
                    <strong style={{ color: 'var(--status-warning)' }}>
                      {metrics.assessments.inProgress}
                    </strong>{' '}
                    | Last 24h:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {metrics.assessments.last24h}
                    </strong>
                  </div>
                </Card>

                {/* Content Stratification */}
                <Card title="Question Bank Stratification">
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--brand-accent, #f472b6)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {metrics.content.totalQuestions} Questions
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Found:{' '}
                    <strong style={{ color: 'var(--brand-primary)' }}>
                      {metrics.content.stratification.foundation}
                    </strong>{' '}
                    | Inter:{' '}
                    <strong style={{ color: 'var(--brand-secondary, #a78bfa)' }}>
                      {metrics.content.stratification.intermediate}
                    </strong>{' '}
                    | Adv:{' '}
                    <strong style={{ color: 'var(--brand-accent, #f472b6)' }}>
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
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Average Candidate Score:
                      </span>
                      <div
                        style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)' }}
                      >
                        {metrics.assessments.averageScore}%
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        Placement Level Breakdown
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Advanced
                          </span>
                          <div
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              color: 'var(--status-success)',
                            }}
                          >
                            {metrics.assessments.levelBreakdown.advanced}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Intermediate
                          </span>
                          <div
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              color: 'var(--brand-primary)',
                            }}
                          >
                            {metrics.assessments.levelBreakdown.intermediate}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Foundation
                          </span>
                          <div
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              color: 'var(--status-warning)',
                            }}
                          >
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
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Total Events Logged:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {metrics.telemetry.totalEventsLogged}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Environment:</span>
                      <Badge variant="info">{metrics.system.environment}</Badge>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Database Ping:</span>
                      <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                        {metrics.system.dbLatencyMs} ms
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Sentry Status:</span>
                      <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
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
                    <table
                      style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: '1px solid var(--border)',
                            textAlign: 'left',
                            color: 'var(--text-muted)',
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
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td
                              style={{
                                padding: '0.75rem 0.5rem',
                                color: 'var(--text-muted)',
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
                                color: 'var(--text-muted)',
                              }}
                            >
                              {err.attempt_id ? err.attempt_id.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td
                              style={{
                                padding: '0.75rem 0.5rem',
                                fontFamily: 'monospace',
                                color: 'var(--text-secondary)',
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
                      color: 'var(--text-muted)',
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
      </PageContent>
    </PageContainer>
  );
}
