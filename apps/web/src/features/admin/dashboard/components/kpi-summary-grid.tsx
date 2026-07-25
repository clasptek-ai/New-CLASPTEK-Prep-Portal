import React from 'react';
import { Users, BookOpen, Award, Database, ShieldCheck, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { StatCard } from '../../../../shared/ui/info-card/StatCard';

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
  const kpis = [
    {
      title: 'Total Enrolled Students',
      value: stats.activeStudents.toLocaleString(),
      description: '+12.4% new enrolments this month',
      icon: <Users size={20} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Active Programmes',
      value: `${stats.programmesCount} Programmes`,
      description: 'IELTS AC, GT, SAT, TOEFL, CELPIP',
      icon: <BookOpen size={20} color="#34d399" />,
      accentColor: '#34d399',
    },
    {
      title: 'Diagnostic Assessments Completed',
      value: '1,420',
      description: 'Baseline proficiency evaluations',
      icon: <Award size={20} color="#60a5fa" />,
      accentColor: '#60a5fa',
    },
    {
      title: 'Mock Tests Scheduled',
      value: stats.activeExamsCount.toString(),
      description: 'Full timed exam simulations',
      icon: <Clock size={20} color="#a78bfa" />,
      accentColor: '#a78bfa',
    },
    {
      title: 'Questions Pending Review',
      value: '12 Items',
      description: 'Requires SME verification',
      icon: <Database size={20} color="#fbbf24" />,
      accentColor: '#fbbf24',
    },
    {
      title: 'Pending Student Approvals',
      value: `${pendingApprovals} Students`,
      description: 'Requires admissions signoff',
      icon: <AlertCircle size={20} color="#f59e0b" />,
      accentColor: '#f59e0b',
    },
    {
      title: 'Active Instructors',
      value: stats.activeInstructors.toString(),
      description: '100% active evaluation coverage',
      icon: <TrendingUp size={20} color="#34d399" />,
      accentColor: '#34d399',
    },
    {
      title: 'Platform Health & Security',
      value: stats.platformHealth,
      description: 'RLS & AES-256 Active',
      icon: <ShieldCheck size={20} color="#34d399" />,
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
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.35rem', fontWeight: 500 }}>
              {kpi.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
