'use client';

import React from 'react';

export interface EvaluationStatusProps {
  status: string;
  attempts: number;
  remainingSeconds: number;
}

export function EvaluationStatus({ status, attempts, remainingSeconds }: EvaluationStatusProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm text-white">
      <h3 className="text-lg font-semibold mb-2">Evaluation Progress</h3>
      <div className="space-y-2 text-sm text-slate-300">
        <div>
          Status: <span className="font-semibold text-sky-400">{status}</span>
        </div>
        <div>
          Attempts: <span className="font-semibold text-slate-100">{attempts}</span>
        </div>
        <div>
          Est. Time Remaining:{' '}
          <span className="font-semibold text-slate-100">{remainingSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
