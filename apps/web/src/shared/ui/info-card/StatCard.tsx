import React, { forwardRef } from 'react';
import { StatCardProps } from './info-card.types';
import { Card } from '../card/Card';

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { title, value, icon, trend, delta, description, style, ...props },
  ref
) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return 'var(--text-muted, #94a3b8)';
    }
  };

  return (
    <Card ref={ref} style={{ padding: '1.25rem', ...style }} {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}
        >
          {title}
        </span>
        {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
      </div>

      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary, #f8fafc)',
          marginBottom: '0.35rem',
        }}
      >
        {value}
      </div>

      {(delta || description) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
          {delta && <span style={{ fontWeight: 700, color: getTrendColor() }}>{delta}</span>}
          {description && (
            <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{description}</span>
          )}
        </div>
      )}
    </Card>
  );
});

export const MetricCard = StatCard;
export const SummaryCard = StatCard;
