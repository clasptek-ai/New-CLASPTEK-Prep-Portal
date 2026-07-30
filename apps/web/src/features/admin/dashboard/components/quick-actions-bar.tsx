'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Layers, Award, Play, Bell, Users, Plus } from 'lucide-react';

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
      label: '+ Create Practice Session',
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
      label: '+ View Students',
      sub: 'User directory management',
      icon: <Users size={18} color="#38bdf8" />,
      onClick: () => router.push('/admin/users'),
    },
  ];

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        backgroundColor: '#151d30',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
        Quick Actions
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.backgroundColor = '#0f172a';
            }}
          >
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
              }}
            >
              {act.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                {act.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {act.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
