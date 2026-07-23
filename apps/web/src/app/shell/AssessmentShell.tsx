'use client';

import React from 'react';
import { AssessmentTimer } from '../../shared/ui/timer/AssessmentTimer';
import { AssessmentProgress } from '../../shared/ui/assessment-progress/AssessmentProgress';

export interface AssessmentShellProps {
  examTitle: string;
  sectionName: string;
  totalQuestions: number;
  answeredQuestions: number;
  remainingSeconds: number;
  onTimeExpired?: () => void;
  children: React.ReactNode;
}

export function AssessmentShell({
  examTitle,
  sectionName,
  totalQuestions,
  answeredQuestions,
  remainingSeconds,
  onTimeExpired,
  children,
}: AssessmentShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app, #0f172a)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          borderBottom: '1px solid var(--border-default, #1e293b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.0rem' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary, #f8fafc)',
            }}
          >
            {examTitle}
          </h3>
        </div>

        <div style={{ width: '380px' }}>
          <AssessmentProgress
            currentSection={sectionName}
            totalQuestions={totalQuestions}
            answeredQuestions={answeredQuestions}
          />
        </div>

        <AssessmentTimer seconds={remainingSeconds} onTimeExpired={onTimeExpired} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.0rem' }}>{children}</main>
    </div>
  );
}

export default AssessmentShell;
