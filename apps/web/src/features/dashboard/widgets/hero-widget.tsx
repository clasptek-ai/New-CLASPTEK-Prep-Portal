import React from 'react';
import { Play, ArrowRight, Flame } from 'lucide-react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Button } from '../../../shared/ui/button/Button';
import { Avatar } from '../../../shared/ui/avatar/Avatar';
import { Skeleton } from '../../../shared/ui/skeleton/Skeleton';

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
  state = 'SUCCESS',
  onResumeLearning,
}) => {
  const isLoading = state === 'LOADING';

  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--surface-0)',
        border: '1px solid var(--border-strong)',
        padding: '1.75rem 2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      {/* Subtle brand accent glow — top right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand)',
          filter: 'blur(90px)',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      />

      {/* ── Top row: Greeting + Actions ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.25rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left: Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Avatar name={studentName} size="lg" status="online" />
          <div>
            {/* Programme badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--brand-subtle)',
                color: 'var(--brand-light)',
                border: '1px solid var(--brand-border)',
                marginBottom: '0.4rem',
              }}
            >
              {config.badge || config.title}
            </span>

            {/* Greeting headline */}
            {isLoading ? (
              <Skeleton width="220px" height="2rem" />
            ) : (
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                }}
              >
                Welcome back, {studentName}
              </h1>
            )}

            {/* Subtitle */}
            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              {config.title} · Target:{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {config.targetMetric.target} {config.targetMetric.unit}
              </strong>
            </p>
          </div>
        </div>

        {/* Right: Streak + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          {/* Study streak badge */}
          {studyStreakDays > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <Flame size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <div>
                <div
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    color: '#fbbf24',
                    lineHeight: 1,
                  }}
                >
                  {studyStreakDays}
                </div>
                <div
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: '#d97706',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  day streak
                </div>
              </div>
            </div>
          )}

          {onResumeLearning && (
            <Button
              variant="primary"
              size="md"
              onClick={onResumeLearning}
              leftIcon={<Play size={15} fill="white" />}
            >
              Continue Learning
            </Button>
          )}
        </div>
      </div>

      {/* ── Bottom row: Key metrics strip ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.875rem',
          marginTop: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          {
            label: 'Current Score',
            value: `${config.targetMetric.current} ${config.targetMetric.unit}`,
            sub: 'Diagnostic baseline',
            color: 'var(--brand-light)',
          },
          {
            label: 'Target Score',
            value: `${config.targetMetric.target} ${config.targetMetric.unit}`,
            sub: config.targetMetric.description,
            color: 'var(--success)',
          },
          {
            label: 'Readiness',
            value: '72%',
            sub: 'AI prediction',
            color: 'var(--warning)',
          },
        ].map((metric) => (
          <div
            key={metric.label}
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '0.35rem',
              }}
            >
              {metric.label}
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: metric.color,
                lineHeight: 1,
                marginBottom: '0.2rem',
              }}
            >
              {isLoading ? '—' : metric.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metric.sub}</div>
          </div>
        ))}

        {/* Quick links */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            Quick Access
          </div>
          <a
            href="/student/assessments"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--brand-light)',
              textDecoration: 'none',
            }}
          >
            <span>My Assessments</span>
            <ArrowRight size={14} />
          </a>
          <a
            href="/student/results"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--brand-light)',
              textDecoration: 'none',
            }}
          >
            <span>My Results</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
