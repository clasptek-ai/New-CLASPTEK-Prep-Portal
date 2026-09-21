'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  FileText,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Award,
} from 'lucide-react';
import {
  AdminQuestion,
  QuestionWorkflowStatus,
} from '../../../../services/admin/questions.service';
import { Badge } from '../../../../shared/ui/badge/Badge';
import { Button } from '../../../../shared/ui/button/Button';

export interface UniversalQuestionPreviewModalProps {
  question: AdminQuestion | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: QuestionWorkflowStatus) => void;
}

function getStatusBadgeVariant(st: QuestionWorkflowStatus) {
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

export const UniversalQuestionPreviewModal: React.FC<UniversalQuestionPreviewModalProps> = ({
  question: q,
  onClose,
  onStatusChange,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFullPassage, setShowFullPassage] = useState(true);

  if (!q) return null;

  const contentKind = q.contentKind || 'QUESTION';
  const assessment = q.assessment || (q.exam?.includes('IELTS') ? 'IELTS Mock' : 'Pre-Assessment');
  const isAuthoritative = q.assessmentSource === 'authoritative';
  const isWritingTask = contentKind === 'WRITING_TASK';
  const isSpeakingPrompt = contentKind === 'SPEAKING_PROMPT';
  const isObjectiveQuestion = contentKind === 'QUESTION';

  const answerDisplay =
    q.answer?.display ||
    q.correctAnswer ||
    (q.acceptedAnswers && q.acceptedAnswers.length > 0 ? q.acceptedAnswers.join(' / ') : '');

  const isMissingAnswer = isObjectiveQuestion && (!answerDisplay || q.answer?.isMissing);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl, 16px)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-floating)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Bar ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--brand-light)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {q.code || q.id}
              </code>

              {/* Content Kind */}
              {isWritingTask ? (
                <Badge
                  variant="warning"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <FileText size={12} /> Writing Task
                </Badge>
              ) : isSpeakingPrompt ? (
                <Badge
                  variant="info"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Mic size={12} /> Speaking Prompt
                </Badge>
              ) : (
                <Badge variant="secondary">Objective Question</Badge>
              )}

              {/* Assessment Provenance Badge */}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
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
              >
                {assessment} ({isAuthoritative ? 'authoritative' : 'inferred'})
              </span>

              <Badge variant="secondary">{q.section || 'General'}</Badge>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Skill:{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>{q.skill || q.topic}</strong>
              {q.subSkill && ` (${q.subSkill})`}
              {' · '}
              Type: <strong style={{ color: 'var(--text-secondary)' }}>{q.type}</strong>
              {' · '}
              Source:{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>
                {q.officialSource || 'Clasptek Bank'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={getStatusBadgeVariant(q.status)}>{q.status.replace('_', ' ')}</Badge>
            <Badge
              variant={
                q.difficulty === 'HARD'
                  ? 'danger'
                  : q.difficulty === 'MEDIUM'
                    ? 'warning'
                    : 'success'
              }
            >
              {q.difficulty}
            </Badge>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.35rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Reading Passage Component ── */}
        {(q.passageTitle || q.passageCode || q.passageContent) && (
          <div
            style={{
              backgroundColor: 'var(--surface-1)',
              border: `1px solid ${
                q.passageStatus === 'UNRESOLVED_DEPENDENCY' ? 'var(--warning)' : 'var(--border)'
              }`,
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowFullPassage(!showFullPassage)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} style={{ color: 'var(--brand-light)' }} />
                <span
                  style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {q.passageTitle || q.passageCode || 'Reading Passage'}
                </span>
                {q.passageCode && (
                  <code
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--surface-2)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    {q.passageCode}
                  </code>
                )}
                {q.passageWordCount && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({q.passageWordCount} words)
                  </span>
                )}
                {q.passageStatus === 'UNRESOLVED_DEPENDENCY' && (
                  <span
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--warning)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ UNRESOLVED PASSAGE DEPENDENCY
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                }}
              >
                <span>{showFullPassage ? 'Collapse' : 'Expand Text'}</span>
                {showFullPassage ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {showFullPassage && (
              <div
                style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.75',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'serif',
                }}
              >
                {q.passageContent ||
                  q.passageText ||
                  'Passage content linked via repository. Verify that passage records are published.'}
              </div>
            )}
          </div>
        )}

        {/* ── Listening Audio & Transcript Component ── */}
        {(q.audioUrl || q.trackTitle || q.sectionNumber) && (
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Volume2 size={18} style={{ color: 'var(--brand-light)' }} />
                <span
                  style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  Listening Section {q.sectionNumber || '1'}
                </span>
                {q.questionRange && <Badge variant="info">{q.questionRange}</Badge>}
                {q.trackTitle && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({q.trackTitle})
                  </span>
                )}
              </div>

              {q.transcript && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  rightIcon={showTranscript ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                >
                  {showTranscript ? 'Hide Transcript' : 'View Transcript'}
                </Button>
              )}
            </div>

            {q.audioUrl ? (
              <audio controls src={q.audioUrl} style={{ width: '100%', height: '36px' }} />
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Canonical audio track registered. (Local audio asset placeholder)
              </div>
            )}

            {showTranscript && q.transcript && (
              <div
                style={{
                  fontSize: '0.825rem',
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <strong>Audio Transcript:</strong>
                <p style={{ marginTop: '0.4rem', margin: 0 }}>{q.transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Writing Stimulus Image / Diagram Component ── */}
        {q.imageUrl && (
          <div
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={16} style={{ color: '#a855f7' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Stimulus Diagram / Process Illustration
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                border: '1px solid var(--border)',
              }}
            >
              <img
                src={q.imageUrl}
                alt="Stimulus visual process diagram"
                style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* ── Question Prompt / Task Stem ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            {isWritingTask
              ? 'Writing Task Instructions & Prompt'
              : isSpeakingPrompt
                ? 'Speaking Prompt & Cue Card'
                : 'Question Prompt'}
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              backgroundColor: 'var(--surface-1)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            {q.text}
          </div>
        </div>

        {/* ── MCQ Options View ── */}
        {q.options && q.options.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Answer Options:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {q.options.map((opt, i) => {
                const optLetter = String.fromCharCode(65 + i); // 'A', 'B', 'C', 'D'
                const isCorrect =
                  opt === q.correctAnswer ||
                  q.answer?.primary === opt ||
                  q.answer?.optionCode === optLetter ||
                  (q.correctAnswer &&
                    (q.correctAnswer.startsWith(optLetter) || q.correctAnswer === optLetter));

                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-1)',
                      border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`,
                      color: isCorrect ? 'var(--success)' : 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      fontWeight: isCorrect ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isCorrect ? 'var(--success)' : 'var(--surface-2)',
                        color: isCorrect ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {optLetter}
                    </span>
                    <span>{opt}</span>
                    {isCorrect && (
                      <span style={{ marginLeft: 'auto', fontWeight: 800 }}>✓ Correct Key</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Authoritative Answer Key (For All Objective Items) ── */}
        {isObjectiveQuestion && (
          <div
            style={{
              backgroundColor: isMissingAnswer
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${isMissingAnswer ? 'var(--error)' : 'rgba(16, 185, 129, 0.3)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isMissingAnswer ? (
                <AlertTriangle size={18} style={{ color: 'var(--error)' }} />
              ) : (
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: isMissingAnswer ? 'var(--error)' : 'var(--success)',
                }}
              >
                {isMissingAnswer
                  ? 'Missing Authoritative Answer'
                  : 'Authoritative Primary Answer Key'}
              </span>
            </div>

            {!isMissingAnswer && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  marginTop: '0.25rem',
                }}
              >
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                  }}
                >
                  {answerDisplay}
                </div>

                {q.answer?.acceptedAnswers && q.answer.acceptedAnswers.length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Accepted Alternate Variations:</strong>{' '}
                    {q.answer.acceptedAnswers.map((alt, idx) => (
                      <code
                        key={idx}
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          color: 'var(--text-secondary)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          marginRight: '0.35rem',
                        }}
                      >
                        {alt}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Writing Rubrics Table Component ── */}
        {isWritingTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={16} style={{ color: 'var(--brand-light)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Official IELTS Writing Assessment Band Descriptors
              </span>
            </div>

            {q.rubrics && q.rubrics.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.65rem',
                }}
              >
                {q.rubrics.map((r, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <strong style={{ fontSize: '0.8rem', color: 'var(--brand-light)' }}>
                        {r.criterion}
                      </strong>
                      <Badge variant="info">Band {r.bandScore}</Badge>
                    </div>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {r.descriptor}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--surface-1)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                Authoritative 4-criteria band descriptors active (Task Achievement, Coherence &
                Cohesion, Lexical Resource, Grammatical Range & Accuracy).
              </div>
            )}

            {/* Model / Reference Response */}
            <div
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Reference Model Response:
                </span>
                {q.referenceResponse && <Badge variant="success">Stored in Repository</Badge>}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {q.referenceResponse ||
                  'No sample model answer currently stored in database. Candidate responses are evaluated against authoritative band descriptors.'}
              </div>
            </div>
          </div>
        )}

        {/* ── Speaking Evaluation Criteria Component ── */}
        {isSpeakingPrompt && (
          <div
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={16} style={{ color: 'var(--brand-light)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Speaking Assessment Timing & Criteria
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <Clock size={13} />
                <span>
                  Prep: <strong>{q.timing?.preparationSeconds ?? 60}s</strong> · Speaking:{' '}
                  <strong>{q.timing?.speakingSeconds ?? 120}s</strong>
                </span>
              </div>
            </div>

            {q.criteria && q.criteria.length > 0 && (
              <div style={{ marginTop: '0.35rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Evaluation Dimensions:
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.35rem',
                    flexWrap: 'wrap',
                    marginTop: '0.25rem',
                  }}
                >
                  {q.criteria.map((crit, idx) => (
                    <Badge key={idx} variant="info">
                      {typeof crit === 'string' ? crit : crit.name || crit.criterion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Explanation / Pedagogical Rationale ── */}
        {q.explanation && (
          <div
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Explanation & Pedagogical Rationale:
            </strong>
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {q.explanation}
            </p>
          </div>
        )}

        {/* ── Actions Footer ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {onStatusChange && q.status === 'DRAFT' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onStatusChange(q.id, 'UNDER_REVIEW');
                  onClose();
                }}
              >
                Submit for Review
              </Button>
            )}
            {onStatusChange && q.status === 'UNDER_REVIEW' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onStatusChange(q.id, 'APPROVED');
                  onClose();
                }}
              >
                Approve
              </Button>
            )}
            {onStatusChange && q.status === 'APPROVED' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  onStatusChange(q.id, 'PUBLISHED');
                  onClose();
                }}
              >
                Publish
              </Button>
            )}
          </div>

          <Button variant="primary" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
export default UniversalQuestionPreviewModal;
