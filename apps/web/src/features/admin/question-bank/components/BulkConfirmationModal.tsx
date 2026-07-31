import React from 'react';
import { Button } from '../../../../components/ui/ui-components';
import { AlertTriangle, Trash2, Archive, X } from 'lucide-react';

interface BulkConfirmationModalProps {
  isOpen: boolean;
  actionType: 'DELETE' | 'ARCHIVE' | null;
  count: number;
  isAllFiltered: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BulkConfirmationModal: React.FC<BulkConfirmationModalProps> = ({
  isOpen,
  actionType,
  count,
  isAllFiltered,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !actionType) return null;

  const isDelete = actionType === 'DELETE';
  const title = isDelete ? `Delete ${count} Question Items?` : `Archive ${count} Question Items?`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '1.5rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: isDelete ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDelete ? '#f87171' : '#fbbf24',
              }}
            >
              {isDelete ? <Trash2 size={24} /> : <Archive size={24} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                {title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {isAllFiltered ? 'Applies to all matching filtered results' : 'Selected items batch'}
              </span>
            </div>
          </div>

          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            lineHeight: 1.5,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            {isDelete
              ? `Warning: Permanently deleting ${count} questions will remove them from the Question Bank repository. This action cannot be undone.`
              : `Archiving ${count} questions will remove them from active candidate practice sessions and mock exam delivery.`}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            style={{
              backgroundColor: isDelete ? '#dc2626' : '#d97706',
              color: '#ffffff',
              gap: '0.4rem',
              fontWeight: 700,
            }}
          >
            {isDelete ? <Trash2 size={16} /> : <Archive size={16} />}
            Confirm {isDelete ? 'Delete' : 'Archive'} ({count})
          </Button>
        </div>
      </div>
    </div>
  );
};
