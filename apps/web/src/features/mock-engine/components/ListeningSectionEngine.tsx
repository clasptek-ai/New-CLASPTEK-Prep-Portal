'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Badge } from '../../../components/ui/ui-components';
import { Headphones, Play, Pause, Volume2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ListeningQuestion {
  id: string;
  code: string;
  text: string;
  type: string;
  options?: string[];
  optionCodes?: string[];
  group?: {
    code: string;
    title: string;
    instructions: string;
    sharedData?: any;
  };
  audio?: {
    trackId: string;
    trackCode: string;
    trackTitle: string;
    trackUrl: string;
    durationSeconds: number;
    sectionNumber: number;
    sectionTitle: string;
  };
}

interface Props {
  questions: ListeningQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: () => void;
  timeRemaining: number;
}

export function ListeningSectionEngine({
  questions,
  answers,
  onAnswer,
  onComplete,
  timeRemaining: _timeRemaining,
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Group questions by audio track for display
  const _groupedByTrack = useMemo(() => {
    const groups: {
      trackCode: string;
      trackTitle: string;
      trackUrl: string;
      sectionNumber: number;
      questions: ListeningQuestion[];
    }[] = [];
    const trackMap = new Map<string, number>();

    for (const q of questions) {
      const key = q.audio?.trackCode || 'no-audio';
      if (!trackMap.has(key)) {
        trackMap.set(key, groups.length);
        groups.push({
          trackCode: key,
          trackTitle: q.audio?.trackTitle || 'Audio Track',
          trackUrl: q.audio?.trackUrl || '',
          sectionNumber: q.audio?.sectionNumber || 1,
          questions: [],
        });
      }
      groups[trackMap.get(key)!].questions.push(q);
    }
    return groups;
  }, [questions]);

  const currentQ = questions[currentQuestionIndex];
  const currentTrack = currentQ?.audio;

  // Audio controls
  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setAudioProgress(audio.currentTime);
    const onLoaded = () => setAudioDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack?.trackUrl]);

  const formatAudioTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const answeredCount = questions.filter((q) => answers[q.id]).length;

  // Determine input type based on question type
  const renderInput = (q: ListeningQuestion) => {
    const rawType = (q.type || '').toUpperCase().trim();
    const currentAnswer = answers[q.id] || '';

    // Normalize options if present
    const normalizedOptions: { code: string; text: string }[] = (q.options || []).map(
      (opt: any, i: number) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            code: opt.code || q.optionCodes?.[i] || String.fromCharCode(65 + i),
            text: opt.text || opt.label || '',
          };
        }
        return {
          code: q.optionCodes?.[i] || String.fromCharCode(65 + i),
          text: String(opt),
        };
      }
    );

    // ── 1. MAP LABELLING / PLAN / DIAGRAM ─────────────────────────────────
    if (rawType === 'MAP_LABELLING' || rawType === 'PLAN_MAP_DIAGRAM') {
      if (normalizedOptions.length > 0) {
        return (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}
          >
            <div style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600 }}>
              Select the correct location label from the map:
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.6rem',
              }}
            >
              {normalizedOptions.map((opt) => {
                const isSelected = currentAnswer.toUpperCase() === opt.code.toUpperCase();
                return (
                  <div
                    key={opt.code}
                    onClick={() => onAnswer(q.id, opt.code)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.25)' : '#1e293b',
                      border: `2px solid ${isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? '#c4b5fd' : '#f8fafc',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: `2px solid ${isSelected ? '#8b5cf6' : '#475569'}`,
                        backgroundColor: isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: isSelected ? '#ffffff' : '#94a3b8',
                      }}
                    >
                      {opt.code}
                    </div>
                    <span style={{ fontSize: '0.85rem' }}>{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }

    // ── 2. MATCHING ─────────────────────────────────────────────────────
    if (rawType === 'MATCHING') {
      if (normalizedOptions.length > 0) {
        return (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            <div style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600 }}>
              Select the matching option:
            </div>
            {normalizedOptions.map((opt) => {
              const isSelected = currentAnswer.toUpperCase() === opt.code.toUpperCase();
              return (
                <div
                  key={opt.code}
                  onClick={() => onAnswer(q.id, opt.code)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.2)' : '#1e293b',
                    border: `1px solid ${isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: isSelected ? '#a78bfa' : '#f8fafc',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#8b5cf6' : '#475569'}`,
                      backgroundColor: isSelected ? '#8b5cf6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {opt.code}
                  </div>
                  <span>{opt.text}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }

    // ── 3. MULTIPLE CHOICE / MCQ ────────────────────────────────────────
    // NOTE: Only render as MCQ when the canonical type explicitly says so.
    // Never fall back to MCQ simply because options happen to be present.
    // Each question must render based on its own rawType, not the group type.
    if (rawType === 'MULTIPLE_CHOICE' || rawType === 'MCQ') {
      if (normalizedOptions.length > 0) {
        return (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = currentAnswer.toUpperCase() === opt.code.toUpperCase();
              return (
                <div
                  key={opt.code}
                  onClick={() => onAnswer(q.id, opt.code)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.2)' : '#1e293b',
                    border: `1px solid ${isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: isSelected ? '#a78bfa' : '#f8fafc',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#8b5cf6' : '#475569'}`,
                      backgroundColor: isSelected ? '#8b5cf6' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {opt.code}
                  </div>
                  <span>{opt.text}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }

    // ── 4. MULTI BLANK (e.g. Question 33) ──────────────────────────────
    if (rawType === 'MULTI_BLANK' || rawType === 'MULTI-BLANK') {
      let b1 = '';
      let b2 = '';
      try {
        const parsed = JSON.parse(currentAnswer);
        if (Array.isArray(parsed)) {
          b1 = parsed[0] || '';
          b2 = parsed[1] || '';
        } else if (typeof parsed === 'object' && parsed !== null) {
          b1 = parsed.blank1 || parsed.b1 || '';
          b2 = parsed.blank2 || parsed.b2 || '';
        }
      } catch {
        if (currentAnswer.includes('|')) {
          const parts = currentAnswer.split('|');
          b1 = parts[0]?.trim() || '';
          b2 = parts[1]?.trim() || '';
        } else if (currentAnswer.includes(',')) {
          const parts = currentAnswer.split(',');
          b1 = parts[0]?.trim() || '';
          b2 = parts[1]?.trim() || '';
        } else {
          b1 = currentAnswer;
        }
      }

      const handleBlankChange = (newB1: string, newB2: string) => {
        if (!newB1.trim() && !newB2.trim()) {
          onAnswer(q.id, '');
        } else {
          onAnswer(q.id, JSON.stringify({ blank1: newB1, blank2: newB2 }));
        }
      };

      const inputStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        color: '#f8fafc',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.15s ease',
      };

      return (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}
        >
          <div style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: 600 }}>
            Enter both answers below (1 mark awarded when both blanks are correct):
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.35rem',
                  fontWeight: 600,
                }}
              >
                Blank 1:
              </label>
              <input
                type="text"
                value={b1}
                onChange={(e) => handleBlankChange(e.target.value, b2)}
                placeholder="Type first answer..."
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#8b5cf6')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.35rem',
                  fontWeight: 600,
                }}
              >
                Blank 2:
              </label>
              <input
                type="text"
                value={b2}
                onChange={(e) => handleBlankChange(b1, e.target.value)}
                placeholder="Type second answer..."
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#8b5cf6')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              />
            </div>
          </div>
        </div>
      );
    }

    // ── 5. COMPLETION / SHORT ANSWER / GAP FILL ──────────────────────────
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <input
          type="text"
          value={currentAnswer}
          onChange={(e) => onAnswer(q.id, e.target.value)}
          placeholder="Type your answer..."
          style={{
            width: '100%',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#f8fafc',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#8b5cf6')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
        />
      </div>
    );
  };

  // Helper to render interactive inline blanks for IELTS structured cards
  const renderBlankBadge = (qNum: number, defaultLabel?: string) => {
    const qIndex = qNum - 1;
    const targetQ = questions[qIndex];
    if (!targetQ) return <span>[{qNum}]</span>;
    const isActive = currentQuestionIndex === qIndex;
    const rawAns = answers[targetQ.id] || '';
    let displayText = rawAns;
    if (targetQ.type === 'MULTI_BLANK' && rawAns) {
      try {
        const parsed = JSON.parse(rawAns);
        displayText = `${parsed.blank1 || ''} & ${parsed.blank2 || ''}`;
      } catch {
        displayText = rawAns;
      }
    }

    return (
      <span
        onClick={() => setCurrentQuestionIndex(qIndex)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.2rem 0.6rem',
          margin: '0.1rem 0.25rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 700,
          border: isActive
            ? '2px solid #8b5cf6'
            : displayText
              ? '1px solid #10b981'
              : '1px dashed rgba(139, 92, 246, 0.45)',
          backgroundColor: isActive
            ? 'rgba(139, 92, 246, 0.35)'
            : displayText
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(255, 255, 255, 0.04)',
          color: isActive ? '#ffffff' : displayText ? '#34d399' : '#c4b5fd',
          boxShadow: isActive ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
          transition: 'all 0.15s ease',
          verticalAlign: 'middle',
        }}
        title={`Click to navigate to Question ${qNum}`}
      >
        <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>[{qNum}]</span>
        <span>{displayText || defaultLabel || '……………'}</span>
      </span>
    );
  };

  // Structured visual container for IELTS layouts (Table, Flowchart, Summary)
  const renderVisualContext = () => {
    const cardStyle: React.CSSProperties = {
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '12px',
      padding: '1.2rem',
      marginBottom: '1.35rem',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '0.65rem',
      marginBottom: '0.85rem',
      borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
      color: '#c4b5fd',
      fontSize: '0.88rem',
    };

    const tableStyle: React.CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.88rem',
    };

    const tdLabel: React.CSSProperties = {
      padding: '0.55rem 0.75rem',
      color: '#94a3b8',
      fontWeight: 600,
      width: '38%',
      verticalAlign: 'middle',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    };

    const tdVal: React.CSSProperties = {
      padding: '0.55rem 0.75rem',
      color: '#f8fafc',
      verticalAlign: 'middle',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    };

    // 1. Part 1: Table Completion (Q1–4: City Bank Customer Service Log)
    if (currentQuestionIndex >= 0 && currentQuestionIndex <= 3) {
      return (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
              📋 City Bank Customer Service Log
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Example: Type of query: <em>Term deposits</em>
            </span>
          </div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={tdLabel}>Customer name:</td>
                <td style={tdVal}>David {renderBlankBadge(1)}</td>
              </tr>
              <tr>
                <td style={tdLabel}>Phone:</td>
                <td style={tdVal}>023 - 561- 055</td>
              </tr>
              <tr>
                <td style={tdLabel}>D.O.B.:</td>
                <td style={tdVal}>18 / 02 / 1968</td>
              </tr>
              <tr>
                <td style={tdLabel} colSpan={2}>
                  <div style={{ fontWeight: 700, margin: '0.4rem 0 0.2rem', color: '#a78bfa' }}>
                    Customer’s Term Deposit details:
                  </div>
                  <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>Amount: $18,000</div>
                    <div>Term: {renderBlankBadge(2)}</div>
                    <div>Interest rate: 3.45% per annum</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={tdLabel} colSpan={2}>
                  <div style={{ fontWeight: 700, margin: '0.4rem 0 0.2rem', color: '#a78bfa' }}>
                    Current Term Deposit interest rates:
                  </div>
                  <div style={{ paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>1 year: 3.65% per annum</div>
                    <div>2 years: {renderBlankBadge(3)} % per annum</div>
                    <div>{renderBlankBadge(4)} Term Deposits (Minimum deposit: $20,000)</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // 2. Part 1: Table Completion (Q5–10: Term Deposit Options & Conditions)
    if (currentQuestionIndex >= 4 && currentQuestionIndex <= 9) {
      return (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
              📋 Term Deposit Options & Conditions
            </span>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              Questions 5–10
            </span>
          </div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={tdLabel}>{renderBlankBadge(5)} tax rate:</td>
                <td style={tdVal}>28%</td>
              </tr>
              <tr>
                <td style={tdLabel}>Investment returns:</td>
                <td style={tdVal}>Depend on {renderBlankBadge(6)}</td>
              </tr>
              <tr>
                <td style={tdLabel}>Term: 2 years</td>
                <td style={tdVal}>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#a78bfa' }}>
                    Effective rate of return:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      Salary $48,001 – $70,000: <strong>3.75% p.a.</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      Salary $70,001 – {renderBlankBadge(7)}: <strong>3.92% p.a.</strong>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={tdLabel}>Minimum investment amount:</td>
                <td style={tdVal}>$10,000</td>
              </tr>
              <tr>
                <td style={tdLabel}>Hidden charges/fees:</td>
                <td style={tdVal}>{renderBlankBadge(8)}</td>
              </tr>
              <tr>
                <td style={tdLabel}>Interest payment options:</td>
                <td style={tdVal}>monthly, {renderBlankBadge(9)}, 6-monthly, annually</td>
              </tr>
              <tr>
                <td style={tdLabel}>Application options:</td>
                <td style={tdVal}>online, {renderBlankBadge(10)}, in person</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // 3. Part 3: Flowchart Completion (Q21–24: Water Treatment System)
    if (currentQuestionIndex >= 20 && currentQuestionIndex <= 23) {
      const flowStepStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        backgroundColor: active ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
        border: `1.5px solid ${active ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
        transition: 'all 0.15s ease',
      });

      return (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
              🔄 Project Flowchart: Design a Water Treatment System
            </span>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              Questions 21–24
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={flowStepStyle(currentQuestionIndex === 20)}>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                STEP 1: Session Outline
              </div>
              <div style={{ color: '#f8fafc' }}>Go over {renderBlankBadge(21)}</div>
            </div>

            <div style={{ textAlign: 'center', color: '#8b5cf6', fontSize: '1.2rem', lineHeight: 1 }}>
              ↓
            </div>

            <div style={flowStepStyle(currentQuestionIndex === 21 || currentQuestionIndex === 22)}>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                STEP 2: Research Planning
              </div>
              <div style={{ color: '#f8fafc' }}>Think about research {renderBlankBadge(22)}</div>
              <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                <li>search online databases using good search terms</li>
                <li>consider the kind of research, e.g. {renderBlankBadge(23)} from other projects</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', color: '#8b5cf6', fontSize: '1.2rem', lineHeight: 1 }}>
              ↓
            </div>

            <div style={flowStepStyle(currentQuestionIndex === 23)}>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                STEP 3: Action Plan
              </div>
              <div style={{ color: '#f8fafc' }}>Develop an {renderBlankBadge(24)}</div>
            </div>
          </div>
        </div>
      );
    }

    // 4. Part 3: Summary Completion (Q25–27: Project Description)
    if (currentQuestionIndex >= 24 && currentQuestionIndex <= 26) {
      return (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
              📄 Summary: Project Description
            </span>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              Questions 25–27 (NO MORE THAN ONE WORD)
            </span>
          </div>
          <div style={{ lineHeight: 1.85, fontSize: '0.92rem', color: '#cbd5e1' }}>
            You need to design a grey-water treatment system to reduce the pressure on the water {renderBlankBadge(25)} in a Cameroon village. Grey-water is wastewater from household {renderBlankBadge(26)}. The system needs to treat this water to remove bacteria, and recycle it to use for purposes such as watering plants, flushing toilets and doing {renderBlankBadge(27)}.
          </div>
        </div>
      );
    }

    // 5. Part 4: Summary Completion (Q31–34: Origins of the Caveman Diet)
    if (currentQuestionIndex >= 30 && currentQuestionIndex <= 33) {
      return (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
              📄 Summary: Origins of the Caveman Diet
            </span>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              Questions 31–34 (NO MORE THAN TWO WORDS)
            </span>
          </div>
          <div style={{ lineHeight: 1.85, fontSize: '0.92rem', color: '#cbd5e1' }}>
            There are many popular fad diets nowadays. They all promise good health if you stick to the {renderBlankBadge(31)}. The Caveman diet is a popular example. This diet includes foods such as lean meat and fish that our forebears ate before we developed {renderBlankBadge(32)}. We need to find out what our ancestors did eat, so researchers are studying some existing hunter-gatherer tribes. These tribes typically like to eat meat but they can’t always get it, even though they are skilled with their weapons, e.g. {renderBlankBadge(33, 'bows & arrows')}. So, instead, they eat foods that their wives gather. They get only about a {renderBlankBadge(34)} of their energy from meat.
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="listening-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── AUDIO PLAYER BAR ────────────────────────────── */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#1a1033',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s',
            flexShrink: 0,
          }}
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause size={18} color="#fff" />
          ) : (
            <Play size={18} color="#fff" style={{ marginLeft: '2px' }} />
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Headphones size={14} color="#a78bfa" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
                {currentTrack?.trackTitle || 'Listening Audio'}
              </span>
              {currentTrack?.sectionTitle && (
                <Badge variant="neutral">{currentTrack.sectionTitle}</Badge>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              {formatAudioTime(audioProgress)} /{' '}
              {formatAudioTime(audioDuration || currentTrack?.durationSeconds || 0)}
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '3px',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              if (!audioRef.current || !audioDuration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = ratio * audioDuration;
            }}
          >
            <div
              style={{
                width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                borderRadius: '3px',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>

        <Volume2 size={16} color="#64748b" />

        {currentTrack?.trackUrl && (
          <audio
            ref={audioRef}
            src={
              currentTrack.trackUrl.includes('cdn.clasptek.com/audio/')
                ? `/audio/${currentTrack.trackUrl.split('/').pop()}`
                : currentTrack.trackUrl.startsWith('/') || currentTrack.trackUrl.startsWith('http')
                  ? currentTrack.trackUrl
                  : `/${currentTrack.trackUrl}`
            }
            preload="metadata"
          />
        )}
      </div>

      {/* ── QUESTIONS AREA ────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Question navigator sidebar */}
        <div
          className="listening-sidebar"
          style={{
            width: '80px',
            backgroundColor: '#0f0b1e',
            borderRight: '1px solid rgba(139, 92, 246, 0.15)',
            padding: '0.75rem 0.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            flexShrink: 0,
          }}
        >
          {questions.map((q, idx) => {
            const isActive = idx === currentQuestionIndex;
            const isAnswered = !!answers[q.id];

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: isActive ? '2px solid #8b5cf6' : '2px solid transparent',
                  backgroundColor: isActive
                    ? 'rgba(139, 92, 246, 0.15)'
                    : isAnswered
                      ? 'rgba(52, 211, 153, 0.1)'
                      : 'transparent',
                  color: isActive ? '#a78bfa' : isAnswered ? '#34d399' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minHeight: '36px',
                  transition: 'all 0.15s',
                }}
              >
                Q{idx + 1}
                {isAnswered && <Check size={10} style={{ marginLeft: '2px' }} />}
              </button>
            );
          })}
        </div>

        {/* Main question panel */}
        <div
          className="listening-question-panel"
          style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}
        >
          {/* Mobile horizontal question picker */}
          <div
            className="listening-mobile-picker"
            style={{
              display: 'none',
              overflowX: 'auto',
              gap: '0.4rem',
              paddingBottom: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {questions.map((q, idx) => {
              const isActive = idx === currentQuestionIndex;
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    flexShrink: 0,
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    border: isActive
                      ? '2px solid #8b5cf6'
                      : isAnswered
                        ? '1px solid #10b981'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: isActive
                      ? 'rgba(139, 92, 246, 0.25)'
                      : isAnswered
                        ? 'rgba(16, 185, 129, 0.15)'
                        : '#1e293b',
                    color: isActive ? '#a78bfa' : isAnswered ? '#34d399' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentQ && (
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {/* Group instructions */}
              {currentQ.group?.instructions && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    color: '#c4b5fd',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: '#a78bfa' }}>{currentQ.group.title}</strong>
                  <div style={{ marginTop: '0.35rem' }}>{currentQ.group.instructions}</div>
                </div>
              )}

              {/* IELTS Visual Context Card (Table, Flowchart, Summary) */}
              {renderVisualContext()}

              {/* Question header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    color: '#8b5cf6',
                    fontFamily: 'monospace',
                  }}
                >
                  {currentQuestionIndex + 1}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {currentQ.code}
                </span>
              </div>

              {/* Question text */}
              <div
                style={{
                  fontSize: '1.05rem',
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
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
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
                    Complete Listening ({answeredCount}/{questions.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 699px) {
          .listening-sidebar {
            display: none !important;
          }
          .listening-mobile-picker {
            display: flex !important;
          }
          .listening-question-panel {
            padding: 1rem !important;
          }
        }
        @media (min-width: 700px) {
          .listening-sidebar {
            display: flex !important;
          }
          .listening-mobile-picker {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
