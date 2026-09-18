'use client';

import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subtext,
  badge,
  badgeVariant = 'neutral',
  icon,
}: StatCardProps) {
  const badgeStyles = {
    primary: 'bg-[#f2f3ff] text-[#003c90]',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-rose-50 text-rose-700',
    neutral: 'bg-slate-100 text-slate-700',
  }[badgeVariant];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-1">
        <span className="text-2xl font-bold text-[#131b2e] tracking-tight tabular-nums">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-slate-500 mt-1 leading-snug">{subtext}</p>}
    </div>
  );
}
