'use client';

import React from 'react';

export interface MockResultsProps {
  scoreLabel: string;
  percentile: number;
  hasPendingSubjective: boolean;
}

export function MockResults({ scoreLabel, percentile, hasPendingSubjective }: MockResultsProps) {
  return (
    <div className="bg-slate-900 text-white p-8 rounded-2xl max-w-xl mx-auto my-12 border border-slate-800 shadow-2xl text-center">
      <h1 className="text-3xl font-extrabold text-sky-400 mb-2">Mock Results</h1>
      <p className="text-slate-400 text-sm mb-6">Official Scaled Score & Percentile Rank</p>
      <div className="text-5xl font-black text-emerald-400 mb-4">{scoreLabel}</div>
      <div className="inline-block bg-slate-800 px-4 py-2 rounded-full text-slate-300 font-semibold mb-6">
        {percentile}th Percentile
      </div>
      {hasPendingSubjective && (
        <div className="p-4 bg-amber-950/50 border border-amber-800/60 rounded-lg text-amber-300 text-sm">
          Writing/Speaking sections are queued for subjective evaluation. Final band score will
          update upon completion.
        </div>
      )}
    </div>
  );
}
