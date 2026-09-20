'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../../components/ui/ui-components';
import { PageContainer, PageContent } from '@/shared/ui/layout/PageContainer';
import {
  instructorReadinessService,
  StudentReadinessDetails,
} from '../../../services/instructor/readiness.service';

export function ReadinessScreen() {
  const [readiness, setReadiness] = useState<StudentReadinessDetails | null>(null);

  useEffect(() => {
    async function load() {
      const data = await instructorReadinessService.getStudentReadiness('s2');
      setReadiness(data);
    }
    load();
  }, []);

  if (!readiness) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3>Loading student readiness projections...</h3>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              Student Readiness Insights
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Inspect prediction confidence factors, risks, and study milestones recommendation
              templates
            </p>
          </div>

          <Card
            title="Overall Readiness Projection"
            actions={
              <Badge variant={readiness.riskLevel === 'HIGH' ? 'danger' : 'success'}>
                {readiness.riskLevel} RISK
              </Badge>
            }
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  padding: '1rem',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  Overall score:{' '}
                  <strong
                    style={{
                      fontSize: '1.25rem',
                      display: 'block',
                      color: 'var(--text-primary)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {readiness.overallReadiness}%
                  </strong>
                </div>
                <div>
                  Confidence interval:{' '}
                  <strong
                    style={{
                      fontSize: '1.25rem',
                      display: 'block',
                      color: 'var(--text-primary)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {readiness.confidence}%
                  </strong>
                </div>
                <div>
                  Suggested mock date:{' '}
                  <strong
                    style={{
                      fontSize: '1.25rem',
                      display: 'block',
                      color: 'var(--text-primary)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {readiness.suggestedMockDate}
                  </strong>
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Actionable Study Plan Advice:
                </span>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {readiness.recommendedStudyPlan}
                </p>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Weak areas list:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {readiness.weakAreas.map((w, idx) => (
                    <Badge key={idx} variant="danger">
                      {w}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Suggested Practice Sessions Count:
                </span>
                <div style={{ marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  <strong>{readiness.suggestedPracticeSessions} recommended sessions</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}
