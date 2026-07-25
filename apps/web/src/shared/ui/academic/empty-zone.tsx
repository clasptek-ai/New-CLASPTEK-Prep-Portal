import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

export interface EmptyZoneProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  height?: string;
}

export const EmptyZone: React.FC<EmptyZoneProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
  height = '180px',
}) => {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px dashed rgba(255, 255, 255, 0.12)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        color: '#94a3b8',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#cbd5e1',
        }}
      >
        <Icon size={20} />
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>{title}</h4>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8', maxWidth: '320px' }}>
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '0.25rem',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
