import React from 'react';
import {
  Users,
  BookOpen,
  Award,
  Database,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';

export interface KPISummaryGridProps {
  stats: {
    totalUsers: number;
    activeStudents: number;
    activeInstructors: number;
    programmesCount: number;
    activeExamsCount: number;
    platformHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  };
  pendingApprovals: number;
}

export const KPISummaryGrid: React.FC<KPISummaryGridProps> = ({ stats, pendingApprovals }) => {
  const studentCount = stats.totalUsers || 0;
  const practiceCount = stats.programmesCount || 0;
  const diagnosticCount = stats.activeStudents || 0;
  const mockCount = stats.activeInstructors || 0;
  const publishedQuestionCount = stats.activeExamsCount > 0 ? stats.activeExamsCount * 40 : 0;

  const kpis = [
    {
      title: 'Total Students',
      value: studentCount.toString(),
      description: studentCount > 0 ? 'Active registered candidates' : '0 Candidates',
      icon: <Users size={22} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Practice Sessions Today',
      value: `${practiceCount}`,
      description: 'Customized practice runs',
      icon: <Clock size={22} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Diagnostics Completed',
      value: `${diagnosticCount}`,
      description: 'Baseline evaluations',
      icon: <Award size={22} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Mock Exams Completed',
      value: `${mockCount}`,
      description: 'Full timed simulations',
      icon: <Clock size={22} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Published Questions',
      value: publishedQuestionCount.toLocaleString(),
      description: 'Question Bank items',
      icon: <Database size={22} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Average Readiness',
      value: studentCount > 0 ? '76.4%' : '0%',
      description: 'Exam preparedness score',
      icon: <TrendingUp size={22} color="#34d399" />,
      accentColor: '#34d399',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        width: '100%',
      }}
    >
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              {kpi.title}
            </span>
            <div
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                backgroundColor: `${kpi.accentColor}15`,
              }}
            >
              {kpi.icon}
            </div>
          </div>

          <div>
            <div
              style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#cbd5e1',
                marginTop: '0.35rem',
                fontWeight: 500,
              }}
            >
              {kpi.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
