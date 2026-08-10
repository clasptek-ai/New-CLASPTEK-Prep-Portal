'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Layers, Award, Play, Bell, Users, BookOpen, BarChart2 } from 'lucide-react';

export const QuickActionsBar: React.FC = () => {
  const router = useRouter();

  const actions = [
    {
      label: '+ Import Questions',
      sub: 'Bulk CSV/JSON importer',
      icon: <Upload size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/question-bank/import'),
    },
    {
      label: '+ Create Practice',
      sub: 'Configure practice templates',
      icon: <Layers size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/practice-sessions'),
    },
    {
      label: '+ Create Diagnostic',
      sub: 'Baseline evaluation setup',
      icon: <Award size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/assessments?mode=assessment'),
    },
    {
      label: '+ Create Mock Exam',
      sub: 'Full timed blueprint test',
      icon: <Play size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/assessments?mode=mock'),
    },
    {
      label: '+ Publish Announcement',
      sub: 'Broadcast candidate updates',
      icon: <Bell size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/notifications'),
    },
    {
      label: '+ Manage Students',
      sub: 'User directory management',
      icon: <Users size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/users'),
    },
    {
      label: '+ Create Programme',
      sub: 'Setup academic exam track',
      icon: <BookOpen size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/programmes'),
    },
    {
      label: 'View Reports',
      sub: 'Institutional analytics DTO',
      icon: <BarChart2 size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/reports'),
    },
  ];

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        backgroundColor: '#151d30',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Quick Administrative Command Operations
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              cursor: 'pointer',
              height: '64px',
              boxSizing: 'border-box',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.backgroundColor = '#0f172a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {act.icon}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {act.label}
              </div>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#94a3b8',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {act.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
