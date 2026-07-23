'use client';

import React from 'react';

export interface MockTimerProps {
  timeRemainingSeconds: number;
}

export function MockTimer({ timeRemainingSeconds }: MockTimerProps) {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const isUrgent = timeRemainingSeconds < 300;

  return (
    <div
      className={`font-mono text-lg font-bold px-3 py-1 rounded border ${
        isUrgent
          ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
          : 'bg-slate-800 border-slate-700 text-sky-300'
      }`}
    >
      ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
