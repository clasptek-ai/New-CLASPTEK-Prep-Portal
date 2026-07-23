'use client';

import React from 'react';

export const InstructorMockDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 space-y-8">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
            Instructor Mock Blueprint & Template Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Author blueprints, manage publication governance, and monitor active student exams
          </p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
          + Create Mock Blueprint
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs text-zinc-400">Total Blueprints</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">8</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs text-zinc-400">Published Templates</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">5</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs text-zinc-400">Active Live Attempts</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">14</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
          <span className="text-xs text-zinc-400">Pending Review</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">2</div>
        </div>
      </div>
    </div>
  );
};
