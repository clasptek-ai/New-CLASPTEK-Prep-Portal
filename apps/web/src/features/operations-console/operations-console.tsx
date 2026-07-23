'use client';

import React from 'react';

export interface OperationsStats {
  queuedCount: number;
  runningCount: number;
  completedToday: number;
  failedCount: number;
}

export function OperationsConsole({ stats }: { stats: OperationsStats }) {
  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-sky-400 mb-4">Operations Console</h3>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-2xl font-bold text-sky-400">{stats.queuedCount}</p>
          <p className="text-xs text-slate-400">Queued</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-2xl font-bold text-sky-400">{stats.runningCount}</p>
          <p className="text-xs text-slate-400">Running</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-2xl font-bold text-emerald-400">{stats.completedToday}</p>
          <p className="text-xs text-slate-400">Completed Today</p>
        </div>
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <p className="text-2xl font-bold text-rose-400">{stats.failedCount}</p>
          <p className="text-xs text-slate-400">Failed</p>
        </div>
      </div>
    </div>
  );
}
