'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api-fetch';
import {
  Shield,
  ArrowRight,
  Download,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Clock,
  Award,
} from 'lucide-react';

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
              setErrorMessage('You do not have permission to view this assessment result.');
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
        } catch {
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
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
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
      <div className="min-h-96 flex items-center justify-center p-8 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#045EAD] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-[#475569]">
            Loading Assessment Performance...
          </div>
        </div>
      </div>
    );
  }

  // State A: Unauthorized / Forbidden Attempt View
  if (isForbidden) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-5 shadow-sm font-sans">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-deep-navy">Result Not Available</h2>
        <p className="text-xs text-[#475569] max-w-md mx-auto">
          {errorMessage || 'You do not have permission to view this assessment attempt.'}
        </p>
        <button
          onClick={() => {
            setActiveAttemptId(null);
            router.push('/student/results');
          }}
          className="px-5 py-2.5 bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
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

    // Calculate circumference for circular gauge (radius = 38, perimeter = 238.76)
    const scoreVal = Math.min(100, Math.max(0, detailResult.overallScore || 0));
    const circumference = 238.76;
    const strokeDashoffset = circumference - (scoreVal / 100) * circumference;

    return (
      <div className="max-w-5xl mx-auto my-8 p-6 md:p-8 bg-white border border-slate-200 rounded-2xl space-y-8 font-sans shadow-sm">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <button
            onClick={() => {
              setActiveAttemptId(null);
              router.push('/student/results');
            }}
            className="text-xs font-bold text-[#045EAD] hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← Return to All Results
          </button>
          <span className="text-[11px] text-[#475569] font-mono">
            Session ID: {detailResult.attemptId.slice(0, 8)}...
          </span>
        </div>

        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#045EAD] uppercase tracking-wider bg-bg-light-blue px-2.5 py-0.5 rounded-full">
                {detailResult.examType || 'English Proficiency'} Diagnostic Audit
              </span>
              {detailResult.cefrLevel && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                  CEFR {detailResult.cefrLevel}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-navy tracking-tight">
              Assessment Outcome &amp; Performance Breakdown
            </h1>
            <p className="text-xs text-[#475569] mt-1">
              Evaluated by Authoritative Examination Engine on {formatDate(detailResult.generatedAt)}
            </p>
          </div>

          <div className="px-5 py-3 bg-bg-neutral border border-slate-200 rounded-xl text-center self-start md:self-auto">
            <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">
              Placement Stage
            </div>
            <div className="text-base font-extrabold text-deep-navy mt-0.5">
              {detailResult.placementStage || 'FOUNDATION'}
            </div>
          </div>
        </div>

        {/* Bento Score Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Overall Band / Score Card with SVG Radial Gauge */}
          <div className="lg:col-span-5 bg-bg-neutral border border-slate-200 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#045EAD]" />

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] block">
                Overall Diagnostic Band
              </span>
              <div className="my-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-4xl font-extrabold text-deep-navy leading-none tabular-nums">
                    {detailResult.predictedBand || (detailResult.overallScore / 10).toFixed(1)}
                  </div>
                  <span className="text-xs text-[#475569] font-medium block mt-1">
                    Raw Score: {detailResult.overallScore}%
                  </span>
                </div>

                {/* SVG Radial Gauge */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="#045EAD"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="238.76"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-deep-navy">
                    {detailResult.overallScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-[#475569] flex items-center justify-between">
              <span>Reliability Index</span>
              <span className="font-bold text-emerald-700">{detailResult.reliabilityScore || 94}%</span>
            </div>
          </div>

          {/* Right: Sub-Score Granular Calibration */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] block mb-3">
                Sub-Score Granular Calibration
              </span>
              <div className="space-y-3">
                {sectionScoresList.map((sec) => (
                  <div key={sec.sectionCode} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-deep-navy">
                        {sec.sectionName || sec.sectionCode}
                      </span>
                      <span className="font-mono text-[#045EAD] font-bold">
                        {sec.scorePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#045EAD] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, sec.scorePercentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        {detailResult.aiFeedback?.summary && (
          <div className="bg-bg-light-blue border border-[#B9DDF8] p-5 rounded-xl space-y-1.5">
            <div className="text-xs font-bold text-[#045EAD] uppercase tracking-wider flex items-center gap-1.5">
              <span>Diagnostic Learning Evaluation</span>
            </div>
            <p className="text-xs text-deep-navy leading-relaxed">
              {detailResult.aiFeedback.summary}
            </p>
          </div>
        )}

        {/* Strengths & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-neutral p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Strongest Competencies
            </h3>
            <ul className="space-y-1.5">
              {strengthsList.map((str, idx) => (
                <li key={idx} className="text-xs text-[#475569] flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-bg-neutral p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Recommended Focus Areas
            </h3>
            <ul className="space-y-1.5">
              {focusAreasList.map((fa, idx) => (
                <li key={idx} className="text-xs text-[#475569] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{fa}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Pathway Banner */}
        <div className="bg-bg-neutral border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-[11px] text-[#045EAD] font-bold uppercase tracking-wider">
              Recommended Preparation Pathway
            </div>
            <div className="text-sm font-bold text-deep-navy mt-0.5">
              {detailResult.recommendedNextStep} ({detailResult.recommendedDuration || '4 Weeks'})
            </div>
          </div>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-6 py-2.5 bg-[#045EAD] hover:bg-brand-hover text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {enrolling ? 'Enrolling...' : `Enroll in ${detailResult.placementStage} Track →`}
          </button>
        </div>
      </div>
    );
  }

  // State C: Student Results Main Landing Page
  return (
    <div className="max-w-5xl mx-auto my-8 p-6 md:p-8 bg-white border border-slate-200 rounded-2xl space-y-8 font-sans shadow-sm">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#045EAD] bg-bg-light-blue px-2.5 py-0.5 rounded-full">
            Performance Ledger
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-deep-navy tracking-tight">My Assessment Results</h1>
        <p className="text-xs text-[#475569] mt-1">
          Authoritative assessment records, calibrated target scores, and skill progression history.
        </p>
      </div>

      {/* Empty State if no completed assessments */}
      {!latestResult && recentResults.length === 0 ? (
        <div className="py-16 px-6 bg-bg-neutral border border-slate-200 rounded-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-bg-light-blue text-[#045EAD] flex items-center justify-center mx-auto">
            <Award size={24} />
          </div>
          <h2 className="text-lg font-bold text-deep-navy">No results yet</h2>
          <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
            Complete your first diagnostic assessment to calibrate your baseline score and generate
            skill profiles here.
          </p>
          <button
            onClick={() => router.push('/student/assessments')}
            className="px-6 py-2.5 bg-[#045EAD] hover:bg-brand-hover text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Start Pre-Assessment</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <>
          {/* LATEST RESULT CARD */}
          {latestResult && (
            <div className="bg-bg-neutral p-6 rounded-2xl border border-slate-200 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#045EAD]" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#045EAD] uppercase tracking-wider">
                  Latest Completed Assessment
                </span>
                <span className="text-xs text-[#475569]">{formatDate(latestResult.generatedAt)}</span>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-deep-navy">
                    {latestResult.examType || 'English Proficiency'} Diagnostic Assessment
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {latestResult.cefrLevel && (
                      <span className="px-2.5 py-0.5 bg-bg-light-blue text-[#045EAD] rounded text-xs font-bold">
                        CEFR {latestResult.cefrLevel}
                      </span>
                    )}
                    {latestResult.predictedBand && (
                      <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-bold">
                        Band {latestResult.predictedBand}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-[#475569] uppercase font-semibold">Score</div>
                    <div className="text-2xl font-black text-deep-navy">{latestResult.overallScore}%</div>
                  </div>
                  <button
                    onClick={() => setActiveAttemptId(latestResult.attemptId)}
                    className="px-5 py-2.5 bg-[#045EAD] hover:bg-brand-hover text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Full Result</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RECENT RESULTS TABLE */}
          {recentResults.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h2 className="text-xs font-bold text-deep-navy uppercase tracking-wider">
                Assessment History
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#475569]">
                  <thead className="border-b border-slate-200 text-[#475569] uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentResults.map((r) => (
                      <tr key={r.resultId || r.attemptId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-deep-navy">
                          {r.examType || 'English Proficiency'} Diagnostic
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#045EAD]">
                          {r.overallScore}%
                        </td>
                        <td className="py-3 px-3 text-[#475569]">{formatDate(r.generatedAt)}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setActiveAttemptId(r.attemptId)}
                            className="px-3 py-1.5 bg-bg-neutral hover:bg-slate-200 text-deep-navy font-semibold text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer"
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
      fallback={
        <div className="min-h-96 flex items-center justify-center text-slate-500 p-8">
          Loading results...
        </div>
      }
    >
      <StudentResultsContent />
    </Suspense>
  );
}
