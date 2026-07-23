'use client';

import React from 'react';

export interface QueueJob {
  jobId: string;
  source: string;
  priority: number;
  status: string;
}

export function QueueMonitor({ queueJobs }: { queueJobs: QueueJob[] }) {
  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-sky-400 mb-4">Evaluation Queue Monitor</h3>
      <div className="space-y-3">
        {queueJobs.map((j) => (
          <div
            key={j.jobId}
            className="flex justify-between items-center bg-slate-800 p-4 rounded border border-slate-700"
          >
            <div>
              <p className="font-semibold text-slate-100">Job: {j.jobId}</p>
              <p className="text-xs text-slate-400">
                Source: {j.source} | Priority: {j.priority}
              </p>
            </div>
            <span className="text-xs bg-sky-950 border border-sky-700 text-sky-300 px-2 py-1 rounded">
              {j.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
