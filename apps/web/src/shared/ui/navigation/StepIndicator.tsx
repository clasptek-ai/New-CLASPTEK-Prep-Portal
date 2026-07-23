import React from 'react';
import { StepIndicatorProps } from './navigation.types';

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav
      aria-label="Progress steps"
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}
    >
      {steps.map((step, idx) => {
        const isComplete = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div
              onClick={() => onStepClick && onStepClick(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: onStepClick ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  width: '2.0rem',
                  height: '2.0rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor:
                    isComplete || isCurrent
                      ? 'var(--primary-500, #3b82f6)'
                      : 'var(--bg-surface-2, #1e293b)',
                  color: isComplete || isCurrent ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                  border: isCurrent ? '2px solid #ffffff' : 'none',
                }}
              >
                {isComplete ? '✓' : idx + 1}
              </div>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? 'var(--text-primary, #f8fafc)' : 'var(--text-muted, #94a3b8)',
                }}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor:
                    idx < currentStep
                      ? 'var(--primary-500, #3b82f6)'
                      : 'var(--border-default, #1e293b)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
