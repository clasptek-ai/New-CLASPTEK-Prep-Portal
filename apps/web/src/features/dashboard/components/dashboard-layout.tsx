'use client';

import React from 'react';
import { ProgrammeId } from '../models/programme-config';
import { ProgrammeRegistry } from '../models/programme-registry';
import { ChevronDown, Shield } from 'lucide-react';

export interface DashboardLayoutProps {
  activeProgrammeId: ProgrammeId;
  programmeIds: ProgrammeId[];
  onSelectProgramme: (id: ProgrammeId) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeProgrammeId,
  programmeIds,
  onSelectProgramme,
  children,
}) => {
  const activeProg = ProgrammeRegistry.get(activeProgrammeId);
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6 pb-12 font-sans">
      {/* ── Page Header & Exam Track Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#003c90] bg-[#f2f3ff] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={12} />
              Candidate Workspace
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{today}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#131b2e] tracking-tight m-0">
            Student Dashboard
          </h1>
        </div>

        {/* Right: Programme Switcher */}
        {programmeIds && programmeIds.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#f8fafc] border border-slate-200 p-1 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 pl-2">Track:</span>
            <div className="relative">
              <select
                value={activeProgrammeId}
                onChange={(e) => onSelectProgramme(e.target.value as ProgrammeId)}
                className="appearance-none bg-white border border-slate-300 text-[#131b2e] font-bold text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#003c90] cursor-pointer shadow-sm"
              >
                {programmeIds.map((id) => {
                  const prog = ProgrammeRegistry.get(id);
                  return (
                    <option key={id} value={id}>
                      {prog.title}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Dashboard Content ── */}
      {children}
    </div>
  );
};
