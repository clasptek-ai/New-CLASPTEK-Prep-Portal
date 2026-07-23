'use client';

import React from 'react';

interface ScorePredictionCardProps {
  examCode: string;
  officialLabel: string;
  percentile: number;
  readinessPct: number;
  passProbabilityPct: number;
}

export const ScorePredictionCard: React.FC<ScorePredictionCardProps> = ({
  examCode,
  officialLabel,
  percentile,
  readinessPct,
  passProbabilityPct,
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-950 border border-indigo-500/30 rounded-xl p-6 shadow-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Official Score Projection ({examCode})
        </span>
        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full border border-indigo-500/30 font-medium">
          Top {100 - percentile}%ile
        </span>
      </div>

      <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-200 mb-6">
        {officialLabel}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
        <div>
          <span className="text-xs text-zinc-400 block">Exam Readiness</span>
          <span className="text-xl font-bold text-emerald-400">{readinessPct}%</span>
        </div>
        <div>
          <span className="text-xs text-zinc-400 block">Pass Probability</span>
          <span className="text-xl font-bold text-cyan-400">{passProbabilityPct}%</span>
        </div>
      </div>
    </div>
  );
};
