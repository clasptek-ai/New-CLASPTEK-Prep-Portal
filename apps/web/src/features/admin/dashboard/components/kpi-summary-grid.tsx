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

export const KPISummaryGrid: React.FC<KPISummaryGridProps> = ({ stats }) => {
  const kpis = [
    // First Row
    {
      title: 'TOTAL STUDENTS',
      value: (stats.totalStudents || 0).toLocaleString(),
      description:
        stats.totalStudents > 0 ? 'Active candidate directory' : 'No registered candidates',
      icon: <Users size={18} color="#38bdf8" />,
    },
    {
      title: 'ACTIVE PROGRAMMES',
      value: (stats.activeProgrammes || 0).toLocaleString(),
      description: stats.activeProgrammes > 0 ? 'Exam preparation tracks' : 'No active programmes',
      icon: <BookOpen size={18} color="#38bdf8" />,
    },
    {
      title: 'PUBLISHED QUESTIONS',
      value: (stats.publishedQuestions || 0).toLocaleString(),
      description: stats.publishedQuestions > 0 ? 'Approved & active items' : 'No published items',
      icon: <CheckCircle2 size={18} color="#34d399" />,
    },
    // Second Row
    {
      title: 'PRACTICE SESSIONS TODAY',
      value: (stats.practiceSessionsToday || 0).toLocaleString(),
      description:
        stats.practiceSessionsToday > 0 ? 'Daily adaptive runs' : 'No practice runs today',
      icon: <Clock size={18} color="#38bdf8" />,
    },
    {
      title: 'DIAGNOSTICS COMPLETED TODAY',
      value: (stats.diagnosticsCompletedToday || 0).toLocaleString(),
      description:
        stats.diagnosticsCompletedToday > 0 ? 'Baseline evaluations today' : 'No diagnostics today',
      icon: <Award size={18} color="#38bdf8" />,
    },
    {
      title: 'AVERAGE READINESS',
      value: stats.totalStudents > 0 ? `${stats.averageReadiness || 0}%` : '0%',
      description: stats.totalStudents > 0 ? 'Cohort exam readiness' : 'Awaiting evaluations',
      icon: <TrendingUp size={18} color="#34d399" />,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        width: '100%',
      }}
      className="kpi-grid"
    >
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          style={{
            padding: '1.25rem 1.35rem',
            borderRadius: '14px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '112px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            transition: 'border-color 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {kpi.title}
            </span>
            <div
              style={{
                padding: '0.35rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {kpi.icon}
            </div>
          </div>

          <div>
            <div
              style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.25rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {kpi.description}
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
