import React, { forwardRef, useEffect, useState } from 'react';
import { AssessmentTimerProps } from './timer.types';

export const AssessmentTimer = forwardRef<HTMLDivElement, AssessmentTimerProps>(
  function AssessmentTimer(
    {
      seconds,
      mode: _mode = 'countdown',
      isPaused = false,
      onTimeExpired,
      warningThresholdSeconds = 300,
      dangerThresholdSeconds = 60,
      style,
      ...props
    },
    ref
  ) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
      setTimeLeft(seconds);
    }, [seconds]);

    useEffect(() => {
      if (isPaused || timeLeft <= 0) return;

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onTimeExpired) onTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [isPaused, timeLeft, onTimeExpired]);

    const formatTime = (secs: number) => {
      const hrs = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;

      if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getStatusColor = () => {
      if (timeLeft === 0) return '#dc2626';
      if (timeLeft <= dangerThresholdSeconds) return '#ef4444';
      if (timeLeft <= warningThresholdSeconds) return '#f59e0b';
      return 'var(--text-primary, #f8fafc)';
    };

    return (
      <div
        ref={ref}
        role="timer"
        aria-live="off"
        aria-label={`Time remaining: ${formatTime(timeLeft)}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.875rem',
          borderRadius: 'var(--radius-md, 8px)',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          border: `1px solid ${getStatusColor()}`,
          color: getStatusColor(),
          fontSize: '1.125rem',
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none',
          ...style,
        }}
        {...props}
      >
        <span>⏱</span>
        <span>{formatTime(timeLeft)}</span>
        {isPaused && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Paused)</span>}
      </div>
    );
  }
);

export const CountdownTimer = AssessmentTimer;
export const ElapsedTimer = AssessmentTimer;
