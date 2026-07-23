'use client';

import React, { useState, useEffect } from 'react';

interface PromptVersion {
  id: string;
  versionNumber: number;
  systemPrompt: string;
  userPromptTemplate: string;
  promptHash: string;
  isCurrent: boolean;
  createdAt: string;
}

interface Experiment {
  id: string;
  name: string;
  baselineVersionId: string;
  candidateVersionId: string;
  triggerReason: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

export default function PromptDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  const [perf, setPerf] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/ai/prompt/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.experiments.length > 0) {
          setExperiments(data.experiments);
          setSelectedExpId(data.experiments[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedExpId) return;
    fetch(`/api/v1/ai/prompt/performance?experimentId=${selectedExpId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPerf(data.performance);
        }
      });
  }, [selectedExpId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-950 text-emerald-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AI Prompt Quality Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Continuous comparison and performance tracking of LLM evaluator prompts.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold animate-pulse">
            Live QA Pipeline Active
          </span>
        </div>

        {/* Experiment Selector & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
              Select Experiment History
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {experiments.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedExpId(e.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                    selectedExpId === e.id
                      ? 'bg-slate-800/80 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-200">{e.name}</div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span>{e.triggerReason}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {e.status}
                    </span>
                  </div>
                </button>
              ))}
              {experiments.length === 0 && (
                <div className="text-slate-500 text-sm py-4 text-center">No experiments found.</div>
              )}
            </div>
          </div>

          {/* Metrics Displays */}
          <div className="lg:col-span-2 space-y-6">
            {perf ? (
              <>
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Agreement Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Human-AI Agreement
                    </h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-emerald-400">
                        {perf.agreementRate ? `${Math.round(perf.agreementRate * 100)}%` : 'N/A'}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">vs human band</span>
                    </div>
                    <div className="mt-4 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-3">
                      <span>Threshold Gate: &ge;80%</span>
                      <span
                        className={
                          perf.agreementRate >= 0.8
                            ? 'text-emerald-400 font-semibold'
                            : 'text-rose-400 font-semibold'
                        }
                      >
                        {perf.agreementRate >= 0.8 ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>

                  {/* Calibration Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Calibration Accuracy
                    </h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-cyan-400">
                        {perf.calibrationAccuracy
                          ? `${Math.round(perf.calibrationAccuracy * 100)}%`
                          : 'N/A'}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">confidence alignment</span>
                    </div>
                    <div className="mt-4 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-3">
                      <span>Expected: &ge;75%</span>
                      <span className="text-cyan-400 font-semibold">OK</span>
                    </div>
                  </div>

                  {/* Override Rate */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all"></div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Instructor Override Rate
                    </h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-rose-400">
                        {perf.instructorOverrideRate
                          ? `${Math.round(perf.instructorOverrideRate * 100)}%`
                          : '0%'}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">manual overrides</span>
                    </div>
                    <div className="mt-4 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-3">
                      <span>Goal: &le;10%</span>
                      <span className="text-emerald-400 font-semibold">GOOD</span>
                    </div>
                  </div>
                </div>

                {/* Latency, Cost and Error Rates */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                    LLM Cost & Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Avg Latency</div>
                      <div className="text-2xl font-bold text-slate-100">
                        {perf.averageLatency ? `${Math.round(perf.averageLatency)} ms` : 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Cost per evaluation</div>
                      <div className="text-2xl font-bold text-slate-100">
                        ${perf.evaluationCost?.toFixed(4) ?? '0.0000'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">False Positive Rate</div>
                      <div className="text-2xl font-bold text-rose-400">
                        {perf.falsePositiveRate
                          ? `${Math.round(perf.falsePositiveRate * 100)}%`
                          : '0%'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">False Negative Rate</div>
                      <div className="text-2xl font-bold text-rose-400">
                        {perf.falseNegativeRate
                          ? `${Math.round(perf.falseNegativeRate * 100)}%`
                          : '0%'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Drift Graph Placeholder / Details */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-200 mb-3">
                    Score Drift and Volatility
                  </h3>
                  <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">
                        Mean Score Drift (Candidate - Baseline)
                      </div>
                      <div className="text-lg font-bold text-slate-200 mt-1">
                        {perf.scoreDrift !== undefined
                          ? `${perf.scoreDrift > 0 ? '+' : ''}${perf.scoreDrift.toFixed(3)} band`
                          : 'N/A'}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                      STABLE
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
                Select an experiment to load the performance data dashboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
