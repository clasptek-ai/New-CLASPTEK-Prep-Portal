import React from 'react';

export function SparklinePlaceholder() {
  return (
    <svg width="100%" height="24" style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke="var(--primary-500, #3b82f6)"
        strokeWidth="2"
        points="0,20 20,15 40,18 60,8 80,12 100,4"
      />
    </svg>
  );
}
