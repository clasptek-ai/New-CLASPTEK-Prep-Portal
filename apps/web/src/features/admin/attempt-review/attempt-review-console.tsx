'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { extractSelectedOptionCode } from '@/lib/scoring/extractSelectedOptionCode';

export interface AttemptSummary {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  catalogId: string;
  assessmentType?: 'MOCK' | 'DIAGNOSTIC';
  status: string;
  score: number;
  cefrLevel: string;
  predictedBand: string;
  placementLevel: string;
  recommendedCourse: string;
  recommendedDuration: string;
  startedAt: string;
  submittedAt: string | null;
}

export interface AttemptDetailBundle {
  attempt: {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    candidateNumber?: string;
    status: string;
    evaluationState?: string;
    score: number;
    officialScaledScore?: number;
    officialScoreLabel?: string;
    durationMinutes: number;
    startedAt: string;
    submittedAt: string | null;
    expiresAt: string;
  };
  result: {
    overallScore: number;
    cefrLevel: string;
    predictedBand: string;
    placementLevel: string;
    recommendedCourse: string;
    recommendedDuration: string;
    sectionScores: Array<{
      sectionCode: string;
      sectionName: string;
      scorePercentage: number;
      rawScore?: number;
      scaledScore?: number;
      evaluationState?: string;
      computedLevel?: string;
    }>;
    strengths: string[];
    weaknesses: string[];
    aiFeedback: {
      summary?: string;
      nextSteps?: string;
    };
  } | null;
  answers: Record<
    string,
    {
      answerId?: string;
      sectionId?: string;
      responsePayload: any;
      isCorrect: boolean | null;
      timeSpentMs: number;
      updatedAt?: string;
    }
  >;
  paperSnapshot: any;
  auditTimeline: Array<{
    id: string;
    eventType: string;
    payload: any;
    timestamp: string;
  }>;
}

export function AttemptInspectorModal({
  attemptId,
  studentId,
  onClose,
}: {
  attemptId: string;
  studentId?: string;
  onClose: () => void;
}) {
  const [detailBundle, setDetailBundle] = useState<AttemptDetailBundle | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'QUESTIONS' | 'READING' | 'WRITING' | 'SPEAKING' | 'RESULTS' | 'AUDIT'
  >('OVERVIEW');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);

  useEffect(() => {
    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const url = studentId
          ? `/api/v1/admin/assessment-attempts/${attemptId}?studentId=${encodeURIComponent(studentId)}`
          : `/api/v1/admin/assessment-attempts/${attemptId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.data) {
          setDetailBundle(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch attempt detail:', err);
      } finally {
        setDetailLoading(false);
      }
    }
    fetchDetail();
  }, [attemptId, studentId]);

  const isMock =
    detailBundle?.paperSnapshot?.assessment?.code?.includes('MOCK') ||
    detailBundle?.result?.placementLevel?.includes('MOCK') ||
    (detailBundle?.paperSnapshot?.listeningQuestions &&
      detailBundle.paperSnapshot.listeningQuestions.length > 0);

  const listeningItems =
    detailBundle?.paperSnapshot?.listeningQuestions ||
    detailBundle?.paperSnapshot?.grammarQuestions ||
    [];

  const distinctAudioTracks = useMemo(() => {
    const map = new Map<
      string,
      {
        trackCode: string;
        trackTitle: string;
        trackUrl: string;
        sectionNumber: number;
        durationSeconds: number;
        questionCount: number;
      }
    >();
    listeningItems.forEach((q: any) => {
      if (q.audio && typeof q.audio === 'object' && (q.audio.trackUrl || q.audio.url)) {
        const rawUrl = q.audio.trackUrl || q.audio.url;
        const url = rawUrl.startsWith('/') || rawUrl.startsWith('http') ? rawUrl : `/${rawUrl}`;
        const secNum = q.audio.sectionNumber || 1;
        const key = q.audio.trackCode || url;
        if (!map.has(key)) {
          map.set(key, {
            trackCode: q.audio.trackCode || `SECTION_${secNum}`,
            trackTitle: q.audio.trackTitle || `Section ${secNum} Audio Recording`,
            trackUrl: url,
            sectionNumber: secNum,
            durationSeconds: q.audio.durationSeconds || 0,
            questionCount: 1,
          });
        } else {
          map.get(key)!.questionCount += 1;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.sectionNumber - b.sectionNumber);
  }, [listeningItems]);

  const readingItems =
    detailBundle?.paperSnapshot?.readingPassage?.comprehensionQuestions ||
    detailBundle?.paperSnapshot?.readingPassages?.flatMap((p: any) => p.questions || []) ||
    [];

  return (
    <div className="fixed inset-0 z-50 bg-(--backdrop) backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-(--surface-0) border border-(--border) rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-(--border) flex justify-between items-center bg-(--surface-1)">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-(--brand) uppercase tracking-widest">
                Immutable Paper Snapshot Inspector
              </span>
              {isMock && (
                <span className="px-2 py-0.5 rounded bg-(--accent-mock-subtle) text-(--accent-mock) border border-(--accent-mock-border) text-[9px] font-bold font-mono">
                  IELTS OFFICIAL MOCK
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-(--text-primary) mt-0.5">
              {detailBundle?.attempt.studentName || 'Candidate Attempt'} (
              {detailBundle?.attempt.studentEmail})
            </h2>
            <div className="text-xs text-(--text-muted) font-mono mt-0.5 flex gap-3">
              <span>Attempt ID: {attemptId}</span>
              {detailBundle?.attempt.candidateNumber && (
                <span className="text-(--accent-diagnostic) font-bold">
                  Candidate No: {detailBundle.attempt.candidateNumber}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-(--surface-1) hover:bg-(--surface-2) text-(--text-secondary) flex items-center justify-center text-sm font-bold border border-(--border)"
          >
            ✕
          </button>
        </div>

        {/* 7 Modal Navigation Tabs */}
        <div className="flex border-b border-(--border) bg-(--surface-1) px-4 space-x-2 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: '1. Overview' },
            {
              id: 'QUESTIONS',
              label: isMock ? `2. Listening (${listeningItems.length} Qs)` : '2. Questions',
            },
            {
              id: 'READING',
              label: isMock ? `3. Reading (${readingItems.length} Qs)` : '3. Reading',
            },
            { id: 'WRITING', label: '4. Writing' },
            { id: 'SPEAKING', label: '5. Speaking' },
            { id: 'RESULTS', label: '6. Results' },
            { id: 'AUDIT', label: '7. Audit Timeline' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors shrink-0 ${
                activeTab === t.id
                  ? 'border-(--brand) text-(--brand)'
                  : 'border-transparent text-(--text-muted) hover:text-(--text-primary)'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {detailLoading ? (
            <div className="p-12 text-center text-(--text-muted) space-y-2">
              <div className="w-6 h-6 border-2 border-(--brand) border-t-transparent rounded-full animate-spin mx-auto" />
              <div>Deserializing frozen paper snapshot & audit events...</div>
            </div>
          ) : !detailBundle ? (
            <div className="text-center text-(--error) p-8">Failed to load attempt details.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-center">
                      <div className="text-[10px] text-(--text-muted) uppercase">
                        {isMock ? 'Overall IELTS Band' : 'Overall Score'}
                      </div>
                      <div className="text-2xl font-black text-(--brand) mt-1">
                        {isMock
                          ? `Band ${Number(detailBundle.result?.overallScore || detailBundle.attempt.officialScaledScore || detailBundle.attempt.score || 0).toFixed(1)}`
                          : `${detailBundle.result?.overallScore || detailBundle.attempt.score}%`}
                      </div>
                    </div>
                    <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-center">
                      <div className="text-[10px] text-(--text-muted) uppercase">CEFR Level</div>
                      <div className="text-xl font-bold text-(--accent-diagnostic) mt-1">
                        {detailBundle.result?.cefrLevel || 'Pending Evaluation'}
                      </div>
                    </div>
                    <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-center">
                      <div className="text-[10px] text-(--text-muted) uppercase">
                        Official Score Label
                      </div>
                      <div className="text-xl font-bold text-(--accent-mock) mt-1">
                        {detailBundle.attempt.officialScoreLabel ||
                          detailBundle.result?.predictedBand ||
                          'Pending'}
                      </div>
                    </div>
                    <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-center">
                      <div className="text-[10px] text-(--text-muted) uppercase">
                        Assessment Type
                      </div>
                      <div className="text-base font-bold text-(--success) mt-1.5">
                        {isMock ? 'OFFICIAL MOCK' : 'DIAGNOSTIC'}
                      </div>
                    </div>
                  </div>

                  {/* Section Scores Summary for Mocks */}
                  {isMock && Array.isArray(detailBundle.result?.sectionScores) && (
                    <div className="bg-(--surface-1) p-5 rounded-xl border border-(--border) space-y-3">
                      <div className="font-bold text-(--text-primary) uppercase tracking-wider">
                        IELTS 4-Skill Section Bands
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {detailBundle.result.sectionScores.map((sec, idx) => (
                          <div
                            key={idx}
                            className="bg-(--surface-2) p-3.5 rounded-lg border border-(--border) text-center space-y-1"
                          >
                            <div className="text-[10px] text-(--text-muted) uppercase font-semibold">
                              {sec.sectionName || sec.sectionCode}
                            </div>
                            <div className="text-lg font-bold text-(--brand) font-mono">
                              {sec.scaledScore !== undefined
                                ? `Band ${Number(sec.scaledScore).toFixed(1)}`
                                : `${sec.scorePercentage}%`}
                            </div>
                            {sec.rawScore !== undefined && (
                              <div className="text-[10px] text-(--text-muted) font-mono">
                                Raw: {sec.rawScore} / 40
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-(--surface-1) p-5 rounded-xl border border-(--border) space-y-3">
                    <div className="font-bold text-(--text-primary) uppercase tracking-wider">
                      Candidate & Execution Details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-(--text-secondary) font-mono">
                      <div>
                        Candidate Name:{' '}
                        <strong className="text-(--text-primary)">
                          {detailBundle.attempt.studentName}
                        </strong>
                      </div>
                      <div>
                        Candidate Email:{' '}
                        <strong className="text-(--text-primary)">
                          {detailBundle.attempt.studentEmail}
                        </strong>
                      </div>
                      <div>
                        Attempt Status:{' '}
                        <strong className="text-(--success)">{detailBundle.attempt.status}</strong>
                      </div>
                      <div>
                        Evaluation State:{' '}
                        <strong className="text-(--accent-mock)">
                          {detailBundle.attempt.evaluationState || 'COMPLETED'}
                        </strong>
                      </div>
                      <div>
                        Started At:{' '}
                        <strong className="text-(--text-primary)">
                          {new Date(detailBundle.attempt.startedAt).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        Submitted At:{' '}
                        <strong className="text-(--text-primary)">
                          {detailBundle.attempt.submittedAt
                            ? new Date(detailBundle.attempt.submittedAt).toLocaleString()
                            : 'N/A'}
                        </strong>
                      </div>
                      <div>
                        Programme / Course:{' '}
                        <strong className="text-(--brand)">
                          {detailBundle.result?.recommendedCourse || 'IELTS Academic Masterclass'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUESTIONS (LISTENING) */}
              {activeTab === 'QUESTIONS' && (
                <div className="space-y-4">
                  <div className="font-bold text-(--text-primary) uppercase flex justify-between items-center">
                    <span>
                      {isMock ? 'Listening Section Questions' : 'Frozen Objective Questions'} (
                      {listeningItems.length} Items)
                    </span>
                    {isMock && (
                      <span className="text-xs text-(--brand) font-mono font-normal">
                        Raw Correct:{' '}
                        {
                          listeningItems.filter(
                            (q: any) => detailBundle.answers[q.id || q.questionId]?.isCorrect
                          ).length
                        }{' '}
                        / {listeningItems.length}
                      </span>
                    )}
                  </div>

                  {/* Master Section Audio Player & Verification Panel */}
                  {distinctAudioTracks.length > 0 && (
                    <div className="bg-(--surface-inverse-elevated) p-4 rounded-xl border border-(--border-inverse) space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-(--text-inverse) uppercase tracking-wider">
                            🎧 Audio Verification Console
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-(--success-subtle) text-(--success) border border-(--success-border)">
                            {distinctAudioTracks.length} Sections Ready
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {distinctAudioTracks.map((tr, tIdx) => (
                            <button
                              key={tr.trackCode}
                              type="button"
                              onClick={() => setSelectedTrackIndex(tIdx)}
                              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                                selectedTrackIndex === tIdx
                                  ? 'bg-(--brand) text-white border-(--brand)'
                                  : 'bg-(--surface-inverse-muted) text-(--text-inverse-secondary) border-(--border-inverse) hover:bg-(--surface-inverse)'
                              }`}
                            >
                              Sec {tr.sectionNumber} ({tr.questionCount} Qs)
                            </button>
                          ))}
                        </div>
                      </div>

                      {distinctAudioTracks[selectedTrackIndex] && (
                        <div className="bg-(--surface-inverse) p-3 rounded-lg border border-(--border-inverse) flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-semibold text-(--text-inverse) text-xs truncate">
                              Section {distinctAudioTracks[selectedTrackIndex].sectionNumber}:{' '}
                              {distinctAudioTracks[selectedTrackIndex].trackTitle}
                            </div>
                            <div className="text-[10px] text-(--text-inverse-muted) font-mono flex flex-wrap gap-2">
                              <span>
                                Track: {distinctAudioTracks[selectedTrackIndex].trackCode}
                              </span>
                              {distinctAudioTracks[selectedTrackIndex].durationSeconds > 0 && (
                                <span>
                                  • Duration:{' '}
                                  {Math.floor(
                                    distinctAudioTracks[selectedTrackIndex].durationSeconds / 60
                                  )}
                                  m {distinctAudioTracks[selectedTrackIndex].durationSeconds % 60}s
                                </span>
                              )}
                              <span>• MIME: audio/mpeg</span>
                            </div>
                          </div>
                          <audio
                            controls
                            key={distinctAudioTracks[selectedTrackIndex].trackUrl}
                            src={distinctAudioTracks[selectedTrackIndex].trackUrl}
                            className="h-8 w-full sm:w-80 shrink-0"
                            preload="metadata"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {listeningItems.map((q: any, idx: number) => {
                      const qId = q.id || q.questionId;
                      const ansObj = detailBundle.answers[qId];
                      const selectedCode =
                        extractSelectedOptionCode(ansObj?.responsePayload) ||
                        ansObj?.responsePayload?.studentAnswer ||
                        ansObj?.responsePayload?.textResponse ||
                        '-';
                      const isCorrect = ansObj?.isCorrect;

                      const rawAudioUrl =
                        typeof q.audio === 'string'
                          ? q.audio
                          : q.audio?.trackUrl || q.audio?.url || '';
                      const resolvedAudioUrl = rawAudioUrl
                        ? rawAudioUrl.startsWith('/') || rawAudioUrl.startsWith('http')
                          ? rawAudioUrl
                          : `/${rawAudioUrl}`
                        : '';

                      return (
                        <div
                          key={qId || idx}
                          className="bg-(--surface-0) p-4 rounded-xl border border-(--border) space-y-2.5"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="font-semibold text-(--text-primary)">
                              Q{idx + 1}. {q.prompt}
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                                isCorrect === true
                                  ? 'bg-(--success-subtle) text-(--success) border-(--success-border)'
                                  : isCorrect === false
                                    ? 'bg-(--error-subtle) text-(--error) border-(--error-border)'
                                    : 'bg-(--surface-1) text-(--text-muted) border-(--border)'
                              }`}
                            >
                              {isCorrect === true
                                ? '✓ Correct (1/1)'
                                : isCorrect === false
                                  ? '✗ Incorrect (0/1)'
                                  : 'Unanswered'}
                            </span>
                          </div>

                          {/* Audio player if audio exists */}
                          {resolvedAudioUrl && (
                            <div className="bg-(--surface-1) p-2.5 rounded-lg border border-(--border) flex items-center gap-3">
                              <span className="text-[10px] text-(--brand) font-bold font-mono">
                                AUDIO:
                              </span>
                              <audio
                                controls
                                src={resolvedAudioUrl}
                                className="h-7 w-full max-w-md"
                                preload="metadata"
                              />
                            </div>
                          )}

                          {/* Options if question has options */}
                          {Array.isArray(q.options) && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                              {q.options.map((opt: any) => {
                                const isOptSelected =
                                  String(selectedCode).toUpperCase() ===
                                  String(opt.code).toUpperCase();
                                const isOptCorrect =
                                  String(q.correctOptionCode).toUpperCase() ===
                                  String(opt.code).toUpperCase();

                                return (
                                  <div
                                    key={opt.code || opt.id}
                                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                                      isOptSelected && isOptCorrect
                                        ? 'bg-(--success-subtle) border-(--success) text-(--success) font-semibold'
                                        : isOptSelected && !isOptCorrect
                                          ? 'bg-(--error-subtle) border-(--error) text-(--error) font-semibold'
                                          : isOptCorrect
                                            ? 'bg-(--success-subtle)/50 border-(--success-border) text-(--success)'
                                            : 'bg-(--surface-1) border-(--border) text-(--text-secondary)'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded flex items-center justify-center bg-(--surface-0) border border-(--border) font-bold text-[10px] uppercase text-(--text-primary)">
                                        {opt.code || opt.id}
                                      </span>
                                      <span>{opt.text}</span>
                                    </span>
                                    {isOptSelected && (
                                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-(--surface-0) border border-(--border) text-(--text-primary) font-mono font-bold">
                                        Candidate Choice
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-(--border) font-mono text-[11px]">
                            <div>
                              <span className="text-(--text-muted)">Answer Key / Correct: </span>
                              <span className="text-(--success) font-bold">
                                {q.correctOptionCode ||
                                  q.correctAnswer ||
                                  (Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length > 0
                                    ? q.acceptedAnswers.join(' | ')
                                    : '-')}
                              </span>
                            </div>
                            <div>
                              <span className="text-(--text-muted)">Candidate Answer: </span>
                              <span
                                className={
                                  isCorrect
                                    ? 'text-(--success) font-bold'
                                    : 'text-(--error) font-bold'
                                }
                              >
                                {String(selectedCode)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: READING */}
              {activeTab === 'READING' && (
                <div className="space-y-4">
                  <div className="bg-(--surface-0) p-5 rounded-xl border border-(--border) space-y-3">
                    <div className="font-bold text-(--brand) uppercase">
                      Reading Passage:{' '}
                      {detailBundle.paperSnapshot.readingPassage?.title ||
                        'Academic Reading Section'}
                    </div>
                    <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-(--text-secondary) leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                      {detailBundle.paperSnapshot.readingPassage?.content ||
                        'Reading passage captured from session snapshots.'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {readingItems.map((cq: any, idx: number) => {
                      const qId = cq.id || cq.questionId;
                      const ansObj = detailBundle.answers[qId];
                      const rawPayload = ansObj?.responsePayload;
                      const isInputType =
                        cq.itemType === 'INPUT' ||
                        cq.itemType === 'COMPLETION' ||
                        cq.itemType === 'SENTENCE_COMPLETION' ||
                        cq.itemType === 'SHORT_ANSWER' ||
                        cq.itemType === 'SHORT_RESPONSE' ||
                        cq.itemType === 'GAP_FILL' ||
                        cq.itemType === 'FILL_IN_BLANK' ||
                        (!cq.options?.length && Array.isArray(cq.acceptedAnswers));

                      const candidateText =
                        typeof rawPayload === 'string'
                          ? rawPayload
                          : typeof rawPayload === 'object' && rawPayload !== null
                            ? rawPayload.textResponse ||
                              rawPayload.studentAnswer ||
                              rawPayload.text ||
                              rawPayload.answer ||
                              rawPayload.value ||
                              rawPayload.selectedOptionCode ||
                              '-'
                            : '-';

                      const selectedCode =
                        extractSelectedOptionCode(rawPayload) || candidateText || '-';

                      const isCorrect = Boolean(ansObj?.isCorrect);

                      return (
                        <div
                          key={qId || idx}
                          className="bg-(--surface-0) p-4 rounded-xl border border-(--border) space-y-3"
                        >
                          <div className="flex justify-between items-start font-semibold text-(--text-primary)">
                            <div>
                              Reading Q{idx + 1}: {cq.prompt}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isCorrect ? 'bg-(--success-subtle) text-(--success) border-(--success-border)' : 'bg-(--error-subtle) text-(--error) border-(--error-border)'}`}
                            >
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>

                          {Array.isArray(cq.options) && cq.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {cq.options.map((opt: any) => {
                                const isOptSelected =
                                  String(selectedCode).toUpperCase() ===
                                  String(opt.code).toUpperCase();
                                const isOptCorrect =
                                  String(cq.correctOptionCode).toUpperCase() ===
                                  String(opt.code).toUpperCase();

                                return (
                                  <div
                                    key={opt.code}
                                    className={`p-2 rounded-lg border flex items-center gap-2 ${
                                      isOptSelected && isOptCorrect
                                        ? 'border-(--success) bg-(--success-subtle) text-(--success) font-semibold'
                                        : isOptSelected && !isOptCorrect
                                          ? 'border-(--error) bg-(--error-subtle) text-(--error) font-semibold'
                                          : isOptCorrect
                                            ? 'border-(--success-border) bg-(--success-subtle)/50 text-(--success)'
                                            : 'border-(--border) bg-(--surface-1) text-(--text-secondary)'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full border border-(--border) bg-(--surface-0) flex items-center justify-center text-[10px] font-mono text-(--text-primary)">
                                      {opt.code}
                                    </span>
                                    <span>{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 font-mono text-[11px] pt-1 bg-(--surface-1) p-2.5 rounded-lg border border-(--border)">
                            <div>
                              <span className="text-(--text-muted)">
                                {isInputType ? 'Accepted Answers:' : 'Correct Option:'}{' '}
                              </span>
                              <span className="text-(--success) font-bold">
                                {isInputType
                                  ? Array.isArray(cq.acceptedAnswers) &&
                                    cq.acceptedAnswers.length > 0
                                    ? cq.acceptedAnswers.join(' | ')
                                    : cq.correctOptionCode || cq.correctAnswer || '-'
                                  : cq.correctOptionCode || cq.correctAnswer || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-(--text-muted)">Candidate Response: </span>
                              <span
                                className={
                                  isCorrect
                                    ? 'text-(--success) font-bold'
                                    : 'text-(--error) font-bold'
                                }
                              >
                                {String(isInputType ? candidateText : selectedCode)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: WRITING */}
              {activeTab === 'WRITING' && (
                <div className="space-y-4">
                  {detailBundle.paperSnapshot.writingTasks?.map((wt: any, idx: number) => {
                    const ansObj = detailBundle.answers[wt.id];
                    const essayText =
                      wt.studentEssay ||
                      ansObj?.responsePayload?.textResponse ||
                      ansObj?.responsePayload?.studentAnswer ||
                      ansObj?.responsePayload?.text ||
                      ansObj?.responsePayload ||
                      'No essay response recorded.';
                    const textStr =
                      typeof essayText === 'string' ? essayText : JSON.stringify(essayText);
                    const wordCount = textStr.trim().split(/\s+/).filter(Boolean).length;
                    const aiEval = wt.aiEvaluation;

                    return (
                      <div
                        key={wt.id || idx}
                        className="bg-(--surface-0) p-5 rounded-xl border border-(--border) space-y-3"
                      >
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="font-bold text-(--brand) uppercase">
                            Writing Task {wt.taskNumber || idx + 1}: {wt.title}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-(--text-muted) font-mono text-[11px]">
                              Word Count:{' '}
                              <strong className="text-(--text-primary)">{wordCount}</strong> / Min{' '}
                              {wt.minWords || 150}
                            </span>
                            {aiEval && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                  aiEval.status === 'COMPLETED'
                                    ? 'bg-(--accent-mock-subtle) text-(--accent-mock) border-(--accent-mock-border)'
                                    : aiEval.status === 'FAILED'
                                      ? 'bg-(--error-subtle) text-(--error) border-(--error-border)'
                                      : 'bg-(--warning-subtle) text-(--warning) border-(--warning-border)'
                                }`}
                              >
                                {aiEval.status === 'COMPLETED'
                                  ? `Band ${Number(aiEval.overallScore || 0).toFixed(1)}`
                                  : aiEval.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* AI Provider Telemetry */}
                        {aiEval?.gradingProvider && (
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-(--text-muted) bg-(--surface-1) px-3 py-1.5 rounded-lg border border-(--border)">
                            <span>
                              Provider:{' '}
                              <strong className="text-(--brand)">
                                {aiEval.gradingProvider.toUpperCase()}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Model:{' '}
                              <strong className="text-(--accent-mock)">
                                {aiEval.gradingModel}
                              </strong>
                            </span>
                            {aiEval.isFallback && (
                              <span className="px-1.5 py-0.5 rounded bg-(--warning-subtle) text-(--warning) border border-(--warning-border) text-[9px] font-bold">
                                FALLBACK FROM {aiEval.fallbackFrom || 'PRIMARY'}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-(--text-primary) font-medium bg-(--surface-1) p-3 rounded-lg border border-(--border)">
                          {wt.prompt}
                        </p>

                        <div className="space-y-1">
                          <div className="text-(--text-muted) font-semibold uppercase text-[10px]">
                            Candidate Submitted Response:
                          </div>
                          <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-(--text-primary) font-mono leading-relaxed whitespace-pre-wrap">
                            {textStr}
                          </div>
                        </div>

                        {/* Criteria Breakdown */}
                        {Array.isArray(aiEval?.criteria) && aiEval.criteria.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="text-[10px] font-bold text-(--text-muted) uppercase">
                              Assessment Criteria Scores:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {aiEval.criteria.map((c: any, cIdx: number) => (
                                <div
                                  key={cIdx}
                                  className="bg-(--surface-1) p-2.5 rounded-lg border border-(--border) space-y-1"
                                >
                                  <div className="text-[10px] text-(--text-muted) uppercase font-semibold">
                                    {c.criterionName}
                                  </div>
                                  <div className="text-sm font-bold text-(--brand) font-mono">
                                    {c.score !== null ? Number(c.score).toFixed(1) : '-'}{' '}
                                    <span className="text-[10px] text-(--text-muted)">
                                      / {c.maxScore || 9}
                                    </span>
                                  </div>
                                  {c.feedback && (
                                    <div className="text-[10px] text-(--text-secondary) italic line-clamp-2">
                                      {c.feedback}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiEval?.feedback && (
                          <div className="bg-(--accent-mock-subtle) border border-(--accent-mock-border) p-3.5 rounded-xl space-y-1 mt-2">
                            <div className="text-[10px] font-bold text-(--accent-mock) uppercase">
                              AI Examiner Evaluation & Feedback:
                            </div>
                            <p className="text-(--text-primary) text-xs leading-relaxed">
                              {aiEval.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 5: SPEAKING */}
              {activeTab === 'SPEAKING' && (
                <div className="space-y-4">
                  {detailBundle.paperSnapshot.speakingItems?.length > 0 ? (
                    detailBundle.paperSnapshot.speakingItems.map((spk: any, idx: number) => {
                      const aiEval = spk.aiEvaluation;
                      return (
                        <div
                          key={spk.id || idx}
                          className="bg-(--surface-0) p-5 rounded-xl border border-(--border) space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-(--brand) uppercase">
                              Speaking Part {spk.partNumber || idx + 1}:{' '}
                              {spk.prompt || `Part ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-2">
                              {spk.durationSeconds > 0 && (
                                <span className="text-(--text-muted) font-mono text-[11px]">
                                  Duration: {spk.durationSeconds}s
                                </span>
                              )}
                              {aiEval && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                    aiEval.status === 'COMPLETED'
                                      ? 'bg-(--accent-mock-subtle) text-(--accent-mock) border-(--accent-mock-border)'
                                      : aiEval.status === 'FAILED'
                                        ? 'bg-(--error-subtle) text-(--error) border-(--error-border)'
                                        : 'bg-(--warning-subtle) text-(--warning) border-(--warning-border)'
                                  }`}
                                >
                                  {aiEval.status === 'COMPLETED'
                                    ? `Band ${Number(aiEval.overallScore || 0).toFixed(1)}`
                                    : aiEval.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* AI Telemetry */}
                          {aiEval?.gradingProvider && (
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-(--text-muted) bg-(--surface-1) px-3 py-1.5 rounded-lg border border-(--border)">
                              <span>
                                Provider:{' '}
                                <strong className="text-(--brand)">
                                  {aiEval.gradingProvider.toUpperCase()}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Model:{' '}
                                <strong className="text-(--accent-mock)">
                                  {aiEval.gradingModel}
                                </strong>
                              </span>
                              {aiEval.isFallback && (
                                <span className="px-1.5 py-0.5 rounded bg-(--warning-subtle) text-(--warning) border border-(--warning-border) text-[9px] font-bold">
                                  FALLBACK FROM {aiEval.fallbackFrom || 'PRIMARY'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Candidate Transcript / Response */}
                          {spk.transcript && (
                            <div className="space-y-1">
                              <div className="text-(--text-muted) font-semibold uppercase text-[10px]">
                                Candidate Transcript / Spoken Response:
                              </div>
                              <div className="bg-(--surface-1) p-4 rounded-xl border border-(--border) text-(--text-primary) font-mono leading-relaxed whitespace-pre-wrap">
                                {spk.transcript}
                              </div>
                            </div>
                          )}

                          {/* Audio Player if recording exists */}
                          {spk.audioUrl && (
                            <div className="bg-(--surface-1) p-3 rounded-xl border border-(--border) flex items-center gap-3">
                              <span className="text-[10px] text-(--brand) font-bold font-mono">
                                RECORDING:
                              </span>
                              <audio controls src={spk.audioUrl} className="w-full h-10" />
                            </div>
                          )}

                          {/* Criteria Breakdown */}
                          {Array.isArray(aiEval?.criteria) && aiEval.criteria.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <div className="text-[10px] font-bold text-(--text-muted) uppercase">
                                Speaking Assessment Criteria:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                {aiEval.criteria.map((c: any, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="bg-(--surface-1) p-2.5 rounded-lg border border-(--border) space-y-1"
                                  >
                                    <div className="text-[10px] text-(--text-muted) uppercase font-semibold">
                                      {c.criterionName}
                                    </div>
                                    <div className="text-sm font-bold text-(--brand) font-mono">
                                      {c.score !== null ? Number(c.score).toFixed(1) : '-'}{' '}
                                      <span className="text-[10px] text-(--text-muted)">
                                        / {c.maxScore || 9}
                                      </span>
                                    </div>
                                    {c.feedback && (
                                      <div className="text-[10px] text-(--text-secondary) italic line-clamp-2">
                                        {c.feedback}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {aiEval?.feedback && (
                            <div className="bg-(--accent-mock-subtle) border border-(--accent-mock-border) p-3.5 rounded-xl space-y-1 mt-2">
                              <div className="text-[10px] font-bold text-(--accent-mock) uppercase">
                                Examiner Assessment & Feedback:
                              </div>
                              <p className="text-(--text-primary) text-xs leading-relaxed">
                                {aiEval.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-(--surface-0) p-5 rounded-xl border border-(--border) space-y-2 text-center text-(--text-muted)">
                      <div className="font-bold text-(--brand) uppercase">
                        Oral & Speaking Evaluation
                      </div>
                      <p>No speaking items captured in this attempt snapshot.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: RESULTS */}
              {activeTab === 'RESULTS' && (
                <div className="space-y-4">
                  {/* 4 Skill Section Breakdown */}
                  {Array.isArray(detailBundle.result?.sectionScores) && (
                    <div className="bg-(--surface-0) p-5 rounded-xl border border-(--border) space-y-3">
                      <div className="font-bold text-(--brand) uppercase tracking-wider">
                        Official Section Breakdown (All 4 Skills)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {detailBundle.result.sectionScores.map((sec, i) => (
                          <div
                            key={i}
                            className="bg-(--surface-1) p-4 rounded-xl border border-(--border) space-y-1 text-center"
                          >
                            <div className="text-[10px] text-(--text-muted) uppercase font-semibold">
                              {sec.sectionName}
                            </div>
                            <div className="text-2xl font-black text-(--text-primary) font-mono mt-1">
                              {sec.scaledScore !== undefined
                                ? `Band ${Number(sec.scaledScore).toFixed(1)}`
                                : `${sec.scorePercentage}%`}
                            </div>
                            {sec.rawScore !== undefined && (
                              <div className="text-xs text-(--text-muted) font-mono">
                                Raw Score:{' '}
                                <strong className="text-(--brand)">{sec.rawScore}</strong>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailBundle.result?.aiFeedback?.summary && (
                    <div className="bg-(--brand-subtle) border border-(--brand-border) p-4 rounded-xl space-y-1">
                      <div className="font-bold text-(--brand) uppercase">
                        AI Diagnostic Evaluation
                      </div>
                      <p className="text-(--text-primary) leading-relaxed">
                        {detailBundle.result.aiFeedback.summary}
                      </p>
                    </div>
                  )}
                  {detailBundle.result?.strengths && (
                    <div className="bg-(--surface-0) p-4 rounded-xl border border-(--border) space-y-2">
                      <div className="font-bold text-(--success) uppercase">
                        Strongest Competencies
                      </div>
                      <ul className="list-disc list-inside text-(--text-primary)">
                        {detailBundle.result.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: AUDIT TIMELINE */}
              {activeTab === 'AUDIT' && (
                <div className="space-y-3">
                  <div className="font-bold text-(--text-primary) uppercase">
                    Immutable Audit Timeline ({detailBundle.auditTimeline.length} Events)
                  </div>

                  <div className="space-y-2 border-l-2 border-(--border) pl-4">
                    {detailBundle.auditTimeline.map((evt) => (
                      <div key={evt.id} className="relative space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-(--brand-subtle) text-(--brand) border border-(--brand-border) rounded font-bold font-mono text-[10px]">
                            {evt.eventType}
                          </span>
                          <span className="text-(--text-muted) font-mono text-[10px]">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="bg-(--surface-1) p-2.5 rounded-lg border border-(--border) text-[10px] text-(--text-secondary) overflow-x-auto">
                          {JSON.stringify(evt.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AttemptReviewConsole() {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cefrFilter, setCefrFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MOCK' | 'DIAGNOSTIC'>('ALL');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchAttempts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (statusFilter) query.set('status', statusFilter);
        if (cefrFilter) query.set('cefr', cefrFilter);
        if (typeFilter) query.set('type', typeFilter);

        const res = await fetch(`/api/v1/admin/assessment-attempts?${query.toString()}`);
        const data = await res.json();
        if (active && data.attempts) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to fetch admin attempts:', err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    fetchAttempts();

    return () => {
      active = false;
    };
  }, [search, statusFilter, cefrFilter, typeFilter]);

  const uniqueAttempts = useMemo(() => {
    const map = new Map<string, AttemptSummary>();

    for (const att of attempts) {
      if (!att.attemptId) continue;

      if (!map.has(att.attemptId)) {
        map.set(att.attemptId, att);
      }
    }

    return Array.from(map.values());
  }, [attempts]);

  return (
    <div className="space-y-6 text-[var(--text-primary)] font-sans w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-(--border) pb-6">
        <div>
          <span className="text-xs font-bold text-(--brand) uppercase tracking-wider">
            Assessment Audit Console
          </span>
          <h1 className="text-2xl font-bold text-(--text-primary) mt-1">
            Student Attempt Review Console
          </h1>
          <p className="text-xs text-(--text-muted) mt-1">
            Inspect frozen paper snapshots, candidate answer logs, scoring rubrics, and event
            timelines for Official Mock Examinations and Diagnostics.
          </p>
        </div>

        {/* Assessment Type Toggle */}
        <div className="flex bg-(--surface-1) border border-(--border) rounded-xl p-1 gap-1 text-xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              typeFilter === 'ALL'
                ? 'bg-(--brand) text-white'
                : 'text-(--text-muted) hover:text-(--text-primary)'
            }`}
          >
            All Assessments
          </button>
          <button
            onClick={() => setTypeFilter('MOCK')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              typeFilter === 'MOCK'
                ? 'bg-(--brand) text-white'
                : 'text-(--text-muted) hover:text-(--text-primary)'
            }`}
          >
            Official Mock Exams
          </button>
          <button
            onClick={() => setTypeFilter('DIAGNOSTIC')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              typeFilter === 'DIAGNOSTIC'
                ? 'bg-(--brand) text-white'
                : 'text-(--text-muted) hover:text-(--text-primary)'
            }`}
          >
            Diagnostics
          </button>
        </div>
      </div>

      <div className="bg-(--surface-1) border border-(--border) p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search candidate name, email, or attempt ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-(--surface-0) border border-(--border) rounded-xl px-3.5 py-2 text-xs text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-(--brand)"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-(--surface-0) border border-(--border) text-xs text-(--text-secondary) rounded-xl px-3 py-2 focus:outline-none focus:border-(--brand)"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>

          <select
            value={cefrFilter}
            onChange={(e) => setCefrFilter(e.target.value)}
            className="bg-(--surface-0) border border-(--border) text-xs text-(--text-secondary) rounded-xl px-3 py-2 focus:outline-none focus:border-(--brand)"
          >
            <option value="">All CEFR Levels</option>
            <option value="C1">C1 Level</option>
            <option value="B2">B2 Level</option>
            <option value="B1">B1 Level</option>
            <option value="A2">A2 Level</option>
          </select>
        </div>
      </div>

      <div className="bg-(--surface-0) border border-(--border) rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-(--text-muted) space-y-2">
            <div className="w-6 h-6 border-2 border-(--brand) border-t-transparent rounded-full animate-spin mx-auto" />
            <div>Loading student assessment attempts...</div>
          </div>
        ) : uniqueAttempts.length === 0 ? (
          <div className="p-12 text-center text-xs text-(--text-muted)">
            No student assessment attempts found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-(--surface-1) text-(--text-muted) border-b border-(--border) uppercase tracking-wider font-semibold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Overall Score</th>
                  <th className="p-4">CEFR & Band</th>
                  <th className="p-4">Placement / Blueprint</th>
                  <th className="p-4">Started At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {uniqueAttempts.map((att) => {
                  const isMockAttempt = att.assessmentType === 'MOCK';
                  return (
                    <tr key={att.attemptId} className="hover:bg-(--surface-1)/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-(--text-primary)">{att.studentName}</div>
                        <div className="text-[11px] text-(--text-muted) font-mono">
                          {att.studentEmail}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isMockAttempt
                              ? 'bg-(--accent-mock-subtle) text-(--accent-mock) border-(--accent-mock-border)'
                              : 'bg-(--accent-diagnostic-subtle) text-(--accent-diagnostic) border-(--accent-diagnostic-border)'
                          }`}
                        >
                          {isMockAttempt ? 'MOCK EXAM' : 'DIAGNOSTIC'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                            att.status === 'SUBMITTED'
                              ? 'bg-(--success-subtle) text-(--success) border-(--success-border)'
                              : att.status === 'IN_PROGRESS'
                                ? 'bg-(--brand-subtle) text-(--brand) border-(--brand-border)'
                                : 'bg-(--warning-subtle) text-(--warning) border-(--warning-border)'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-(--brand) font-mono text-sm">
                          {isMockAttempt && att.score <= 9.0
                            ? `Band ${Number(att.score).toFixed(1)}`
                            : `${att.score}%`}
                        </span>
                      </td>
                      <td className="p-4 space-x-1.5">
                        <span className="px-2 py-0.5 bg-(--accent-diagnostic-subtle) text-(--accent-diagnostic) border border-(--accent-diagnostic-border) rounded text-[10px] font-bold">
                          {att.cefrLevel}
                        </span>
                        <span className="px-2 py-0.5 bg-(--accent-mock-subtle) text-(--accent-mock) border border-(--accent-mock-border) rounded text-[10px] font-bold">
                          {att.predictedBand}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-(--text-secondary) font-semibold">
                          {att.placementLevel}
                        </span>
                      </td>
                      <td className="p-4 text-(--text-muted) text-[11px] font-mono">
                        {att.startedAt ? new Date(att.startedAt).toLocaleString() : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedAttemptId(att.attemptId)}
                          className="px-3 py-1.5 bg-(--brand) hover:bg-(--brand-hover) text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          View Attempt →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAttemptId && (
        <AttemptInspectorModal
          attemptId={selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </div>
  );
}
