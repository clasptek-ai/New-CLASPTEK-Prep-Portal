'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, ProgressRing, Badge } from '../../components/ui/ui-components';
import { LineChart } from '../../components/charts/svg-charts';
import { Row, Column } from '../../components/layouts/layout-engine';
import { useStudentWorkspace } from '../../workspace/StudentWorkspaceContext';
import { studentDashboardService, DashboardAggregatedData } from '../../services/student/dashboard.service';

export function DashboardScreen() {
  const router = useRouter();
  const { student, programme, readiness } = useStudentWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await studentDashboardService.getDashboardData();
        setDashboardData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !dashboardData || !student || !programme || !readiness) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading student learning dashboard...</h3>
      </div>
    );
  }

  const stats = dashboardData.stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Welcome header card */}
      <Card style={{ background: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {student.name}</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#93c5fd' }}>
              Enrolled: <strong>{programme.name}</strong> | Current Module: <strong>{programme.currentModule}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button onClick={() => router.push('/learning')}>Continue Learning</Button>
            <Button variant="secondary" onClick={() => router.push('/practice')}>Resume Practice</Button>
          </div>
        </div>
      </Card>

      {/* KPI Stats widgets grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <Card title="Learning Progress">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.learningProgress}%</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Estimated {programme.estimatedCompletionWeeks} weeks left</div>
          </div>
        </Card>
        <Card title="Practice Accuracy">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.practiceAccuracy}%</div>
            <Badge variant="success">Steady</Badge>
          </div>
        </Card>
        <Card title="Mock Average">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.mockAverage}%</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Target: {readiness.targetScore}%</div>
          </div>
        </Card>
        <Card title="Readiness Score">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>{stats.readinessScore}%</div>
            <Badge variant="info">Low Risk</Badge>
          </div>
        </Card>
      </div>

      <Row>
        {/* Today's Tasks recommendations */}
        <Column span={6}>
          <Card title="Today's Recommended Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {dashboardData.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{rec}</span>
                </div>
              ))}
            </div>
          </Card>
        </Column>

        {/* Deadlines card */}
        <Column span={6}>
          <Card title="Upcoming Tasks & Deadlines">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {dashboardData.upcomingDeadlines.map((dl, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>{dl.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Due: {dl.due}</span>
                  </div>
                  <Badge variant={dl.type === 'MOCK' ? 'success' : 'info'}>{dl.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </Column>
      </Row>

      <Row>
        {/* Readiness Trend chart */}
        <Column span={6}>
          <Card title="Readiness Tracker Trend">
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <LineChart data={readiness.readinessTrend} labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']} />
            </div>
          </Card>
        </Column>

        {/* Notifications and Alerts logs summary */}
        <Column span={6}>
          <Card title="Recent Notifications">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {dashboardData.notifications.map((notif) => (
                <div key={notif.id} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f19', borderLeft: '3px solid #2563eb' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', display: 'block' }}>{notif.title}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{notif.content}</span>
                </div>
              ))}
            </div>
          </Card>
        </Column>
      </Row>
    </div>
  );
}
export default DashboardScreen;
