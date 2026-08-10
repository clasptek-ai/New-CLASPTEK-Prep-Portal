'use client';

import React from 'react';
import {
  Users,
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  Award,
  Layers,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Database,
} from 'lucide-react';

export interface KPISummaryGridProps {
  stats: {
    // Row 1
    totalStudents: number;
    activeProgrammes: number;
    publishedQuestions: number;
    readingPassages: number;
    practiceSessionsToday: number;
    diagnosticsCompletedToday: number;

    // Row 2
    mockExamsCompleted: number;
    averageReadiness: number;
    pendingReviewsCount: number;
    activeAssessments: number;
    studentRegistrationsToday: number;
    totalQuestionBankAssets: number;

    platformHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  };
}

export const KPISummaryGrid: React.FC<KPISummaryGridProps> = ({ stats }) => {
  const row1Kpis = [
    {
      title: 'Total Students',
      value: (stats.totalStudents || 0).toLocaleString(),
      description:
        stats.totalStudents > 0 ? 'Active candidate directory' : 'No registered candidates',
      emptyHint: 'Register your first student',
      icon: <Users size={20} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Active Programmes',
      value: (stats.activeProgrammes || 0).toLocaleString(),
      description: 'Exam preparation tracks',
      emptyHint: 'Configure exam programmes',
      icon: <BookOpen size={20} color="#a855f7" />,
      accentColor: '#a855f7',
    },
    {
      title: 'Published Questions',
      value: (stats.publishedQuestions || 0).toLocaleString(),
      description: 'Approved & active items',
      emptyHint: 'Publish questions to bank',
      icon: <CheckCircle2 size={20} color="#34d399" />,
      accentColor: '#34d399',
    },
    {
      title: 'Reading Passages',
      value: (stats.readingPassages || 0).toLocaleString(),
      description: 'Academic reading texts',
      emptyHint: 'Upload reading passages',
      icon: <FileText size={20} color="#fbbf24" />,
      accentColor: '#fbbf24',
    },
    {
      title: 'Practice Sessions Today',
      value: (stats.practiceSessionsToday || 0).toLocaleString(),
      description: 'Daily adaptive runs',
      emptyHint: 'No practice runs today',
      icon: <Clock size={20} color="#60a5fa" />,
      accentColor: '#60a5fa',
    },
    {
      title: 'Diagnostics Completed Today',
      value: (stats.diagnosticsCompletedToday || 0).toLocaleString(),
      description: 'Baseline evaluations today',
      emptyHint: 'No diagnostics today',
      icon: <Award size={20} color="#f472b6" />,
      accentColor: '#f472b6',
    },
  ];

  const row2Kpis = [
    {
      title: 'Mock Exams Completed',
      value: (stats.mockExamsCompleted || 0).toLocaleString(),
      description: 'Full timed simulations',
      emptyHint: 'No mock exams completed',
      icon: <Layers size={20} color="#818cf8" />,
      accentColor: '#818cf8',
    },
    {
      title: 'Average Readiness',
      value: stats.totalStudents > 0 ? `${stats.averageReadiness || 0}%` : '0%',
      description: 'Cohort exam readiness',
      emptyHint: 'Awaiting student evaluations',
      icon: <TrendingUp size={20} color="#34d399" />,
      accentColor: '#34d399',
    },
    {
      title: 'Pending Reviews',
      value: (stats.pendingReviewsCount || 0).toLocaleString(),
      description: 'Questions awaiting audit',
      emptyHint: 'Everything has been reviewed',
      icon: <AlertCircle size={20} color={stats.pendingReviewsCount > 0 ? '#fbbf24' : '#34d399'} />,
      accentColor: stats.pendingReviewsCount > 0 ? '#fbbf24' : '#34d399',
    },
    {
      title: 'Active Assessments',
      value: (stats.activeAssessments || 0).toLocaleString(),
      description: 'Live test blueprints',
      emptyHint: 'No active blueprints',
      icon: <ShieldCheck size={20} color="#2dd4bf" />,
      accentColor: '#2dd4bf',
    },
    {
      title: 'Registrations Today',
      value: (stats.studentRegistrationsToday || 0).toLocaleString(),
      description: 'New candidates today',
      emptyHint: 'No registrations today',
      icon: <UserPlus size={20} color="#38bdf8" />,
      accentColor: '#38bdf8',
    },
    {
      title: 'Total Question Assets',
      value: (stats.totalQuestionBankAssets || 0).toLocaleString(),
      description: 'Entire question inventory',
      emptyHint: 'Question bank is empty',
      icon: <Database size={20} color="#c084fc" />,
      accentColor: '#c084fc',
    },
  ];

  const renderKpiCard = (kpi: (typeof row1Kpis)[0], idx: number) => {
    const numericVal = parseInt(kpi.value.replace(/[^0-9]/g, ''), 10);
    const isZero = numericVal === 0;

    return (
      <div
        key={idx}
        style={{
          padding: '1.15rem 1.25rem',
          borderRadius: '14px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.65rem',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.2s ease, border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${kpi.accentColor}60`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
            }}
          >
            {kpi.title}
          </span>
          <div
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: `${kpi.accentColor}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {kpi.icon}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
            {kpi.value}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: isZero ? '#64748b' : '#cbd5e1',
              marginTop: '0.3rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {isZero ? kpi.emptyHint : kpi.description}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Row 1 KPIs */}
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.6rem',
          }}
        >
          Primary Operations & Engagement
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            width: '100%',
          }}
        >
          {row1Kpis.map(renderKpiCard)}
        </div>
      </div>

      {/* Row 2 KPIs */}
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.6rem',
          }}
        >
          Assessment & Content Inventory
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            width: '100%',
          }}
        >
          {row2Kpis.map(renderKpiCard)}
        </div>
      </div>
    </div>
  );
};
