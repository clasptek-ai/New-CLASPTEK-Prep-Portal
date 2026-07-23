import React from 'react';
import { WidgetProps } from './WidgetRegistry';

export const TrendChartWidget: React.FC<WidgetProps> = ({ title, data }) => {
  const points = data?.points ?? [65, 70, 68, 74, 82, 85, 89];
  const max = Math.max(...points, 100);

  return (
    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl shadow-lg">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">{title}</h3>
      <div className="h-32 flex items-end justify-between gap-2 pt-4 border-b border-slate-800">
        {points.map((val: number, idx: number) => {
          const heightPct = (val / max) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                style={{ height: `${heightPct}%` }}
                className="w-full bg-indigo-500 hover:bg-indigo-400 transition-all rounded-t-sm relative"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded shadow">
                  {val}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-2">
        <span>Week 1</span>
        <span>Week 7</span>
      </div>
    </div>
  );
};
