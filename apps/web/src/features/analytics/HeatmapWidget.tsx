import React from 'react';
import { WidgetProps } from './WidgetRegistry';

export const HeatmapWidget: React.FC<WidgetProps> = ({ title, data }) => {
  const competencies = data?.competencies ?? [
    { code: 'GRAMMAR', score: 88, status: 'HIGH' },
    { code: 'READING', score: 72, status: 'MEDIUM' },
    { code: 'LISTENING', score: 91, status: 'HIGH' },
    { code: 'SPEAKING', score: 64, status: 'NEEDS_ATTENTION' },
  ];

  return (
    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl shadow-lg">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {competencies.map((c: any) => {
          const isHigh = c.score >= 80;
          const isMed = c.score >= 70 && c.score < 80;
          return (
            <div
              key={c.code}
              className={`p-3 rounded-lg border ${
                isHigh
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : isMed
                    ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                    : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
              }`}
            >
              <div className="text-xs font-semibold">{c.code}</div>
              <div className="text-lg font-bold mt-1">{c.score}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
