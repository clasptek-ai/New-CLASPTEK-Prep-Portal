import React from 'react';
import { Flame, Target, Sparkles, Play, Shield, RotateCcw } from 'lucide-react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Button } from '../../../shared/ui/button/Button';
import { Avatar } from '../../../shared/ui/avatar/Avatar';

export interface HeroWidgetProps {
  studentName: string;
  config: ProgrammeConfiguration;
  studyStreakDays: number;
  studentId?: string;
  learningLevel?: string;
  state?: WidgetState;
  onRetry?: () => void;
  onResumeLearning?: () => void;
}

export const HeroWidget: React.FC<HeroWidgetProps> = ({
  studentName,
  config,
  studyStreakDays,
  studentId = 'CGA-2026-000245',
  learningLevel = 'Intermediate',
  state: _state = 'SUCCESS',
  onRetry: _onRetry,
  onResumeLearning,
}) => {
  return (
    <div
      style={{
        padding: '2.25rem',
        borderRadius: '20px',
        background: `linear-gradient(135deg, rgba(21, 29, 48, 0.95), rgba(11, 15, 25, 0.98)), ${config.colorPalette.gradient}`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow Backdrop Accent */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: config.colorPalette.primary,
          filter: 'blur(100px)',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />

      {/* Main Header & Profile Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Avatar name={studentName} size="lg" status="online" />
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.35rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: config.colorPalette.badgeBg,
                  color: config.colorPalette.badgeText,
                  border: `1px solid ${config.colorPalette.primary}40`,
                }}
              >
                {config.badge}
              </span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#38bdf8',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Shield size={13} /> {studentId}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• Level: {learningLevel}</span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.95rem',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome back, {studentName}
            </h1>
            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: '0.9rem',
                color: '#cbd5e1',
                maxWidth: '580px',
              }}
            >
              Your predictive model indicates a{' '}
              <strong style={{ color: config.colorPalette.badgeText }}>
                {config.targetMetric.current} {config.targetMetric.unit}
              </strong>{' '}
              readiness. Finish today’s recommended diagnostic drills to push towards your target.
            </p>
          </div>
        </div>

        {/* Study Streak & Quick Resume CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Flame size={24} color="#f59e0b" fill="#f59e0b" />
            <div>
              <div
                style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}
              >
                {studyStreakDays} Days
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#d97706',
                  fontWeight: 700,
                  marginTop: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Active Streak
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = '/student/welcome')}
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                gap: '0.5rem',
              }}
            >
              <RotateCcw size={16} /> Retake Diagnostic
            </Button>

            {onResumeLearning && (
              <Button
                variant="primary"
                size="lg"
                onClick={onResumeLearning}
                style={{
                  backgroundColor: config.colorPalette.primary,
                  color: '#ffffff',
                  boxShadow: `0 4px 14px ${config.colorPalette.primary}50`,
                  gap: '0.5rem',
                }}
              >
                <Play size={16} fill="#ffffff" /> Practice Drills
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Metric Summary Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '0.5rem',
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: '1.1rem 1.25rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Target size={15} color={config.colorPalette.primary} />
            <span>Target Score Goal</span>
          </div>
          <div
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}
          >
            {config.targetMetric.target} {config.targetMetric.unit}
          </div>
          <div
            style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem', fontWeight: 600 }}
          >
            {config.targetMetric.description}
          </div>
        </div>

        <div
          style={{
            padding: '1.1rem 1.25rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={15} color="#a78bfa" />
            <span>AI Readiness Precision</span>
          </div>
          <div
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}
          >
            94.8%
          </div>
          <div
            style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '0.2rem', fontWeight: 600 }}
          >
            Based on 14 recent drills
          </div>
        </div>
      </div>
    </div>
  );
};
