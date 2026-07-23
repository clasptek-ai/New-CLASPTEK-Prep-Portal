'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryProvider extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error Boundary Exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f19',
            color: '#f8fafc',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2rem',
              backgroundColor: '#151d30',
              border: '1px solid #ef444450',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#f87171', marginTop: 0 }}>Application Error Encountered</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.6rem 1.2rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
