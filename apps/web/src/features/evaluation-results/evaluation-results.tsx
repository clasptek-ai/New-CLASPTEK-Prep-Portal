'use client';

import React from 'react';

export interface EvaluationResultsProps {
  bandScore: string;
  rawScore: number;
  maxScore: number;
  feedbackText: string;
}

export function EvaluationResults({
  bandScore,
  rawScore,
  maxScore,
  feedbackText,
}: EvaluationResultsProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md text-white">
      <h2 className="text-xl font-bold text-sky-400 mb-4">Evaluation Result</h2>
      <div className="text-4xl font-black text-emerald-400 mb-3">Band {bandScore}</div>
      <div className="text-sm text-slate-400 mb-4">
        Score: {rawScore}/{maxScore}
      </div>
      <div className="p-3 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200">
        {feedbackText}
      </div>
    </div>
  );
}
