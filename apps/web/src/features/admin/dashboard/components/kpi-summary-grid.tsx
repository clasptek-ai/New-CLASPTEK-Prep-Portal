'use client';

import React from 'react';
import { Users, BookOpen, CheckCircle2, Clock, Award, TrendingUp } from 'lucide-react';

export interface KPISummaryGridProps {
  stats: {
    totalStudents: number;
    activeProgrammes: number;
    publishedQuestions: number;
    practiceSessionsToday: number;
    diagnosticsCompletedToday: number;
    averageReadiness: number;
  };
}

interface KPIItem {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const KPISummaryGrid: React.FC<KPISummaryGridProps> = ({ stats }) => {
  const kpis: KPIItem[] = [
    {
      title: 'Total Students',
      value: (stats.totalStudents || 0).toLocaleString(),
      description: stats.totalStudents > 0 ? 'Active candidates' : 'No registered candidates',
      icon: <Users size={16} />,
      iconBg: 'var(--brand-subtle)',
    },
    {
      title: 'Active Programmes',
      value: (stats.activeProgrammes || 0).toLocaleString(),
      description: stats.activeProgrammes > 0 ? 'Exam preparation tracks' : 'No active programmes',
      icon: <BookOpen size={16} />,
      iconBg: 'var(--brand-subtle)',
    },
    {
      title: 'Published Questions',
      value: (stats.publishedQuestions || 0).toLocaleString(),
      description: stats.publishedQuestions > 0 ? 'Approved question bank items' : 'No published items',
      icon: <CheckCircle2 size={16} />,
      iconBg: 'var(--success-subtle)',
    },
    {
      title: 'Practice Sessions Today',
      value: (stats.practiceSessionsToday || 0).toLocaleString(),
      description: stats.practiceSessionsToday > 0 ? 'Daily adaptive runs' : 'No practice today',
      icon: <Clock size={16} />,
      iconBg: 'var(--brand-subtle)',
    },
    {
      title: 'Diagnostics Today',
      value: (stats.diagnosticsCompletedToday || 0).toLocaleString(),
      description: stats.diagnosticsCompletedToday > 0 ? 'Baseline evaluations' : 'No diagnostics today',
      icon: <Award size={16} />,
      iconBg: 'var(--brand-subtle)',
    },
    {
      title: 'Avg. Readiness',
      value: stats.totalStudents > 0 ? `${stats.averageReadiness || 0}%` : '—',
      description: stats.totalStudents > 0 ? 'Cohort exam readiness' : 'Awaiting evaluations',
      icon: <TrendingUp size={16} />,
      iconBg: 'var(--success-subtle)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
        width: '100%',
      }}
    >
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {/* Row: label + icon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}
            >
              {kpi.title}
            </span>
            <span
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: kpi.iconBg,
                color: 'var(--brand-light)',
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </span>
          </div>

          {/* Value */}
          <div
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {kpi.value}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {kpi.description}
          </div>
        </div>
      ))}
    </div>
  );
};
