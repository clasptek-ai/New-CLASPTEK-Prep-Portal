'use client';

import React from 'react';

export interface EvaluationSettingsProps {
  maxRetries: number;
  timeoutMs: number;
}

export function EvaluationSettings({ maxRetries, timeoutMs }: EvaluationSettingsProps) {
  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-sky-400 mb-4">Evaluation Settings</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Max Retries:</span>
          <span className="font-semibold">{maxRetries}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Timeout Limit:</span>
          <span className="font-semibold">{timeoutMs}ms</span>
        </div>
      </div>
    </div>
  );
}
