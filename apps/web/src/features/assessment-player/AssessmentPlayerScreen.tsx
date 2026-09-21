'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { BottomSheet } from '@/shared/ui/bottom-sheet/BottomSheet';
import { authFetch } from '@/lib/api-fetch';

export interface PlayerQuestion {
  id: string;
  versionId: string;
  code: string;
  order?: number;
  prompt: string;
  itemType:
    | 'MCQ'
    | 'MULTIPLE_CHOICE'
    | 'TFNG'
    | 'TRUE_FALSE_NOT_GIVEN'
    | 'YNNG'
    | 'YES_NO_NOT_GIVEN'
    | 'INPUT'
    | 'COMPLETION'
    | 'SENTENCE_COMPLETION'
    | 'SHORT_ANSWER'
    | 'SHORT_RESPONSE'
    | 'GAP_FILL'
    | 'FILL_IN_BLANK'
    | 'FILL_IN_THE_BLANK'
    | 'SUMMARY_COMPLETION'
    | 'TABLE_COMPLETION'
    | 'DIAGRAM_COMPLETION'
    | 'MATCHING'
    | 'MATCHING_HEADINGS'
    | 'MATCHING_INFORMATION'
    | 'MATCHING_FEATURES'
    | 'MATCHING_SENTENCE_ENDINGS'
    | 'ESSAY'
    | 'LETTER'
    | 'WRITING'
    | 'SPEAKING_PROMPT'
    | string;
  questionType?: string;
  options?: { code: string; text: string }[];
  passageTitle?: string;
  passageContent?: string;
  audioUrl?: string;
  cueCardPoints?: string[];
  sectionCode: string;
}

export interface PlayerSection {
  id: string;
  code: string;
  name: string;
  timeLimitMinutes: number;
  instructions: string;
  questions: PlayerQuestion[];
}

export interface AssessmentPlayerProps {
  assessmentId: string;
  title: string;
  examType: string;
  sections: PlayerSection[];
  attemptId: string;
  initialRemainingTime?: number;
  initialSavedAnswers?: Record<string, any>;
  status?: string;
  onComplete?: () => void;
}

export function AssessmentPlayerScreen({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  assessmentId,
  title,
  examType,
  sections,
  attemptId,
  initialRemainingTime,
  initialSavedAnswers,
  status,
  onComplete,
}: AssessmentPlayerProps) {
  const router = useRouter();

  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialSavedAnswers || {});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  // Check if attempt is already expired upon initialization
  const isInitiallyExpired =
    status === 'EXPIRED' ||
    status === 'SUBMITTED' ||
    (initialRemainingTime !== undefined && initialRemainingTime <= 0);

  const [isExpired, setIsExpired] = useState(isInitiallyExpired);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sectionStarted, setSectionStarted] = useState(!isInitiallyExpired);
  const [paletteOpenMobile, setPaletteOpenMobile] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'offline'>('saved');

  // Authoritative server-derived deadline timestamp
  const expiresAtMsRef = useRef(
    isInitiallyExpired
      ? Date.now()
      : initialRemainingTime !== undefined
        ? Date.now() + initialRemainingTime * 1000
        : Date.now() + (sections[0]?.timeLimitMinutes || 10) * 60 * 1000
  );

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (isInitiallyExpired) return 0;
    return Math.max(0, Math.ceil((expiresAtMsRef.current - Date.now()) / 1000));
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSubmittedRef = useRef(false);

  const currentSection = sections[currentSectionIdx] || sections[0];
  const currentQuestions = currentSection?.questions || [];
  const currentQuestion = currentQuestions[currentQuestionIdx];

  // Sync initialSavedAnswers on load
  useEffect(() => {
    if (initialSavedAnswers && Object.keys(initialSavedAnswers).length > 0) {
      setAnswers((prev) => ({ ...initialSavedAnswers, ...prev }));
    }
  }, [initialSavedAnswers]);

  // Idempotent final submission path
  const handleSubmitFinal = useCallback(async () => {
    if (hasAutoSubmittedRef.current && isSubmitting) return;
    hasAutoSubmittedRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Enqueue evaluations for subjective responses (Writing / Speaking)
      for (const [qId, ans] of Object.entries(answers)) {
        if (ans.textResponse || ans.audioRecordingUrl) {
          const isAudio = Boolean(ans.audioRecordingUrl);
          await authFetch('/api/v1/evaluations/enqueue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assessmentType: 'DIAGNOSTIC',
              sessionId: attemptId,
              responseId: qId,
              skill: isAudio ? 'Speaking' : 'Writing',
              examType,
              rawResponseReference: isAudio ? ans.audioRecordingUrl : ans.textResponse,
            }),
          }).catch(() => {});
        }
      }

      const res = await authFetch(
        `/api/v1/assessment-attempts/${encodeURIComponent(attemptId)}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examType }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        let msg = json.error || json.message || 'Assessment submission failed on server.';
        if (res.status === 401) msg = 'Your session has expired. Please log in again to submit.';
        else if (res.status === 403)
          msg = 'You are not authorized to submit this assessment attempt.';
        else if (res.status === 404 || res.status === 410) {
          // Already finalized or closed
          if (onComplete) onComplete();
          else router.push(`/student/results?attemptId=${encodeURIComponent(attemptId)}`);
          return;
        }
        throw new Error(msg);
      }

      if (onComplete) onComplete();
      else router.push(`/student/results?attemptId=${encodeURIComponent(attemptId)}`);
    } catch (err: any) {
      console.error('Assessment final submission error:', err);
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, attemptId, examType, onComplete, router, isSubmitting]);

  // Authoritative server-deadline countdown with visibility / drift compensation
  useEffect(() => {
    if (!sectionStarted || isExpired) return;

    const checkDeadline = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, expiresAtMsRef.current - now);
      const remainingSecs = Math.ceil(remainingMs / 1000);

      setSecondsRemaining(remainingSecs);

      // Trigger expiration exactly when zero is reached
      if (remainingSecs <= 0) {
        setIsExpired(true);
        setSecondsRemaining(0);
        setConfirmOpen(false);
        if (timerRef.current) clearInterval(timerRef.current);
        void handleSubmitFinal();
      }
    };

    // Immediate check
    checkDeadline();

    timerRef.current = setInterval(checkDeadline, 500);

    const handleVisibilityOrFocus = () => {
      checkDeadline();
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [sectionStarted, isExpired, handleSubmitFinal]);

  // Option selection with input lock guard
  function handleSelectOption(qId: string, optionCode: string) {
    if (isExpired) return; // Strict lock: mutations rejected after expiry
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOptionCode: optionCode, sectionCode: currentSection.name },
    }));
    autosaveResponse(qId, { selectedOptionCode: optionCode, sectionCode: currentSection.name });
  }

  // Text response with input lock guard
  function handleTextChange(qId: string, text: string) {
    if (isExpired) return; // Strict lock: mutations rejected after expiry
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], textResponse: text, sectionCode: currentSection.name },
    }));
    autosaveResponse(qId, { textResponse: text, sectionCode: currentSection.name });
  }

  async function autosaveResponse(qId: string, payload: any) {
    if (!currentQuestion || !attemptId || isExpired) return;
    setSaveState('saving');
    try {
      const res = await authFetch(
        `/api/v1/assessment-attempts/${encodeURIComponent(attemptId)}/answers`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            questionVersionId: currentQuestion.versionId,
            answer: payload,
            timeSpentMs: 5000,
          }),
        }
      );

      if (res.status === 403 || res.status === 410) {
        // Server rejected mutation because attempt is expired
        setIsExpired(true);
        setSaveState('offline');
        return;
      }

      setSaveState('saved');
    } catch {
      setSaveState('offline');
    }
  }

  function toggleFlag(qId: string) {
    if (isExpired) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }

  function handleNextSection() {
    if (isExpired) return;
    if (currentSectionIdx < sections.length - 1) {
      const nextIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(nextIdx);
      setCurrentQuestionIdx(0);
    } else {
      setConfirmOpen(true);
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Semantic Tokenized Timer Styles
  const getTimerStyles = () => {
    if (isExpired || secondsRemaining <= 0) {
      return 'bg-red-100 text-red-900 border-red-500 font-extrabold';
    } else if (secondsRemaining <= 60) {
      return 'bg-red-50 text-red-700 border-red-400 animate-pulse font-bold shadow-xs';
    } else if (secondsRemaining <= 300) {
      return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
    }
    return 'bg-(--surface-1) text-(--text-primary) border-(--border)';
  };

  const totalQuestionsAllSections = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredCountAll = Object.keys(answers).length;
  const progressPercent = Math.round(
    (answeredCountAll / Math.max(1, totalQuestionsAllSections)) * 100
  );

  const renderVisualBlocks = () => {
    const totalBlocks = 8;
    const filledBlocks = Math.round((progressPercent / 100) * totalBlocks);
    return '■'.repeat(filledBlocks) + '□'.repeat(totalBlocks - filledBlocks);
  };

  const renderQuestionMatrix = () => (
    <div className="grid grid-cols-5 gap-2">
      {currentQuestions.map((q, idx) => {
        const isCurrent = idx === currentQuestionIdx;
        const isAnswered = !!answers[q.id];
        const isFlagged = flagged.has(q.id);

        let bgClass =
          'bg-(--surface-1) border-(--border) text-(--text-secondary) hover:border-(--border-strong) hover:bg-(--surface-0)';
        if (isCurrent) {
          bgClass = 'bg-(--brand) border-(--brand) text-white font-bold shadow-xs';
        } else if (isAnswered) {
          bgClass = 'bg-(--brand-subtle) border-(--brand-border) text-(--brand) font-semibold';
        }
        if (isFlagged && !isCurrent) {
          bgClass = 'bg-amber-50 border-amber-300 text-amber-800';
        }

        return (
          <button
            key={q.id}
            disabled={isExpired}
            onClick={() => {
              if (isExpired) return;
              setCurrentQuestionIdx(idx);
              setPaletteOpenMobile(false);
            }}
            className={`min-h-11 h-10 rounded-xl border text-xs font-mono transition-all flex items-center justify-center relative touch-target disabled:opacity-50 disabled:cursor-not-allowed ${bgClass}`}
          >
            {idx + 1}
            {isFlagged && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
            )}
          </button>
        );
      })}
    </div>
  );

  // Initial Section Start Screen
  if (!sectionStarted && !isExpired) {
    return (
      <div className="min-h-screen bg-(--bg-app) flex items-center justify-center p-4">
        <div className="max-w-2xl w-full p-6 md:p-8 bg-(--surface-0) border border-(--border) rounded-2xl shadow-sm text-(--text-primary) space-y-6">
          <div className="flex justify-between items-center border-b border-(--border) pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-(--brand) tracking-wider">
                {examType} Diagnostic • Section {currentSectionIdx + 1} of {sections.length}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-(--text-primary) mt-1">
                {currentSection.name}
              </h1>
            </div>
            <div className="px-3 py-1 bg-(--surface-1) border border-(--border) rounded-full text-xs font-semibold text-(--text-secondary)">
              ⏱ {currentSection.timeLimitMinutes} mins
            </div>
          </div>

          <div className="bg-(--surface-1) p-6 rounded-xl border border-(--border) space-y-3">
            <h2 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">
              Section Instructions
            </h2>
            <p className="text-sm text-(--text-secondary) leading-relaxed">
              {currentSection.instructions}
            </p>
          </div>

          <button
            onClick={() => setSectionStarted(true)}
            className="w-full min-h-12 py-3.5 bg-(--brand) hover:bg-(--brand-hover) text-white font-bold rounded-xl text-base transition-colors shadow-sm"
          >
            Begin {currentSection.name} Section →
          </button>
        </div>
      </div>
    );
  }

  const hasReadingPassage = Boolean(currentQuestion?.passageContent);

  return (
    <div className="min-h-screen bg-(--bg-app) text-(--text-primary) flex flex-col font-sans">
      {/* Top Header Bar — Clasptek Light Theme */}
      <header className="px-4 md:px-6 py-3 bg-(--surface-0) border-b border-(--border) flex justify-between items-center sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <h1 className="text-xs md:text-sm font-bold text-(--text-primary) truncate max-w-36 sm:max-w-none">
            {title}
          </h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-(--brand-subtle) text-(--brand) border border-(--brand-border)">
            {currentSection.name}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Autosave Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-(--surface-1) border border-(--border) text-[11px] font-mono text-(--text-secondary)">
            {saveState === 'saving' && (
              <>
                <RefreshCw size={12} className="animate-spin text-(--brand)" />
                <span>Saving...</span>
              </>
            )}
            {saveState === 'saved' && (
              <>
                <Wifi size={12} className="text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Saved</span>
              </>
            )}
            {saveState === 'offline' && (
              <>
                <WifiOff size={12} className="text-red-500 animate-pulse" />
                <span className="text-red-600 font-semibold">Offline</span>
              </>
            )}
          </div>

          {/* Synchronized Countdown Timer */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${getTimerStyles()}`}
          >
            <Clock size={14} />
            <span>⏱ {formatTime(secondsRemaining)}</span>
          </div>

          {/* Mobile Palette Trigger */}
          <button
            onClick={() => setPaletteOpenMobile(true)}
            className="lg:hidden p-2 rounded-lg bg-(--surface-1) border border-(--border) text-(--text-secondary) hover:text-(--text-primary) min-h-11 touch-target"
            aria-label="Open Question Palette"
          >
            <Grid size={18} />
          </button>

          {/* Final Submit Button */}
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isExpired}
            className="hidden sm:inline-flex px-3.5 py-1.5 bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors min-h-10 items-center shadow-xs"
          >
            Submit Diagnostic
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto pb-24 md:pb-6">
        {/* Left / Primary Workspace Column */}
        <main className="lg:col-span-8 bg-(--surface-0) border border-(--border) rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xs">
          <div>
            {/* Top Question Bar */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-(--border)">
              <span className="text-xs font-bold text-(--text-muted) uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {currentQuestions.length}
              </span>
              <button
                onClick={() => currentQuestion && toggleFlag(currentQuestion.id)}
                disabled={isExpired}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center space-x-1.5 min-h-11 touch-target disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentQuestion && flagged.has(currentQuestion.id)
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-(--surface-1) border-(--border) text-(--text-secondary) hover:border-(--border-strong)'
                }`}
              >
                <Flag size={14} />
                <span>
                  {currentQuestion && flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                </span>
              </button>
            </div>

            {/* Split-Pane for Reading Passage + Dependent Question */}
            {hasReadingPassage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Left Pane: Reading Passage */}
                <div className="bg-(--surface-1) border border-(--border) rounded-xl p-4 md:p-5 max-h-[480px] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-(--border)">
                    <BookOpen size={16} className="text-(--brand)" />
                    <h4 className="text-xs font-bold text-(--brand) uppercase tracking-wide">
                      {currentQuestion?.passageTitle || 'Reading Passage'}
                    </h4>
                  </div>
                  <div className="text-xs md:text-sm text-(--text-primary) leading-relaxed whitespace-pre-line font-serif select-text">
                    {currentQuestion?.passageContent}
                  </div>
                </div>

                {/* Right Pane: Question & Interactive Answering */}
                <div
                  className="flex flex-col justify-between"
                  style={{
                    pointerEvents: isExpired ? 'none' : 'auto',
                    userSelect: isExpired ? 'none' : 'auto',
                    opacity: isExpired ? 0.6 : 1,
                  }}
                >
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-(--text-primary) mb-5 leading-relaxed">
                      {currentQuestion?.prompt}
                    </h2>
                    {renderQuestionItem()}
                  </div>
                </div>
              </div>
            ) : (
              /* Non-Reading Standard Flow */
              <div
                style={{
                  pointerEvents: isExpired ? 'none' : 'auto',
                  userSelect: isExpired ? 'none' : 'auto',
                  opacity: isExpired ? 0.6 : 1,
                }}
              >
                <h2 className="text-sm md:text-base font-semibold text-(--text-primary) mb-6 leading-relaxed">
                  {currentQuestion?.prompt}
                </h2>
                {renderQuestionItem()}
              </div>
            )}
          </div>

          {/* Desktop & Tablet Bottom Navigation Controls */}
          <div className="hidden md:flex justify-between items-center border-t border-(--border) pt-5 mt-6">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0 || isExpired}
              className="px-4 py-2.5 bg-(--surface-1) hover:bg-(--surface-2) border border-(--border) disabled:opacity-40 disabled:cursor-not-allowed text-(--text-primary) text-xs font-semibold rounded-xl transition-colors min-h-11 flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < currentQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                disabled={isExpired}
                className="px-5 py-2.5 bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors min-h-11 flex items-center space-x-2 shadow-xs"
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleNextSection}
                disabled={isExpired}
                className="px-5 py-2.5 bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors min-h-11 flex items-center space-x-2 shadow-xs"
              >
                <span>
                  {currentSectionIdx < sections.length - 1 ? 'Next Section' : 'Complete Diagnostic'}
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </main>

        {/* Right Side Panel: Question Matrix & Visual Progress */}
        <aside className="hidden lg:block lg:col-span-4 space-y-5">
          <div className="bg-(--surface-0) border border-(--border) rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-(--text-secondary) uppercase tracking-wide">
              {currentSection.name} Question Matrix
            </h3>
            {renderQuestionMatrix()}
          </div>

          <div className="bg-(--surface-0) border border-(--border) rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-(--text-muted) uppercase tracking-wide">
              Overall Progress
            </h4>
            <div className="font-mono text-sm font-bold text-(--brand) tracking-wider">
              {renderVisualBlocks()}{' '}
              <span className="text-xs text-(--text-primary)">({progressPercent}%)</span>
            </div>
            <div className="flex justify-between text-xs text-(--text-muted) font-mono">
              <span>Answered: {answeredCountAll}</span>
              <span>Total: {totalQuestionsAllSections}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Action Bar for Mobile (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--surface-0)/95 backdrop-blur-md border-t border-(--border) p-3 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIdx === 0 || isExpired}
          className="px-4 py-2 bg-(--surface-1) hover:bg-(--surface-2) border border-(--border) disabled:opacity-30 disabled:cursor-not-allowed text-(--text-primary) text-xs font-semibold rounded-xl min-h-11 flex items-center space-x-1"
        >
          <ArrowLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          onClick={() => setPaletteOpenMobile(true)}
          disabled={isExpired}
          className="px-3 py-2 bg-(--surface-1) border border-(--border) text-(--brand) text-xs font-mono font-bold rounded-xl min-h-11 flex items-center space-x-1 disabled:opacity-50"
        >
          <span>
            Q{currentQuestionIdx + 1}/{currentQuestions.length}
          </span>
          <Grid size={14} />
        </button>

        {currentQuestionIdx < currentQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
            disabled={isExpired}
            className="px-5 py-2 bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl min-h-11 flex items-center space-x-1 shadow-xs"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleNextSection}
            disabled={isExpired}
            className="px-4 py-2 bg-(--brand) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl min-h-11 flex items-center space-x-1 shadow-xs"
          >
            <span>Submit</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Mobile Native Bottom Sheet for Question Palette */}
      <BottomSheet
        isOpen={paletteOpenMobile}
        onClose={() => setPaletteOpenMobile(false)}
        title={`${currentSection.name} — Question Palette`}
      >
        <div className="space-y-4">
          {renderQuestionMatrix()}

          <div className="pt-3 border-t border-(--border) space-y-2">
            <div className="text-xs font-mono text-(--brand) font-bold">
              Progress: {renderVisualBlocks()} ({progressPercent}%)
            </div>
            <div className="flex justify-between text-xs text-(--text-muted) font-mono">
              <span>Answered: {answeredCountAll}</span>
              <span>Total Questions: {totalQuestionsAllSections}</span>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Manual Submission Modal */}
      {confirmOpen && !isExpired && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface-0) border border-(--border) rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-(--text-primary)">
            <h3 className="text-lg font-bold text-(--text-primary)">
              Submit Diagnostic Assessment?
            </h3>
            <p className="text-xs text-(--text-secondary) leading-relaxed">
              You have completed {answeredCountAll} of {totalQuestionsAllSections} questions.
              Submitting will finalize your responses and compute your placement diagnosis.
            </p>
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <span>⚠️ Submission Error</span>
                </div>
                <div>{submitError}</div>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-(--border)">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2.5 bg-(--surface-1) hover:bg-(--surface-2) border border-(--border) text-(--text-primary) text-xs font-semibold rounded-xl min-h-11"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-(--brand) hover:bg-(--brand-hover) text-white text-xs font-bold rounded-xl min-h-11 shadow-xs"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : submitError
                    ? 'Retry Submission'
                    : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strict Timeout & Auto-Submission Modal (Release Gate) */}
      {isExpired && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface-0) border-2 border-red-500 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-(--text-primary)">
              Examination Time Expired
            </h3>
            <p className="text-xs md:text-sm text-(--text-secondary) leading-relaxed">
              Your examination deadline has been reached. All responses saved prior to expiry have
              been preserved and your assessment is being finalized.
            </p>
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2 text-(--brand) font-semibold text-xs py-2">
                <RefreshCw size={16} className="animate-spin" />
                <span>Finalizing and scoring responses...</span>
              </div>
            ) : submitError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-left">
                <p className="font-bold">Submission notice:</p>
                <p>{submitError}</p>
                <button
                  onClick={handleSubmitFinal}
                  className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  Retry Submission
                </button>
              </div>
            ) : (
              <div className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1 py-1">
                <CheckCircle2 size={16} />
                <span>Assessment finalized. Transferring to results...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Helper renderer for all item types
  function renderQuestionItem() {
    if (!currentQuestion) {
      return (
        <div className="p-4 bg-(--surface-1) border border-(--border) rounded-xl text-(--text-muted) text-xs">
          No active question selected.
        </div>
      );
    }

    const rawType = (currentQuestion.itemType || currentQuestion.questionType || 'MCQ')
      .toString()
      .toUpperCase()
      .replace(/[\s-]/g, '_');

    const isTFNG =
      rawType === 'TRUE_FALSE_NOT_GIVEN' ||
      rawType === 'TFNG' ||
      (currentQuestion.prompt?.toUpperCase().includes('TRUE') &&
        currentQuestion.prompt?.toUpperCase().includes('FALSE') &&
        currentQuestion.prompt?.toUpperCase().includes('NOT GIVEN'));

    const isYNNG =
      rawType === 'YES_NO_NOT_GIVEN' ||
      rawType === 'YNNG' ||
      (currentQuestion.prompt?.toUpperCase().includes('YES') &&
        currentQuestion.prompt?.toUpperCase().includes('NO') &&
        currentQuestion.prompt?.toUpperCase().includes('NOT GIVEN'));

    const isInput =
      rawType === 'INPUT' ||
      rawType === 'COMPLETION' ||
      rawType === 'SENTENCE_COMPLETION' ||
      rawType === 'SHORT_ANSWER' ||
      rawType === 'SHORT_RESPONSE' ||
      rawType === 'GAP_FILL' ||
      rawType === 'FILL_IN_BLANK' ||
      rawType === 'FILL_IN_THE_BLANK' ||
      rawType === 'SUMMARY_COMPLETION' ||
      rawType === 'TABLE_COMPLETION' ||
      rawType === 'DIAGRAM_COMPLETION' ||
      (Array.isArray(currentQuestion.options) &&
        currentQuestion.options.length === 0 &&
        rawType !== 'ESSAY' &&
        rawType !== 'SPEAKING_PROMPT');

    const isMatching =
      rawType === 'MATCHING' ||
      rawType === 'MATCHING_HEADINGS' ||
      rawType === 'MATCHING_INFORMATION' ||
      rawType === 'MATCHING_FEATURES' ||
      rawType === 'MATCHING_SENTENCE_ENDINGS';

    const isWriting = rawType === 'ESSAY' || rawType === 'LETTER' || rawType === 'WRITING';

    const isSpeaking = rawType === 'SPEAKING_PROMPT' || rawType === 'SPEAKING';

    // ── 1. INPUT / COMPLETION / SHORT ANSWER ───────────────────────
    if (isInput) {
      const currentVal =
        answers[currentQuestion.id]?.textResponse ??
        answers[currentQuestion.id]?.text ??
        answers[currentQuestion.id]?.answer ??
        '';

      return (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-(--brand)">✏️ Type your answer below:</div>
          <div className="relative">
            <input
              type="text"
              disabled={isExpired}
              readOnly={isExpired}
              value={currentVal}
              onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
              onBlur={(e) =>
                autosaveResponse(currentQuestion.id, {
                  textResponse: e.target.value,
                  sectionCode: currentSection.name,
                })
              }
              placeholder="Type your completion answer here..."
              aria-label={`Answer for ${currentQuestion.code || 'question'}`}
              className="w-full bg-(--surface-0) border-2 border-(--border) hover:border-(--border-strong) focus:border-(--brand) rounded-xl p-4 text-sm md:text-base text-(--text-primary) placeholder-(--text-muted) focus:outline-none transition-colors font-mono disabled:bg-(--surface-1) disabled:cursor-not-allowed"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-(--text-muted)">
            <span>Answers are case-insensitive and autosaved.</span>
            {currentVal ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Answer entered
              </span>
            ) : (
              <span className="text-amber-700">Input required</span>
            )}
          </div>
        </div>
      );
    }

    // ── 2. TRUE / FALSE / NOT GIVEN ─────────────────────────────────
    if (isTFNG) {
      const tfngOptions =
        currentQuestion.options && currentQuestion.options.length >= 2
          ? currentQuestion.options
          : [
              { code: 'TRUE', text: 'TRUE' },
              { code: 'FALSE', text: 'FALSE' },
              { code: 'NOT_GIVEN', text: 'NOT GIVEN' },
            ];

      return (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-2">
            Select one answer:
          </div>
          {tfngOptions.map((opt) => {
            const selectedCode = (
              answers[currentQuestion.id]?.selectedOptionCode || ''
            ).toUpperCase();
            const isSelected =
              selectedCode === opt.code.toUpperCase() ||
              (selectedCode === 'A' && opt.code.toUpperCase() === 'TRUE') ||
              (selectedCode === 'B' && opt.code.toUpperCase() === 'FALSE') ||
              (selectedCode === 'C' && opt.code.toUpperCase() === 'NOT_GIVEN');

            return (
              <button
                key={opt.code}
                disabled={isExpired}
                onClick={() => handleSelectOption(currentQuestion.id, opt.code)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between min-h-12 touch-target disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-(--brand-subtle) border-(--brand) text-(--brand) font-semibold shadow-xs'
                    : 'bg-(--surface-0) border-(--border) text-(--text-primary) hover:border-(--border-strong) hover:bg-(--surface-1)'
                }`}
              >
                <span className="text-xs md:text-sm flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono ${
                      isSelected
                        ? 'border-(--brand) bg-(--brand) text-white font-bold'
                        : 'border-(--border) bg-(--surface-1) text-(--text-secondary)'
                    }`}
                  >
                    {opt.code.substring(0, 1)}
                  </span>
                  <span>{opt.text}</span>
                </span>
                {isSelected && <CheckCircle2 size={18} className="text-(--brand)" />}
              </button>
            );
          })}
        </div>
      );
    }

    // ── 3. YES / NO / NOT GIVEN ─────────────────────────────────────
    if (isYNNG) {
      const ynngOptions =
        currentQuestion.options && currentQuestion.options.length >= 2
          ? currentQuestion.options
          : [
              { code: 'YES', text: 'YES' },
              { code: 'NO', text: 'NO' },
              { code: 'NOT_GIVEN', text: 'NOT GIVEN' },
            ];

      return (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-2">
            Select one answer:
          </div>
          {ynngOptions.map((opt) => {
            const selectedCode = (
              answers[currentQuestion.id]?.selectedOptionCode || ''
            ).toUpperCase();
            const isSelected =
              selectedCode === opt.code.toUpperCase() ||
              (selectedCode === 'A' && opt.code.toUpperCase() === 'YES') ||
              (selectedCode === 'B' && opt.code.toUpperCase() === 'NO') ||
              (selectedCode === 'C' && opt.code.toUpperCase() === 'NOT_GIVEN');

            return (
              <button
                key={opt.code}
                disabled={isExpired}
                onClick={() => handleSelectOption(currentQuestion.id, opt.code)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between min-h-12 touch-target disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-(--brand-subtle) border-(--brand) text-(--brand) font-semibold shadow-xs'
                    : 'bg-(--surface-0) border-(--border) text-(--text-primary) hover:border-(--border-strong) hover:bg-(--surface-1)'
                }`}
              >
                <span className="text-xs md:text-sm flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono ${
                      isSelected
                        ? 'border-(--brand) bg-(--brand) text-white font-bold'
                        : 'border-(--border) bg-(--surface-1) text-(--text-secondary)'
                    }`}
                  >
                    {opt.code.substring(0, 1)}
                  </span>
                  <span>{opt.text}</span>
                </span>
                {isSelected && <CheckCircle2 size={18} className="text-(--brand)" />}
              </button>
            );
          })}
        </div>
      );
    }

    // ── 4. MATCHING ────────────────────────────────────────────────
    if (isMatching) {
      const matchingOptions = currentQuestion.options || [];
      if (matchingOptions.length >= 2) {
        return (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-(--brand) uppercase tracking-wider mb-2">
              Select corresponding match:
            </div>
            {matchingOptions.map((opt) => {
              const isSelected = answers[currentQuestion.id]?.selectedOptionCode === opt.code;
              return (
                <button
                  key={opt.code}
                  disabled={isExpired}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.code)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between min-h-12 touch-target disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-(--brand-subtle) border-(--brand) text-(--brand) font-semibold shadow-xs'
                      : 'bg-(--surface-0) border-(--border) text-(--text-primary) hover:border-(--border-strong) hover:bg-(--surface-1)'
                  }`}
                >
                  <span className="text-xs md:text-sm flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono ${
                        isSelected
                          ? 'border-(--brand) bg-(--brand) text-white font-bold'
                          : 'border-(--border) bg-(--surface-1) text-(--text-secondary)'
                      }`}
                    >
                      {opt.code}
                    </span>
                    <span>{opt.text}</span>
                  </span>
                  {isSelected && <CheckCircle2 size={18} className="text-(--brand)" />}
                </button>
              );
            })}
          </div>
        );
      }
    }

    // ── 5. MULTIPLE CHOICE (MCQ) ───────────────────────────────────
    if (currentQuestion.options && currentQuestion.options.length >= 2) {
      return (
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id]?.selectedOptionCode === opt.code;
            return (
              <button
                key={opt.code}
                disabled={isExpired}
                onClick={() => handleSelectOption(currentQuestion.id, opt.code)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between min-h-12 touch-target disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-(--brand-subtle) border-(--brand) text-(--brand) font-semibold shadow-xs'
                    : 'bg-(--surface-0) border-(--border) text-(--text-primary) hover:border-(--border-strong) hover:bg-(--surface-1)'
                }`}
              >
                <span className="text-xs md:text-sm flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono ${
                      isSelected
                        ? 'border-(--brand) bg-(--brand) text-white font-bold'
                        : 'border-(--border) bg-(--surface-1) text-(--text-secondary)'
                    }`}
                  >
                    {opt.code}
                  </span>
                  <span>{opt.text}</span>
                </span>
                {isSelected && <CheckCircle2 size={18} className="text-(--brand)" />}
              </button>
            );
          })}
        </div>
      );
    }

    // ── 6. ESSAY / WRITING TASK ────────────────────────────────────
    if (isWriting) {
      const textVal = answers[currentQuestion?.id || '']?.textResponse || '';
      const words = textVal.trim().split(/\s+/).filter(Boolean).length;

      return (
        <div className="space-y-2">
          <textarea
            rows={8}
            disabled={isExpired}
            readOnly={isExpired}
            value={textVal}
            onChange={(e) =>
              currentQuestion && handleTextChange(currentQuestion.id, e.target.value)
            }
            onBlur={(e) =>
              autosaveResponse(currentQuestion.id, {
                textResponse: e.target.value,
                sectionCode: currentSection.name,
              })
            }
            placeholder="Type your response here..."
            inputMode="text"
            enterKeyHint="enter"
            className="w-full bg-(--surface-0) border border-(--border) hover:border-(--border-strong) focus:border-(--brand) rounded-xl p-4 text-xs md:text-sm text-(--text-primary) placeholder-(--text-muted) focus:outline-none disabled:bg-(--surface-1) disabled:cursor-not-allowed leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-(--text-muted) font-mono">
            <span>Autosaves on change.</span>
            <span>
              Word Count: <strong className="text-(--text-primary)">{words}</strong>
            </span>
          </div>
        </div>
      );
    }

    // ── 7. SPEAKING PROMPT ─────────────────────────────────────────
    if (isSpeaking) {
      return (
        <div className="p-5 bg-(--surface-1) border border-(--border) rounded-xl text-center space-y-2">
          <p className="text-xs font-bold text-(--text-primary)">Speaking Audio Recorder</p>
          <p className="text-[11px] text-(--text-muted)">
            Record your oral response for diagnostic evaluation.
          </p>
        </div>
      );
    }

    // ── 8. STRUCTURED DIAGNOSTIC FAIL-SAFE RECOVERY ─────────────────
    return (
      <div className="space-y-3">
        <div className="text-xs font-semibold text-amber-800">✏️ Enter your answer:</div>
        <input
          type="text"
          disabled={isExpired}
          readOnly={isExpired}
          value={answers[currentQuestion.id]?.textResponse || ''}
          onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
          onBlur={(e) =>
            autosaveResponse(currentQuestion.id, {
              textResponse: e.target.value,
              sectionCode: currentSection.name,
            })
          }
          placeholder="Type your answer here..."
          className="w-full bg-(--surface-0) border border-(--border) rounded-xl p-4 text-xs md:text-sm text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--brand) font-mono disabled:bg-(--surface-1) disabled:cursor-not-allowed"
        />
      </div>
    );
  }
}
