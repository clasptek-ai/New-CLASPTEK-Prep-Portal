'use client';

import React from 'react';
import { Play, Flame } from 'lucide-react';
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
  isDiagnosticCompleted?: boolean;
  actionLabel?: string;
  actionSubtitle?: string;
  onPrimaryAction?: () => void;
  onRetry?: () => void;
  onResumeLearning?: () => void;
}

export const HeroWidget: React.FC<HeroWidgetProps> = ({
  studentName,
  config,
  studyStreakDays,
  state = 'SUCCESS',
  isDiagnosticCompleted = false,
  actionLabel,
  actionSubtitle,
  onPrimaryAction,
  onResumeLearning,
}) => {
  const isLoading = state === 'LOADING';
  const firstName = studentName ? studentName.split(' ')[0] : 'STUDENT';

  // Determine dominant next action handler and label
  const handleAction = onPrimaryAction || onResumeLearning;
  const defaultActionLabel = isDiagnosticCompleted ? 'Continue Practice' : 'Take Pre-Assessment';
  const resolvedActionLabel = actionLabel || defaultActionLabel;

  const defaultSubtitle = isDiagnosticCompleted
    ? 'Your baseline is calibrated. Continue focused practice drills to target skill gaps.'
    : 'Complete your initial diagnostic pre-assessment to calibrate your personal preparation plan.';
  const resolvedSubtitle = actionSubtitle || defaultSubtitle;

  return (
    <div
      style={{
        borderRadius: '1rem',
        backgroundColor: 'var(--surface-0)',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Brand Top Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: 'var(--brand-primary)',
        }}
      />

      {/* ── Top row: Greeting + Actions ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
        className="sm:flex-row sm:items-center"
      >
        {/* Left: Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Avatar name={studentName} size="lg" status="online" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Programme badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.125rem 0.625rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(4, 94, 173, 0.08)',
                  border: '1px solid rgba(4, 94, 173, 0.25)',
                  color: 'var(--brand-primary)',
                }}
              >
                {config.badge || config.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                • Official Candidate Session
              </span>
            </div>

            {/* Greeting headline */}
            {isLoading ? (
              <Skeleton width="240px" height="2rem" />
            ) : (
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                WELCOME BACK, {firstName.toUpperCase()}
              </h1>
            )}

            {/* Subtitle */}
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                lineHeight: 1.5,
              }}
            >
              {resolvedSubtitle}
            </p>
          </div>
        </div>

        {/* Right: Streak (informational) + Dominant Action */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          className="self-start sm:self-auto"
        >
          {studyStreakDays > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--warning)',
              }}
              title={`${studyStreakDays} consecutive days active`}
            >
              <Flame size={16} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>
                  {studyStreakDays} Days
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  Streak
                </span>
              </div>
            </div>
          )}

          {handleAction && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAction}
              leftIcon={<Play size={14} fill="currentColor" />}
              style={{ whiteSpace: 'nowrap' }}
            >
              {resolvedActionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* ── Bottom row: Key metrics strip ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.875rem',
          marginTop: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: '0.875rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            Current Baseline
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem',
              marginTop: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {config.targetMetric.current}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {config.targetMetric.unit}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginTop: '2px',
            }}
          >
            Calibrated Diagnostic
          </span>
        </div>

        <div
          style={{
            padding: '0.875rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            Target Goal
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem',
              marginTop: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--brand-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {config.targetMetric.target}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
              {config.targetMetric.unit}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginTop: '2px',
            }}
          >
            {config.targetMetric.description}
          </span>
        </div>

        <div
          style={{
            padding: '0.875rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            Diagnostic Status
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.25rem',
              marginTop: '0.25rem',
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>
              Available
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginTop: '2px',
            }}
          >
            Automated Rubric Evaluation
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroWidget;
