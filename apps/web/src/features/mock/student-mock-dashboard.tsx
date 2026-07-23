'use client';

import React, { useState, useEffect } from 'react';
import { ScorePredictionCard } from '@/components/mock/score-prediction-card';

export const StudentMockDashboard: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tempRes, readRes] = await Promise.all([
          fetch('/api/v1/mock/templates'),
          fetch('/api/v1/mock/readiness'),
        ]);
        const tempJson = await tempRes.json();
        const readJson = await readRes.json();

        if (tempJson.success) setTemplates(tempJson.templates);
        if (readJson.success) setReadiness(readJson.readiness);
      } catch (err) {
        console.error('Failed loading mock dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-zinc-400 font-mono">Loading Mock Examination Arena...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 space-y-8">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
            Mock Examination Arena
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Simulate real timed standardized exams under exam-day conditions
          </p>
        </div>
        <div className="flex gap-3">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold">
            Status: Ready
          </span>
        </div>
      </header>

      {readiness && (
        <ScorePredictionCard
          examCode="IELTS-ACAD"
          officialLabel="IELTS Band 7.5"
          percentile={90}
          readinessPct={readiness.overallReadinessPct}
          passProbabilityPct={readiness.passProbabilityPct}
        />
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-200">Available Full-Length Mock Exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length > 0 ? (
            templates.map((t) => (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-all rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                      {t.scoringStrategy} Strategy
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">v{t.version}.0</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100">Full Academic Simulation</h3>
                  <p className="text-xs text-zinc-400 mt-2">
                    Duration: {t.totalDurationMinutes} mins | Passing: {t.passingScore}%
                  </p>
                </div>
                <button
                  onClick={() => alert(`Starting session for template: ${t.id}`)}
                  className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-all"
                >
                  Start Exam Session ➔
                </button>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-zinc-400 text-sm">
              Standardized IELTS Academic Simulation Template v1.0 (180 mins)
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
