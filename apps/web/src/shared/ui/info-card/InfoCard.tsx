import React, { forwardRef } from 'react';
import { InfoCardProps } from './info-card.types';
import { Card } from '../card/Card';

export const InfoCard = forwardRef<HTMLDivElement, InfoCardProps>(function InfoCard(
  { title, icon, action, style, children, ...props },
  ref
) {
  return (
    <Card ref={ref} style={{ padding: '1.5rem', ...style }} {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.0rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
          <h4
            style={{
              margin: 0,
              fontSize: '1.0rem',
              fontWeight: 700,
              color: 'var(--text-primary, #f8fafc)',
            }}
          >
            {title}
          </h4>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </Card>
  );
});
