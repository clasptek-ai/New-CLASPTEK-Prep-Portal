'use client';

import React, { useEffect, useState } from 'react';
import { extractSelectedOptionCode } from '@/lib/scoring/extractSelectedOptionCode';

export interface AttemptSummary {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  catalogId: string;
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
    status: string;
    score: number;
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
      responsePayload: any;
      isCorrect: boolean | null;
      timeSpentMs: number;
      updatedAt: string;
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
  onClose,
}: {
  attemptId: string;
  onClose: () => void;
}) {
  const [detailBundle, setDetailBundle] = useState<AttemptDetailBundle | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'QUESTIONS' | 'READING' | 'WRITING' | 'SPEAKING' | 'RESULTS' | 'AUDIT'
  >('OVERVIEW');

  useEffect(() => {
    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/assessment-attempts/${attemptId}`);
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
  }, [attemptId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              Immutable Paper Snapshot Inspector
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {detailBundle?.attempt.studentName || 'Candidate Attempt'} (
              {detailBundle?.attempt.studentEmail})
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">Attempt ID: {attemptId}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* 7 Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 space-x-2 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: '1. Overview' },
            { id: 'QUESTIONS', label: '2. Questions' },
            { id: 'READING', label: '3. Reading' },
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
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {detailLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>Deserializing frozen paper snapshot & audit events...</div>
            </div>
          ) : !detailBundle ? (
            <div className="text-center text-rose-400 p-8">Failed to load attempt details.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Overall Score</div>
                      <div className="text-2xl font-black text-sky-400 mt-1">
                        {detailBundle.result?.overallScore || detailBundle.attempt.score}%
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">CEFR Level</div>
                      <div className="text-xl font-bold text-indigo-400 mt-1">
                        {detailBundle.result?.cefrLevel || 'Pending Evaluation'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Predicted Band</div>
                      <div className="text-xl font-bold text-purple-400 mt-1">
                        {detailBundle.result?.predictedBand || 'Not Yet Generated'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Placement</div>
                      <div className="text-base font-bold text-emerald-400 mt-1.5">
                        {detailBundle.result?.placementLevel || 'FOUNDATION'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-200 uppercase tracking-wider">
                      Candidate & Execution Details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 font-mono">
                      <div>
                        Candidate Name:{' '}
                        <strong className="text-white">{detailBundle.attempt.studentName}</strong>
                      </div>
                      <div>
                        Candidate Email:{' '}
                        <strong className="text-white">{detailBundle.attempt.studentEmail}</strong>
                      </div>
                      <div>
                        Attempt Status:{' '}
                        <strong className="text-emerald-400">{detailBundle.attempt.status}</strong>
                      </div>
                      <div>
                        Started At:{' '}
                        <strong className="text-white">
                          {new Date(detailBundle.attempt.startedAt).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        Submitted At:{' '}
                        <strong className="text-white">
                          {detailBundle.attempt.submittedAt
                            ? new Date(detailBundle.attempt.submittedAt).toLocaleString()
                            : 'N/A'}
                        </strong>
                      </div>
                      <div>
                        Recommended Course:{' '}
                        <strong className="text-sky-400">
                          {detailBundle.result?.recommendedCourse} (
                          {detailBundle.result?.recommendedDuration})
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUESTIONS */}
              {activeTab === 'QUESTIONS' && (
                <div className="space-y-4">
                  <div className="font-bold text-slate-200 uppercase">
                    Frozen Objective Questions (
                    {detailBundle.paperSnapshot.grammarQuestions?.length || 0} Items)
                  </div>

                  <div className="space-y-3">
                    {detailBundle.paperSnapshot.grammarQuestions?.map((q: any, idx: number) => {
                      const ansObj = detailBundle.answers[q.id];
                      const selectedCode =
                        extractSelectedOptionCode(ansObj?.responsePayload) || '-';
                      const isCorrect = ansObj?.isCorrect;

                      return (
                        <div
                          key={q.id || idx}
                          className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-semibold text-slate-200">
                              Q{idx + 1}. {q.prompt}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isCorrect === true
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : isCorrect === false
                                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {isCorrect === true
                                ? '✓ Correct (1/1)'
                                : isCorrect === false
                                  ? '✗ Incorrect (0/1)'
                                  : 'Unanswered'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 font-mono text-[11px]">
                            <div>
                              <span className="text-slate-500">Correct Code: </span>
                              <span className="text-emerald-400 font-bold">
                                {q.correctOptionCode || 'A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">Candidate Selected: </span>
                              <span
                                className={
                                  isCorrect
                                    ? 'text-emerald-400 font-bold'
                                    : 'text-rose-400 font-bold'
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
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="font-bold text-sky-400 uppercase">
                      Reading Passage:{' '}
                      {detailBundle.paperSnapshot.readingPassage?.title ||
                        'Academic Reading Passage'}
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                      {detailBundle.paperSnapshot.readingPassage?.content ||
                        'No reading passage recorded.'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {detailBundle.paperSnapshot.readingPassage?.comprehensionQuestions?.map(
                      (cq: any, idx: number) => {
                        const ansObj = detailBundle.answers[cq.id];
                        const selectedCode =
                          extractSelectedOptionCode(ansObj?.responsePayload) || '-';
                        const isCorrect = ansObj?.isCorrect;

                        return (
                          <div
                            key={cq.id || idx}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2"
                          >
                            <div className="flex justify-between items-start font-semibold text-slate-200">
                              <div>
                                Reading Q{idx + 1}: {cq.prompt}
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                              >
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                            </div>
                            <div className="flex gap-4 font-mono text-[11px] pt-1">
                              <div>
                                Correct:{' '}
                                <span className="text-emerald-400 font-bold">
                                  {cq.correctOptionCode || 'B'}
                                </span>
                              </div>
                              <div>
                                Student Choice:{' '}
                                <span
                                  className={
                                    isCorrect
                                      ? 'text-emerald-400 font-bold'
                                      : 'text-rose-400 font-bold'
                                  }
                                >
                                  {String(selectedCode)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: WRITING */}
              {activeTab === 'WRITING' && (
                <div className="space-y-4">
                  {detailBundle.paperSnapshot.writingTasks?.map((wt: any, idx: number) => {
                    const ansObj = detailBundle.answers[wt.id];
                    const essayText =
                      ansObj?.responsePayload?.text ||
                      ansObj?.responsePayload ||
                      'No essay response recorded.';

                    return (
                      <div
                        key={wt.id || idx}
                        className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sky-400 uppercase">
                            Writing Task {wt.taskNumber || idx + 1}: {wt.title}
                          </span>
                          <span className="text-slate-400 font-mono">
                            Min {wt.minWords || 150} Words
                          </span>
                        </div>

                        <p className="text-slate-300 font-medium bg-slate-900 p-3 rounded-lg border border-slate-800">
                          {wt.prompt}
                        </p>

                        <div className="space-y-1">
                          <div className="text-slate-400 font-semibold uppercase text-[10px]">
                            Candidate Essay Response:
                          </div>
                          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                            {String(essayText)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 5: SPEAKING */}
              {activeTab === 'SPEAKING' && (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-center text-slate-400">
                  <div className="font-bold text-sky-400 uppercase">Oral & Speaking Evaluation</div>
                  <p>Audio recording & transcript evaluation pipeline active.</p>
                </div>
              )}

              {/* TAB 6: RESULTS */}
              {activeTab === 'RESULTS' && (
                <div className="space-y-4">
                  {detailBundle.result?.aiFeedback?.summary && (
                    <div className="bg-sky-950/30 border border-sky-800/40 p-4 rounded-xl space-y-1">
                      <div className="font-bold text-sky-400 uppercase">
                        AI Diagnostic Evaluation
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {detailBundle.result.aiFeedback.summary}
                      </p>
                    </div>
                  )}
                  {detailBundle.result?.strengths && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-emerald-400 uppercase">
                        Strongest Competencies
                      </div>
                      <ul className="list-disc list-inside text-slate-300">
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
                  <div className="font-bold text-slate-200 uppercase">
                    Immutable Audit Timeline ({detailBundle.auditTimeline.length} Events)
                  </div>

                  <div className="space-y-2 border-l-2 border-slate-800 pl-4">
                    {detailBundle.auditTimeline.map((evt) => (
                      <div key={evt.id} className="relative space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded font-bold font-mono text-[10px]">
                            {evt.eventType}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 overflow-x-auto">
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
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (statusFilter) query.set('status', statusFilter);
        if (cefrFilter) query.set('cefr', cefrFilter);

        const res = await fetch(`/api/v1/admin/assessment-attempts?${query.toString()}`);
        const data = await res.json();
        if (data.attempts) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error('Failed to fetch admin attempts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttempts();
  }, [search, statusFilter, cefrFilter]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Assessment Audit Console
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Student Attempt Review Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect frozen paper snapshots, candidate answer logs, scoring rubrics, and event
            timelines.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search candidate name, email, or attempt ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>

          <select
            value={cefrFilter}
            onChange={(e) => setCefrFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All CEFR Levels</option>
            <option value="C1">C1 Level</option>
            <option value="B2">B2 Level</option>
            <option value="B1">B1 Level</option>
            <option value="A2">A2 Level</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>Loading student assessment attempts...</div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No student assessment attempts found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Overall Score</th>
                  <th className="p-4">CEFR & Band</th>
                  <th className="p-4">Placement</th>
                  <th className="p-4">Started At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attempts.map((att) => (
                  <tr key={att.attemptId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{att.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{att.studentEmail}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                          att.status === 'SUBMITTED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : att.status === 'IN_PROGRESS'
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-sky-400 font-mono text-sm">{att.score}%</span>
                    </td>
                    <td className="p-4 space-x-1.5">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold">
                        {att.cefrLevel}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">
                        {att.predictedBand}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 font-semibold">{att.placementLevel}</span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] font-mono">
                      {att.startedAt ? new Date(att.startedAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedAttemptId(att.attemptId)}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                      >
                        View Attempt →
                      </button>
                    </td>
                  </tr>
                ))}
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
