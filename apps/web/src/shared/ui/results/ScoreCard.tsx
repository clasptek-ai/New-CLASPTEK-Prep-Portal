import React, { forwardRef } from 'react';
import { ScoreCardProps } from './results.types';
import { Card } from '../card/Card';

export const ScoreCard = forwardRef<HTMLDivElement, ScoreCardProps>(function ScoreCard(
  { testTitle, overallScore, maxScore = '9.0', bandDescriptor, dateCompleted, style, ...props },
  ref
) {
  return (
    <Card
      ref={ref}
      style={{
        padding: '2.0rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.75rem',
        ...style,
      }}
      {...props}
    >
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--text-muted, #94a3b8)',
        }}
      >
        {testTitle}
      </span>

      <div
        style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          color: 'var(--primary-500, #3b82f6)',
          lineHeight: 1,
        }}
      >
        {overallScore}
        <span style={{ fontSize: '1.25rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
          {' '}
          / {maxScore}
        </span>
      </div>

      {bandDescriptor && (
        <span
          style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}
        >
          {bandDescriptor}
        </span>
      )}

      {dateCompleted && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Completed on {dateCompleted}
        </span>
      )}
    </Card>
  );
});

export const PerformanceBreakdown = ScoreCard;
export const BandScore = ScoreCard;
export const SkillBreakdown = ScoreCard;
