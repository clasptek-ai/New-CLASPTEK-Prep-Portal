'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { Send, AlertTriangle } from 'lucide-react';
import { ListeningSectionEngine } from './ListeningSectionEngine';
import { ReadingSectionEngine } from './ReadingSectionEngine';
import { WritingSectionEngine } from './WritingSectionEngine';
import { SpeakingSectionEngine } from './SpeakingSectionEngine';
import { MockExamFullscreenShell } from './MockExamFullscreenShell';

interface SectionData {
  sectionName: string;
  timeLimitMinutes: number;
  questions: any[];
}

interface IELTSExamEngineProps {
  session: {
    id: string;
    exam: string;
    startedAt?: string;
    expiresAt?: string;
    template: {
      title: string;
      sections: SectionData[];
      totalDurationMinutes: number;
    };
  };
  selectedAnswerMap: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmit: () => void | Promise<void>;
}

const SECTION_COLORS: Record<string, string> = {
  Listening: '#8b5cf6',
  Reading: '#3b82f6',
  Writing: '#f59e0b',
  Speaking: '#10b981',
};

export function IELTSExamEngine({
  session,
  selectedAnswerMap,
  onAnswerChange,
  onSubmit,
}: IELTSExamEngineProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sectionCompleted, setSectionCompleted] = useState<boolean[]>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  const sections = session.template.sections;

  // Authoritative server-derived deadline
  const expiresAtMs = useRef(
    session?.expiresAt
      ? new Date(session.expiresAt).getTime()
      : Date.now() + (session.template.totalDurationMinutes || 165) * 60 * 1000
  ).current;

  // Initialize countdown derived from deadline
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000))
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  // Initialize section completion flags
  useEffect(() => {
    setSectionCompleted(sections.map(() => false));
  }, [sections]);

  // Idempotent auto-submission handler
  const handleAutoSubmit = useCallback(async () => {
    try {
      await onSubmit();
    } catch (err) {
      console.error('[MOCK_AUTO_SUBMIT_ERROR]', err);
    } finally {
      setIsAutoSubmitting(false);
    }
  }, [onSubmit]);

  // Deadline-driven countdown with visibility/sleep catch-up
  useEffect(() => {
    const checkDeadline = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, expiresAtMs - now);
      const remainingSecs = Math.ceil(remainingMs / 1000);

      // Clamp display at 00:00, never negative
      setTimeRemainingSeconds(remainingSecs);

      // Single termination path at 00:00
      if (remainingMs <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        setIsExpired(true);
        setIsAutoSubmitting(true);
        setConfirmSubmit(false);
        if (timerRef.current) clearInterval(timerRef.current);
        void handleAutoSubmit();
      }
    };

    // Immediate initial check
    checkDeadline();

    // High frequency interval (500ms) to ensure precision without drift
    timerRef.current = setInterval(checkDeadline, 500);

    // Tab visibility & Window focus listeners for background tab/sleep recovery
    const handleActivity = () => {
      checkDeadline();
    };

    window.addEventListener('visibilitychange', handleActivity);
    window.addEventListener('focus', handleActivity);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('visibilitychange', handleActivity);
      window.removeEventListener('focus', handleActivity);
    };
  }, [expiresAtMs, handleAutoSubmit]);

  const activeSection = sections[activeSectionIndex];

  const answeredInSection =
    activeSection?.questions.filter((q: any) => selectedAnswerMap[q.id])?.length ?? 0;
  const totalInSection = activeSection?.questions.length ?? 0;

  const handleCompleteSection = useCallback(() => {
    if (isExpired) return;
    setSectionCompleted((prev) => {
      const next = [...prev];
      next[activeSectionIndex] = true;
      return next;
    });

    // Move to next section or show submit
    if (activeSectionIndex < sections.length - 1) {
      setActiveSectionIndex(activeSectionIndex + 1);
    } else {
      setConfirmSubmit(true);
    }
  }, [activeSectionIndex, sections.length, isExpired]);

  const sectionColor = SECTION_COLORS[activeSection?.sectionName] || '#3b82f6';

  return (
    <MockExamFullscreenShell
      headerProps={{
        examTitle: session.template.title || 'IELTS Academic',
        sectionName: activeSection?.sectionName || 'Exam Section',
        sectionIndex: activeSectionIndex,
        totalSections: sections.length,
        timeRemainingSeconds: timeRemainingSeconds,
        answeredCount: answeredInSection,
        totalQuestionsCount: totalInSection,
        sectionColor: sectionColor,
        sections: sections.map((s, idx) => ({
          name: s.sectionName,
          isComplete: sectionCompleted[idx],
          isCurrent: idx === activeSectionIndex,
        })),
        onSelectSection: (idx) => {
          if (isExpired) return;
          if (sectionCompleted[idx] || idx <= activeSectionIndex) {
            setActiveSectionIndex(idx);
          }
        },
      }}
      isExamActive={!isExpired}
    >
      {/* ── SECTION RENDERER WITH INPUT LOCKDOWN ────────────── */}
      <div
        style={{
          flex: 1,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: isExpired ? 'none' : 'auto',
          userSelect: isExpired ? 'none' : 'auto',
          opacity: isExpired ? 0.6 : 1,
        }}
      >
        {activeSection?.sectionName === 'Listening' && (
          <ListeningSectionEngine
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={(qId, ans) => {
              if (!isExpired) onAnswerChange(qId, ans);
            }}
            onComplete={handleCompleteSection}
            timeRemaining={timeRemainingSeconds}
          />
        )}
        {activeSection?.sectionName === 'Reading' && (
          <ReadingSectionEngine
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={(qId, ans) => {
              if (!isExpired) onAnswerChange(qId, ans);
            }}
            onComplete={handleCompleteSection}
            timeRemaining={timeRemainingSeconds}
          />
        )}
        {activeSection?.sectionName === 'Writing' && (
          <WritingSectionEngine
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={(qId, ans) => {
              if (!isExpired) onAnswerChange(qId, ans);
            }}
            onComplete={handleCompleteSection}
            timeRemaining={timeRemainingSeconds}
          />
        )}
        {activeSection?.sectionName === 'Speaking' && (
          <SpeakingSectionEngine
            sessionId={session.id}
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={(qId, ans) => {
              if (!isExpired) onAnswerChange(qId, ans);
            }}
            onComplete={handleCompleteSection}
            timeRemaining={timeRemainingSeconds}
          />
        )}
      </div>

      {/* ── EXPIRY AUTO-SUBMISSION MODAL ────────────────────── */}
      {isExpired && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Card
            style={{
              padding: '2.5rem',
              backgroundColor: '#111827',
              border: '1.5px solid #ef4444',
              borderRadius: '20px',
              maxWidth: '520px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
            }}
          >
            <AlertTriangle size={48} color="#ef4444" className="pulse-warning-icon" />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Time Expired
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              Your examination time has expired. Your examination is being submitted automatically.
            </p>
            {isAutoSubmitting ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#3b82f6',
                  marginTop: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2.5px solid #3b82f6',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Finalizing and scoring attempt...
                </span>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => void handleAutoSubmit()}
                style={{ marginTop: '0.5rem' }}
              >
                Complete Submission
              </Button>
            )}
          </Card>
        </div>
      )}

      {/* ── MANUAL SUBMIT CONFIRMATION MODAL ────────────────── */}
      {confirmSubmit && !isExpired && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Card
            style={{
              padding: '2.5rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              maxWidth: '500px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <Send size={40} color="#3b82f6" style={{ margin: '0 auto' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Submit Examination?
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              You are about to submit your complete IELTS Academic Mock Examination. This action
              cannot be undone. Your answers will be evaluated and a score report will be generated.
            </p>

            {/* Show section summary */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}
            >
              {sections.map((sec, idx) => {
                const answered = sec.questions.filter((q: any) => selectedAnswerMap[q.id]).length;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span
                      style={{
                        color: SECTION_COLORS[sec.sectionName] || '#94a3b8',
                        fontWeight: 700,
                      }}
                    >
                      {sec.sectionName}
                    </span>
                    <span
                      style={{ color: answered === sec.questions.length ? '#34d399' : '#f59e0b' }}
                    >
                      {answered}/{sec.questions.length} answered
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
                Continue Exam
              </Button>
              <Button variant="primary" onClick={() => void onSubmit()}>
                Submit Exam
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pulse and spin animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </MockExamFullscreenShell>
  );
}
