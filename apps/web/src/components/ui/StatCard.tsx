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
    primary: 'bg-[var(--brand-subtle)] text-[var(--brand)] border border-[var(--brand)]/20',
    success: 'bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success)]/20',
    warning: 'bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)]/20',
    error: 'bg-[var(--error-subtle)] text-[var(--error)] border border-[var(--error)]/20',
    neutral: 'bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border)]',
  }[badgeVariant];

  return (
    <div className="bg-[var(--surface-0)] border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-card)] flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-secondary)]">
          {label}
        </span>
        {icon && <div className="text-[var(--brand)]">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-1">
        <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight tabular-nums">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">{subtext}</p>
      )}
    </div>
  );
}
