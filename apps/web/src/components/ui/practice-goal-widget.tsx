'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from './ui-components';

export interface PracticeGoalData {
  id: string;
  goalType: string;
  goalTitle: string;
  targetValue: number;
  status: string;
}

export function PracticeGoalWidget({
  goals,
  onSetGoal,
}: {
  goals: PracticeGoalData[];
  onSetGoal?: (type: string, title: string, value: number) => void;
}) {
  const [goalType, setGoalType] = useState('IMPROVE_GRAMMAR_ACCURACY');
  const [goalTitle, setGoalTitle] = useState('Improve Grammar Accuracy');
  const [targetValue, setTargetValue] = useState(85);

  const goalOptions = [
    { type: 'IMPROVE_GRAMMAR_ACCURACY', title: 'Improve Grammar Accuracy', val: 85 },
    { type: 'IMPROVE_READING_SPEED', title: 'Improve Reading Speed (WPM)', val: 220 },
    { type: 'INCREASE_SAT_MATH_ACCURACY', title: 'Increase SAT Math Accuracy', val: 90 },
    { type: 'REVIEW_WEAK_VOCABULARY', title: 'Review Weak Vocabulary', val: 50 },
    { type: 'MAINTAIN_MASTERED_SKILLS', title: 'Maintain Mastered Skills', val: 95 },
    { type: 'PREPARE_FOR_MOCK', title: 'Prepare for Upcoming Mock Exam', val: 80 },
  ];

  return (
    <Card title="Practice Goal Engine">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {goals.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No active practice goals set.</p>
        ) : (
          goals.map((g) => (
            <div
              key={g.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#0b0f19',
                borderRadius: '6px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                  {g.goalTitle}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    marginTop: '0.2rem',
                  }}
                >
                  Target: {g.targetValue}%
                </span>
              </div>
              <Badge variant={g.status === 'COMPLETED' ? 'success' : 'warning'}>{g.status}</Badge>
            </div>
          ))
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <select
            value={goalType}
            onChange={(e) => {
              const selected = goalOptions.find((o) => o.type === e.target.value);
              if (selected) {
                setGoalType(selected.type);
                setGoalTitle(selected.title);
                setTargetValue(selected.val);
              }
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              backgroundColor: '#151d30',
              color: '#f8fafc',
              border: '1px solid #232e48',
              fontSize: '0.85rem',
              flex: 1,
            }}
          >
            {goalOptions.map((o) => (
              <option key={o.type} value={o.type}>
                {o.title}
              </option>
            ))}
          </select>
          <Button onClick={() => onSetGoal?.(goalType, goalTitle, targetValue)} variant="primary">
            Set Goal
          </Button>
        </div>
      </div>
    </Card>
  );
}
