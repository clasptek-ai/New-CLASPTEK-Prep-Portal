'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../../components/ui/ui-components';
import { instructorReadinessService, StudentReadinessDetails } from '../../../services/instructor/readiness.service';

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
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student readiness projections...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Student Readiness Insights</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Inspect prediction confidence factors, risks, and study milestones recommendation templates</p>
      </div>

      <Card title="Overall Readiness Projection" actions={<Badge variant={readiness.riskLevel === 'HIGH' ? 'danger' : 'success'}>{readiness.riskLevel} RISK</Badge>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1rem', backgroundColor: '#0b0f19', borderRadius: '8px' }}>
            <div>Overall score: <strong style={{ fontSize: '1.25rem', display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{readiness.overallReadiness}%</strong></div>
            <div>Confidence interval: <strong style={{ fontSize: '1.25rem', display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{readiness.confidence}%</strong></div>
            <div>Suggested mock date: <strong style={{ fontSize: '1.25rem', display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{readiness.suggestedMockDate}</strong></div>
          </div>

          <div>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>Actionable Study Plan Advice:</span>
            <p style={{ margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>{readiness.recommendedStudyPlan}</p>
          </div>

          <div>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>Weak areas list:</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {readiness.weakAreas.map((w, idx) => (
                <Badge key={idx} variant="danger">{w}</Badge>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>Suggested Practice Sessions Count:</span>
            <div style={{ marginTop: '0.25rem' }}><strong>{readiness.suggestedPracticeSessions} recommended sessions</strong></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
export default ReadinessScreen;
