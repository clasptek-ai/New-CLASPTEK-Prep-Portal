'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to structured logger (server-safe import via dynamic require)
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      // Fire-and-forget — import is cached after first call
      import('@/lib/logger')
        .then(({ logger }) => {
          logger.error('ErrorBoundary caught rendering crash', error, {
            componentStack: errorInfo.componentStack?.substring(0, 500),
          });
        })
        .catch(() => {});
    } else {
      console.error('[ErrorBoundary] Rendering crash:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const isProduction = process.env.NODE_ENV === 'production';
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            maxWidth: '480px',
            margin: '2rem auto',
            padding: '1.5rem',
            backgroundColor: '#0f1729',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            color: '#cbd5e1',
            fontSize: '0.9rem',
          }}
        >
          <p style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Something went wrong
          </p>
          <p style={{ marginBottom: '1rem' }}>
            An unexpected error occurred while rendering this component.
          </p>
          {!isProduction && this.state.error && (
            <pre
              style={{
                padding: '0.75rem',
                backgroundColor: '#0b0f19',
                border: '1px solid #232e48',
                borderRadius: '6px',
                color: '#f87171',
                overflowX: 'auto',
                fontSize: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
