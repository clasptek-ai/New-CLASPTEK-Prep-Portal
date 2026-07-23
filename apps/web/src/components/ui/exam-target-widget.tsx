'use client';

import React from 'react';

interface ExamTargetWidgetProps {
  targetExamDate?: string | Date;
  daysRemaining?: number;
  weeksRemaining?: number;
  targetScore?: number;
  registrationStatus?: string;
  scheduleCalculations?: {
    lessonsPerWeek: number;
    practiceSessionsPerWeek: number;
    mockIntervalWeeks: number;
    revisionWindowDays: number;
  };
}

export const ExamTargetWidget: React.FC<ExamTargetWidgetProps> = ({
  targetExamDate,
  daysRemaining = 95,
  weeksRemaining = 14,
  targetScore = 7.5,
  registrationStatus = 'REGISTERED',
  scheduleCalculations,
}) => {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Target Exam Schedule</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            registrationStatus === 'CONFIRMED' || registrationStatus === 'REGISTERED'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          {registrationStatus}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-800/80 p-3">
          <span className="text-xs text-slate-400">Target Exam Date</span>
          <p className="text-sm font-bold text-white">
            {targetExamDate ? new Date(targetExamDate).toLocaleDateString() : '18 October 2026'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/80 p-3">
          <span className="text-xs text-slate-400">Days Remaining</span>
          <p className="text-xl font-bold text-blue-400">{daysRemaining} Days</p>
        </div>

        <div className="rounded-lg bg-slate-800/80 p-3">
          <span className="text-xs text-slate-400">Target Band / Score</span>
          <p className="text-xl font-bold text-emerald-400">{targetScore}</p>
        </div>
      </div>

      {scheduleCalculations && (
        <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400 grid grid-cols-2 gap-2">
          <div>
            Pacing:{' '}
            <span className="font-semibold text-white">
              {scheduleCalculations.lessonsPerWeek} Lessons/Wk
            </span>
          </div>
          <div>
            Practice:{' '}
            <span className="font-semibold text-white">
              {scheduleCalculations.practiceSessionsPerWeek} Sessions/Wk
            </span>
          </div>
          <div>
            Mock Exam:{' '}
            <span className="font-semibold text-white">
              Every {scheduleCalculations.mockIntervalWeeks} Wk(s)
            </span>
          </div>
          <div>
            Revision Window:{' '}
            <span className="font-semibold text-white">
              {scheduleCalculations.revisionWindowDays} Days Prior
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
