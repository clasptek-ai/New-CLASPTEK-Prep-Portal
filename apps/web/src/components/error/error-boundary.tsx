'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, Button } from '../ui/ui-components';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught rendering crash:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <Card title="Something went wrong" style={{ maxWidth: '500px', margin: '2rem auto', border: '1px solid #ef4444' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <p>An unexpected error occurred while rendering this component.</p>
            {this.state.error && (
              <pre style={{ padding: '0.75rem', backgroundColor: '#0b0f19', border: '1px solid #232e48', borderRadius: '6px', color: '#f87171', overflowX: 'auto', fontSize: '0.8rem' }}>
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset}>Try Again</Button>
          </div>
        </Card>
      );
    }

    return this.children;
  }

  private get fallback() {
    return this.props.fallback;
  }

  private get children() {
    return this.props.children;
  }
}
export default ErrorBoundary;
