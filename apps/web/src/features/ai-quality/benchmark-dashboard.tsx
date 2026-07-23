'use client';

import React, { useState, useEffect } from 'react';

interface BenchmarkRun {
  id: string;
  datasetId: string;
  triggerType: string;
  status: string;
  agreementRate?: number;
  calibrationAccuracy?: number;
  avgScoreDifference?: number;
  falsePositiveRate?: number;
  falseNegativeRate?: number;
  avgLatencyMs?: number;
  totalCostUsd?: number;
  createdAt: string;
}

interface Regression {
  id: string;
  runId: string;
  regressionType: string;
  severity: string;
  currentValue: number;
  baselineValue?: number;
  thresholdValue?: number;
  delta?: number;
  deltaPercent?: number;
  description: string;
  isResolved: boolean;
  detectedAt: string;
}

interface BenchmarkResult {
  id: string;
  datasetItemId: string;
  aiScore: number;
  humanScore: number;
  scoreDifference: number;
  agreesWithHuman: boolean;
  confidence: number;
  latencyMs: number;
  costUsd: number;
}

export default function BenchmarkDashboard() {
  const [runs, setRuns] = useState<BenchmarkRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [regressions, setRegressions] = useState<Regression[]>([]);
  const [decision, setDecision] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load runs and regressions
    Promise.all([
      fetch('/api/v1/ai/benchmark/history').then((res) => res.json()),
      fetch('/api/v1/ai/benchmark/regressions').then((res) => res.json()),
    ])
      .then(([runsData, regsData]) => {
        if (runsData.success) {
          setRuns(runsData.runs);
          if (runsData.runs.length > 0) {
            setSelectedRunId(runsData.runs[0].id);
          }
        }
        if (regsData.success) {
          setRegressions(regsData.regressions);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRunId) return;
    // Load results and deployment decision for the selected run
    Promise.all([
      fetch(`/api/v1/ai/benchmark/results?runId=${selectedRunId}`).then((res) => res.json()),
      fetch(`/api/v1/ai/deployment/decision?runId=${selectedRunId}`).then((res) => res.json()),
    ])
      .then(([resultsData, decisionData]) => {
        if (resultsData.success) {
          setResults(resultsData.results);
        }
        if (decisionData.success) {
          setDecision(decisionData.decision);
        } else {
          setDecision(null);
        }
      })
      .catch(() => {
        setResults([]);
        setDecision(null);
      });
  }, [selectedRunId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-950 text-cyan-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Benchmark Dataset & Continuous Integration Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Golden-dataset regression analysis and automated deployment gate verification.
            </p>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Runs List & Regressions */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                Benchmark Runs
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {runs.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRunId(r.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                      selectedRunId === r.id
                        ? 'bg-slate-800/80 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm text-slate-200">
                        Run: {r.id.substring(0, 8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          r.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      <div>Trigger: {r.triggerType}</div>
                      <div className="mt-1">Date: {new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Regression Log */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                Active Regressions
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {regressions.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-rose-400">{reg.regressionType}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold text-[9px]">
                        {reg.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{reg.description}</p>
                    <div className="text-[10px] text-slate-500">
                      Detected: {new Date(reg.detectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {regressions.length === 0 && (
                  <div className="text-slate-500 text-sm py-4 text-center">
                    No active regressions.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Run Details, Deployment Verdict, Results List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deployment gate alert */}
            {decision && (
              <div
                className={`border rounded-xl p-6 relative overflow-hidden bg-gradient-to-r ${
                  decision.verdict === 'APPROVED'
                    ? 'from-emerald-950/40 to-slate-950 border-emerald-500/30'
                    : decision.verdict === 'NEEDS_REVIEW'
                      ? 'from-amber-950/40 to-slate-950 border-amber-500/30'
                      : 'from-rose-950/40 to-slate-950 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Automated Deployment Gate Verdict
                    </h3>
                    <h2
                      className={`text-2xl font-extrabold mt-1 uppercase ${
                        decision.verdict === 'APPROVED'
                          ? 'text-emerald-400'
                          : decision.verdict === 'NEEDS_REVIEW'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {decision.verdict}
                    </h2>
                    <p className="text-xs text-slate-300 mt-2 max-w-xl">
                      Reason: {decision.decisionReason}
                    </p>
                  </div>
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center border font-extrabold text-lg ${
                      decision.verdict === 'APPROVED'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : decision.verdict === 'NEEDS_REVIEW'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {decision.verdict === 'APPROVED'
                      ? 'GO'
                      : decision.verdict === 'NEEDS_REVIEW'
                        ? 'WARN'
                        : 'HALT'}
                  </div>
                </div>
              </div>
            )}

            {/* AI vs Human Scatter/Results List */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                Human vs AI Comparison Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Item ID</th>
                      <th className="py-2">AI Score</th>
                      <th className="py-2">Human Score</th>
                      <th className="py-2">Difference</th>
                      <th className="py-2">Agreements</th>
                      <th className="py-2">Confidence</th>
                      <th className="py-2">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => (
                      <tr
                        key={res.id}
                        className="border-b border-slate-800/40 hover:bg-slate-800/10"
                      >
                        <td className="py-3 font-mono text-slate-400">
                          {res.datasetItemId.substring(0, 8)}
                        </td>
                        <td className="py-3 font-semibold text-slate-200">
                          {res.aiScore?.toFixed(2) ?? 'N/A'}
                        </td>
                        <td className="py-3 text-slate-200">{res.humanScore.toFixed(2)}</td>
                        <td
                          className={`py-3 ${
                            Math.abs(res.scoreDifference) <= 0.5
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {res.scoreDifference !== undefined
                            ? `${res.scoreDifference > 0 ? '+' : ''}${res.scoreDifference.toFixed(2)}`
                            : 'N/A'}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.agreesWithHuman
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {res.agreesWithHuman ? 'AGREE' : 'DISAGREE'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">
                          {res.confidence ? `${Math.round(res.confidence * 100)}%` : 'N/A'}
                        </td>
                        <td className="py-3 text-slate-400">{res.latencyMs} ms</td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-slate-500 py-8">
                          No results for this run.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
