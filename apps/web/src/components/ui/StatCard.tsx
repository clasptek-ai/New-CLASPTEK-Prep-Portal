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
    primary: 'bg-(--brand-subtle) text-(--brand) border border-(--brand)/20',
    success: 'bg-(--success-subtle) text-(--success) border border-(--success)/20',
    warning: 'bg-(--warning-subtle) text-(--warning) border border-(--warning)/20',
    error: 'bg-(--error-subtle) text-(--error) border border-(--error)/20',
    neutral: 'bg-(--surface-1) text-(--text-secondary) border border-(--border)',
  }[badgeVariant];

  return (
    <div className="bg-(--surface-0) border border-(--border) rounded-xl p-4 shadow-(--shadow-card) flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-(--text-secondary)">
          {label}
        </span>
        {icon && <div className="text-(--brand)">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-1">
        <span className="text-2xl font-bold text-(--text-primary) tracking-tight tabular-nums">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-(--text-secondary) mt-1 leading-snug">{subtext}</p>}
    </div>
  );
}
