import React, { forwardRef } from 'react';
import { TimelineProps, TimelineItemProps } from './timeline.types';

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(function TimelineItem(
  { date, title, description, icon, isCompleted = false },
  ref
) {
  return (
    <div
      ref={ref}
      style={{ display: 'flex', gap: '1.0rem', position: 'relative', paddingBottom: '1.5rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: isCompleted
              ? 'var(--primary-500, #3b82f6)'
              : 'var(--bg-surface-2, #1e293b)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            zIndex: 1,
          }}
        >
          {icon || (isCompleted ? '✓' : '•')}
        </div>
        <div
          style={{
            flex: 1,
            width: '2px',
            backgroundColor: 'var(--border-default, #1e293b)',
            marginTop: '0.25rem',
          }}
        />
      </div>

      <div style={{ flex: 1, paddingTop: '0.1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)' }}>
          {date}
        </span>
        <h5
          style={{
            margin: '0.15rem 0 0.25rem 0',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary, #f8fafc)',
          }}
        >
          {title}
        </h5>
        {description && (
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #cbd5e1)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(function Timeline(
  { style, children, ...props },
  ref
) {
  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', ...style }} {...props}>
      {children}
    </div>
  );
});
