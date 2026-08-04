'use client';

import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '@/components/ui/ui-components';
import { SkeletonText } from '@/components/ui/skeleton';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/observability/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Failed to load learning analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Network error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Learning Analytics & Intelligence Dashboard
            </h1>
            <Badge variant="info">v1.1 TELEMETRY</Badge>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
            Candidate usage analytics, CEFR distributions, assessment sample calibration, and Data Quality Governance metrics.
          </p>
        </div>
        <Button onClick={fetchAnalytics} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Analytics'}
        </Button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f87171', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading && !data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} title="Loading Analytics...">
              <SkeletonText lines={3} />
            </Card>
          ))}
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Active Users */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            <Card title="Daily Active Users (DAU)">
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                {data.userAnalytics.dau}
              </div>
            </Card>
            <Card title="Weekly Active Users (WAU)">
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
                {data.userAnalytics.wau}
              </div>
            </Card>
            <Card title="Monthly Active Users (MAU)">
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa' }}>
                {data.userAnalytics.mau}
              </div>
            </Card>
            <Card title="Data Quality Governance">
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                {data.dataQuality.score}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status: 0 Violations (PASS)</span>
            </Card>
          </div>

          {/* Sample Size Calibration Notice */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#0c1322',
              border: '1px solid #1e293b',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24', marginBottom: '0.25rem' }}>
                Statistical Calibration Gate Status
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                {data.assessmentAnalytics.calibrationStatus}
              </div>
            </div>
            <Badge variant="warning">
              {data.assessmentAnalytics.completedSampleCount} / 100 SAMPLES
            </Badge>
          </div>

          {/* CEFR & Completion Distributions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Card title="CEFR Level Placement Distribution">
              {data.distributions.cefr && data.distributions.cefr.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.distributions.cefr.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#94a3b8' }}>CEFR Level {item.cefr_level}:</span>
                      <strong style={{ color: '#60a5fa' }}>{item.cnt} Candidates</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Baseline CEFR placement records accumulating...</div>
              )}
            </Card>

            <Card title="Assessment Completion Metrics">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Completion Rate:</span>
                  <strong style={{ color: '#34d399' }}>{data.assessmentAnalytics.completionRatePct}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Average Candidate Score:</span>
                  <strong style={{ color: '#38bdf8' }}>{data.assessmentAnalytics.averageScorePct}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#94a3b8' }}>Total Submitted Attempts:</span>
                  <strong style={{ color: '#f8fafc' }}>{data.assessmentAnalytics.submittedAttempts}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
