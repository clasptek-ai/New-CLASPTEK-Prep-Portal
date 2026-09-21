'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../../components/ui/ui-components';
import {
  ReconstructedAttemptDetail,
  ReconstructedQuestion,
} from '../../../../services/admin/assessment-reviews.service';
import {
  ArrowLeft,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Volume2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';

interface CandidateAttemptAuditViewProps {
  detail: ReconstructedAttemptDetail;
  onBack: () => void;
}

export function CandidateAttemptAuditView({ detail, onBack }: CandidateAttemptAuditViewProps) {
  // Available tabs
  const availableTabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
    count?: number;
  }> = [{ id: 'overview', label: 'Overview', icon: FileText }];

  if (detail.sections.listening) {
    availableTabs.push({
      id: 'listening',
      label: 'Listening',
      icon: Headphones,
      count: detail.sections.listening.totalQuestions,
    });
  }

  if (detail.sections.reading) {
    availableTabs.push({
      id: 'reading',
      label: 'Reading',
      icon: BookOpen,
      count: detail.sections.reading.totalQuestions,
    });
  }

  if (detail.sections.writing) {
    availableTabs.push({
      id: 'writing',
      label: 'Writing',
      icon: PenTool,
      count: detail.sections.writing.tasks.length,
    });
  }

  if (detail.sections.speaking) {
    availableTabs.push({
      id: 'speaking',
      label: 'Speaking',
      icon: Mic,
      count: detail.sections.speaking.parts.length,
    });
  }

  if (detail.sections.grammar) {
    availableTabs.push({
      id: 'grammar',
      label: 'Grammar',
      icon: HelpCircle,
      count: detail.sections.grammar.totalQuestions,
    });
  }

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<number, boolean>>({});
  const [expandedRubrics, setExpandedRubrics] = useState<Record<number, boolean>>({});

  const toggleTranscript = (sectionNum: number) => {
    setExpandedTranscripts((prev) => ({ ...prev, [sectionNum]: !prev[sectionNum] }));
  };

  const toggleRubric = (taskNum: number) => {
    setExpandedRubrics((prev) => ({ ...prev, [taskNum]: !prev[taskNum] }));
  };

  const { candidate, assessmentDefinition, attemptSummary, sections } = detail;
  const overview = sections.overview;

  const startedDate = attemptSummary.startedAt ? new Date(attemptSummary.startedAt) : null;
  const submittedDate = attemptSummary.submittedAt ? new Date(attemptSummary.submittedAt) : null;
  const dateStr = startedDate
    ? startedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';
  const timeStartedStr = startedDate
    ? startedDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';
  const timeSubmittedStr = submittedDate
    ? submittedDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  // Collect all questions for active section or overall navigator
  const currentSectionQuestions: ReconstructedQuestion[] = React.useMemo(() => {
    if (activeTab === 'listening' && sections.listening) {
      return sections.listening.sections.flatMap((s) => s.questions);
    }
    if (activeTab === 'reading' && sections.reading) {
      return sections.reading.passages.flatMap((p) => p.questions);
    }
    if (activeTab === 'grammar' && sections.grammar) {
      return sections.grammar.questions;
    }
    return [];
  }, [activeTab, sections]);

  const scrollToQuestion = (questionId: string) => {
    const el = document.getElementById(`q-card-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.boxShadow = '0 0 0 2px var(--brand-primary)';
      setTimeout(() => {
        el.style.boxShadow = 'none';
      }, 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* ─── TOP AUDIT BANNER & NAVIGATION ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            variant="secondary"
            onClick={onBack}
            style={{
              color: 'var(--text-muted)',
              gap: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Directory
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Candidate Audit:{' '}
                <span style={{ color: 'var(--brand-primary)' }}>{candidate.name}</span>
              </h1>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor:
                    detail.attemptNumber > 1
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(59, 130, 246, 0.15)',
                  color: detail.attemptNumber > 1 ? 'var(--warning)' : 'var(--brand-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                Attempt {detail.attemptNumber} of {detail.totalAttempts}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ID: <strong>{candidate.candidateNumber}</strong> | {candidate.email} | Assessment:{' '}
              <strong>{assessmentDefinition.title}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge
            variant={
              attemptSummary.status === 'SUBMITTED' || attemptSummary.status === 'COMPLETED'
                ? 'success'
                : 'warning'
            }
          >
            {attemptSummary.status}
          </Badge>
          <div
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '8px',
              backgroundColor:
                attemptSummary.scoreStatus === 'AVAILABLE'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
              border: '1px solid',
              borderColor:
                attemptSummary.scoreStatus === 'AVAILABLE'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)',
              color:
                attemptSummary.scoreStatus === 'AVAILABLE' ? 'var(--success)' : 'var(--warning)',
              fontSize: '0.9rem',
              fontWeight: 800,
            }}
          >
            {attemptSummary.officialScoreLabel ||
              (attemptSummary.officialScaledScore
                ? `Band ${attemptSummary.officialScaledScore.toFixed(1)}`
                : 'Pending')}
          </div>
        </div>
      </div>

      {/* ─── FULL EXAMINATION TELEMETRY SUMMARY HEADER ─────────────────────── */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Clock size={16} color="var(--brand-primary)" />
          Examination Telemetry & Candidate Parameters
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date Completed</div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {dateStr}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Start - Submit Time
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {timeStartedStr} {timeSubmittedStr ? `– ${timeSubmittedStr}` : ''}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Duration Allocated / Used
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {attemptSummary.durationMinutes} mins / {assessmentDefinition.durationMinutes} mins
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total Objective Questions
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '2px',
              }}
            >
              {overview.totalQuestions} items
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Correct Items</div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--success)',
                marginTop: '2px',
              }}
            >
              {overview.correctCount} items (
              {overview.totalQuestions > 0
                ? Math.round((overview.correctCount / overview.totalQuestions) * 100)
                : 0}
              %)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Incorrect Items</div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--danger)',
                marginTop: '2px',
              }}
            >
              {overview.incorrectCount} items
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unanswered Items</div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginTop: '2px',
              }}
            >
              {overview.unansweredCount} items
            </div>
          </div>
        </div>
      </Card>

      {/* ─── SECTION NAVIGATION TABS ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
        }}
      >
        {availableTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                backgroundColor: isActive ? 'var(--surface-0)' : 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'var(--surface-1)',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── PERSISTENT QUESTION NAVIGATOR (FOR OBJECTIVE SECTIONS) ─────────── */}
      {currentSectionQuestions.length > 0 && (
        <Card
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.6rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Question Quick Navigator (Click to Jump)
            </span>
            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />{' '}
                Correct
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                  }}
                />{' '}
                Incorrect
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#6b7280',
                  }}
                />{' '}
                Unanswered
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {currentSectionQuestions.map((q) => {
              const bg =
                q.status === 'CORRECT'
                  ? '#10b981'
                  : q.status === 'INCORRECT'
                    ? '#ef4444'
                    : '#6b7280';
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => scrollToQuestion(q.id)}
                  title={`Q${q.order}: ${q.status}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: bg,
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {q.order}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── TAB 1: OVERVIEW ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {overview.sectionSummaries.map((sec) => (
              <div
                key={sec.sectionKey}
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onClick={() => {
                  if (availableTabs.some((t) => t.id === sec.sectionKey)) {
                    setActiveTab(sec.sectionKey);
                  }
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}
                  >
                    {sec.title}
                  </span>
                  {sec.bandScore ? (
                    <span
                      style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)' }}
                    >
                      Band {sec.bandScore.toFixed(1)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>
                      {sec.scorePercentage}%
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    <span>Correct Items:</span>
                    <span>
                      {sec.correctCount} / {sec.questionCount}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--surface-1)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${sec.scorePercentage}%`,
                        backgroundColor:
                          sec.scorePercentage >= 70 ? 'var(--success)' : 'var(--warning)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>
                    {sec.answeredCount} of {sec.questionCount} answered
                  </span>
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                    Inspect Section →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: LISTENING SECTION ─────────────────────────────────────── */}
      {activeTab === 'listening' && sections.listening && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sections.listening.sections.map((sec) => (
            <Card
              key={sec.sectionNumber}
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Section Header & Audio Player */}
              <div
                style={{
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Headphones size={20} color="var(--brand-primary)" />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                      }}
                    >
                      Section {sec.sectionNumber}: {sec.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Duration: {Math.floor(sec.durationSeconds / 60)}m {sec.durationSeconds % 60}s |
                    Questions {sec.questions[0]?.order}–
                    {sec.questions[sec.questions.length - 1]?.order}
                  </span>
                </div>

                {/* HTML5 Audio Player */}
                {sec.audioUrl ? (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
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
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                      }}
                    >
                      <Volume2 size={16} /> Listening Audio Track ({sec.audioUrl})
                    </div>
                    <audio
                      controls
                      src={sec.audioUrl}
                      preload="metadata"
                      style={{ width: '100%', height: '42px', outline: 'none' }}
                    >
                      Your browser does not support HTML5 audio playback.
                    </audio>
                  </div>
                ) : (
                  <div
                    style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  >
                    No recorded audio track attached to this section.
                  </div>
                )}

                {/* Collapsible Transcript */}
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => toggleTranscript(sec.sectionNumber)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {expandedTranscripts[sec.sectionNumber] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {expandedTranscripts[sec.sectionNumber]
                      ? 'Hide Listening Transcript'
                      : 'Show Listening Transcript'}
                  </button>

                  {expandedTranscripts[sec.sectionNumber] && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        borderRadius: '10px',
                        backgroundColor: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {sec.transcript || 'No transcript text stored for this listening section.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {sec.questions.map((q) => (
                  <QuestionItemCard key={q.id} question={q} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ─── TAB 3: READING SECTION ───────────────────────────────────────── */}
      {activeTab === 'reading' && sections.reading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sections.reading.passages.map((passage) => (
            <Card
              key={passage.passageNumber}
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Passage Title & Word Count */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={20} color="var(--brand-primary)" />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Passage {passage.passageNumber}: {passage.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {passage.code && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {passage.code}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--surface-1)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {passage.wordCount} words
                  </span>
                </div>
              </div>

              {/* Full Reading Passage Content */}
              <div
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1.75rem',
                }}
              >
                {passage.content ||
                  'Reading passage text recorded in canonical mock examination package.'}
              </div>

              {/* Comprehension Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Comprehension Questions ({passage.questions.length} Items)
                </div>
                {passage.questions.map((q) => (
                  <QuestionItemCard key={q.id} question={q} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ─── TAB 4: WRITING SECTION ───────────────────────────────────────── */}
      {activeTab === 'writing' && sections.writing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sections.writing.tasks.map((task) => (
            <Card
              key={task.taskNumber}
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Task Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PenTool size={20} color="var(--brand-primary)" />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Writing Task {task.taskNumber}: {task.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={task.evaluationState === 'COMPLETED' ? 'success' : 'warning'}>
                    {task.evaluationState}
                  </Badge>
                  {task.overallScore && (
                    <span
                      style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)' }}
                    >
                      Band {task.overallScore.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions & Prompt */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}
                >
                  {task.instructions}
                </div>
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {task.prompt}
                </div>
              </div>

              {/* Stimulus Image (e.g. Process Diagram / Graph for Task 1) */}
              {task.stimulusImageUrl && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <ImageIcon size={15} /> Task 1 Visual Stimulus Diagram
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={task.stimulusImageUrl}
                      alt="Task stimulus diagram"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '420px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.5rem',
                      }}
                    >
                      Diagram Asset: {task.stimulusImageUrl}
                    </div>
                  </div>
                </div>
              )}

              {/* Candidate's Submitted Essay */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}
                  >
                    Candidate Submitted Essay
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor:
                          task.wordCount >= task.minWords
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color: task.wordCount >= task.minWords ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {task.wordCount} words (Minimum: {task.minWords} words)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    minHeight: '140px',
                  }}
                >
                  {task.studentEssay ? (
                    task.studentEssay
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No written essay response was submitted for this task by the candidate.
                    </span>
                  )}
                </div>
              </div>

              {/* 4 IELTS Writing Evaluation Criteria */}
              {task.criteria && task.criteria.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Official IELTS 4-Criteria Evaluation
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {task.criteria.map((crit) => (
                      <div
                        key={crit.criterionName}
                        style={{
                          padding: '1rem',
                          borderRadius: '10px',
                          backgroundColor: 'var(--surface-1)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {crit.criterionName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              color: 'var(--brand-primary)',
                            }}
                          >
                            Band {crit.score.toFixed(1)} / {crit.maxScore}
                          </span>
                        </div>
                        {crit.feedback && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              marginTop: '0.5rem',
                              lineHeight: 1.5,
                            }}
                          >
                            {crit.feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examiner Feedback */}
              {task.feedback && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      color: 'var(--brand-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Examiner / AI Qualitative Feedback:
                  </strong>
                  {task.feedback}
                </div>
              )}

              {/* Official Rubric Level Descriptors Accordion */}
              {task.rubrics && task.rubrics.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleRubric(task.taskNumber)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {expandedRubrics[task.taskNumber] ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                    {expandedRubrics[task.taskNumber]
                      ? 'Hide IELTS Band Rubric Descriptors'
                      : 'View Official IELTS Band Rubric Descriptors'}
                  </button>

                  {expandedRubrics[task.taskNumber] && (
                    <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.75rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: '1px solid var(--border)',
                              textAlign: 'left',
                              backgroundColor: 'var(--surface-1)',
                            }}
                          >
                            <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                              Criterion
                            </th>
                            <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                              Band
                            </th>
                            <th style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                              Descriptor
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {task.rubrics.slice(0, 10).map((rub, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '6px 10px', fontWeight: 600 }}>
                                {rub.criterion}
                              </td>
                              <td
                                style={{
                                  padding: '6px 10px',
                                  fontWeight: 700,
                                  color: 'var(--brand-primary)',
                                }}
                              >
                                {rub.bandScore}
                              </td>
                              <td style={{ padding: '6px 10px', lineHeight: 1.4 }}>
                                {rub.descriptor}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ─── TAB 5: SPEAKING SECTION ───────────────────────────────────────── */}
      {activeTab === 'speaking' && sections.speaking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sections.speaking.parts.map((part) => (
            <Card
              key={part.partNumber}
              style={{
                padding: '1.75rem',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Part Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mic size={20} color="var(--brand-primary)" />
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Speaking Part {part.partNumber}: {part.title}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={part.evaluationState === 'COMPLETED' ? 'success' : 'warning'}>
                    {part.evaluationState}
                  </Badge>
                  {part.overallScore && (
                    <span
                      style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)' }}
                    >
                      Band {part.overallScore.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  marginBottom: '1rem',
                }}
              >
                {part.instructions}
              </div>

              {/* Part 2 Cue Card (Specially Styled) */}
              {part.cueCard ? (
                <div
                  style={{
                    padding: '1.5rem',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: 'var(--brand-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Official IELTS Speaking Cue Card
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-0)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Prep: {part.cueCard.prepTimeSeconds}s
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-0)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Speak: {part.cueCard.speakingTimeSeconds}s
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {part.cueCard.prompt}
                  </div>
                </div>
              ) : (
                /* Part 1 or Part 3 Prompt */
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {part.prompt}
                </div>
              )}

              {/* Candidate Audio Recording Player */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  Candidate Audio Recording
                </div>
                {part.audioUrl ? (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--brand-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Volume2 size={16} /> Candidate Audio Playback
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Duration: {part.durationSeconds}s
                      </span>
                    </div>
                    <audio
                      controls
                      src={part.audioUrl}
                      preload="metadata"
                      style={{ width: '100%', height: '42px', outline: 'none' }}
                    >
                      Your browser does not support HTML5 audio playback.
                    </audio>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    No candidate audio recording was stored for this speaking part.
                  </div>
                )}
              </div>

              {/* Candidate Transcript */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  Candidate Speech Transcript
                </div>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {part.transcript ? (
                    part.transcript
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Candidate transcript unavailable for this response.
                    </span>
                  )}
                </div>
              </div>

              {/* 4 IELTS Speaking Evaluation Criteria */}
              {part.criteria && part.criteria.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Official IELTS 4-Criteria Evaluation
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {part.criteria.map((crit) => (
                      <div
                        key={crit.criterionName}
                        style={{
                          padding: '1rem',
                          borderRadius: '10px',
                          backgroundColor: 'var(--surface-1)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {crit.criterionName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              color: 'var(--brand-primary)',
                            }}
                          >
                            Band {crit.score.toFixed(1)} / {crit.maxScore}
                          </span>
                        </div>
                        {crit.feedback && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              marginTop: '0.5rem',
                              lineHeight: 1.5,
                            }}
                          >
                            {crit.feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examiner Feedback */}
              {part.feedback && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      color: 'var(--brand-primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Examiner / AI Qualitative Feedback:
                  </strong>
                  {part.feedback}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ─── TAB 6: GRAMMAR SECTION (DIAGNOSTIC) ─────────────────────────── */}
      {activeTab === 'grammar' && sections.grammar && (
        <Card
          style={{
            padding: '1.75rem',
            borderRadius: '16px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              Diagnostic Grammar & Usage ({sections.grammar.totalQuestions} Questions)
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {sections.grammar.questions.map((q) => (
              <QuestionItemCard key={q.id} question={q} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Reusable Card for rendering an Objective Question (MCQ, completion, etc.)
 */
function QuestionItemCard({ question }: { question: ReconstructedQuestion }) {
  const isCorrect = question.status === 'CORRECT';
  const isIncorrect = question.status === 'INCORRECT';
  const isUnanswered = question.status === 'UNANSWERED';

  const statusColor = isCorrect
    ? 'var(--success)'
    : isIncorrect
      ? 'var(--danger)'
      : 'var(--text-muted)';

  return (
    <div
      id={`q-card-${question.id}`}
      style={{
        padding: '1.25rem',
        borderRadius: '12px',
        backgroundColor: 'var(--surface-1)',
        border: '1px solid',
        borderColor: isCorrect
          ? 'rgba(16, 185, 129, 0.3)'
          : isIncorrect
            ? 'rgba(239, 68, 68, 0.3)'
            : 'var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: isCorrect
                ? 'rgba(16, 185, 129, 0.15)'
                : isIncorrect
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'var(--surface-0)',
              color: statusColor,
            }}
          >
            Q{question.order}
          </span>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}
          >
            {question.code}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-muted)',
            }}
          >
            {question.itemType}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: statusColor,
          }}
        >
          {isCorrect && <CheckCircle2 size={16} />}
          {isIncorrect && <XCircle size={16} />}
          {isUnanswered && <AlertCircle size={16} />}
          <span>{question.status}</span>
        </div>
      </div>

      {/* Prompt */}
      <div
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
        }}
      >
        {question.prompt}
      </div>

      {/* Options (if present) */}
      {question.options && question.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {question.options.map((opt) => {
            const isStudentChoice =
              String(question.studentAnswer).trim().toUpperCase() ===
              String(opt.code).trim().toUpperCase();
            const isAuthoritative =
              String(question.correctAnswer).trim().toUpperCase() ===
              String(opt.code).trim().toUpperCase();

            let borderCol = 'var(--border)';
            let bgCol = 'var(--surface-0)';
            if (isAuthoritative) {
              borderCol = 'var(--success)';
              bgCol = 'rgba(16, 185, 129, 0.12)';
            }
            if (isStudentChoice && !isAuthoritative) {
              borderCol = 'var(--danger)';
              bgCol = 'rgba(239, 68, 68, 0.12)';
            }

            return (
              <div
                key={opt.code}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: borderCol,
                  backgroundColor: bgCol,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, width: '18px' }}>{opt.code}.</span>
                  <span style={{ color: 'var(--text-primary)' }}>{opt.text}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {isAuthoritative && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircle2 size={13} /> Correct Answer
                    </span>
                  )}
                  {isStudentChoice && !isAuthoritative && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <XCircle size={13} /> Selected by Student
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Answers Summary (for fill in blank or non-MCQ) */}
      {(!question.options || question.options.length === 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-0)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Student Submitted:
            </span>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isCorrect
                  ? 'var(--success)'
                  : isIncorrect
                    ? 'var(--danger)'
                    : 'var(--text-muted)',
              }}
            >
              {question.studentAnswer ? String(question.studentAnswer) : '(No answer submitted)'}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Authoritative Answer:
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
              {question.correctAnswer ? String(question.correctAnswer) : 'Authoritative Answer Key'}
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
          }}
        >
          <strong style={{ color: 'var(--brand-primary)', display: 'block', marginBottom: '2px' }}>
            Explanation / Teaching Rationale:
          </strong>
          {question.explanation}
        </div>
      )}
    </div>
  );
}
