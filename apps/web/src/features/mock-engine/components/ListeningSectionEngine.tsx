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
