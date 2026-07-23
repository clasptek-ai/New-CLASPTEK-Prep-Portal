'use client';

import React from 'react';

interface SectionProgressBarProps {
  sections: { name: string; isComplete: boolean; isCurrent: boolean }[];
}

export const SectionProgressBar: React.FC<SectionProgressBarProps> = ({ sections }) => {
  return (
    <div className="flex items-center gap-2 w-full py-3">
      {sections.map((sec, idx) => (
        <div key={idx} className="flex-1 flex flex-col gap-1">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              sec.isComplete
                ? 'bg-emerald-500'
                : sec.isCurrent
                  ? 'bg-indigo-500 animate-pulse'
                  : 'bg-zinc-800'
            }`}
          />
          <span
            className={`text-xs text-center truncate ${
              sec.isCurrent ? 'text-indigo-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            {sec.name}
          </span>
        </div>
      ))}
    </div>
  );
};
