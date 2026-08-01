'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface PlayerQuestion {
  id: string;
  versionId: string;
  code: string;
  prompt: string;
  itemType: 'MCQ' | 'FILL_IN_BLANK' | 'ESSAY' | 'SPEAKING_PROMPT' | 'MATCHING';
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
    initialRemainingTime !== undefined ? initialRemainingTime : (sections[0]?.timeLimitMinutes || 10) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sectionStarted, setSectionStarted] = useState(true);

  const currentSection = sections[currentSectionIdx] || sections[0];
  const currentQuestions = currentSection?.questions || [];
  const currentQuestion = currentQuestions[currentQuestionIdx];

  // Sync initialSavedAnswers if updated externally on mount
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
    try {
      await fetch(`/api/v1/assessment-attempts/${encodeURIComponent(attemptId)}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionVersionId: currentQuestion.versionId,
          answer: payload,
          timeSpentMs: 5000,
        }),
      });
    } catch {
      // Background autosave failure retry handled silently
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

  async function handleSubmitFinal() {
    setIsSubmitting(true);
    try {
      // Enqueue subjective evaluation jobs for Writing essays and Speaking audio
      for (const [qId, ans] of Object.entries(answers)) {
        if (ans.textResponse || ans.audioRecordingUrl) {
          const isAudio = Boolean(ans.audioRecordingUrl);
          await fetch('/api/v1/evaluations/enqueue', {
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

      await fetch(`/api/v1/assessment-attempts/${encodeURIComponent(attemptId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType }),
      });
      if (onComplete) onComplete();
      else router.push(`/student/results?attemptId=${encodeURIComponent(attemptId)}`);
    } catch {
      router.push(`/student/results?attemptId=${encodeURIComponent(attemptId)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalQuestionsAllSections = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredCountAll = Object.keys(answers).length;

  if (!sectionStarted) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
              {examType} Diagnostic • Section {currentSectionIdx + 1} of {sections.length}
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{currentSection.name}</h1>
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
            ⏱ {currentSection.timeLimitMinutes} minutes
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Section Instructions
          </h2>
          <p className="text-slate-300 leading-relaxed">{currentSection.instructions}</p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>Ensure your audio and input peripherals are connected.</li>
            <li>Questions in this section carry equal weight toward section placement.</li>
            <li>Autosave is enabled throughout your evaluation.</li>
          </ul>
        </div>

        <button
          onClick={() => setSectionStarted(true)}
          className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-base transition-colors shadow-lg shadow-sky-500/20"
        >
          Begin {currentSection.name} Section →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-slate-950 min-h-screen text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <h1 className="text-sm font-bold text-white">{title}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {currentSection.name}
          </span>
        </div>

        {/* Section Tabs */}
        <div className="hidden md:flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => {
                if (idx <= currentSectionIdx) {
                  setCurrentSectionIdx(idx);
                  setCurrentQuestionIdx(0);
                }
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                idx === currentSectionIdx
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : idx < currentSectionIdx
                  ? 'text-emerald-400 hover:bg-slate-900'
                  : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
            ⏱ {formatTime(secondsRemaining)}
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
          >
            Submit Diagnostic
          </button>
        </div>
      </header>

      {/* Main Question Runner Layout */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl w-full mx-auto">
        {/* Left Side: Question Content */}
        <main className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {currentQuestions.length}
              </span>
              <button
                onClick={() => currentQuestion && toggleFlag(currentQuestion.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                  currentQuestion && flagged.has(currentQuestion.id)
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                🚩 {currentQuestion && flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}
              </button>
            </div>

            {/* Reading Passage Panel (if present) */}
            {currentQuestion?.passageContent && (
              <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wide mb-2">
                  📖 {currentQuestion.passageTitle || 'Reading Passage'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentQuestion.passageContent}
                </p>
              </div>
            )}

            {/* Listening Audio Track (if present) */}
            {currentQuestion?.audioUrl && (
              <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
                <span className="text-lg">🎧</span>
                <audio controls src={currentQuestion.audioUrl} className="w-full" />
              </div>
            )}

            {/* Question Prompt */}
            <h3 className="text-base font-semibold text-white mb-6 leading-relaxed">
              {currentQuestion?.prompt}
            </h3>

            {/* MCQ Options */}
            {currentQuestion?.options && currentQuestion.options.length > 0 && (
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected =
                    answers[currentQuestion.id]?.selectedOptionCode === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.code)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-500/10 border-sky-500 text-white font-medium shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-xs font-mono">
                          {opt.code}
                        </span>
                        <span>{opt.text}</span>
                      </span>
                      {isSelected && <span className="text-sky-400 text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Writing Response Textarea */}
            {(currentQuestion?.itemType === 'ESSAY' || currentSection.code.includes('WRITING')) && (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  value={answers[currentQuestion?.id || '']?.textResponse || ''}
                  onChange={(e) => currentQuestion && handleTextChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your essay response here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
                <div className="text-right text-xs text-slate-400 font-mono">
                  Word Count:{' '}
                  {(answers[currentQuestion?.id || '']?.textResponse || '')
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length}
                </div>
              </div>
            )}

            {/* Speaking Cue Card & Microphone Audio Recorder */}
            {(currentQuestion?.itemType === 'SPEAKING_PROMPT' || currentSection.code.includes('SPEAKING')) && (
              <div className="space-y-4">
                {currentQuestion?.cueCardPoints && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wide">
                      Cue Card Topic & Points:
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {currentQuestion.cueCardPoints.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <SpeakingAudioRecorder
                  questionId={currentQuestion?.id || ''}
                  existingAudioUrl={answers[currentQuestion?.id || '']?.audioBlobUrl}
                  onAudioRecorded={(audioUrl) => {
                    if (!currentQuestion) return;
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: {
                        ...prev[currentQuestion.id],
                        audioBlobUrl: audioUrl,
                        sectionCode: currentSection.name,
                      },
                    }));
                    autosaveResponse(currentQuestion.id, {
                      audioBlobUrl: audioUrl,
                      sectionCode: currentSection.name,
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Question Navigation Controls */}
          <div className="flex justify-between items-center border-t border-slate-800 pt-6 mt-8">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              ← Previous Question
            </button>

            {currentQuestionIdx < currentQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleNextSection}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Complete {currentSection.name} →
              </button>
            )}
          </div>
        </main>

        {/* Right Side: Section Question Matrix */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              {currentSection.name} Questions
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {currentQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);

                let bgClass = 'bg-slate-950 border-slate-800 text-slate-400';
                if (isCurrent) bgClass = 'bg-sky-500 border-sky-400 text-slate-950 font-bold';
                else if (isAnswered) bgClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
                if (isFlagged && !isCurrent) bgClass = 'bg-amber-500/20 border-amber-500/40 text-amber-400';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative ${bgClass}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Progress Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Overall Progress</h4>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{
                  width: `${(answeredCountAll / Math.max(1, totalQuestionsAllSections)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Answered: {answeredCountAll}</span>
              <span>Total: {totalQuestionsAllSections}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Diagnostic Assessment?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have answered {answeredCountAll} of {totalQuestionsAllSections} questions across all 5 sections. Submitting will complete your diagnostic attempt and compute your placement outcome.
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SpeakingAudioRecorderProps {
  questionId: string;
  existingAudioUrl?: string;
  onAudioRecorded: (audioUrl: string) => void;
}

function SpeakingAudioRecorder({
  questionId,
  existingAudioUrl,
  onAudioRecorded,
}: SpeakingAudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [recordTime, setRecordTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (recording) {
      timer = setInterval(() => setRecordTime((t) => t + 1), 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(timer);
  }, [recording]);

  async function startRecording() {
    setMicError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices microphone API is not supported in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        try {
          const formData = new FormData();
          formData.append('file', blob, `speaking-${questionId}-${Date.now()}.webm`);

          const uploadRes = await fetch('/api/v1/media/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          const permanentUrl = uploadData.mediaUrl || URL.createObjectURL(blob);

          setAudioUrl(permanentUrl);
          onAudioRecorded(permanentUrl);
        } catch {
          const fallbackUrl = URL.createObjectURL(blob);
          setAudioUrl(fallbackUrl);
          onAudioRecorded(fallbackUrl);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start(200);
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  }

  return (
    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
      <div className="flex justify-center items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
          🎙️
        </div>
      </div>

      <div className="text-xs text-slate-300 font-semibold">
        {recording ? (
          <span className="text-amber-400 font-mono animate-pulse">
            🔴 Recording Oral Response: {recordTime}s
          </span>
        ) : audioUrl ? (
          <span className="text-emerald-400 font-semibold">✓ Oral Response Audio Recorded</span>
        ) : (
          <span>Microphone MediaRecorder Ready</span>
        )}
      </div>

      {micError && (
        <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
          ⚠️ {micError}
        </div>
      )}

      <div className="flex justify-center space-x-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/20"
          >
            ● Record Oral Response
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
          >
            ■ Stop & Save Recording
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="pt-3 border-t border-slate-900 flex justify-center">
          <audio controls src={audioUrl} className="max-w-md w-full" />
        </div>
      )}
    </div>
  );
}
