'use client';

import React from 'react';
import { Card } from '../../components/ui/ui-components';
import { RadarChart, LineChart, BarChart } from '../../components/charts/svg-charts';
import { DashboardLayout } from '../../components/layouts/layout-engine';

export function AnalyticsScreen() {
  const competencyData = {
    Grammar: 85,
    Reading: 60,
    Listening: 70,
    Vocabulary: 50,
    Writing: 75,
  };

  const progressData = [60, 65, 75, 78, 84.5];
  const progressLabels = ['May', 'Jun', 'Jul', 'Aug', 'Current'];

  const studyMinutes = [120, 150, 90, 180, 240];
  const studyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Learning Analytics</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Statistical dashboards of student readiness, mastery, and study timelines
        </p>
      </div>

      <DashboardLayout>
        <Card title="Competency Mastery Radar">
          <RadarChart data={competencyData} />
        </Card>

        <Card title="Readiness Progress Timeline">
          <LineChart data={progressData} labels={progressLabels} />
        </Card>

        <Card title="Daily Study Duration (Mins)">
          <BarChart data={studyMinutes} labels={studyLabels} />
        </Card>
      </DashboardLayout>
    </div>
  );
}
