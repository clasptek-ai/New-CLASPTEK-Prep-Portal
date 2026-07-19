'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../components/ui/ui-components';
import { HeatMap } from '../../components/charts/svg-charts';

export function HabitScreen() {
  const [streak, setStreak] = useState(5);
  const [checkedIn, setCheckedIn] = useState(false);

  const mockHeatmapData = Array.from({ length: 28 }).map((_, i) => ({
    day: i + 1,
    active: i < 5 || i === 10 || i === 12 || i === 15
  }));

  function handleCheckIn() {
    setCheckedIn(true);
    setStreak(prev => prev + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Habit Tracker</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Maintain consistency and track daily focus scores</p>
        </div>
        <Button onClick={handleCheckIn} disabled={checkedIn}>
          {checkedIn ? 'Checked In' : 'Daily Check-in'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <Card title="Activity Heatmap (Current Month)">
          <HeatMap valList={mockHeatmapData} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Streak Statistics">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Active Study Streak (Days)</span>
              </div>
            </div>
          </Card>

          <Card title="Milestones">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span>Completed 5 days</span>
                <Badge variant="success">Earned</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span>Complete 10 days</span>
                <Badge variant="info">In Progress</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
