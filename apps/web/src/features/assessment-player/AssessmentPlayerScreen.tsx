'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { BottomSheet } from '@/shared/ui/bottom-sheet/BottomSheet';
import { authFetch } from '@/lib/api-fetch';

export interface PlayerQuestion {
  id: string;
  versionId: string;
  code: string;
  prompt: string;
  itemType:
    'MCQ' | 'FILL_IN_BLANK' | 'ESSAY' | 'SPEAKING_PROMPT' | 'MATCHING' | 'TRUE_FALSE_NOT_GIVEN';
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
  onComplete,
}: AssessmentPlayerProps) {
  const router = useRouter();

  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialSavedAnswers || {});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState(
    initialRemainingTime !== undefined
      ? initialRemainingTime
      : (sections[0]?.timeLimitMinutes || 10) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sectionStarted, setSectionStarted] = useState(true);
  const [paletteOpenMobile, setPaletteOpenMobile] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'offline'>('saved');

  const currentSection = sections[currentSectionIdx] || sections[0];
  const currentQuestions = currentSection?.questions || [];
  const currentQuestion = currentQuestions[currentQuestionIdx];

  // Sync initialSavedAnswers on load
  useEffect(() => {
    if (initialSavedAnswers && Object.keys(initialSavedAnswers).length > 0) {
      setAnswers((prev) => ({ ...initialSavedAnswers, ...prev }));
    }
  }, [initialSavedAnswers]);

  // Server-authoritative timer countdown
  useEffect(() => {
    if (!sectionStarted) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sectionStarted]);

  function handleSelectOption(qId: string, optionCode: string) {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOptionCode: optionCode, sectionCode: currentSection.name },
    }));
    autosaveResponse(qId, { selectedOptionCode: optionCode, sectionCode: currentSection.name });
  }

  function handleTextChange(qId: string, text: string) {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], textResponse: text, sectionCode: currentSection.name },
    }));
    autosaveResponse(qId, { textResponse: text, sectionCode: currentSection.name });
  }

  async function autosaveResponse(qId: string, payload: any) {
    if (!currentQuestion || !attemptId) return;
    setSaveState('saving');
    try {
      await authFetch(`/api/v1/assessment-attempts/${encodeURIComponent(attemptId)}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionVersionId: currentQuestion.versionId,
          answer: payload,
          timeSpentMs: 5000,
        }),
      });
      setSaveState('saved');
    } catch {
      setSaveState('offline');
    }
  }

  function toggleFlag(qId: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }

  function handleNextSection() {
    if (currentSectionIdx < sections.length - 1) {
      const nextIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(nextIdx);
      setCurrentQuestionIdx(0);
    } else {
      setConfirmOpen(true);
    }
  }

  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmitFinal() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
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
        else if (res.status === 404) msg = 'Assessment attempt not found or already closed.';
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
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTimerStyles = () => {
    if (secondsRemaining <= 60) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse font-extrabold shadow-lg shadow-rose-500/20';
    } else if (secondsRemaining <= 300) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/40';
    } else if (secondsRemaining <= 600) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/40';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
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

        let bgClass = 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700';
        if (isCurrent) bgClass = 'bg-sky-500 border-sky-400 text-slate-950 font-bold';
        else if (isAnswered) bgClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
        if (isFlagged && !isCurrent) bgClass = 'bg-amber-500/20 border-amber-500/40 text-amber-400';

        return (
          <button
            key={q.id}
            onClick={() => {
              setCurrentQuestionIdx(idx);
              setPaletteOpenMobile(false);
            }}
            className={`min-h-11 h-10 rounded-xl border text-xs font-mono transition-all flex items-center justify-center relative touch-target ${bgClass}`}
          >
            {idx + 1}
            {isFlagged && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
            )}
          </button>
        );
      })}
    </div>
  );

  if (!sectionStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
              {examType} Diagnostic • Section {currentSectionIdx + 1} of {sections.length}
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">{currentSection.name}</h1>
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
            ⏱ {currentSection.timeLimitMinutes} mins
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Section Instructions
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">{currentSection.instructions}</p>
        </div>

        <button
          onClick={() => setSectionStarted(true)}
          className="w-full min-h-12 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-base transition-colors shadow-lg shadow-sky-500/20"
        >
          Begin {currentSection.name} Section →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-slate-950 min-h-screen text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="px-4 md:px-6 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <h1 className="text-xs md:text-sm font-bold text-white truncate max-w-35 sm:max-w-none">
            {title}
          </h1>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {currentSection.name}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            {saveState === 'saving' && (
              <>
                <RefreshCw size={12} className="animate-spin text-sky-400" />
                <span>Saving...</span>
              </>
            )}
            {saveState === 'saved' && (
              <>
                <Wifi size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Saved</span>
              </>
            )}
            {saveState === 'offline' && (
              <>
                <WifiOff size={12} className="text-rose-400 animate-pulse" />
                <span className="text-rose-400 font-semibold">Offline</span>
              </>
            )}
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${getTimerStyles()}`}
          >
            <Clock size={14} />
            <span>⏱ {formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setPaletteOpenMobile(true)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white min-h-11 touch-target"
            aria-label="Open Question Palette"
          >
            <Grid size={18} />
          </button>

          <button
            onClick={() => setConfirmOpen(true)}
            className="hidden sm:inline-flex px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors min-h-10 items-center"
          >
            Submit Diagnostic
          </button>
        </div>
      </header>

      {/* Main Single-Component Layout */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto pb-24 md:pb-6">
        {/* Left / Primary Column: Question Container */}
        <main className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-lg">
          <div>
            {/* Top Question Header Bar */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {currentQuestions.length}
              </span>
              <button
                onClick={() => currentQuestion && toggleFlag(currentQuestion.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center space-x-1.5 min-h-11 touch-target ${
                  currentQuestion && flagged.has(currentQuestion.id)
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Flag size={14} />
                <span>
                  {currentQuestion && flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                </span>
              </button>
            </div>

            {/* Passage Content (if present) */}
            {currentQuestion?.passageContent && (
              <div className="mb-5 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wide mb-2">
                  📖 {currentQuestion.passageTitle || 'Reading Passage'}
                </h4>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentQuestion.passageContent}
                </p>
              </div>
            )}

            {/* Question Prompt */}
            <h2 className="text-sm md:text-base font-semibold text-white mb-6 leading-relaxed">
              {currentQuestion?.prompt}
            </h2>

            {/* Explicit Fail-Safe Item Renderer Switch */}
            {(() => {
              switch (currentQuestion?.itemType) {
                case 'MCQ':
                  return (
                    <div className="space-y-3">
                      {(currentQuestion.options || []).map((opt) => {
                        const isSelected =
                          answers[currentQuestion.id]?.selectedOptionCode === opt.code;
                        return (
                          <button
                            key={opt.code}
                            onClick={() => handleSelectOption(currentQuestion.id, opt.code)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between min-h-12 touch-target ${
                              isSelected
                                ? 'bg-sky-500/10 border-sky-500 text-white font-medium shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs md:text-sm flex items-center space-x-3">
                              <span className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-xs font-mono">
                                {opt.code}
                              </span>
                              <span>{opt.text}</span>
                            </span>
                            {isSelected && <CheckCircle2 size={18} className="text-sky-400" />}
                          </button>
                        );
                      })}
                    </div>
                  );

                case 'TRUE_FALSE_NOT_GIVEN':
                  return (
                    <div className="space-y-3">
                      {[
                        { code: 'A', text: 'True' },
                        { code: 'B', text: 'False' },
                        { code: 'C', text: 'Not Given' },
                      ].map((opt) => {
                        const isSelected =
                          answers[currentQuestion?.id || '']?.selectedOptionCode === opt.code;
                        return (
                          <button
                            key={opt.code}
                            onClick={() =>
                              currentQuestion && handleSelectOption(currentQuestion.id, opt.code)
                            }
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between min-h-12 touch-target ${
                              isSelected
                                ? 'bg-sky-500/10 border-sky-500 text-white font-medium shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs md:text-sm flex items-center space-x-3">
                              <span className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-xs font-mono">
                                {opt.code}
                              </span>
                              <span>{opt.text}</span>
                            </span>
                            {isSelected && <CheckCircle2 size={18} className="text-sky-400" />}
                          </button>
                        );
                      })}
                    </div>
                  );

                case 'FILL_IN_BLANK':
                  return (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={answers[currentQuestion?.id || '']?.textResponse || ''}
                        onChange={(e) =>
                          currentQuestion && handleTextChange(currentQuestion.id, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  );

                case 'ESSAY':
                  return (
                    <div className="space-y-2">
                      <textarea
                        rows={8}
                        value={answers[currentQuestion?.id || '']?.textResponse || ''}
                        onChange={(e) =>
                          currentQuestion && handleTextChange(currentQuestion.id, e.target.value)
                        }
                        placeholder="Type your response here..."
                        inputMode="text"
                        enterKeyHint="enter"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs md:text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                      />
                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        Word Count:{' '}
                        {
                          (answers[currentQuestion?.id || '']?.textResponse || '')
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean).length
                        }
                      </div>
                    </div>
                  );

                case 'SPEAKING_PROMPT':
                  return (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
                      <p className="text-xs text-slate-300">Speaking Audio Recorder</p>
                      <p className="text-[11px] text-slate-400">
                        Record your oral response for evaluation.
                      </p>
                    </div>
                  );

                default:
                  return (
                    <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs font-mono">
                      ⚠️ Unsupported Question Item Type:{' '}
                      <strong>{String(currentQuestion?.itemType || 'UNKNOWN')}</strong>
                    </div>
                  );
              }
            })()}
          </div>

          {/* Desktop & Tablet Bottom Navigation Controls */}
          <div className="hidden md:flex justify-between items-center border-t border-slate-800 pt-5 mt-6">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl transition-colors min-h-11 flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < currentQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-colors min-h-11 flex items-center space-x-2 shadow-md shadow-sky-500/20"
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleNextSection}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors min-h-11 flex items-center space-x-2 shadow-md shadow-emerald-500/20"
              >
                <span>Complete Section</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </main>

        {/* Right Side Panel: Question Matrix & Visual Progress */}
        <aside className="hidden lg:block lg:col-span-4 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {currentSection.name} Question Matrix
            </h3>
            {renderQuestionMatrix()}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Overall Progress
            </h4>
            <div className="font-mono text-sm font-bold text-sky-400 tracking-wider">
              {renderVisualBlocks()}{' '}
              <span className="text-xs text-white">({progressPercent}%)</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Answered: {answeredCountAll}</span>
              <span>Total: {totalQuestionsAllSections}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Action Bar for Mobile (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex items-center justify-between shadow-2xl">
        <button
          onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIdx === 0}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold rounded-xl min-h-11 flex items-center space-x-1"
        >
          <ArrowLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          onClick={() => setPaletteOpenMobile(true)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 text-sky-400 text-xs font-mono font-bold rounded-xl min-h-11 flex items-center space-x-1"
        >
          <span>
            Q{currentQuestionIdx + 1}/{currentQuestions.length}
          </span>
          <Grid size={14} />
        </button>

        {currentQuestionIdx < currentQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl min-h-11 flex items-center space-x-1 shadow-md shadow-sky-500/20"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleNextSection}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl min-h-11 flex items-center space-x-1 shadow-md shadow-emerald-500/20"
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

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs font-mono text-sky-400 font-bold">
              Progress: {renderVisualBlocks()} ({progressPercent}%)
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Answered: {answeredCountAll}</span>
              <span>Total Questions: {totalQuestionsAllSections}</span>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Submission Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Submit Diagnostic Assessment?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have completed {answeredCountAll} of {totalQuestionsAllSections} questions.
              Submitting will compute your placement assessment outcome.
            </p>
            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <span>⚠️ Submission Error</span>
                </div>
                <div>{submitError}</div>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl min-h-11"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl min-h-11"
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
    </div>
  );
}
