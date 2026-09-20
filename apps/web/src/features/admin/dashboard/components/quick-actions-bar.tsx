'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Layers, Award, Play, Users, Download } from 'lucide-react';

export const QuickActionsBar: React.FC = () => {
  const router = useRouter();

  const actions = [
    {
      label: 'Import Questions',
      sub: 'Bulk CSV/JSON importer',
      icon: <Upload size={16} color="var(--brand)" />,
      onClick: () => router.push('/admin/question-bank/import'),
    },
    {
      label: 'Create Practice',
      sub: 'Configure practice templates',
      icon: <Layers size={16} color="var(--brand)" />,
      onClick: () => router.push('/admin/practice-sessions'),
    },
    {
      label: 'Create Diagnostic',
      sub: 'Baseline evaluation setup',
      icon: <Award size={16} color="var(--brand)" />,
      onClick: () => router.push('/admin/assessments?mode=assessment'),
    },
    {
      label: 'Create Mock Exam',
      sub: 'Full timed blueprint test',
      icon: <Play size={16} color="var(--brand)" />,
      onClick: () => router.push('/admin/assessments?mode=mock'),
    },
    {
      label: 'Manage Users',
      sub: 'People & candidate directory',
      icon: <Users size={16} color="var(--brand)" />,
      onClick: () => router.push('/admin/users'),
    },
    {
      label: 'Export Reports',
      sub: 'Live institutional datasets',
      icon: <Download size={16} color="var(--brand)" />,
      onClick: () => {
        const el = document.getElementById('export-reports-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
  ];

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        backgroundColor: 'var(--surface-0)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: 'var(--shadow-surface)',
      }}
    >
      <div
        style={{
          fontSize: '0.725rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Quick Administrative Operations
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.75rem',
          width: '100%',
        }}
        className="quick-actions-grid"
      >
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            style={{
              padding: '0.75rem 0.85rem',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textAlign: 'left',
              cursor: 'pointer',
              height: '56px',
              boxSizing: 'border-box',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.backgroundColor = 'var(--brand-subtle)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.backgroundColor = 'var(--surface-1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                padding: '0.35rem',
                borderRadius: '6px',
                backgroundColor: 'var(--brand-subtle)',
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
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {act.label}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
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
      <style>{`
        @media (max-width: 1200px) {
          .quick-actions-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};
