import React, { forwardRef } from 'react';
import { MetricProps, MetricGroupProps } from './metric.types';
import { TrendIndicator } from './TrendIndicator';

export const Metric = forwardRef<HTMLDivElement, MetricProps>(function Metric(
  { label, value, previousValue, trend = 'neutral', percentageChange, period, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        padding: '1.0rem',
        backgroundColor: 'var(--bg-surface-0, #111827)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-default, #1e293b)',
        ...style,
      }}
      {...props}
    >
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--text-muted, #94a3b8)',
        }}
      >
        {label}
      </span>

      <div
        style={{
          fontSize: '2.0rem',
          fontWeight: 800,
          color: 'var(--text-primary, #f8fafc)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {(percentageChange || previousValue) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem',
            fontSize: '0.75rem',
          }}
        >
          {percentageChange && <TrendIndicator direction={trend} label={percentageChange} />}
          {period && <span style={{ color: 'var(--text-muted, #94a3b8)' }}>vs {period}</span>}
        </div>
      )}
    </div>
  );
});

export function MetricGroup({ style, children, ...props }: MetricGroupProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.0rem',
        width: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
