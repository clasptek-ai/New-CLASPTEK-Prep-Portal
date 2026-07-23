'use client';

import React from 'react';

export interface ActiveSession {
  sessionId: string;
  studentId: string;
  status: string;
  warningCount: number;
}

export function MockMonitor({ sessions }: { sessions: ActiveSession[] }) {
  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
      <h2 className="text-xl font-bold text-sky-400 mb-4">Live Examination Monitor</h2>
      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.sessionId}
            className="flex justify-between items-center bg-slate-800 p-4 rounded border border-slate-700"
          >
            <div>
              <p className="font-semibold text-slate-200">Session: {s.sessionId}</p>
              <p className="text-xs text-slate-400">Student ID: {s.studentId}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-1 rounded">
                {s.status}
              </span>
              {s.warningCount > 0 && (
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-2 py-1 rounded">
                  ⚠️ Warnings: {s.warningCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
