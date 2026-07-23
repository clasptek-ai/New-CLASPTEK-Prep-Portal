'use client';

import React from 'react';

export interface MockReviewProps {
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onSubmit: () => void;
}

export function MockReview({
  totalQuestions,
  answeredCount,
  flaggedCount,
  onSubmit,
}: MockReviewProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md mx-auto my-8 text-white">
      <h2 className="text-xl font-bold mb-4 text-sky-400">Section Review</h2>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-slate-400">Total Questions:</span>
          <span className="font-semibold">{totalQuestions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Answered:</span>
          <span className="text-emerald-400 font-semibold">{answeredCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Flagged for Review:</span>
          <span className="text-amber-400 font-semibold">{flaggedCount}</span>
        </div>
      </div>
      <button
        onClick={onSubmit}
        className="w-full bg-sky-600 hover:bg-sky-500 font-bold py-2 px-4 rounded transition"
      >
        Submit Section & Continue
      </button>
    </div>
  );
}
