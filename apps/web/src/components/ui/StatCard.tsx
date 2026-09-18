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
    primary: 'bg-[#EAF4FC] text-[#045EAD] border border-[#B9DDF8]',
    success: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    error: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    neutral: 'bg-[#F8FAFC] text-[#475569] border border-slate-200',
  }[badgeVariant];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#475569]">
          {label}
        </span>
        {icon && <div className="text-[#045EAD]">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-1">
        <span className="text-2xl font-bold text-[#050310] tracking-tight tabular-nums">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-[#475569] mt-1 leading-snug">{subtext}</p>}
    </div>
  );
}
