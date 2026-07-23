import React, { useState } from 'react';

export interface QuestionSummaryItem {
  id: string;
  number: number;
  isAnswered: boolean;
  isFlagged: boolean;
  selectedAnswer?: string;
}

export interface ExamReviewScreenProps {
  questions: QuestionSummaryItem[];
  onJumpToQuestion: (number: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ExamReviewScreen: React.FC<ExamReviewScreenProps> = ({
  questions,
  onJumpToQuestion,
  onSubmit,
  onCancel,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const total = questions.length;
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const unansweredCount = total - answeredCount;
  const flaggedCount = questions.filter((q) => q.isFlagged).length;

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: '12px',
      }}
    >
      <div
        style={{ marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          Examination Summary & Final Review
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Review your answered, flagged, and unanswered questions before submitting your exam
          attempt.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Answered</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {answeredCount} / {total}
          </div>
        </div>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Flagged for Review</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {flaggedCount}
          </div>
        </div>
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unanswered</div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: unansweredCount > 0 ? '#ef4444' : '#10b981',
            }}
          >
            {unansweredCount}
          </div>
        </div>
      </div>

      {unansweredCount > 0 && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          Warning: You have <strong>{unansweredCount} unanswered questions</strong>. Unanswered
          questions will receive zero points.
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Question Palette
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {questions.map((q) => {
            let bgColor = '#1e293b';
            let borderColor = '#334155';
            if (q.isFlagged) {
              borderColor = '#f59e0b';
            } else if (q.isAnswered) {
              bgColor = '#10b98120';
              borderColor = '#10b981';
            } else {
              bgColor = '#ef444420';
              borderColor = '#ef4444';
            }

            return (
              <button
                key={q.id}
                onClick={() => onJumpToQuestion(q.number)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {q.number}
                {q.isFlagged && (
                  <span style={{ position: 'absolute', top: 2, right: 2, fontSize: '8px' }}>
                    🚩
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#334155',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Return to Exam
        </button>
        <button
          onClick={() => setShowConfirmModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1e5eff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Confirm Final Submission
        </button>
      </div>

      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>
              Are you sure you want to submit?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '1rem 0 1.5rem' }}>
              Once submitted, your responses are finalized and cannot be modified.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                }}
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
