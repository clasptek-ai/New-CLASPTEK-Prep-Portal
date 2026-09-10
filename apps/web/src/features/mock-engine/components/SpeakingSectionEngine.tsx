'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Badge } from '../../../components/ui/ui-components';
import {
  Mic,
  MicOff,
  Play,
  Square,
  RotateCcw,
  ChevronRight,
  Timer,
  MessageSquare,
} from 'lucide-react';

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

function getSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return undefined;
}

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
  const [microphoneUnavailable, setMicrophoneUnavailable] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [micErrorType, setMicErrorType] = useState<
    | 'PERMISSION_DENIED'
    | 'DEVICE_NOT_FOUND'
    | 'DEVICE_BUSY'
    | 'SECURITY_ERROR'
    | 'GENERIC_ERROR'
    | null
  >(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [prepTimer, setPrepTimer] = useState(0);
  const [recordTimer, setRecordTimer] = useState(0);
  const [, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Proactive check for mediaDevices / audio input support
  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function')
    ) {
      setMicrophoneUnavailable(true);
      setMicErrorType('DEVICE_NOT_FOUND');
      setMicErrorMessage('Microphone access is not supported in this browser environment.');
    }
  }, []);

  const currentQ = questions[activePromptIndex];
  const partNumber = currentQ?.speaking?.partNumber || 1;
  const prepTime = currentQ?.speaking?.prepTimeSeconds || (partNumber === 2 ? 60 : 0);
  const speakTime = currentQ?.speaking?.speakingTimeSeconds || (partNumber === 2 ? 120 : 60);

  // Cleanup timer and audio context on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
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

  // Start recording with robust device handling and audio analyser
  const startRecording = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setMicrophoneUnavailable(true);
      setMicErrorType('DEVICE_NOT_FOUND');
      setMicErrorMessage('Microphone access is not supported in this browser environment.');
      setRecordingState('IDLE');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneUnavailable(false);
      setMicErrorMessage(null);
      setMicErrorType(null);

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Audio level analyser for visual feedback
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.5;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const buffer = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
              sum += buffer[i];
            }
            const avg = sum / buffer.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch {
        // Fallback without visualizer
      }

      recorder.onstop = async () => {
        // Stop audio analyser
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        setAudioLevel(0);

        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState('REVIEW');

        // Initial answer reference
        const localRef = `recording-${Date.now()}`;
        onAnswer(currentQ.id, localRef);

        // Upload to server-side persistence
        try {
          const ext = mimeType?.includes('mp4')
            ? 'mp4'
            : mimeType?.includes('aac')
              ? 'aac'
              : 'webm';
          const formData = new FormData();
          formData.append('sessionId', sessionId || '00000000-0000-0000-0000-000000000001');
          formData.append('questionId', currentQ.id);
          formData.append('partNumber', String(partNumber));
          formData.append('durationSeconds', String(speakTime - (recordTimer || 0)));
          formData.append('audio', blob, `speaking-${currentQ.id}.${ext}`);

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
    } catch (err: unknown) {
      console.error('Microphone access error:', err);
      setMicrophoneUnavailable(true);
      const errorObj = err instanceof Error ? err : null;
      const name = errorObj?.name || '';
      const msg = errorObj?.message || String(err || '');

      if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        msg.includes('Permission denied') ||
        msg.includes('not allowed')
      ) {
        setMicErrorType('PERMISSION_DENIED');
        setMicErrorMessage(
          'Microphone permission was denied by the browser. Microphone access is required to record your IELTS Speaking responses.'
        );
      } else if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError' ||
        msg.includes('not found')
      ) {
        setMicErrorType('DEVICE_NOT_FOUND');
        setMicErrorMessage(
          'No microphone hardware detected. Please connect an external microphone or headset and click "Allow Microphone".'
        );
      } else if (
        name === 'NotReadableError' ||
        name === 'TrackStartError' ||
        msg.includes('could not start')
      ) {
        setMicErrorType('DEVICE_BUSY');
        setMicErrorMessage(
          'Microphone is currently in use by another application or operating system service. Close other apps and click "Retry Connection".'
        );
      } else if (name === 'SecurityError') {
        setMicErrorType('SECURITY_ERROR');
        setMicErrorMessage(
          'Microphone access was blocked by browser security policy. Please ensure the portal is loaded over HTTPS.'
        );
      } else {
        setMicErrorType('GENERIC_ERROR');
        setMicErrorMessage(
          `Unable to access microphone (${name || 'UnknownError'}): ${msg || 'Device unavailable'}. Please verify device permissions.`
        );
      }
      setRecordingState('IDLE');
    }
  }, [speakTime, currentQ?.id, onAnswer, sessionId, partNumber]);

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

  const requestMicrophonePermission = useCallback(async () => {
    setMicrophoneUnavailable(false);
    setMicErrorMessage(null);
    setMicErrorType(null);
    await startRecording();
  }, [startRecording]);

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
      className="speaking-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
      }}
    >
      <audio ref={playbackRef} onEnded={() => setIsPlayingBack(false)} />

      {/* ── SPEAKING INTERFACE ──────────────────────── */}
      <div
        className="speaking-interface-card"
        style={{
          maxWidth: '680px',
          width: '100%',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxSizing: 'border-box',
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

              {/* Live Audio Activity Meter */}
              <div
                style={{
                  marginTop: '0.75rem',
                  width: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(6, audioLevel)}%`,
                      height: '100%',
                      backgroundColor: audioLevel > 15 ? '#10b981' : '#ef4444',
                      borderRadius: '4px',
                      transition: 'width 0.08s ease-out, background-color 0.15s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: audioLevel > 12 ? '#34d399' : '#94a3b8',
                    fontWeight: audioLevel > 12 ? 600 : 400,
                  }}
                >
                  {audioLevel > 12 ? '● Voice detected' : 'Speak into your microphone...'}
                </span>
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
                <Badge variant="success">RECORDED ATTEMPT ✓</Badge>
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

        {/* ── NEXT PROMPT (Only accessible after recorded response) ── */}
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
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.15s',
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

        {/* ── ERROR BANNER & PERMISSION RETRY (MANDATORY ACCESS CONTROL) ── */}
        {recordingState === 'IDLE' && microphoneUnavailable && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              maxWidth: '560px',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '0.88rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'left',
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  color: '#ef4444',
                  fontSize: '0.95rem',
                }}
              >
                <MicOff size={20} />
                <span>Microphone Access Required</span>
              </div>
              <div>{micErrorMessage}</div>
              {micErrorType === 'PERMISSION_DENIED' && (
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#e2e8f0',
                  }}
                >
                  <strong>How to enable microphone in Chrome / Edge / Safari:</strong>
                  <ol style={{ margin: '0.35rem 0 0 1.25rem', padding: 0, lineHeight: 1.6 }}>
                    <li>Click the lock or site settings icon 🔒 next to the website URL.</li>
                    <li>
                      Toggle <strong>Microphone</strong> to <strong>Allow</strong>.
                    </li>
                    <li>
                      Click the <strong>[Allow Microphone]</strong> button below.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <button
              onClick={requestMicrophonePermission}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'transform 0.15s',
              }}
            >
              <Mic size={18} /> Allow Microphone / Retry Connection
            </button>
          </div>
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
