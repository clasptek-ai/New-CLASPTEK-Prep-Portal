'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Send,
  Grid,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface ExamHeaderProps {
  examTitle: string;
  sectionName: string;
  sectionIndex: number;
  totalSections: number;
  timeRemainingSeconds: number;
  answeredCount: number;
  totalQuestionsCount: number;
  sections?: { name: string; isComplete: boolean; isCurrent: boolean }[];
  onSelectSection?: (index: number) => void;
  sectionColor?: string;
}

export interface ExamFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
  isLastQuestionOrSection?: boolean;
  currentQuestionNumber?: number;
  totalQuestions?: number;
  answeredCount?: number;
  questionIds?: string[];
  answeredMap?: Record<string, any>;
  onJumpToQuestion?: (index: number) => void;
  nextButtonLabel?: string;
  submitButtonLabel?: string;
}

export interface MockExamFullscreenShellProps {
  headerProps: ExamHeaderProps;
  footerProps?: ExamFooterProps;
  children: React.ReactNode;
  isExamActive?: boolean;
}

/* -------------------------------------------------------------------------- */
/* EXAM HEADER COMPONENT                                                      */
/* -------------------------------------------------------------------------- */

export function ExamHeader({
  examTitle,
  sectionName,
  sectionIndex,
  totalSections,
  timeRemainingSeconds,
  answeredCount,
  totalQuestionsCount,
  sections,
  onSelectSection,
  sectionColor = '#3b82f6',
}: ExamHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setSupportsFullscreen(
        Boolean(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled)
      );
      const handleFsChange = () => {
        setIsFullscreen(
          Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement)
        );
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      document.addEventListener('webkitfullscreenchange', handleFsChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFsChange);
        document.removeEventListener('webkitfullscreenchange', handleFsChange);
      };
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          root.requestFullscreen().catch(() => {});
        } else if ((root as any).webkitRequestFullscreen) {
          (root as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // Gracefully ignore full-screen denial or exception
    }
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(Math.max(0, s) / 60);
    const secs = Math.max(0, s) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerWarning = timeRemainingSeconds > 0 && timeRemainingSeconds <= 300;
  const timerCritical = timeRemainingSeconds > 0 && timeRemainingSeconds <= 60;

  const timerColor = timerCritical ? '#ef4444' : timerWarning ? '#f59e0b' : '#f8fafc';
  const timerBg = timerCritical
    ? 'rgba(239, 68, 68, 0.2)'
    : timerWarning
      ? 'rgba(245, 158, 11, 0.2)'
      : 'rgba(255, 255, 255, 0.06)';
  const timerBorder = timerCritical
    ? '#dc2626'
    : timerWarning
      ? '#f59e0b'
      : 'rgba(255, 255, 255, 0.1)';

  const progressPercent =
    totalQuestionsCount > 0
      ? Math.min(100, Math.round((answeredCount / totalQuestionsCount) * 100))
      : 0;

  return (
    <header
      role="banner"
      className="mock-exam-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        backgroundColor: '#0f172a',
        borderBottom: `2px solid ${sectionColor}`,
        zIndex: 50,
        gap: '0.75rem',
        minHeight: '60px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* ── LEFT: BRAND & SECTION IDENTITY ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {/* Academic Portal Emblem (Hidden on smallest screens) */}
        <div
          className="brand-pill"
          style={{
            padding: '0.35rem 0.65rem',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            color: '#60a5fa',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
          }}
        >
          <span>CLASPTEK</span>
        </div>

        {/* Section info */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            className="exam-title-text"
            style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {examTitle} • Sec {sectionIndex + 1}/{totalSections}
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: sectionColor }}>●</span>
            <span>{sectionName}</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: DESKTOP SECTION TABS ───────────────────────── */}
      {sections && sections.length > 0 && (
        <nav
          className="desktop-section-tabs"
          aria-label="Exam Sections"
          style={{
            display: 'flex',
            gap: '0.4rem',
            alignItems: 'center',
          }}
        >
          {sections.map((sec, idx) => {
            const isClickable = Boolean(onSelectSection);
            return (
              <button
                key={sec.name}
                type="button"
                onClick={() => onSelectSection?.(idx)}
                disabled={!isClickable}
                aria-current={sec.isCurrent ? 'step' : undefined}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: sec.isCurrent ? `1.5px solid ${sectionColor}` : '1.5px solid transparent',
                  backgroundColor: sec.isCurrent
                    ? 'rgba(59, 130, 246, 0.15)'
                    : sec.isComplete
                      ? '#1e293b'
                      : '#0b0f19',
                  color: sec.isCurrent ? '#ffffff' : sec.isComplete ? '#94a3b8' : '#64748b',
                  cursor: isClickable ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  minHeight: '36px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{sec.name}</span>
                {sec.isComplete && (
                  <CheckCircle2 size={12} color="#10b981" aria-label="Completed" />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── RIGHT: PROGRESS, FULLSCREEN & TIMER ─────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* Progress indicator (Compact on mobile) */}
        <div
          className="header-progress-group"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>{answeredCount}</span>/
            {totalQuestionsCount} <span className="answered-text">answered</span>
          </div>
          <div
            style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#1e293b',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '3px',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: sectionColor,
                transition: 'width 0.25s ease',
              }}
            />
          </div>
        </div>

        {/* Fullscreen Toggle (if supported) */}
        {supportsFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: '38px',
              minWidth: '38px',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}

        {/* Countdown Timer with Visual State Warning */}
        <div
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Time remaining: ${formatTime(timeRemainingSeconds)}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '10px',
            backgroundColor: timerBg,
            border: `1.5px solid ${timerBorder}`,
            color: timerColor,
            flexShrink: 0,
            minHeight: '40px',
            boxSizing: 'border-box',
          }}
        >
          {timerCritical ? (
            <AlertTriangle
              size={16}
              color="#ef4444"
              className="pulse-warning-icon"
              aria-hidden="true"
            />
          ) : (
            <Clock size={16} color={timerWarning ? '#f59e0b' : '#94a3b8'} aria-hidden="true" />
          )}
          <span
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            {formatTime(timeRemainingSeconds)}
          </span>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* EXAM CONTENT REGION                                                        */
/* -------------------------------------------------------------------------- */

export function ExamContent({ children }: { children: React.ReactNode }) {
  return (
    <main
      role="main"
      className="mock-exam-content"
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0b0f19',
      }}
    >
      {children}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* EXAM FOOTER COMPONENT                                                      */
/* -------------------------------------------------------------------------- */

export function ExamFooter({
  onPrevious,
  onNext,
  onSubmit,
  canPrevious = true,
  canNext = true,
  isLastQuestionOrSection = false,
  currentQuestionNumber,
  totalQuestions,
  answeredCount,
  questionIds,
  answeredMap,
  onJumpToQuestion,
  nextButtonLabel = 'Next',
  submitButtonLabel = 'Submit Exam',
}: ExamFooterProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <footer
        role="contentinfo"
        className="mock-exam-footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.25rem',
          backgroundColor: '#0f172a',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 40,
          gap: '0.75rem',
          minHeight: '60px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {/* Previous Button */}
        {onPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canPrevious}
            aria-label="Previous question"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: canPrevious
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(255, 255, 255, 0.02)',
              color: canPrevious ? '#f8fafc' : '#475569',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: canPrevious ? 'pointer' : 'not-allowed',
              minHeight: '44px',
              minWidth: '100px',
              transition: 'all 0.15s ease',
              touchAction: 'manipulation',
            }}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
        ) : (
          <div style={{ width: '100px' }} />
        )}

        {/* Center: Question Navigation / Drawer Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {questionIds && questionIds.length > 0 && onJumpToQuestion && (
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle Question Navigator"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: drawerOpen
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: drawerOpen ? '#60a5fa' : '#94a3b8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '44px',
                transition: 'all 0.15s ease',
                touchAction: 'manipulation',
              }}
            >
              <Grid size={16} />
              <span>
                {currentQuestionNumber && totalQuestions
                  ? `Q ${currentQuestionNumber} of ${totalQuestions}`
                  : 'Questions'}
              </span>
            </button>
          )}

          {typeof answeredCount === 'number' &&
            typeof totalQuestions === 'number' &&
            !questionIds && (
              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  fontWeight: 600,
                }}
              >
                Answered: <strong style={{ color: '#f8fafc' }}>{answeredCount}</strong> /{' '}
                {totalQuestions}
              </div>
            )}
        </div>

        {/* Next / Submit Button */}
        <div>
          {isLastQuestionOrSection && onSubmit ? (
            <button
              type="button"
              onClick={onSubmit}
              aria-label="Submit Examination"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                minHeight: '44px',
                minWidth: '120px',
                transition: 'all 0.15s ease',
                touchAction: 'manipulation',
              }}
            >
              <Send size={16} />
              <span>{submitButtonLabel}</span>
            </button>
          ) : onNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              aria-label="Next question"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                background: canNext
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: canNext ? '#ffffff' : '#475569',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: canNext ? 'pointer' : 'not-allowed',
                boxShadow: canNext ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                minHeight: '44px',
                minWidth: '100px',
                transition: 'all 0.15s ease',
                touchAction: 'manipulation',
              }}
            >
              <span>{nextButtonLabel}</span>
              <ChevronRight size={18} />
            </button>
          ) : null}
        </div>
      </footer>

      {/* ── QUESTION JUMP DRAWER / MODAL ───────────────────────── */}
      {drawerOpen && questionIds && questionIds.length > 0 && onJumpToQuestion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Question Navigator Grid"
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '650px',
              backgroundColor: '#111827',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '1.25rem 1.5rem',
              maxHeight: '60vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Question Navigator
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '36px',
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {questionIds.map((qId, idx) => {
                const isCurrent = currentQuestionNumber === idx + 1;
                const isAnswered = Boolean(answeredMap && answeredMap[qId]);
                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => {
                      onJumpToQuestion(idx);
                      setDrawerOpen(false);
                    }}
                    aria-label={`Question ${idx + 1}${isAnswered ? ', Answered' : ', Not answered'}`}
                    style={{
                      height: '44px',
                      borderRadius: '8px',
                      border: isCurrent
                        ? '2px solid #3b82f6'
                        : isAnswered
                          ? '1px solid #10b981'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isCurrent
                        ? 'rgba(59, 130, 246, 0.25)'
                        : isAnswered
                          ? 'rgba(16, 185, 129, 0.15)'
                          : '#1e293b',
                      color: isCurrent ? '#60a5fa' : isAnswered ? '#34d399' : '#94a3b8',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.12s ease',
                      touchAction: 'manipulation',
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* FULLSCREEN SHELL CONTAINER                                                 */
/* -------------------------------------------------------------------------- */

export function MockExamFullscreenShell({
  headerProps,
  footerProps,
  children,
  isExamActive = true,
}: MockExamFullscreenShellProps) {
  // Lock body scroll on mount, restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100dvh';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, []);

  // Prevent accidental navigation / page reload during active examination
  useEffect(() => {
    if (!isExamActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an examination in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isExamActive]);

  return (
    <div
      className="mock-exam-fullscreen-shell"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <ExamHeader {...headerProps} />
      <ExamContent>{children}</ExamContent>
      {footerProps && <ExamFooter {...footerProps} />}

      {/* Global Responsive Styles */}
      <style>{`
        @keyframes pulse-warn {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .pulse-warning-icon {
          animation: pulse-warn 1s infinite ease-in-out;
        }
        @media (max-width: 640px) {
          .brand-pill {
            display: none !important;
          }
          .desktop-section-tabs {
            display: none !important;
          }
          .answered-text {
            display: none !important;
          }
          .exam-title-text {
            font-size: 0.65rem !important;
          }
        }
        @media (max-width: 900px) {
          .desktop-section-tabs {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
