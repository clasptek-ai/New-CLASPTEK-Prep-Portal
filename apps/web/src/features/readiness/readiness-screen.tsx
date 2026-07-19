'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/ui/ui-components';
import { LineChart } from '../../components/charts/svg-charts';
import { studentReadinessService, StudentReadinessInfo } from '../../services/student/readiness.service';

export function ReadinessScreen() {
  const [readiness, setReadiness] = useState<StudentReadinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await studentReadinessService.getReadiness();
        setReadiness(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !readiness) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading dynamic readiness score predictions...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Student Readiness Tracker</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Monitor AI-driven exam success probability metrics and focus areas</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main metric card */}
          <Card title="Current Readiness Score Indicator" actions={<Badge variant={readiness.riskLevel === 'LOW' ? 'success' : 'danger'}>{readiness.riskLevel} RISK</Badge>}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#2563eb' }}>{readiness.overallReadiness}%</div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Target Success Score: <strong>{readiness.targetScore}%</strong></div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Confidence Interval: {readiness.confidenceRange.min}% - {readiness.confidenceRange.max}%
                </div>
              </div>
            </div>
          </Card>

          {/* Trend Chart */}
          <Card title="Readiness Trend History">
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart data={readiness.readinessTrend} labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']} />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recommended study actions */}
          <Card title="Focus Directions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#0b0f19', borderLeft: '3px solid #f59e0b' }}>
                <span style={{ fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '0.25rem' }}>Suggested Action:</span>
                {readiness.priorityStudyPlan}
              </div>
              <div>
                <span>Suggested Next Mock:</span>
                <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{readiness.suggestedMockDate}</strong>
              </div>
              <div>
                <span>Daily Practice target:</span>
                <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>{readiness.suggestedPracticePlan}</strong>
              </div>
            </div>
          </Card>

          {/* Strong / weak competency areas */}
          <Card title="Domains Breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem' }}>Strong Competencies:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {readiness.strongDomains.map((d, i) => <Badge key={i} variant="success">{d}</Badge>)}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                <span style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem' }}>Weak Focus Areas:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {readiness.weakDomains.map((d, i) => <Badge key={i} variant="danger">{d}</Badge>)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default ReadinessScreen;
