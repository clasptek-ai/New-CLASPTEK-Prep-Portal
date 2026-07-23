import React, { forwardRef } from 'react';
import { ProgressBarProps } from './progress.types';

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    value,
    max = 100,
    showValueLabel = false,
    color = 'var(--primary-500, #3b82f6)',
    style,
    ...props
  },
  ref
) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ width: '100%' }}>
      {showValueLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          width: '100%',
          height: '0.5rem',
          backgroundColor: 'var(--bg-surface-2, #1e293b)',
          borderRadius: 'var(--radius-full, 9999px)',
          overflow: 'hidden',
          ...style,
        }}
        {...props}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-full, 9999px)',
            transition: 'width 200ms ease-out',
          }}
        />
      </div>
    </div>
  );
});
