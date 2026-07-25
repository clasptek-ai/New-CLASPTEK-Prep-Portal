import React from 'react';
import { Card } from '../card/Card';
import { Skeleton } from '../skeleton/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../alert/Alert';
import { EmptyState } from '../empty-state/EmptyState';
import { Button } from '../button/Button';
import { RefreshCw } from 'lucide-react';

export type WidgetState = 'LOADING' | 'EMPTY' | 'ERROR' | 'SUCCESS';

export interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  state?: WidgetState;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  actionSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = '#3b82f6',
  state = 'SUCCESS',
  errorMessage = 'Unable to load widget data. Please try again.',
  emptyTitle = 'No data available',
  emptyDescription = 'There is currently no information to display for this section.',
  onRetry,
  actionSlot,
  children,
  className,
  style,
}) => {
  return (
    <Card
      className={className}
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-surface-1, #151d30)',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {/* Widget Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary, #f8fafc)',
              }}
            >
              {title}
            </h3>
            {badge && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: `${badgeColor}25`,
                  color: badgeColor,
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p
              style={{
                margin: '0.25rem 0 0',
                fontSize: '0.825rem',
                color: 'var(--text-secondary, #94a3b8)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actionSlot && <div>{actionSlot}</div>}
      </div>

      {/* 4-State UI Matrix Content Handler */}
      <div>
        {state === 'LOADING' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}
          >
            <Skeleton height="24px" width="60%" />
            <Skeleton height="16px" width="90%" />
            <Skeleton height="16px" width="40%" />
          </div>
        )}

        {state === 'ERROR' && (
          <Alert variant="error" className="my-2">
            <AlertTitle>Widget Loading Failure</AlertTitle>
            <AlertDescription
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>{errorMessage}</span>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  style={{ gap: '0.4rem', marginTop: '0.5rem' }}
                >
                  <RefreshCw size={12} /> Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {state === 'EMPTY' && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            primaryAction={
              onRetry ? (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Refresh
                </Button>
              ) : undefined
            }
          />
        )}

        {state === 'SUCCESS' && children}
      </div>
    </Card>
  );
};
