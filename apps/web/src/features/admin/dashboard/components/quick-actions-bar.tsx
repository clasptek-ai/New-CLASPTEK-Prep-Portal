import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Layers, FileUp, Award, Upload, Bell, Play } from 'lucide-react';

export const QuickActionsBar: React.FC = () => {
  const router = useRouter();

  const operations = [
    {
      id: 'create-programme',
      label: 'Create Programme',
      icon: <BookOpen size={16} color="#38bdf8" />,
      onClick: () => router.push('/admin/programmes'),
    },
    {
      id: 'create-course',
      label: 'Create Course',
      icon: <Layers size={16} color="#38bdf8" />,
      onClick: () => router.push('/admin/curriculum'),
    },
    {
      id: 'upload-resource',
      label: 'Upload Resources',
      icon: <FileUp size={16} color="#34d399" />,
      onClick: () => router.push('/admin/resources'),
    },
    {
      id: 'create-diagnostic',
      label: 'Create Diagnostic',
      icon: <Award size={16} color="#60a5fa" />,
      onClick: () => router.push('/admin/assessments?action=create-diagnostic'),
    },
    {
      id: 'create-mock',
      label: 'Create Mock Test',
      icon: <Play size={16} color="#a78bfa" />,
      onClick: () => router.push('/admin/assessments?action=create-mock'),
    },
    {
      id: 'question-import-centre',
      label: 'Import Centre (CSV/ZIP)',
      icon: <Upload size={16} color="#fbbf24" />,
      onClick: () => router.push('/admin/question-bank/import'),
    },
    {
      id: 'publish-announcement',
      label: 'Publish Announcement',
      icon: <Bell size={16} color="#38bdf8" />,
      onClick: () => router.push('/admin/notifications'),
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
      <div
        style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}
      >
        Quick Administrative Workflows
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={op.onClick}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0f172a';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            {op.icon}
            <span>{op.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
