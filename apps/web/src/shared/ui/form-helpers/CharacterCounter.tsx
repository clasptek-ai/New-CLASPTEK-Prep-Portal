import React from 'react';

export interface CharacterCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  current: number;
  max: number;
}

export function CharacterCounter({ current, max, style, ...props }: CharacterCounterProps) {
  const isOver = current > max;

  return (
    <span
      style={{
        fontSize: '0.75rem',
        color: isOver ? '#ef4444' : 'var(--text-muted, #94a3b8)',
        fontWeight: isOver ? 600 : 400,
        ...style,
      }}
      {...props}
    >
      {current} / {max}
    </span>
  );
}
