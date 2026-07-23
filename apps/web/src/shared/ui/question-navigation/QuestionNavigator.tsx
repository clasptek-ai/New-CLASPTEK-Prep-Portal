import React, { forwardRef } from 'react';
import { QuestionNavigatorProps, QuestionStatus } from './question-navigation.types';

export const QuestionNavigator = forwardRef<HTMLDivElement, QuestionNavigatorProps>(
  function QuestionNavigator(
    { questions, currentQuestionId, onSelectQuestion, style, ...props },
    ref
  ) {
    const getStatusStyles = (status: QuestionStatus, isCurrent: boolean): React.CSSProperties => {
      if (isCurrent) {
        return { backgroundColor: '#3b82f6', color: '#ffffff', border: '2px solid #ffffff' };
      }
      switch (status) {
        case 'flagged':
          return { backgroundColor: '#f59e0b', color: '#ffffff' };
        case 'answered':
          return { backgroundColor: '#10b981', color: '#ffffff' };
        case 'visited':
          return { backgroundColor: '#334155', color: '#f8fafc' };
        case 'disabled':
          return { backgroundColor: '#1e293b', color: '#64748b', cursor: 'not-allowed' };
        default:
          return { backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155' };
      }
    };

    return (
      <div
        ref={ref}
        aria-label="Question Navigation Palette"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
          gap: '0.5rem',
          padding: '1.0rem',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-default, #1e293b)',
          ...style,
        }}
        {...props}
      >
        {questions.map((q) => {
          const isCurrent = q.id === currentQuestionId;
          const isDisabled = q.status === 'disabled';

          return (
            <button
              key={q.id}
              disabled={isDisabled}
              onClick={() => onSelectQuestion(q.id)}
              aria-label={`Question ${q.number}, ${q.status}`}
              style={{
                height: '36px',
                borderRadius: 'var(--radius-md, 8px)',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                ...getStatusStyles(q.status, isCurrent),
              }}
            >
              {q.number}
            </button>
          );
        })}
      </div>
    );
  }
);

export const QuestionPalette = QuestionNavigator;
export const SectionNavigator = QuestionNavigator;
