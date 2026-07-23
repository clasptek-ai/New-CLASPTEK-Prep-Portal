import React, { forwardRef } from 'react';
import { WordCounterProps } from './writing.types';

export const WordCounter = forwardRef<HTMLDivElement, WordCounterProps>(function WordCounter(
  { text, minTarget, maxTarget, style, ...props },
  ref
) {
  const getWordCount = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const words = getWordCount(text);
  const chars = text.length;

  const isBelowMin = minTarget !== undefined && words < minTarget;
  const isAboveMax = maxTarget !== undefined && words > maxTarget;

  const getStatusColor = () => {
    if (isBelowMin) return '#f59e0b';
    if (isAboveMax) return '#ef4444';
    return '#10b981';
  };

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-md, 8px)',
        backgroundColor: 'var(--bg-surface-0, #111827)',
        border: '1px solid var(--border-default, #1e293b)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'var(--text-primary, #f8fafc)',
        ...style,
      }}
      {...props}
    >
      <span>
        Words: <strong style={{ color: getStatusColor() }}>{words}</strong>
        {minTarget && (
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}> / {minTarget} min</span>
        )}
      </span>
      <span style={{ color: 'var(--text-muted, #94a3b8)' }}>|</span>
      <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Chars: {chars}</span>
    </div>
  );
});

export const WritingToolbar = WordCounter;
export const WritingStatus = WordCounter;
