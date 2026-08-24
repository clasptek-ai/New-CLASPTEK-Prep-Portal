'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Badge } from '../../../components/ui/ui-components';
import { Mic, Play, Square, RotateCcw, ChevronRight, Timer, MessageSquare } from 'lucide-react';

interface SpeakingQuestion {
  id: string;
  code: string;
  text: string;
  type: string;
  speaking?: {
    partNumber: number;
    topic?: string;
    prepTimeSeconds?: number;
    speakingTimeSeconds?: number;
    criteria?: { name: string; weight: number; bandRange: string }[];
  };
  group?: {
    code: string;
    title: string;
    instructions: string;
  };
}

interface Props {
  sessionId?: string;
  questions: SpeakingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: () => void;
  timeRemaining: number;
}

type RecordingState = 'IDLE' | 'PREP' | 'RECORDING' | 'REVIEW';

export function SpeakingSectionEngine({
  sessionId,
  questions,
  answers,
  onAnswer,
  onComplete,
  timeRemaining: _timeRemaining,
}: Props) {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
  const [prepTimer, setPrepTimer] = useState(0);
  const [recordTimer, setRecordTimer] = useState(0);
  const [, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[activePromptIndex];
  const partNumber = currentQ?.speaking?.partNumber || 1;
  const prepTime = currentQ?.speaking?.prepTimeSeconds || (partNumber === 2 ? 60 : 0);
  const speakTime = currentQ?.speaking?.speakingTimeSeconds || (partNumber === 2 ? 120 : 60);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Start preparation timer (Part 2)
  const startPrep = useCallback(() => {
    if (prepTime <= 0) {
      startRecording();
      return;
    }

    setRecordingState('PREP');
    setPrepTimer(prepTime);

    timerRef.current = setInterval(() => {
      setPrepTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [prepTime]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState('REVIEW');

        // Initial answer reference
        const localRef = `recording-${Date.now()}`;
        onAnswer(currentQ.id, localRef);

        // Upload to server-side persistence
        try {
          const formData = new FormData();
          formData.append('sessionId', sessionId || '00000000-0000-0000-0000-000000000001');
          formData.append('questionId', currentQ.id);
          formData.append('partNumber', String(partNumber));
          formData.append('durationSeconds', String(speakTime - (recordTimer || 0)));
          formData.append('audio', blob, `speaking-${currentQ.id}.webm`);

          const uploadRes = await fetch('/api/v1/mock/speaking/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData?.recording?.audio_url) {
            onAnswer(currentQ.id, uploadData.recording.audio_url);
          }
        } catch (uploadErr) {
          console.warn('Server recording upload fallback to local reference:', uploadErr);
        }

        // Stop tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(1000);
      setRecordingState('RECORDING');
      setRecordTimer(speakTime);

      timerRef.current = setInterval(() => {
        setRecordTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            recorder.stop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      // Fallback: allow text input
      setRecordingState('IDLE');
    }
  }, [speakTime, currentQ?.id, onAnswer]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reRecord = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState('IDLE');
    setRecordTimer(0);
    setPrepTimer(0);
  }, [audioUrl]);

  const togglePlayback = useCallback(() => {
    if (!playbackRef.current || !audioUrl) return;
    if (isPlayingBack) {
      playbackRef.current.pause();
      setIsPlayingBack(false);
    } else {
      playbackRef.current.src = audioUrl;
      playbackRef.current.play().catch(console.error);
      setIsPlayingBack(true);
    }
  }, [audioUrl, isPlayingBack]);

  const moveToNext = useCallback(() => {
    // Reset state for next question
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState('IDLE');
    setRecordTimer(0);
    setPrepTimer(0);

    if (activePromptIndex < questions.length - 1) {
      setActivePromptIndex((p) => p + 1);
    } else {
      onComplete();
    }
  }, [activePromptIndex, questions.length, onComplete, audioUrl]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const answeredCount = questions.filter((q) => answers[q.id]).length;

  const PART_LABELS: Record<number, string> = {
    1: 'Part 1 — Introduction & Interview',
    2: 'Part 2 — Individual Long Turn (Cue Card)',
    3: 'Part 3 — Two-Way Discussion',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 72px)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <audio ref={playbackRef} onEnded={() => setIsPlayingBack(false)} />

      {/* ── SPEAKING INTERFACE ──────────────────────── */}
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Part label */}
        <div
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#34d399',
            textAlign: 'center',
          }}
        >
          {PART_LABELS[partNumber] || `Part ${partNumber}`}
        </div>

        {/* Question counter */}
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
          {currentQ?.code} — Prompt {activePromptIndex + 1} of {questions.length}
        </div>

        {/* Prompt card */}
        <Card
          style={{
            width: '100%',
            padding: '2rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          {/* Group instructions */}
          {currentQ?.group?.instructions && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                color: '#6ee7b7',
                lineHeight: 1.6,
                textAlign: 'left',
              }}
            >
              {currentQ.group.instructions}
            </div>
          )}

          <MessageSquare size={28} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />

          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.8,
              textAlign: 'left',
            }}
          >
            {currentQ?.text}
          </div>

          {/* Part 2 topic hint */}
          {partNumber === 2 && currentQ?.speaking?.topic && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#fbbf24',
              }}
            >
              <strong>Topic:</strong> {currentQ.speaking.topic}
            </div>
          )}
        </Card>

        {/* ── RECORDING CONTROLS ──────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
          }}
        >
          {/* IDLE state */}
          {recordingState === 'IDLE' && (
            <button
              onClick={prepTime > 0 ? startPrep : startRecording}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              <Mic size={32} />
            </button>
          )}

          {/* PREP state (Part 2 countdown) */}
          {recordingState === 'PREP' && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: '#fbbf24',
                  fontFamily: 'monospace',
                }}
              >
                {formatTimer(prepTimer)}
              </div>
              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: '#fbbf24',
                  fontWeight: 600,
                }}
              >
                <Timer size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                Preparation Time — Think about your answer
              </div>
            </div>
          )}

          {/* RECORDING state */}
          {recordingState === 'RECORDING' && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={stopRecording}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(220, 38, 38, 0.4)',
                  animation: 'recordPulse 1.5s ease-in-out infinite',
                }}
              >
                <Square size={28} />
              </button>
              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#ef4444',
                  fontFamily: 'monospace',
                }}
              >
                {formatTimer(recordTimer)}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  marginTop: '0.25rem',
                  fontSize: '0.8rem',
                  color: '#fca5a5',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    animation: 'recordDot 1s ease-in-out infinite',
                  }}
                />
                Recording...
              </div>
            </div>
          )}

          {/* REVIEW state */}
          {recordingState === 'REVIEW' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  borderRadius: '12px',
                }}
              >
                <Badge variant="success">Recorded ✓</Badge>
                <button
                  onClick={togglePlayback}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'transparent',
                    color: '#34d399',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Play size={14} /> {isPlayingBack ? 'Playing...' : 'Play Back'}
                </button>
                <button
                  onClick={reRecord}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <RotateCcw size={14} /> Re-record
                </button>
              </div>
            </div>
          )}

          {/* Instruction text */}
          {recordingState === 'IDLE' && (
            <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
              {prepTime > 0
                ? `Tap the microphone to start. You will have ${prepTime}s to prepare, then ${speakTime}s to speak.`
                : `Tap the microphone to begin recording your answer.`}
            </div>
          )}
        </div>

        {/* ── NEXT PROMPT ────────────────────────── */}
        {recordingState === 'REVIEW' && (
          <button
            onClick={moveToNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background:
                activePromptIndex < questions.length - 1
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#ffffff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {activePromptIndex < questions.length - 1 ? (
              <>
                Next Prompt <ChevronRight size={16} />
              </>
            ) : (
              <>
                Complete Speaking ({answeredCount}/{questions.length})
              </>
            )}
          </button>
        )}

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {questions.map((q, idx) => {
            const isActive = idx === activePromptIndex;
            const isAnswered = !!answers[q.id];
            return (
              <div
                key={q.id}
                style={{
                  width: isActive ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? '#10b981' : isAnswered ? '#34d399' : '#1e293b',
                  transition: 'all 0.25s',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes recordPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 50px rgba(220, 38, 38, 0.6); }
        }
        @keyframes recordDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
