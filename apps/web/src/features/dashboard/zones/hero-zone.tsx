import React from 'react';
import { Flame, Target, Sparkles, ArrowRight } from 'lucide-react';
import { ProgrammeConfiguration } from '../models/programme-config';

export interface HeroZoneProps {
  studentName: string;
  config: ProgrammeConfiguration;
  studyStreakDays: number;
}

export const HeroZone: React.FC<HeroZoneProps> = ({ studentName, config, studyStreakDays }) => {
  return (
    <div
      style={{
        padding: '2rem',
        borderRadius: '16px',
        background: `linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)), ${config.colorPalette.gradient}`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          backgroundColor: config.colorPalette.primary,
          filter: 'blur(90px)',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: config.colorPalette.badgeBg,
                color: config.colorPalette.badgeText,
              }}
            >
              {config.badge}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Exam Date: Aug 28, 2026</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Welcome back, {studentName}
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '560px' }}>
            Your predictive model indicates a <strong style={{ color: config.colorPalette.badgeText }}>{config.targetMetric.current} {config.targetMetric.unit}</strong> readiness. Finish today’s recommended diagnostic drills to push towards your target.
          </p>
        </div>

        {/* Study Streak & Target Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Flame size={22} color="#f59e0b" fill="#f59e0b" />
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                {studyStreakDays} Days
              </div>
              <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600, marginTop: '2px' }}>
                Active Streak
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Quick Stat Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '0.5rem',
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            <Target size={14} color={config.colorPalette.primary} />
            <span>Target Goal</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
            {config.targetMetric.target} {config.targetMetric.unit}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.15rem', fontWeight: 600 }}>
            {config.targetMetric.description}
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            <Sparkles size={14} color="#a78bfa" />
            <span>AI Confidence Index</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
            92%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '0.15rem', fontWeight: 600 }}>
            High Predictive Precision
          </div>
        </div>
      </div>
    </div>
  );
};
