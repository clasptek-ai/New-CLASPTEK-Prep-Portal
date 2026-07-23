'use client';

import React from 'react';
import { Card, Badge, ProgressBar } from './ui-components';

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
    <Card title="Today's Adaptive Daily Goal">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            {goal.completedQuestions} of {goal.targetQuestions} Questions Completed
          </span>
          <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'warning'}>{goal.status}</Badge>
        </div>
        <ProgressBar value={pct} max={100} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {goal.timedPracticeRequired && <Badge variant="warning">Timed Practice Required</Badge>}
          {goal.vocabularyReviewRequired && <Badge variant="info">Vocab Review Needed</Badge>}
          <Badge variant="neutral">{goal.targetPassages} Reading Passages</Badge>
        </div>
      </div>
    </Card>
  );
}
