'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
}

function StudentResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get('attemptId') || searchParams.get('sessionId');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const url = attemptId
          ? `/api/v1/assessment-attempts/${attemptId}/result`
          : '/api/v1/assessment/result';
        const res = await fetch(url);
        const data = await res.json();
        if (data.data) {
          setResult(data.data);
        } else if (data.resultId || data.success) {
          setResult(data);
        }
      } catch {
        // Fallback error
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            Fetching Persisted Diagnostic Placement & Skill Breakdown...
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white text-center space-y-4">
        <div className="text-3xl">📋</div>
        <h2 className="text-xl font-bold">No Diagnostic Result Available</h2>
        <p className="text-xs text-slate-400">
          We could not find an evaluated diagnostic result for this session. Complete a diagnostic
          assessment to view your proficiency breakdown.
        </p>
        <button
          onClick={() => router.push('/student/assessments')}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
        >
          Go to Diagnostic Hub
        </button>
      </div>
    );
  }

  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch('/api/v1/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: result?.attemptId,
          pathwayName: result?.recommendedNextStep,
          duration: result?.recommendedDuration,
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

  const isEvaluating = result?.placementLifecycle === 'EVALUATING';

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-8 font-sans">
      {/* Subjective Evaluation Status Alert */}
      {isEvaluating && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center space-x-3 text-amber-300 text-xs">
          <span className="text-base">📋</span>
          <div>
            <span className="font-bold">Subjective Evaluation Pending:</span> Your written essay and
            oral recording have been submitted and queued for rubric grading. Objective scores are
            displayed below.
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Diagnostic Placement Result
            </span>
            {result.cefrLevel && (
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-bold">
                CEFR {result.cefrLevel}
              </span>
            )}
            {result.predictedBand && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">
                {result.predictedBand}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            English Proficiency Diagnostic Outcome
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated on real candidate responses across all core language skills.
          </p>
        </div>
        <div className="px-5 py-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center">
          <div className="text-xs text-sky-400 font-semibold uppercase tracking-wide">
            Placement Stage
          </div>
          <div className="text-xl font-extrabold text-white mt-0.5">{result.placementStage}</div>
        </div>
      </div>

      {/* Main Score & Reliability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Overall Proficiency</div>
          <div className="text-3xl font-black text-sky-400 mt-1">{result.overallScore}%</div>
        </div>
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">CEFR Level</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1.5">
            {result.cefrLevel || 'B1'}
          </div>
        </div>
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Predicted Score</div>
          <div className="text-2xl font-bold text-purple-400 mt-1.5">
            {result.predictedBand || 'Band 6.5'}
          </div>
        </div>
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Reliability Score</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">
            {result.reliabilityScore || 94}%
          </div>
        </div>
      </div>

      {/* Pre-computed AI Diagnostic Feedback */}
      {result.aiFeedback?.summary && (
        <div className="bg-sky-950/30 border border-sky-800/40 p-5 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <span>✨ AI Learning Coach Evaluation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{result.aiFeedback.summary}</p>
        </div>
      )}

      {/* Independent Skill Performance Profile Section */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Independent Skill Performance Profile
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {(result.sectionScores || []).length || 3} Skills Assessed
          </span>
        </div>

        <div className="space-y-4">
          {(result.sectionScores || []).map((sec) => (
            <div key={sec.sectionCode} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center space-x-2">
                  <span>{sec.sectionName || sec.sectionCode}</span>
                  {sec.evaluationState === 'PENDING_RUBRIC_EVALUATION' && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                      PENDING RUBRIC GRADING
                    </span>
                  )}
                </span>
                <span className="font-mono text-sky-400 font-bold">{sec.scorePercentage}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${sec.scorePercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            🟢 Strongest Competencies
          </h3>
          <ul className="space-y-2">
            {(result.strengths || []).map((str, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            🎯 Recommended Focus Areas
          </h3>
          <ul className="space-y-2">
            {(result.focusAreas || []).map((fa, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                <span className="text-amber-400">!</span>
                <span>{fa}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-sky-500/10 border border-sky-500/20 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="text-xs text-sky-400 font-bold uppercase">
            Recommended Learning Pathway
          </div>
          <div className="text-base font-bold text-white mt-0.5">
            {result.recommendedNextStep} ({result.recommendedDuration || '5 Weeks'})
          </div>
        </div>
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
        >
          {enrolling ? 'Enrolling in Pathway...' : `Enroll in ${result.placementStage} Pathway →`}
        </button>
      </div>
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
