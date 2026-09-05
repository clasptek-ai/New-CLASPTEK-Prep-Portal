'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { Send } from 'lucide-react';
import { ListeningSectionEngine } from './ListeningSectionEngine';
import { ReadingSectionEngine } from './ReadingSectionEngine';
import { WritingSectionEngine } from './WritingSectionEngine';
import { SpeakingSectionEngine } from './SpeakingSectionEngine';

interface SectionData {
  sectionName: string;
  timeLimitMinutes: number;
  questions: any[];
}

interface IELTSExamEngineProps {
  session: {
    id: string;
    exam: string;
    template: {
      title: string;
      sections: SectionData[];
      totalDurationMinutes: number;
    };
  };
  selectedAnswerMap: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmit: () => void;
}

const SECTION_COLORS: Record<string, string> = {
  Listening: '#8b5cf6',
  Reading: '#3b82f6',
  Writing: '#f59e0b',
  Speaking: '#10b981',
};

import { MockExamFullscreenShell } from './MockExamFullscreenShell';

export function IELTSExamEngine({
  session,
  selectedAnswerMap,
  onAnswerChange,
  onSubmit,
}: IELTSExamEngineProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sectionTimers, setSectionTimers] = useState<number[]>([]);
  const [sectionCompleted, setSectionCompleted] = useState<boolean[]>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sections = session.template.sections;

  // Initialize section timers from blueprint
  useEffect(() => {
    const timers = sections.map((s) => s.timeLimitMinutes * 60);
    setSectionTimers(timers);
    setSectionCompleted(sections.map(() => false));
  }, [sections]);

  // Run countdown for active section only
  useEffect(() => {
    if (sectionTimers.length === 0) return;

    timerRef.current = setInterval(() => {
      setSectionTimers((prev) => {
        const next = [...prev];
        if (next[activeSectionIndex] > 0) {
          next[activeSectionIndex] -= 1;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSectionIndex, sectionTimers.length]);

  const activeSection = sections[activeSectionIndex];
  const activeTimer = sectionTimers[activeSectionIndex] ?? 0;

  const answeredInSection =
    activeSection?.questions.filter((q: any) => selectedAnswerMap[q.id])?.length ?? 0;
  const totalInSection = activeSection?.questions.length ?? 0;

  const handleCompleteSection = useCallback(() => {
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
  }, [activeSectionIndex, sections.length]);

  const sectionColor = SECTION_COLORS[activeSection?.sectionName] || '#3b82f6';

  return (
    <MockExamFullscreenShell
      headerProps={{
        examTitle: session.template.title || 'IELTS Academic',
        sectionName: activeSection?.sectionName || 'Exam Section',
        sectionIndex: activeSectionIndex,
        totalSections: sections.length,
        timeRemainingSeconds: activeTimer,
        answeredCount: answeredInSection,
        totalQuestionsCount: totalInSection,
        sectionColor: sectionColor,
        sections: sections.map((s, idx) => ({
          name: s.sectionName,
          isComplete: sectionCompleted[idx],
          isCurrent: idx === activeSectionIndex,
        })),
        onSelectSection: (idx) => {
          if (sectionCompleted[idx] || idx <= activeSectionIndex) {
            setActiveSectionIndex(idx);
          }
        },
      }}
      isExamActive={true}
    >
      {/* ── SECTION RENDERER ────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {activeSection?.sectionName === 'Listening' && (
          <ListeningSectionEngine
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={onAnswerChange}
            onComplete={handleCompleteSection}
            timeRemaining={activeTimer}
          />
        )}
        {activeSection?.sectionName === 'Reading' && (
          <ReadingSectionEngine
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={onAnswerChange}
            onComplete={handleCompleteSection}
            timeRemaining={activeTimer}
          />
        )}
        {activeSection?.sectionName === 'Writing' && (
          <WritingSectionEngine
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={onAnswerChange}
            onComplete={handleCompleteSection}
            timeRemaining={activeTimer}
          />
        )}
        {activeSection?.sectionName === 'Speaking' && (
          <SpeakingSectionEngine
            sessionId={session.id}
            questions={activeSection.questions}
            answers={selectedAnswerMap}
            onAnswer={onAnswerChange}
            onComplete={handleCompleteSection}
            timeRemaining={activeTimer}
          />
        )}
      </div>

      {/* ── SUBMIT CONFIRMATION MODAL ─────────────────────── */}
      {confirmSubmit && (
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
              <Button variant="primary" onClick={onSubmit}>
                Submit Exam
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </MockExamFullscreenShell>
  );
}
