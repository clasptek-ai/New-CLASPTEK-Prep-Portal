'use client';

import React from 'react';

export interface MockDashboardProps {
  availableTemplates: { id: string; title: string; durationMinutes: number }[];
  onStart: (templateId: string) => void;
}

export function MockDashboard({ availableTemplates, onStart }: MockDashboardProps) {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-extrabold text-sky-400 mb-6">Mock Examinations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {availableTemplates.map((t) => (
          <div
            key={t.id}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">{t.title}</h2>
              <p className="text-slate-400 text-sm mb-4">Duration: {t.durationMinutes} minutes</p>
            </div>
            <button
              onClick={() => onStart(t.id)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded transition"
            >
              Start Full Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
