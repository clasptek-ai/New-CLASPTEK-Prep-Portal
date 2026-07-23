import React from 'react';

export function TrendIndicator({
  direction,
  label,
}: {
  direction: 'up' | 'down' | 'neutral';
  label: string;
}) {
  const getColor = () => {
    switch (direction) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const getArrow = () => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        color: getColor(),
        fontWeight: 700,
      }}
    >
      <span>{getArrow()}</span>
      <span>{label}</span>
    </span>
  );
}
