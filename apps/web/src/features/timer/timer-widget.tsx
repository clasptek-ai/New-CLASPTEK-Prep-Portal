'use client';

import React from 'react';

interface TimerWidgetProps {
  remainingSeconds: number;
  isServerSynced?: boolean;
}

export function TimerWidget({ remainingSeconds, isServerSynced = true }: TimerWidgetProps) {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono">
      <span className="text-slate-400">Time:</span>
      <span className="font-bold text-amber-400">{formatted}</span>
      {isServerSynced && (
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Server Synced" />
      )}
    </div>
  );
}
