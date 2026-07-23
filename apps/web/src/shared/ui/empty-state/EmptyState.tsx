import React, { forwardRef } from 'react';
import { EmptyStateProps } from './empty-state.types';

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, primaryAction, secondaryAction, illustration, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.0rem 1.5rem',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {illustration && <div style={{ marginBottom: '1.5rem' }}>{illustration}</div>}

      {icon && !illustration && (
        <div
          style={{
            fontSize: '2.5rem',
            color: 'var(--text-muted, #94a3b8)',
            marginBottom: '1.0rem',
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary, #f8fafc)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #cbd5e1)',
            maxWidth: '420px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
});

export function NoResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description={
        query
          ? `No matching records found for "${query}". Try adjusting your search or filters.`
          : 'No records match your criteria.'
      }
    />
  );
}

export function PermissionDenied() {
  return (
    <EmptyState
      icon="🔒"
      title="Access Restricted"
      description="You do not have permission to view this resource. Contact your administrator for access."
    />
  );
}

export function ComingSoon({ feature }: { feature?: string }) {
  return (
    <EmptyState
      icon="🚀"
      title={feature ? `${feature} Coming Soon` : 'Feature Coming Soon'}
      description="We are hard at work building this module. Check back shortly for updates!"
    />
  );
}
