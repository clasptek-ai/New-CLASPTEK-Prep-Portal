'use client';

import React from 'react';

// ─── Grid Dashboard Layout ───────────────────────────────────────────
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
}

// ─── Row Component ───────────────────────────────────────────────────
export function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ─── Column Component ────────────────────────────────────────────────
interface ColumnProps {
  span?: 1 | 2 | 3 | 4 | 6 | 12;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Column({ span = 12, children, style }: ColumnProps) {
  const getWidth = () => {
    switch (span) {
      case 1:
        return '8.33%';
      case 2:
        return '16.66%';
      case 3:
        return '25%';
      case 4:
        return '33.33%';
      case 6:
        return '50%';
      default:
        return '100%';
    }
  };

  return (
    <div
      style={{
        flex: span === 12 ? '0 0 100%' : `0 0 calc(${getWidth()} - 1.5rem)`,
        minWidth: '280px',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {children}
    </div>
  );
}
