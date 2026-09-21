import React from 'react';
import {
  Clock,
  BookOpen,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Image as ImageIcon,
  FileText,
  Mic,
} from 'lucide-react';
import {
  AdminQuestion,
  QuestionWorkflowStatus,
} from '../../../../services/admin/questions.service';
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
    case 'PUBLISHED':
      return 'success' as const;
    case 'APPROVED':
      return 'info' as const;
    case 'UNDER_REVIEW':
      return 'warning' as const;
    case 'DRAFT':
      return 'secondary' as const;
    case 'ARCHIVED':
      return 'danger' as const;
    default:
      return 'secondary' as const;
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
  const contentKind = q.contentKind || 'QUESTION';
  const assessment = q.assessment || (q.exam?.includes('IELTS') ? 'IELTS Mock' : 'Pre-Assessment');
  const isAuthoritative = q.assessmentSource === 'authoritative';

  // Answer display resolution
  const answerDisplay =
    q.answer?.display ||
    q.correctAnswer ||
    (q.acceptedAnswers && q.acceptedAnswers.length > 0 ? q.acceptedAnswers.join(' / ') : '');

  const isObjectiveQuestion = contentKind === 'QUESTION';
  const isMissingAnswer = isObjectiveQuestion && (!answerDisplay || q.answer?.isMissing);

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
        {/* Left: Checkbox, code, contentKind, assessment, section, timing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(q.id)}
            aria-label={`Select item ${q.code || q.id}`}
            style={{
              width: '15px',
              height: '15px',
              cursor: 'pointer',
              accentColor: 'var(--brand)',
            }}
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

          {/* Content Kind Badge */}
          {contentKind === 'WRITING_TASK' ? (
            <Badge
              variant="warning"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <FileText size={11} /> Writing Task
            </Badge>
          ) : contentKind === 'SPEAKING_PROMPT' ? (
            <Badge
              variant="info"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <Mic size={11} /> Speaking Prompt
            </Badge>
          ) : (
            <Badge variant="secondary">Question</Badge>
          )}

          {/* Assessment Provenance Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.725rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor:
                assessment === 'Pre-Assessment'
                  ? 'rgba(59, 130, 246, 0.12)'
                  : assessment === 'IELTS Mock'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(107, 114, 128, 0.12)',
              color:
                assessment === 'Pre-Assessment'
                  ? 'var(--brand-light)'
                  : assessment === 'IELTS Mock'
                    ? 'var(--success)'
                    : 'var(--text-muted)',
              border: '1px solid currentColor',
            }}
            title={
              isAuthoritative
                ? 'Authoritative Database Assignment'
                : 'Inferred Section/Code Mapping'
            }
          >
            {assessment}
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
              ({isAuthoritative ? 'auth' : 'inf'})
            </span>
          </span>

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
              q.difficulty === 'HARD' ? 'danger' : q.difficulty === 'MEDIUM' ? 'warning' : 'success'
            }
          >
            {q.difficulty}
          </Badge>
        </div>
      </div>

      {/* ── Question Text / Task Prompt ── */}
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

      {/* ── Attached Passage / Media / Rubric Indicators ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Reading Passage Indicator */}
        {(q.passageTitle || q.passageCode) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.785rem',
              color:
                q.passageStatus === 'UNRESOLVED_DEPENDENCY'
                  ? 'var(--warning)'
                  : 'var(--text-secondary)',
              backgroundColor: 'var(--surface-1)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.6rem',
              border: '1px solid var(--border)',
            }}
          >
            <BookOpen size={13} style={{ color: 'var(--brand-light)', flexShrink: 0 }} />
            <span>Passage:</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {q.passageTitle || q.passageCode}
            </strong>
            {q.passageStatus === 'UNRESOLVED_DEPENDENCY' && (
              <span
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--warning)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                ⚠️ UNRESOLVED
              </span>
            )}
            {q.passageWordCount && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                ({q.passageWordCount}w)
              </span>
            )}
          </div>
        )}

        {/* Audio Track Indicator */}
        {(q.audioUrl || q.trackTitle) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.785rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.6rem',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <Volume2 size={13} style={{ color: 'var(--brand-light)' }} />
            <span>
              {q.sectionNumber ? `Section ${q.sectionNumber}` : 'Audio Track'}:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {q.questionRange || q.trackTitle || 'Audio Attached'}
              </strong>
            </span>
          </div>
        )}

        {/* Stimulus Image Indicator */}
        {q.imageUrl && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.785rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(168, 85, 247, 0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.6rem',
              border: '1px solid rgba(168, 85, 247, 0.2)',
            }}
          >
            <ImageIcon size={13} style={{ color: '#a855f7' }} />
            <span>Stimulus Diagram Attached</span>
          </div>
        )}

        {/* Writing Rubrics Attached */}
        {q.rubrics && q.rubrics.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.785rem',
              color: 'var(--success)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.6rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <CheckCircle2 size={13} />
            <span>{q.rubrics.length} Band Rubric Descriptors Attached</span>
          </div>
        )}
      </div>

      {/* ── Authoritative Answer Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: isMissingAnswer ? 'rgba(239, 68, 68, 0.08)' : 'var(--surface-1)',
          border: `1px solid ${isMissingAnswer ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.75rem',
          fontSize: '0.8125rem',
        }}
      >
        {isMissingAnswer ? (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--error)' }}
          >
            <AlertTriangle size={14} />
            <strong style={{ fontWeight: 700 }}>⚠️ Missing Authoritative Answer Key</strong>
          </div>
        ) : contentKind === 'WRITING_TASK' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            <FileText size={14} style={{ color: 'var(--brand-light)' }} />
            <span>Model Answer:</span>
            <strong
              style={{ color: q.referenceResponse ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {q.referenceResponse
                ? 'Authoritative Sample Stored'
                : 'Evaluated via Band Descriptors'}
            </strong>
          </div>
        ) : contentKind === 'SPEAKING_PROMPT' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Mic size={14} style={{ color: 'var(--brand-light)' }} />
            <span>Assessment:</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {q.criteria && q.criteria.length > 0
                ? `${q.criteria.length} Evaluation Criteria Active`
                : 'Fluency, Lexical, Grammar, Pronunciation'}
            </strong>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              Authoritative Answer:
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'var(--success)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '0.1rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {answerDisplay}
            </span>
            {q.answer?.acceptedAnswers && q.answer.acceptedAnswers.length > 1 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ({q.answer.acceptedAnswers.length} accepted variations)
              </span>
            )}
          </div>
        )}
      </div>

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
          Type: <strong style={{ color: 'var(--text-secondary)' }}>{q.type}</strong>
          {' · '}
          Source:{' '}
          <strong style={{ color: 'var(--text-secondary)' }}>
            {q.officialSource || 'Clasptek Bank'}
          </strong>
        </div>

        {/* Workflow transition buttons */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(q)}
            leftIcon={<Eye size={13} />}
          >
            Inspect Item
          </Button>

          {q.status === 'DRAFT' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(q.id, 'UNDER_REVIEW')}
            >
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
export default QuestionRow;
