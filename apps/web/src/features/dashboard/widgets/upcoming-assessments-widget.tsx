'use client';

import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { FileText, Award, Play, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export interface UpcomingAssessmentsWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
  onLaunchDiagnostic?: () => void;
  onLaunchMock?: () => void;
}

export const UpcomingAssessmentsWidget: React.FC<UpcomingAssessmentsWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
  onLaunchDiagnostic,
  onLaunchMock,
}) => {
  return (
    <DashboardWidget
      title="Upcoming Assessments & Mock Examinations"
      subtitle="Strict academic separation of initial Diagnostic Assessments and full timed Mock Tests"
      state={state}
      onRetry={onRetry}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module 1: Diagnostic Pre-Assessment Card */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#045EAD]" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#045EAD] bg-[#EAF4FC] border border-[#B9DDF8] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} />
                INITIAL PROFICIENCY
              </span>
              <span className="text-xs text-[#475569] font-bold flex items-center gap-1">
                <Clock size={12} />
                ~35 Mins
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#050310] tracking-tight mb-1">
              Diagnostic Pre-Assessment
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Calibrate your exact current baseline across all exam skills before beginning tailored study plans.
              Automated marking across standard rubric dimensions.
            </p>
          </div>

          <button
            type="button"
            onClick={onLaunchDiagnostic}
            className="w-full h-10 rounded-lg bg-[#045EAD] hover:bg-[#034A8A] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Play size={14} fill="currentColor" />
            <span>START PRE-ASSESSMENT</span>
          </button>
        </div>

        {/* Module 2: Full Mock Test Simulation Card */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#050310]" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#050310] bg-[#F8FAFC] border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award size={12} />
                PROCTORED MOCK SIMULATION
              </span>
              <span className="text-xs text-[#475569] font-bold flex items-center gap-1">
                <Clock size={12} />
                Full Length
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#050310] tracking-tight mb-1">
              Full Mock Examination
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Simulate the official examination environment under strict timed conditions with auto-submit
              enforcement and comprehensive score analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={onLaunchMock}
            className="w-full h-10 rounded-lg border border-slate-300 hover:bg-[#F8FAFC] text-[#050310] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={14} />
            <span>LAUNCH FULL MOCK TEST</span>
          </button>
        </div>
      </div>
    </DashboardWidget>
  );
};
