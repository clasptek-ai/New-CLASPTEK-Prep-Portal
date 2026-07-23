'use client';

import React from 'react';

export interface CostMonitorProps {
  dailySpend: number;
  monthlySpend: number;
  monthlyLimit: number;
}

export function CostMonitor({ dailySpend, monthlySpend, monthlyLimit }: CostMonitorProps) {
  const percentage = Math.min(100, Math.round((monthlySpend / monthlyLimit) * 100));

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-sky-400 mb-4">AI Cost Monitoring</h3>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Daily Spend:</span>
          <span className="font-semibold text-slate-100">${dailySpend.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Monthly Spend:</span>
          <span className="font-semibold text-slate-100">${monthlySpend.toFixed(2)}</span>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Limit: ${monthlyLimit.toFixed(2)}</span>
            <span>{percentage}% Used</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
