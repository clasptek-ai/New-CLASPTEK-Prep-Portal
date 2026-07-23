import React from 'react';
import { CircularProgressProps } from './progress.types';

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  style,
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-surface-2, #1e293b)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary-500, #3b82f6)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 200ms ease-out' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-primary, #f8fafc)',
        }}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
