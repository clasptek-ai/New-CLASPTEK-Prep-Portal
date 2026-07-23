import React, { forwardRef } from 'react';
import { RecordingIndicatorProps } from './recording.types';

export const RecordingIndicator = forwardRef<HTMLDivElement, RecordingIndicatorProps>(
  function RecordingIndicator({ status, elapsedSeconds = 0, style, ...props }, ref) {
    const getStatusColor = () => {
      switch (status) {
        case 'recording':
          return '#ef4444';
        case 'paused':
          return '#f59e0b';
        case 'stopped':
          return '#10b981';
        default:
          return '#64748b';
      }
    };

    const formatSecs = (s: number) => {
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div
        ref={ref}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.875rem',
          borderRadius: 'var(--radius-full, 9999px)',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          border: '1px solid var(--border-default, #1e293b)',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--text-primary, #f8fafc)',
          ...style,
        }}
        {...props}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            boxShadow: status === 'recording' ? '0 0 8px #ef4444' : undefined,
          }}
        />
        <span style={{ textTransform: 'capitalize' }}>{status}</span>
        {status !== 'idle' && (
          <span style={{ color: 'var(--text-muted, #94a3b8)', fontVariantNumeric: 'tabular-nums' }}>
            ({formatSecs(elapsedSeconds)})
          </span>
        )}
      </div>
    );
  }
);

export const RecordingControls = RecordingIndicator;
export const MicrophoneStatus = RecordingIndicator;
export const WaveformPlaceholder = RecordingIndicator;
