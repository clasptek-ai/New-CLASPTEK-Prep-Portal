'use client';

import React, { useState } from 'react';
import { Badge } from '../../../components/ui/ui-components';
import { Pen, Image as ImageIcon, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface WritingQuestion {
  id: string;
  code: string;
  text: string;
  type: string;
  imageUrl?: string;
  group?: {
    code: string;
    title: string;
    instructions: string;
  };
}

interface Props {
  questions: WritingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: () => void;
  timeRemaining: number;
}

export function WritingSectionEngine({
  questions,
  answers,
  onAnswer,
  onComplete,
  timeRemaining: _timeRemaining,
}: Props) {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);

  const currentTask = questions[activeTaskIndex];

  // Determine if Task 1 or Task 2 based on code or index
  const isTask1 =
    activeTaskIndex === 0 ||
    currentTask?.code?.includes('WRITE-001') ||
    currentTask?.type === 'WRITING_TASK_1';
  const minWords = isTask1 ? 150 : 250;
  const taskLabel = isTask1 ? 'Task 1' : 'Task 2';
  const taskDescription = isTask1
    ? 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.'
    : 'Write an essay in response to the given topic. Give reasons for your answer and include any relevant examples from your own knowledge or experience.';

  const currentText = answers[currentTask?.id] || '';
  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const isUnderMinimum = wordCount < minWords && wordCount > 0;
  const isAdequate = wordCount >= minWords;

  const [mobileTab, setMobileTab] = useState<'PROMPT' | 'EDITOR'>('EDITOR');

  return (
    <div
      className="writing-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── MOBILE VIEW TOGGLE ──────────────────────────── */}
      <div
        className="writing-mobile-toggle"
        style={{
          display: 'none',
          padding: '0.45rem 0.75rem',
          backgroundColor: '#1a1400',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('PROMPT')}
          aria-label="View task prompt and stimulus"
          style={{
            flex: 1,
            minHeight: '44px',
            borderRadius: '8px',
            border:
              mobileTab === 'PROMPT' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: mobileTab === 'PROMPT' ? 'rgba(245, 158, 11, 0.25)' : '#0f172a',
            color: mobileTab === 'PROMPT' ? '#fbbf24' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            touchAction: 'manipulation',
          }}
        >
          <span>📋 {taskLabel} Prompt</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('EDITOR')}
          aria-label="View essay response editor"
          style={{
            flex: 1,
            minHeight: '44px',
            borderRadius: '8px',
            border:
              mobileTab === 'EDITOR' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: mobileTab === 'EDITOR' ? 'rgba(245, 158, 11, 0.25)' : '#0f172a',
            color: mobileTab === 'EDITOR' ? '#fbbf24' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            touchAction: 'manipulation',
          }}
        >
          <span>✍️ Response ({wordCount} words)</span>
        </button>
      </div>

      {/* ── TASK TABS ──────────────────────────────────── */}
      <div
        className="writing-task-tabs-bar"
        style={{
          padding: '0.65rem 1.5rem',
          backgroundColor: '#1a1400',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <Pen size={16} color="#f59e0b" />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
          IELTS Writing
        </span>
        <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
          {questions.map((q, idx) => {
            const isActive = idx === activeTaskIndex;
            const isAnswered = !!(answers[q.id] && answers[q.id].trim().length > 0);
            const taskNum = idx === 0 ? 'Task 1' : 'Task 2';

            return (
              <button
                key={q.id}
                onClick={() => setActiveTaskIndex(idx)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: isActive ? '2px solid #f59e0b' : '2px solid transparent',
                  backgroundColor: isActive
                    ? 'rgba(245, 158, 11, 0.15)'
                    : isAnswered
                      ? 'rgba(52, 211, 153, 0.1)'
                      : '#0f172a',
                  color: isActive ? '#fbbf24' : isAnswered ? '#34d399' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  minHeight: '38px',
                  transition: 'all 0.15s',
                }}
              >
                {taskNum}
                {isAnswered && ' ✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN WRITING AREA ────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left: Task prompt + stimulus */}
        <div
          className="writing-pane-prompt"
          style={{
            backgroundColor: '#0f172a',
            borderRight: '3px solid rgba(245, 158, 11, 0.2)',
            overflowY: 'auto',
            padding: '1.5rem 1.75rem',
          }}
        >
          {/* Task header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.95rem',
                color: '#fff',
              }}
            >
              {activeTaskIndex + 1}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Writing {taskLabel}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Minimum {minWords} words</div>
            </div>
          </div>

          {/* Task instructions */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              color: '#fcd34d',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}
          >
            {taskDescription}
          </div>

          {/* Question prompt */}
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#e2e8f0',
              lineHeight: 1.8,
              marginBottom: '1.5rem',
            }}
          >
            {currentTask?.text}
          </div>

          {/* Visual stimulus (Task 1 process diagram/chart) */}
          {currentTask?.imageUrl && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                <ImageIcon size={14} color="#f59e0b" />
                Visual Stimulus — {taskLabel}
              </div>
              <img
                src={currentTask.imageUrl}
                alt={`Writing ${taskLabel} stimulus diagram`}
                style={{
                  maxHeight: '500px',
                  width: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </div>
          )}

          {/* Group instructions if available */}
          {currentTask?.group?.instructions && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                marginTop: '1rem',
                fontSize: '0.82rem',
                color: '#d4a300',
                lineHeight: 1.6,
              }}
            >
              {currentTask.group.instructions}
            </div>
          )}
        </div>

        {/* Right: Essay editor */}
        <div
          className="writing-pane-editor"
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#111827',
          }}
        >
          {/* Editor toolbar */}
          <div
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#0f172a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              Your Response — {taskLabel}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isUnderMinimum && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#f59e0b',
                    fontSize: '0.75rem',
                  }}
                >
                  <AlertTriangle size={13} />
                  Below minimum
                </div>
              )}
              <Badge variant={isAdequate ? 'success' : wordCount > 0 ? 'warning' : 'neutral'}>
                {wordCount} / {minWords} words
              </Badge>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={currentText}
            onChange={(e) => onAnswer(currentTask.id, e.target.value)}
            placeholder={`Begin your ${taskLabel} response here...\n\nWrite at least ${minWords} words.`}
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: '#1a2033',
              border: 'none',
              padding: '1.5rem 2rem',
              color: '#f8fafc',
              fontSize: '1rem',
              lineHeight: 1.85,
              fontFamily: 'Georgia, "Times New Roman", serif',
              resize: 'none',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />

          {/* Word count bar */}
          <div
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#0f172a',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#1e293b',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (wordCount / minWords) * 100)}%`,
                    height: '100%',
                    backgroundColor: isAdequate
                      ? '#34d399'
                      : isUnderMinimum
                        ? '#f59e0b'
                        : '#3b82f6',
                    transition: 'width 0.3s, background-color 0.3s',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeTaskIndex > 0 && (
                <button
                  onClick={() => setActiveTaskIndex((p) => p - 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <ChevronLeft size={14} /> Task 1
                </button>
              )}

              {activeTaskIndex < questions.length - 1 ? (
                <button
                  onClick={() => setActiveTaskIndex((p) => p + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Task 2 <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.35rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Complete Writing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 839px) {
          .writing-mobile-toggle {
            display: flex !important;
          }
          .writing-task-tabs-bar {
            padding: 0.4rem 0.85rem !important;
          }
          .writing-pane-prompt {
            width: 100% !important;
            display: ${mobileTab === 'PROMPT' ? 'flex !important' : 'none !important'};
            border-right: none !important;
          }
          .writing-pane-editor {
            width: 100% !important;
            display: ${mobileTab === 'EDITOR' ? 'flex !important' : 'none !important'};
          }
        }
        @media (min-width: 840px) {
          .writing-mobile-toggle {
            display: none !important;
          }
          .writing-pane-prompt {
            width: 42% !important;
            display: flex !important;
          }
          .writing-pane-editor {
            width: 58% !important;
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
