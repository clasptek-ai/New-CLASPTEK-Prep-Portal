'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Badge } from '../../../components/ui/ui-components';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReadingQuestion {
  id: string;
  code: string;
  text: string;
  type: string;
  options?: string[];
  optionCodes?: string[];
  passage?: {
    id: string;
    code: string;
    title: string;
    content: string;
    wordCount: number;
  };
  group?: {
    code: string;
    title: string;
    instructions: string;
    questionType?: string;
    sharedData?: any;
  };
}

interface Props {
  questions: ReadingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: () => void;
  timeRemaining: number;
}

export function ReadingSectionEngine({
  questions,
  answers,
  onAnswer,
  onComplete,
  timeRemaining: _timeRemaining,
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [splitRatio] = useState(50); // percentage for passage pane
  const passagePaneRef = useRef<HTMLDivElement>(null);

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  // Group questions by passage
  const passageGroups = useMemo(() => {
    const groups: {
      passageCode: string;
      passageTitle: string;
      content: string;
      wordCount: number;
      questionIndices: number[];
    }[] = [];
    const pMap = new Map<string, number>();

    questions.forEach((q, idx) => {
      const key = q.passage?.code || 'no-passage';
      if (!pMap.has(key)) {
        pMap.set(key, groups.length);
        groups.push({
          passageCode: key,
          passageTitle: q.passage?.title || 'Passage',
          content: q.passage?.content || '',
          wordCount: q.passage?.wordCount || 0,
          questionIndices: [],
        });
      }
      groups[pMap.get(key)!].questionIndices.push(idx);
    });
    return groups;
  }, [questions]);

  // Find active passage group
  const activePassageGroup = passageGroups.find((g) =>
    g.questionIndices.includes(currentQuestionIndex)
  );

  const renderInput = (q: ReadingQuestion) => {
    const hasOptions = q.options && q.options.length > 0;

    if (hasOptions) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {q.options!.map((opt, i) => {
            const code = q.optionCodes?.[i] || String.fromCharCode(65 + i);
            const isSelected = answers[q.id] === code;
            return (
              <div
                key={i}
                onClick={() => onAnswer(q.id, code)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
                  border: `1px solid ${isSelected ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: isSelected ? '#60a5fa' : '#f8fafc',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#475569'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: isSelected ? '#3b82f6' : '#64748b',
                  }}
                >
                  {code}
                </div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      );
    }

    // Short answer / fill-in
    return (
      <input
        type="text"
        value={answers[q.id] || ''}
        onChange={(e) => onAnswer(q.id, e.target.value)}
        placeholder="Type your answer..."
        style={{
          width: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '0.65rem 1rem',
          color: '#f8fafc',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    );
  };

  const [mobilePane, setMobilePane] = useState<'PASSAGE' | 'QUESTIONS'>('QUESTIONS');

  return (
    <div
      className="reading-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── MOBILE VIEW TOGGLE (Passage vs Questions) ── */}
      <div
        className="reading-mobile-toggle"
        style={{
          display: 'none',
          padding: '0.45rem 0.75rem',
          backgroundColor: '#0c1529',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setMobilePane('PASSAGE')}
          aria-label="View reading passage"
          style={{
            flex: 1,
            minHeight: '44px',
            borderRadius: '8px',
            border:
              mobilePane === 'PASSAGE' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: mobilePane === 'PASSAGE' ? 'rgba(59, 130, 246, 0.25)' : '#1e293b',
            color: mobilePane === 'PASSAGE' ? '#60a5fa' : '#94a3b8',
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
          <BookOpen size={16} />
          <span>Passage {passageGroups.findIndex((g) => g === activePassageGroup) + 1 || 1}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobilePane('QUESTIONS')}
          aria-label="View questions"
          style={{
            flex: 1,
            minHeight: '44px',
            borderRadius: '8px',
            border:
              mobilePane === 'QUESTIONS'
                ? '2px solid #3b82f6'
                : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: mobilePane === 'QUESTIONS' ? 'rgba(59, 130, 246, 0.25)' : '#1e293b',
            color: mobilePane === 'QUESTIONS' ? '#60a5fa' : '#94a3b8',
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
          <span>
            Questions (Q {currentQuestionIndex + 1}/{questions.length})
          </span>
        </button>
      </div>

      {/* ── PANES WRAPPER ───────────────────────────── */}
      <div
        className="reading-panes-wrapper"
        style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {/* ── LEFT PANE: READING PASSAGE ──────────────────── */}
        <div
          ref={passagePaneRef}
          className="reading-pane-passage"
          style={{
            backgroundColor: '#0f172a',
            borderRight: '3px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Passage Header */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#0c1529',
              borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="#3b82f6" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
                {activePassageGroup?.passageTitle || 'Reading Passage'}
              </span>
            </div>
            {activePassageGroup?.wordCount ? (
              <Badge variant="neutral">{activePassageGroup.wordCount} words</Badge>
            ) : null}
          </div>

          {/* Passage Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem 2rem',
              lineHeight: 1.85,
              fontSize: '0.95rem',
              color: '#e2e8f0',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {activePassageGroup?.content ? (
              activePassageGroup.content.split('\n').map((para, idx) => (
                <p key={idx} style={{ marginBottom: '1rem' }}>
                  {para}
                </p>
              ))
            ) : (
              <div
                style={{
                  color: '#475569',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  paddingTop: '3rem',
                }}
              >
                No passage available for this question group.
              </div>
            )}
          </div>

          {/* Passage navigation - which passage you're on */}
          <div
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#0c1529',
              borderTop: '1px solid rgba(59, 130, 246, 0.15)',
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
            }}
          >
            {passageGroups.map((g, idx) => {
              const isActive = g === activePassageGroup;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(g.questionIndices[0])}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: `1px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: isActive ? '#60a5fa' : '#64748b',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Passage {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANE: QUESTIONS ──────────────────────── */}
        <div
          className="reading-pane-questions"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Question navigator bar */}
          <div
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: '#111827',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.3rem',
              justifyContent: 'center',
            }}
          >
            {questions.map((q, idx) => {
              const isActive = idx === currentQuestionIndex;
              const isAnswered = !!answers[q.id];
              const inSamePassage = activePassageGroup?.questionIndices.includes(idx);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                    backgroundColor: isActive
                      ? 'rgba(59, 130, 246, 0.2)'
                      : isAnswered
                        ? 'rgba(52, 211, 153, 0.12)'
                        : inSamePassage
                          ? 'rgba(59, 130, 246, 0.05)'
                          : '#0f172a',
                    color: isActive ? '#60a5fa' : isAnswered ? '#34d399' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
            {currentQ && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Group instructions */}
                {currentQ.group?.instructions && (
                  <div
                    style={{
                      padding: '0.75rem 0.85rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.06)',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                      color: '#93c5fd',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: '#60a5fa', fontSize: '0.85rem' }}>
                      {currentQ.group.title}
                    </strong>
                    <div style={{ marginTop: '0.25rem' }}>{currentQ.group.instructions}</div>
                  </div>
                )}

                {/* Question number + code */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.65rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      color: '#3b82f6',
                      fontFamily: 'monospace',
                    }}
                  >
                    {currentQuestionIndex + 1}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace' }}>
                    {currentQ.code}
                  </span>
                  <Badge variant={answers[currentQ.id] ? 'success' : 'neutral'}>
                    {answers[currentQ.id] ? 'Answered' : 'Unanswered'}
                  </Badge>
                </div>

                {/* Question text */}
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                    lineHeight: 1.7,
                    marginBottom: '1.25rem',
                  }}
                >
                  {currentQ.text}
                </div>

                {/* Answer input */}
                {renderInput(currentQ)}

                {/* Navigation */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: 'transparent',
                      color: currentQuestionIndex === 0 ? '#475569' : '#94a3b8',
                      fontSize: '0.85rem',
                      cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex((p) => Math.min(questions.length - 1, p + 1))
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={onComplete}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Complete Reading ({answeredCount}/{questions.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Styles */}

      <style>{`
        @media (max-width: 839px) {
          .reading-mobile-toggle {
            display: flex !important;
          }
          .reading-pane-passage {
            width: 100% !important;
            display: ${mobilePane === 'PASSAGE' ? 'flex !important' : 'none !important'};
            border-right: none !important;
          }
          .reading-pane-questions {
            width: 100% !important;
            display: ${mobilePane === 'QUESTIONS' ? 'flex !important' : 'none !important'};
          }
        }
        @media (min-width: 840px) {
          .reading-mobile-toggle {
            display: none !important;
          }
          .reading-pane-passage {
            width: ${splitRatio}% !important;
            display: flex !important;
          }
          .reading-pane-questions {
            width: ${100 - splitRatio}% !important;
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
