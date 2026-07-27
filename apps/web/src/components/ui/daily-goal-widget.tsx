'use client';

import React from 'react';
import { Card, Badge, ProgressBar } from './ui-components';
import { Target } from 'lucide-react';

export interface DailyGoalData {
  targetQuestions: number;
  targetPassages: number;
  completedQuestions: number;
  timedPracticeRequired: boolean;
  vocabularyReviewRequired: boolean;
  status: string;
}

export function DailyGoalWidget({ goal }: { goal: DailyGoalData | null }) {
  if (!goal) return null;
  const pct = Math.min(100, Math.round((goal.completedQuestions / goal.targetQuestions) * 100));

  return (
    <Card
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        backgroundColor: '#151d30',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Target size={18} color="#38bdf8" />
          Today's Adaptive Practice Target
        </div>
        <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'warning'}>{goal.status}</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ color: '#cbd5e1' }}>
            Progress: <strong>{goal.completedQuestions}</strong> of{' '}
            <strong>{goal.targetQuestions}</strong> Questions Completed
          </span>
          <span style={{ fontWeight: 800, color: '#38bdf8' }}>{pct}%</span>
        </div>

        <ProgressBar value={pct} max={100} />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
          {goal.timedPracticeRequired && <Badge variant="warning">Timed Practice Required</Badge>}
          {goal.vocabularyReviewRequired && <Badge variant="info">Vocab Review Needed</Badge>}
          <Badge variant="neutral">{goal.targetPassages} Reading Passages</Badge>
        </div>
      </div>
    </Card>
  );
}
export default DailyGoalWidget;
