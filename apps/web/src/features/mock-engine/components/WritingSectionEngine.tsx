'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Pen,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface WritingQuestion {
  id: string;
  code: string;
  text: string;
  type: string;
  imageUrl?: string;
  group?: {
    code: string;
    title: string;
    instructions: string;
  };
}

interface Props {
  questions: WritingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: () => void;
  timeRemaining?: number;
}

/* -------------------------------------------------------------------------- */
/* UTILITIES                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Resolves high-resolution vector assets when available, with PNG fallback
 */
function resolveStimulusSource(url?: string): string | undefined {
  if (!url) return undefined;
  // If a PNG stimulus has an SVG counterpart in the stimuli library, prefer SVG for vector sharpness
  if (url.includes('/images/stimuli/') && url.endsWith('.png')) {
    return url.replace(/\.png$/, '.svg');
  }
  return url;
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT: STIMULUS LIGHTBOX MODAL                                         */
/* -------------------------------------------------------------------------- */

interface LightboxProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  title: string;
  onClose: () => void;
}

function StimulusLightbox({ src, fallbackSrc, alt, title, onClose }: LightboxProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imgSrc, setImgSrc] = useState(src);

  // Keyboard navigation: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} - Expanded View`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Lightbox Controls Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          padding: '0.65rem 1.25rem',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          color: '#f8fafc',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ImageIcon size={18} color="#f59e0b" />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>{title}</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            Zoom: {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75}
            title="Zoom Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              cursor: zoomLevel <= 0.75 ? 'not-allowed' : 'pointer',
              opacity: zoomLevel <= 0.75 ? 0.4 : 1,
            }}
          >
            <ZoomOut size={16} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom (100%)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5}
            title="Zoom In"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              cursor: zoomLevel >= 2.5 ? 'not-allowed' : 'pointer',
              opacity: zoomLevel >= 2.5 ? 0.4 : 1,
            }}
          >
            <ZoomIn size={16} />
          </button>

          <div
            style={{
              width: '1px',
              height: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              margin: '0 0.25rem',
            }}
          />

          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#dc2626',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Lightbox Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          maxHeight: 'calc(85vh - 70px)',
          overflow: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <img
          src={imgSrc}
          alt={alt}
          onError={() => {
            if (fallbackSrc && imgSrc !== fallbackSrc) {
              setImgSrc(fallbackSrc);
            }
          }}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN WRITING SECTION ENGINE                                                */
/* -------------------------------------------------------------------------- */

export function WritingSectionEngine({
  questions,
  answers,
  onAnswer,
  onComplete,
  timeRemaining: _timeRemaining,
}: Props) {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [roughNotes, setRoughNotes] = useState<Record<string, string>>({});
  const [mobileTab, setMobileTab] = useState<'PROMPT' | 'EDITOR'>('EDITOR');

  const currentTask = questions[activeTaskIndex];

  // Determine Task 1 vs Task 2
  const isTask1 = useMemo(() => {
    return (
      activeTaskIndex === 0 ||
      currentTask?.code?.includes('WRITE-001') ||
      currentTask?.type === 'WRITING_TASK_1'
    );
  }, [activeTaskIndex, currentTask]);

  const minWords = isTask1 ? 150 : 250;
  const taskLabel = isTask1 ? 'Task 1' : 'Task 2';
  const taskTimeRecommendation = isTask1 ? 'about 20 minutes' : 'about 40 minutes';

  // Answers & Word Count
  const currentText = answers[currentTask?.id] || '';
  const wordCount = useMemo(() => countWords(currentText), [currentText]);
  const isMinimumMet = wordCount >= minWords;

  // Stimulus URLs
  const rawImageUrl = currentTask?.imageUrl;
  const preferredStimulusUrl = useMemo(() => resolveStimulusSource(rawImageUrl), [rawImageUrl]);
  const [activeImgUrl, setActiveImgUrl] = useState<string | undefined>(preferredStimulusUrl);

  useEffect(() => {
    setActiveImgUrl(preferredStimulusUrl);
  }, [preferredStimulusUrl]);

  // Rough notes handler for Task 2
  const currentNote = roughNotes[currentTask?.id] || '';
  const handleNoteChange = (val: string) => {
    if (!currentTask?.id) return;
    setRoughNotes((prev) => ({ ...prev, [currentTask.id]: val }));
  };

  return (
    <div
      className="writing-engine-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── 1. SECONDARY TASK NAVIGATION BAR ───────────────────── */}
      <nav
        aria-label="IELTS Writing Tasks"
        className="writing-task-navbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.25rem',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          flexShrink: 0,
          gap: '1rem',
          minHeight: '48px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Active Module & Task Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#f59e0b',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            <Pen size={15} color="#f59e0b" />
            <span>IELTS Writing</span>
          </div>

          <div
            style={{
              width: '1px',
              height: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
            }}
          />

          {/* Task 1 / Task 2 Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {questions.map((q, idx) => {
              const isActive = idx === activeTaskIndex;
              const qText = answers[q.id] || '';
              const qWords = countWords(qText);
              const qMin = idx === 0 ? 150 : 250;
              const qMet = qWords >= qMin;
              const hasStarted = qWords > 0;
              const label = idx === 0 ? 'Task 1' : 'Task 2';

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveTaskIndex(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: isActive
                      ? '1.5px solid #f59e0b'
                      : '1.5px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: isActive
                      ? 'rgba(245, 158, 11, 0.16)'
                      : hasStarted
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'transparent',
                    color: isActive ? '#fbbf24' : '#94a3b8',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span>{label}</span>
                  {qMet ? (
                    <span title="Minimum met">
                      <CheckCircle2 size={13} color="#10b981" />
                    </span>
                  ) : hasStarted ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                      }}
                    >
                      {qWords}w
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Minimum word guide & Task 2 Notes toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isTask1 && (
            <button
              type="button"
              onClick={() => setNotesOpen((o) => !o)}
              title="Toggle rough essay scratchpad"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: notesOpen
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: notesOpen
                  ? '1px solid #3b82f6'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                color: notesOpen ? '#60a5fa' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FileText size={13} />
              <span>{notesOpen ? 'Hide Notes' : 'Rough Notes'}</span>
            </button>
          )}

          <div
            style={{
              fontSize: '0.75rem',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Clock size={13} color="#94a3b8" />
            <span>Recommended: {taskTimeRecommendation}</span>
          </div>
        </div>
      </nav>

      {/* ── 2. MOBILE VIEW TOGGLE (Only on screens < 900px) ───── */}
      <div
        className="writing-mobile-toggle"
        style={{
          display: 'none',
          padding: '0.45rem 0.75rem',
          backgroundColor: '#0c1322',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('PROMPT')}
          style={{
            flex: 1,
            minHeight: '40px',
            borderRadius: '8px',
            border:
              mobileTab === 'PROMPT'
                ? '1.5px solid #f59e0b'
                : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor:
              mobileTab === 'PROMPT' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            color: mobileTab === 'PROMPT' ? '#fbbf24' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
        >
          <span>📋 {taskLabel} Prompt & Stimulus</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('EDITOR')}
          style={{
            flex: 1,
            minHeight: '40px',
            borderRadius: '8px',
            border:
              mobileTab === 'EDITOR'
                ? '1.5px solid #f59e0b'
                : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor:
              mobileTab === 'EDITOR' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
            color: mobileTab === 'EDITOR' ? '#fbbf24' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
        >
          <span>✍️ Response ({wordCount} words)</span>
        </button>
      </div>

      {/* ── 3. MAIN EXAMINATION WORKSPACE ───────────────────────── */}
      <div
        className={`writing-workspace-grid ${isTask1 ? 'layout-task1' : 'layout-task2'}`}
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* ── LEFT PANEL: QUESTION & STIMULUS ──────────────────── */}
        <section
          aria-label={`${taskLabel} Prompt and Instructions`}
          className="writing-panel-stimulus"
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0c1322',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              padding: isTask1 ? '1.5rem 1.75rem' : '2rem 2.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxWidth: isTask1 ? '100%' : '900px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Standard IELTS Task Header Banner */}
            <div
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '1rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#f59e0b',
                  marginBottom: '0.35rem',
                }}
              >
                <span>IELTS ACADEMIC WRITING</span>
                <span>•</span>
                <span>{taskLabel.toUpperCase()}</span>
              </div>

              <h1
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Writing {taskLabel}
              </h1>

              {/* Standard Timing & Word Count Instructions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  marginTop: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                }}
              >
                <span>
                  You should spend <strong>{taskTimeRecommendation}</strong> on this task.
                </span>
                <span>•</span>
                <span>
                  Write at least <strong style={{ color: '#f8fafc' }}>{minWords} words</strong>.
                </span>
              </div>
            </div>

            {/* Task Prompt Box */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '8px',
                padding: '1.15rem 1.35rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#fbbf24',
                  marginBottom: '0.45rem',
                }}
              >
                Task Instruction & Topic
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#f1f5f9',
                  lineHeight: 1.75,
                }}
              >
                {currentTask?.text || 'No question prompt text available.'}
              </div>

              {/* Group/Additional Instructions */}
              {currentTask?.group?.instructions && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.85rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                  }}
                >
                  {currentTask.group.instructions}
                </div>
              )}
            </div>

            {/* ── TASK 1: PRIMARY VISUAL STIMULUS ──────────────── */}
            {isTask1 && rawImageUrl && (
              <div
                className="stimulus-container"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                  overflow: 'hidden',
                }}
              >
                {/* Stimulus Subheader Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.85rem',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <ImageIcon size={15} color="#f59e0b" />
                    <span>Visual Stimulus — {currentTask?.group?.title || 'Diagram'}</span>
                  </div>

                  {/* Expand / Lightbox Button */}
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    title="Expand stimulus in high resolution"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <Maximize2 size={12} />
                    <span>Expand Stimulus</span>
                  </button>
                </div>

                {/* The Primary Image Display */}
                <div
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'zoom-in',
                    backgroundColor: '#ffffff',
                  }}
                  onClick={() => setLightboxOpen(true)}
                  title="Click to expand diagram"
                >
                  <img
                    src={activeImgUrl || rawImageUrl}
                    alt={`IELTS Writing ${taskLabel} diagram`}
                    onError={() => {
                      if (activeImgUrl !== rawImageUrl) {
                        setActiveImgUrl(rawImageUrl);
                      }
                    }}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: 'calc(100vh - 340px)',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            )}

            {/* ── TASK 2: OPTIONAL ESSAY ROUGH NOTES SCRATCHPAD ──── */}
            {!isTask1 && notesOpen && (
              <div
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#111827',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
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
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    📝 Rough Notes & Outline (Optional)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Notes are not evaluated
                  </span>
                </div>
                <textarea
                  value={currentNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Jot down thesis, body paragraph points, or examples here..."
                  rows={4}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0f19',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT PANEL: RESPONSE EDITOR ─────────────────────── */}
        <section
          aria-label={`${taskLabel} Response Editor`}
          className="writing-panel-editor"
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0e1526',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Editor Header Toolbar */}
          <div
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: '#0f172a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                Your Response — {taskLabel}
              </span>
            </div>

            {/* Word Count Pill with Strict Minimum Terminology */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                role="status"
                aria-live="polite"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  backgroundColor: isMinimumMet
                    ? 'rgba(16, 185, 129, 0.15)'
                    : wordCount > 0
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border: isMinimumMet
                    ? '1.5px solid rgba(16, 185, 129, 0.35)'
                    : wordCount > 0
                      ? '1.5px solid rgba(245, 158, 11, 0.35)'
                      : '1.5px solid rgba(255, 255, 255, 0.1)',
                  color: isMinimumMet ? '#34d399' : wordCount > 0 ? '#fbbf24' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                }}
              >
                {isMinimumMet ? (
                  <>
                    <CheckCircle2 size={14} color="#34d399" />
                    <span>
                      {wordCount} words · Minimum met <strong style={{ color: '#ffffff' }}>✓</strong>
                    </span>
                  </>
                ) : (
                  <>
                    {wordCount > 0 && <AlertCircle size={14} color="#f59e0b" />}
                    <span>
                      {wordCount} words · Minimum {minWords}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Usable Writing Textarea */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              minHeight: 0,
              position: 'relative',
            }}
          >
            <textarea
              value={currentText}
              onChange={(e) => onAnswer(currentTask.id, e.target.value)}
              placeholder={`Begin typing your ${taskLabel} response here...\n\nEnsure your essay addresses all parts of the task instruction. Write at least ${minWords} words.`}
              aria-label={`Type your ${taskLabel} answer here`}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                backgroundColor: '#0c1220',
                border: 'none',
                padding: '1.5rem 2rem',
                color: '#f8fafc',
                fontSize: '1.05rem',
                lineHeight: 1.85,
                fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                resize: 'none',
                boxSizing: 'border-box',
                outline: 'none',
                overflowY: 'auto',
              }}
            />
          </div>

          {/* Bottom Task Navigation & Progress Bar */}
          <div
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: '#0f172a',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              gap: '1rem',
            }}
          >
            {/* Word count progress indicator */}
            <div style={{ flex: 1, maxWidth: '300px' }}>
              <div
                style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (wordCount / minWords) * 100)}%`,
                    height: '100%',
                    backgroundColor: isMinimumMet ? '#10b981' : '#f59e0b',
                    transition: 'width 0.25s ease-out, background-color 0.25s ease-out',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>

            {/* Task Switching Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {activeTaskIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTaskIndex((p) => p - 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>← Task 1</span>
                </button>
              )}

              {activeTaskIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveTaskIndex((p) => p + 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span>Task 2 →</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onComplete}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span>Complete Writing Section</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. STIMULUS LIGHTBOX MODAL ─────────────────────────── */}
      {lightboxOpen && rawImageUrl && (
        <StimulusLightbox
          src={activeImgUrl || rawImageUrl}
          fallbackSrc={rawImageUrl}
          alt={`IELTS Writing ${taskLabel} diagram`}
          title={`Visual Stimulus — Writing ${taskLabel}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ── 5. RESPONSIVE CSS STYLES ───────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Mobile / Small Tablet View (< 900px) */
        @media (max-width: 899px) {
          .writing-mobile-toggle {
            display: flex !important;
          }
          .writing-panel-stimulus {
            width: 100% !important;
            flex: 1 1 100% !important;
            display: ${mobileTab === 'PROMPT' ? 'flex !important' : 'none !important'};
            border-right: none !important;
          }
          .writing-panel-editor {
            width: 100% !important;
            flex: 1 1 100% !important;
            display: ${mobileTab === 'EDITOR' ? 'flex !important' : 'none !important'};
          }
        }

        /* Desktop & Large Tablet (>= 900px) */
        @media (min-width: 900px) {
          .writing-mobile-toggle {
            display: none !important;
          }
          /* Task 1: 45% Stimulus / 55% Response split */
          .layout-task1 .writing-panel-stimulus {
            width: 45% !important;
            flex: 0 0 45% !important;
            display: flex !important;
            max-width: 48% !important;
          }
          .layout-task1 .writing-panel-editor {
            width: 55% !important;
            flex: 1 1 55% !important;
            display: flex !important;
          }

          /* Task 2: 36% Question Guidance / 64% Expansive Editor split */
          .layout-task2 .writing-panel-stimulus {
            width: 36% !important;
            flex: 0 0 36% !important;
            display: flex !important;
            max-width: 40% !important;
          }
          .layout-task2 .writing-panel-editor {
            width: 64% !important;
            flex: 1 1 64% !important;
            display: flex !important;
          }
        }

        /* Large Desktop (>= 1440px) */
        @media (min-width: 1440px) {
          .layout-task1 .writing-panel-stimulus {
            width: 46% !important;
            flex: 0 0 46% !important;
          }
          .layout-task1 .writing-panel-editor {
            width: 54% !important;
            flex: 1 1 54% !important;
          }
        }
      `}</style>
    </div>
  );
}
