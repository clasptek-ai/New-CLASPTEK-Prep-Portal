'use client';

import React from 'react';

export interface MockPlayerProps {
  sessionId: string;
  templateTitle: string;
  currentSectionIndex: number;
  totalSections: number;
}

export function MockPlayer({
  sessionId,
  templateTitle,
  currentSectionIndex,
  totalSections,
}: MockPlayerProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white p-6">
      <header className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-xl font-bold text-sky-400">{templateTitle}</h1>
        <div className="text-sm font-semibold bg-slate-800 px-3 py-1 rounded">
          Section {currentSectionIndex + 1} of {totalSections}
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center">
        <p className="text-slate-400 mb-4">Session Active: {sessionId}</p>
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 max-w-xl text-center">
          <h2 className="text-lg font-semibold mb-2">Examination Mode Active</h2>
          <p className="text-slate-300 text-sm">
            Fullscreen monitoring enabled. Answers are automatically auto-saved every 15 seconds.
          </p>
        </div>
      </main>
    </div>
  );
}
