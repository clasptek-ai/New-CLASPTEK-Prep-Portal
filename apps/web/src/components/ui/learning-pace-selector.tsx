'use client';

import React, { useState } from 'react';

export type LearningPaceType = 'Accelerated' | 'Standard' | 'Flexible' | 'Intensive' | 'Self-Paced';

interface LearningPaceSelectorProps {
  currentPace?: LearningPaceType;
  weeklyHours?: number;
  estimatedCompletionDate?: string | null;
  onPaceChange?: (pace: LearningPaceType, hours: number) => void;
}

const PACE_HOURS: Record<LearningPaceType, number> = {
  Accelerated: 18,
  Intensive: 25,
  Standard: 12,
  Flexible: 8,
  'Self-Paced': 5,
};

export const LearningPaceSelector: React.FC<LearningPaceSelectorProps> = ({
  currentPace = 'Standard',
  weeklyHours = 12,
  estimatedCompletionDate,
  onPaceChange,
}) => {
  const [selectedPace, setSelectedPace] = useState<LearningPaceType>(currentPace);

  const handleSelect = (pace: LearningPaceType) => {
    setSelectedPace(pace);
    if (onPaceChange) {
      onPaceChange(pace, PACE_HOURS[pace]);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Learning Pace</h3>
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
          {selectedPace}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(
          ['Accelerated', 'Standard', 'Flexible', 'Intensive', 'Self-Paced'] as LearningPaceType[]
        ).map((pace) => (
          <button
            key={pace}
            onClick={() => handleSelect(pace)}
            className={`rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
              selectedPace === pace
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {pace}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
        <div>
          <span className="text-xs text-slate-400">Weekly Goal</span>
          <p className="text-xl font-bold text-emerald-400">{PACE_HOURS[selectedPace]} Hours</p>
        </div>
        <div>
          <span className="text-xs text-slate-400">Estimated Completion</span>
          <p className="text-sm font-semibold text-slate-200">
            {estimatedCompletionDate
              ? new Date(estimatedCompletionDate).toLocaleDateString()
              : '4–8 Weeks'}
          </p>
        </div>
      </div>
    </div>
  );
};
