import React from 'react';
import { LoadingOverlayProps } from './spinner.types';
import { Spinner } from './Spinner';

export function LoadingOverlay({ isLoading, message, children }: LoadingOverlayProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            zIndex: 1300,
          }}
        >
          <Spinner size="lg" />
          {message && (
            <span style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 600 }}>
              {message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
