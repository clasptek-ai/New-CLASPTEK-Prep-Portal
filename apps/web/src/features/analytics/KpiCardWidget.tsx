import React from 'react';
import { WidgetProps } from './WidgetRegistry';

export const KpiCardWidget: React.FC<WidgetProps> = ({ title, data, config }) => {
  const value = data?.value ?? config?.defaultValue ?? '84.2%';
  const growth = data?.growth ?? '+4.8%';
  const isPositive = !growth.startsWith('-');

  return (
    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl shadow-lg">
      <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
        {title}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {growth}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-3">Compared to previous period</p>
    </div>
  );
};
