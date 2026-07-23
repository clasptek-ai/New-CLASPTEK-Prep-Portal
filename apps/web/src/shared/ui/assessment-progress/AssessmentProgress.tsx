import React, { forwardRef } from 'react';
import { AssessmentProgressProps } from './assessment-progress.types';
import { ProgressBar } from '../progress/ProgressBar';

export const AssessmentProgress = forwardRef<HTMLDivElement, AssessmentProgressProps>(
  function AssessmentProgress(
    { currentSection, totalQuestions, answeredQuestions, style, ...props },
    ref
  ) {
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100) || 0;

    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          padding: '0.75rem 1.0rem',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-default, #1e293b)',
          ...style,
        }}
        {...props}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          <span style={{ color: 'var(--text-primary, #f8fafc)' }}>Section: {currentSection}</span>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>
            {answeredQuestions} of {totalQuestions} answered ({percentage}%)
          </span>
        </div>
        <ProgressBar value={percentage} />
      </div>
    );
  }
);

export const SectionProgress = AssessmentProgress;
export const OverallProgress = AssessmentProgress;
