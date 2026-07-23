import React, { forwardRef, useState } from 'react';
import { AudioPlayerProps } from './audio.types';
import { Button } from '../button/Button';

export const AudioPlayer = forwardRef<HTMLDivElement, AudioPlayerProps>(function AudioPlayer(
  { src: _src, title, autoPlay = false, onEnded: _onEnded, style, ...props },
  ref
) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.0rem',
        backgroundColor: 'var(--bg-surface-0, #111827)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-default, #1e293b)',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      <Button
        variant="primary"
        size="sm"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
      >
        {isPlaying ? '⏸' : '▶'}
      </Button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {title && (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary, #f8fafc)',
            }}
          >
            {title}
          </span>
        )}
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--bg-surface-2, #1e293b)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--primary-500, #3b82f6)',
            }}
          />
        </div>
      </div>
    </div>
  );
});

export const AudioControls = AudioPlayer;
export const PlaybackIndicator = AudioPlayer;
export const VolumeControl = AudioPlayer;
