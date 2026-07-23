'use client';

import React from 'react';

export interface ProviderHealthRecord {
  provider: string;
  isHealthy: boolean;
  latencyMs: number;
  circuitState: string;
}

export function ProviderHealth({ healthRecords }: { healthRecords: ProviderHealthRecord[] }) {
  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-sky-400 mb-4">AI Provider Health Registry</h3>
      <div className="grid grid-cols-1 gap-4">
        {healthRecords.map((r) => (
          <div
            key={r.provider}
            className="flex justify-between items-center bg-slate-800 p-4 rounded border border-slate-700"
          >
            <div>
              <p className="font-semibold text-slate-100">{r.provider}</p>
              <p className="text-xs text-slate-400">
                Latency: {r.latencyMs}ms | Circuit: {r.circuitState}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs border ${
                r.isHealthy
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950 border-rose-700 text-rose-300'
              }`}
            >
              {r.isHealthy ? 'Healthy' : 'Degraded'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
