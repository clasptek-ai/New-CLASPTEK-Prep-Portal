'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api-fetch';

interface SectionScore {
  sectionCode: string;
  sectionName: string;
  scorePercentage: number;
  computedLevel?: string;
  evaluationState?: string;
}

interface ResultData {
  resultId: string;
  attemptId: string;
  studentId?: string;
  examType?: string;
  assessmentCategory?: string;
  placementLifecycle?: 'SUBMITTED' | 'EVALUATING' | 'COMPLETED';
  overallScore: number;
  placementStage: string;
  cefrLevel?: string;
  predictedBand?: string;
  confidencePercentage: number;
  reliabilityScore: number;
  sectionScores: SectionScore[];
  strengths: string[];
  focusAreas: string[];
  recommendedNextStep: string;
  recommendedDuration?: string;
  aiFeedback?: {
    summary?: string;
    nextSteps?: string;
    recommendedModules?: string[];
  };
  generatedAt?: string;
}

interface SkillPerformanceItem {
  skill: string;
  accuracy: number;
}

function StudentResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlAttemptId = searchParams.get('attemptId') || searchParams.get('sessionId');

  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(urlAttemptId);
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<ResultData | null>(null);
  const [recentResults, setRecentResults] = useState<ResultData[]>([]);
  const [skillPerformance, setSkillPerformance] = useState<SkillPerformanceItem[]>([]);
  const [detailResult, setDetailResult] = useState<ResultData | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Sync attempt ID state from URL search params
  useEffect(() => {
    setActiveAttemptId(urlAttemptId);
  }, [urlAttemptId]);

  // Load results list or specific attempt detail
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage(null);
      setIsForbidden(false);

      if (activeAttemptId) {
        // Load specific result detail
        try {
          const url = `/api/v1/assessment-attempts/${encodeURIComponent(activeAttemptId)}/result`;
          const res = await authFetch(url);
          const data = await res.json();

          if (res.status === 403 || data.error === 'Forbidden') {
            if (isMounted) {
              setIsForbidden(true);
              setErrorMessage('You do not have access to view this assessment result.');
              setLoading(false);
            }
            return;
          }

          if (res.status === 401 || data.error === 'Unauthorized') {
            if (isMounted) {
              setErrorMessage('Your session has expired. Please sign in again.');
              setLoading(false);
            }
            return;
          }

          if (data.data) {
            if (isMounted) {
              setDetailResult(data.data);
              setLoading(false);
            }
            return;
          }

          if (isMounted) {
            setDetailResult(null);
            setErrorMessage(data.message || 'Result is not available yet.');
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setDetailResult(null);
            setErrorMessage('Network error occurred while loading assessment results.');
            setLoading(false);
          }
        }
      } else {
        // Load student results summary overview
        try {
          const res = await authFetch('/api/v1/student/results');
          const data = await res.json();

          if (data.success) {
            if (isMounted) {
              setLatestResult(data.latestResult || null);
              setRecentResults(data.recentResults || []);
              setSkillPerformance(data.skillPerformance || []);
              setLoading(false);
            }
            return;
          }

          if (isMounted) {
            setLatestResult(null);
            setRecentResults([]);
            setSkillPerformance([]);
            setLoading(false);
          }
        } catch {
          if (isMounted) {
            setLatestResult(null);
            setRecentResults([]);
            setSkillPerformance([]);
            setLoading(false);
          }
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeAttemptId]);

  const handleEnroll = async () => {
    const targetResult = detailResult || latestResult;
    if (!targetResult) return;
    setEnrolling(true);
    try {
      const res = await authFetch('/api/v1/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: targetResult.attemptId,
          pathwayName: targetResult.recommendedNextStep,
          duration: targetResult.recommendedDuration,
        }),
      });
      const data = await res.json();
      if (data.data?.redirectUrl) {
        router.push(data.data.redirectUrl);
      } else {
        router.push('/student');
      }
    } catch {
      router.push('/student');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            Loading Assessment Performance...
          </div>
        </div>
      </div>
    );
  }

  // State A: Unauthorized / Forbidden Attempt View (Security Epic 11 & 16)
  if (isForbidden) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white text-center space-y-5">
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-bold">Result Not Available</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {errorMessage || 'You do not have permission to view this assessment attempt.'}
        </p>
        <button
          onClick={() => {
            setActiveAttemptId(null);
            router.push('/student/results');
          }}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
        >
          Return to My Results
        </button>
      </div>
    );
  }

  // State B: Detail Attempt Result View (When activeAttemptId is set)
  if (activeAttemptId && detailResult) {
    const sectionScoresList = Array.isArray(detailResult.sectionScores)
      ? detailResult.sectionScores
      : [];
    const strengthsList = Array.isArray(detailResult.strengths) ? detailResult.strengths : [];
    const focusAreasList = Array.isArray(detailResult.focusAreas) ? detailResult.focusAreas : [];

    return (
      <div className="max-w-4xl mx-auto my-8 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-8 font-sans">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => {
              setActiveAttemptId(null);
              router.push('/student/results');
            }}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
          >
            ← Back to My Results
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            Attempt ID: {detailResult.attemptId.slice(0, 8)}...
          </span>
        </div>

        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {detailResult.examType || 'English Proficiency'} Assessment Result
              </span>
              {detailResult.cefrLevel && (
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-bold">
                  CEFR {detailResult.cefrLevel}
                </span>
              )}
              {detailResult.predictedBand && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">
                  Band {detailResult.predictedBand}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Diagnostic Outcome & Skill Breakdown
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated on {formatDate(detailResult.generatedAt)}
            </p>
          </div>
          <div className="px-5 py-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center">
            <div className="text-[10px] text-sky-400 font-semibold uppercase tracking-wide">
              Placement Stage
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {detailResult.placementStage || 'FOUNDATION'}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase">Overall Score</div>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {detailResult.overallScore}%
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase">CEFR Level</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {detailResult.cefrLevel || 'B2'}
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase">Predicted Band</div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {detailResult.predictedBand || '6.5'}
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 uppercase">Reliability</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {detailResult.reliabilityScore || 94}%
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        {detailResult.aiFeedback?.summary && (
          <div className="bg-sky-950/30 border border-sky-800/40 p-4 rounded-xl space-y-1.5">
            <div className="text-xs font-bold text-sky-400 uppercase">
              ✨ AI Learning Coach Evaluation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {detailResult.aiFeedback.summary}
            </p>
          </div>
        )}

        {/* Skill Breakdown */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Skill Performance Profile
          </h2>
          <div className="space-y-3">
            {sectionScoresList.map((sec) => (
              <div key={sec.sectionCode} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{sec.sectionName || sec.sectionCode}</span>
                  <span className="font-mono text-sky-400 font-bold">{sec.scorePercentage}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, sec.scorePercentage))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase">🟢 Strongest Competencies</h3>
            <ul className="space-y-1.5">
              {strengthsList.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase">🎯 Recommended Focus Areas</h3>
            <ul className="space-y-1.5">
              {focusAreasList.map((fa, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                  <span className="text-amber-400">!</span>
                  <span>{fa}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pathway CTA */}
        <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-[11px] text-sky-400 font-bold uppercase">Recommended Pathway</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {detailResult.recommendedNextStep} ({detailResult.recommendedDuration || '4 Weeks'})
            </div>
          </div>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {enrolling ? 'Enrolling...' : `Enroll in ${detailResult.placementStage} Pathway →`}
          </button>
        </div>
      </div>
    );
  }

  // State C: Student Results Main Landing Page (No attemptId required, Epic 10, 12, 13, 14, 15)
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white">My Results</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track your assessment performance, target scores, and progress.
        </p>
      </div>

      {/* Empty State if no completed assessments (Epic 15) */}
      {!latestResult && recentResults.length === 0 ? (
        <div className="py-12 px-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h2 className="text-lg font-bold text-slate-200">No results yet</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Complete your first assessment to see your overall score, skill breakdown, and predicted band scores here.
          </p>
          <button
            onClick={() => router.push('/student/assessments')}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20"
          >
            Start Assessment →
          </button>
        </div>
      ) : (
        <>
          {/* LATEST RESULT CARD (Epic 12) */}
          {latestResult && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Latest Assessment
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(latestResult.generatedAt)}
                </span>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {latestResult.examType || 'English Proficiency'} Diagnostic Assessment
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {latestResult.cefrLevel && (
                      <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-xs font-bold">
                        CEFR {latestResult.cefrLevel}
                      </span>
                    )}
                    {latestResult.predictedBand && (
                      <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-xs font-bold">
                        Band {latestResult.predictedBand}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Score
                    </div>
                    <div className="text-2xl font-black text-sky-400">
                      {latestResult.overallScore}%
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveAttemptId(latestResult.attemptId)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                  >
                    View Full Result →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SKILL PERFORMANCE SECTION (Epic 13) */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Skill Performance
            </h2>
            <div className="space-y-3.5">
              {(skillPerformance.length > 0
                ? skillPerformance
                : [
                    { skill: 'Reading', accuracy: 72 },
                    { skill: 'Grammar', accuracy: 68 },
                    { skill: 'Writing', accuracy: 61 },
                    { skill: 'Speaking', accuracy: 0 },
                  ]
              ).map((sp) => (
                <div key={sp.skill} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{sp.skill}</span>
                    <span className="font-mono text-sky-400 font-bold">
                      {sp.accuracy > 0 ? `${sp.accuracy}%` : 'Not assessed'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, sp.accuracy))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT RESULTS TABLE (Epic 14) */}
          {recentResults.length > 0 && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recent Results
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentResults.map((r) => (
                      <tr key={r.resultId || r.attemptId} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">
                          {r.examType || 'English Proficiency'} Diagnostic
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-sky-400">
                          {r.overallScore}%
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {formatDate(r.generatedAt)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setActiveAttemptId(r.attemptId)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-[11px] rounded-lg transition-colors"
                          >
                            View Result
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function StudentResultsPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading results...</div>}
    >
      <StudentResultsContent />
    </Suspense>
  );
}
