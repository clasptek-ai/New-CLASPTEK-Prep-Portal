'use client';

import React from 'react';
import { Clock, BookOpen, Eye, Trash2 } from 'lucide-react';
import { AdminQuestion, QuestionWorkflowStatus } from '../../../../services/admin/questions.service';
import { Button } from '../../../../shared/ui/button/Button';
import { Badge } from '../../../../shared/ui/badge/Badge';

export interface QuestionRowProps {
  question: AdminQuestion;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (q: AdminQuestion) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: QuestionWorkflowStatus) => void;
}

function statusBadgeVariant(st: QuestionWorkflowStatus) {
  switch (st) {
    case 'PUBLISHED':    return 'success' as const;
    case 'APPROVED':     return 'info'    as const;
    case 'UNDER_REVIEW': return 'warning' as const;
    case 'DRAFT':        return 'secondary' as const;
    case 'ARCHIVED':     return 'danger'  as const;
    default:             return 'secondary' as const;
  }
}

export const QuestionRow: React.FC<QuestionRowProps> = ({
  question: q,
  isSelected,
  onToggleSelect,
  onPreview,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div
      role="row"
      aria-selected={isSelected}
      style={{
        padding: '1.125rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : 'var(--surface-0)',
        border: `1px solid ${isSelected ? 'var(--brand-border)' : 'var(--border)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Meta Row ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Left: Checkbox, code, exam, section, timing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(q.id)}
            aria-label={`Select question ${q.code || q.id}`}
            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--brand)' }}
          />
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: 'var(--surface-2)',
              color: 'var(--brand-light)',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {q.code || q.id}
          </code>
          <Badge variant="info">{q.exam || q.programmeName || 'IELTS'}</Badge>
          <Badge variant="secondary">{q.section || 'General'}</Badge>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <Clock size={12} />
            {q.estimatedTime || '2 mins'}
          </span>
        </div>

        {/* Right: Status + difficulty badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Badge variant={statusBadgeVariant(q.status)}>{q.status.replace('_', ' ')}</Badge>
          <Badge
            variant={
              q.difficulty === 'HARD' ? 'danger' :
              q.difficulty === 'MEDIUM' ? 'warning' :
              'success'
            }
          >
            {q.difficulty}
          </Badge>
        </div>
      </div>

      {/* ── Question Text ── */}
      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.55,
        }}
      >
        {q.text}
      </div>

      {/* ── Attached Passage ── */}
      {q.passageTitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--surface-1)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.75rem',
          }}
        >
          <BookOpen size={13} style={{ color: 'var(--brand-light)', flexShrink: 0 }} />
          Passage: <strong style={{ color: 'var(--text-primary)' }}>{q.passageTitle}</strong>
        </div>
      )}

      {/* ── Footer: Metadata + Actions ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Skill: <strong style={{ color: 'var(--text-secondary)' }}>{q.skill || q.topic}</strong>
          {' · '}
          Source: <strong style={{ color: 'var(--text-secondary)' }}>{q.officialSource || 'Clasptek Bank'}</strong>
        </div>

        {/* Workflow transition buttons */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" onClick={() => onPreview(q)} leftIcon={<Eye size={13} />}>
            Preview
          </Button>

          {q.status === 'DRAFT' && (
            <Button variant="secondary" size="sm" onClick={() => onStatusChange(q.id, 'UNDER_REVIEW')}>
              Submit for Review
            </Button>
          )}

          {q.status === 'UNDER_REVIEW' && (
            <Button variant="primary" size="sm" onClick={() => onStatusChange(q.id, 'APPROVED')}>
              Approve
            </Button>
          )}

          {q.status === 'APPROVED' && (
            <Button variant="success" size="sm" onClick={() => onStatusChange(q.id, 'PUBLISHED')}>
              Publish
            </Button>
          )}

          {q.status !== 'ARCHIVED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(q.id, 'ARCHIVED')}
              style={{ color: 'var(--error)' }}
            >
              Archive
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(q.id)}
            aria-label={`Delete question ${q.code || q.id}`}
          >
            <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
          </Button>
        </div>
      </div>
    </div>
  );
};
