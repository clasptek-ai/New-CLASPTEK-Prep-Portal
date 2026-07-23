'use client';

import React from 'react';
import { Card, Badge } from './ui-components';

export interface MotivationData {
  dailyStreak: number;
  weeklyStreak: number;
  longestStreak: number;
  practicePoints: number;
  xp: number;
  badges: string[];
}

export function MotivationWidget({ motivation }: { motivation: MotivationData | null }) {
  if (!motivation) return null;

  return (
    <Card title="Motivation Engine & Practice XP">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0b0f19',
            padding: '0.75rem',
            borderRadius: '6px',
          }}
        >
          <span
            style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}
          >
            🔥 {motivation.dailyStreak} Days
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Daily Streak</span>
        </div>
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0b0f19',
            padding: '0.75rem',
            borderRadius: '6px',
          }}
        >
          <span
            style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}
          >
            ⚡ {motivation.xp} XP
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Practice XP</span>
        </div>
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0b0f19',
            padding: '0.75rem',
            borderRadius: '6px',
          }}
        >
          <span
            style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}
          >
            🪙 {motivation.practicePoints} pts
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Practice Points</span>
        </div>
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0b0f19',
            padding: '0.75rem',
            borderRadius: '6px',
          }}
        >
          <span
            style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}
          >
            🏅 {motivation.badges.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Badges Unlocked</span>
        </div>
      </div>
      {motivation.badges.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {motivation.badges.map((b, idx) => (
            <Badge key={idx} variant="success">
              🏆 {b}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
