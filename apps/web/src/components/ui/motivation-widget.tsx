'use client';

import React from 'react';
import { Card, Badge } from './ui-components';
import { Flame, Zap, Award, Star } from 'lucide-react';

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
    <Card
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        backgroundColor: '#151d30',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
        Practice Motivation & Achievements
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Flame size={20} color="#f59e0b" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            {motivation.dailyStreak} Days
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Daily Streak</span>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Zap size={20} color="#38bdf8" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            {motivation.xp} XP
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Practice XP</span>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Star size={20} color="#34d399" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            {motivation.practicePoints} pts
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Practice Points</span>
        </div>

        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Award size={20} color="#a78bfa" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            {motivation.badges.length} Badges
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unlocked Achievements</span>
        </div>
      </div>

      {motivation.badges.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {motivation.badges.map((b, idx) => (
            <Badge key={idx} variant="success">
              {b}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
export default MotivationWidget;
