'use client';

import React, { useEffect, useState } from 'react';

interface AttemptSummary {
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

interface AttemptDetailBundle {
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

export function AttemptReviewConsole() {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cefrFilter, setCefrFilter] = useState('');

  // Selected attempt detail modal state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [detailBundle, setDetailBundle] = useState<AttemptDetailBundle | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUESTIONS' | 'WRITING' | 'AUDIT'>(
    'OVERVIEW'
  );

  // Load attempts list
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

  // Load attempt detail bundle when attempt is selected
  useEffect(() => {
    if (!selectedAttemptId) {
      setDetailBundle(null);
      return;
    }

    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/assessment-attempts/${selectedAttemptId}`);
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
  }, [selectedAttemptId]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Assessment Management Console
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Student Attempt Review Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit frozen paper snapshots, candidate answer logs, scoring rubrics, and event
            timelines.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
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

      {/* Table List */}
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
                        Inspect Paper Snapshot →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Frozen Paper Snapshot Review Modal */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  Attempt Audit & Paper Snapshot
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {detailBundle?.attempt.studentName} ({detailBundle?.attempt.studentEmail})
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Attempt ID: {selectedAttemptId}
                </div>
              </div>
              <button
                onClick={() => setSelectedAttemptId(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 space-x-4">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'OVERVIEW'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Overview & Result
              </button>
              <button
                onClick={() => setActiveTab('QUESTIONS')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'QUESTIONS'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Questions & Answers
              </button>
              <button
                onClick={() => setActiveTab('WRITING')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'WRITING'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Essay & Writing Response
              </button>
              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'AUDIT'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                4. Audit Event Timeline
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {detailLoading ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>Deserializing frozen paper snapshot & audit events...</div>
                </div>
              ) : !detailBundle ? (
                <div className="text-center text-rose-400">Failed to load attempt details.</div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW & RESULT */}
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
                            {detailBundle.result?.cefrLevel || 'B1'}
                          </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400 uppercase">Predicted Band</div>
                          <div className="text-xl font-bold text-purple-400 mt-1">
                            {detailBundle.result?.predictedBand || 'Band 6.5'}
                          </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400 uppercase">Placement</div>
                          <div className="text-base font-bold text-emerald-400 mt-1.5">
                            {detailBundle.result?.placementLevel || 'FOUNDATION'}
                          </div>
                        </div>
                      </div>

                      {/* Section Scores */}
                      {detailBundle.result?.sectionScores && (
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                          <div className="font-bold text-slate-200 uppercase tracking-wider">
                            Section Breakdown
                          </div>
                          <div className="space-y-3">
                            {detailBundle.result.sectionScores.map((sec) => (
                              <div key={sec.sectionCode} className="space-y-1">
                                <div className="flex justify-between font-semibold">
                                  <span>{sec.sectionName || sec.sectionCode}</span>
                                  <span className="text-sky-400">{sec.scorePercentage}%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-sky-500 h-full rounded-full"
                                    style={{ width: `${sec.scorePercentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Feedback */}
                      {detailBundle.result?.aiFeedback?.summary && (
                        <div className="bg-sky-950/30 border border-sky-800/40 p-4 rounded-xl space-y-1">
                          <div className="font-bold text-sky-400 uppercase">
                            AI Learning Feedback
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {detailBundle.result.aiFeedback.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: QUESTIONS & ANSWERS */}
                  {activeTab === 'QUESTIONS' && (
                    <div className="space-y-4">
                      <div className="font-bold text-slate-200 uppercase">
                        Frozen Paper Snapshot Items (
                        {detailBundle.paperSnapshot.grammarQuestions?.length || 0} Questions)
                      </div>

                      <div className="space-y-3">
                        {detailBundle.paperSnapshot.grammarQuestions?.map((q: any, idx: number) => {
                          const ansObj = detailBundle.answers[q.id];
                          const selectedCode =
                            ansObj?.responsePayload?.selectedOptionCode ||
                            ansObj?.responsePayload ||
                            '-';
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
                                  <span className="text-slate-500">Candidate Answer: </span>
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

                  {/* TAB 3: WRITING */}
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

                  {/* TAB 4: AUDIT LOG TIMELINE */}
                  {activeTab === 'AUDIT' && (
                    <div className="space-y-3">
                      <div className="font-bold text-slate-200 uppercase">
                        Immutable Attempt Audit Event Log ({detailBundle.auditTimeline.length}{' '}
                        Events)
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
      )}
    </div>
  );
}
