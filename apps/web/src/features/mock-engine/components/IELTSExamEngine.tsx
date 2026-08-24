'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { Clock, Send, BookOpen, Headphones, Pen, Mic } from 'lucide-react';
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

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Listening: <Headphones size={16} />,
  Reading: <BookOpen size={16} />,
  Writing: <Pen size={16} />,
  Speaking: <Mic size={16} />,
};

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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

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

  const timerWarning = activeTimer > 0 && activeTimer <= 300; // 5 min warning
  const timerCritical = activeTimer > 0 && activeTimer <= 60;

  const sectionColor = SECTION_COLORS[activeSection?.sectionName] || '#3b82f6';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
      }}
    >
      {/* ── EXAM HEADER BAR ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#111827',
          borderBottom: `2px solid ${sectionColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Exam title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${sectionColor}, ${sectionColor}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {SECTION_ICONS[activeSection?.sectionName] || <BookOpen size={16} />}
          </div>
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {session.template.title || 'IELTS Academic'} • Clasptek Full Simulation
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              {activeSection?.sectionName}{' '}
              {activeSection?.sectionName === 'Speaking'
                ? '(Part-Timed Assessment)'
                : `— Section ${activeSectionIndex + 1} of ${sections.length}`}
            </div>
          </div>
        </div>

        {/* Center: Section tabs */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {sections.map((sec, idx) => {
            const isActive = idx === activeSectionIndex;
            const isComplete = sectionCompleted[idx];
            const secColor = SECTION_COLORS[sec.sectionName] || '#64748b';

            return (
              <button
                key={idx}
                onClick={() => {
                  if (isComplete || idx <= activeSectionIndex) {
                    setActiveSectionIndex(idx);
                  }
                }}
                disabled={idx > activeSectionIndex && !isComplete}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: isActive ? `2px solid ${secColor}` : '2px solid transparent',
                  backgroundColor: isActive ? `${secColor}22` : isComplete ? '#1e293b' : '#0f172a',
                  color: isActive ? '#ffffff' : isComplete ? '#94a3b8' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: idx <= activeSectionIndex || isComplete ? 'pointer' : 'not-allowed',
                  opacity: idx > activeSectionIndex && !isComplete ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {SECTION_ICONS[sec.sectionName]}
                {sec.sectionName}
                {isComplete && <span style={{ color: '#34d399' }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Right: Timer + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
              Progress: {answeredInSection}/{totalInSection}
            </div>
            <div
              style={{
                width: '120px',
                height: '4px',
                backgroundColor: '#1e293b',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '3px',
              }}
            >
              <div
                style={{
                  width: `${totalInSection > 0 ? (answeredInSection / totalInSection) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: sectionColor,
                  transition: 'width 0.3s',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: timerCritical
                ? 'rgba(220, 38, 38, 0.2)'
                : timerWarning
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${timerCritical ? '#dc2626' : timerWarning ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <Clock
              size={16}
              color={timerCritical ? '#ef4444' : timerWarning ? '#f59e0b' : '#94a3b8'}
              style={timerCritical ? { animation: 'pulse 1s infinite' } : undefined}
            />
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: timerCritical ? '#ef4444' : timerWarning ? '#f59e0b' : '#f8fafc',
              }}
            >
              {formatTime(activeTimer)}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION RENDERER ────────────────────────────────── */}
      <div style={{ flex: 1, padding: '0' }}>
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
    </div>
  );
}
