'use client';

import React from 'react';
import { Play, Flame } from 'lucide-react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Button } from '../../../shared/ui/button/Button';
import { Avatar } from '../../../shared/ui/avatar/Avatar';
import { Skeleton } from '../../../shared/ui/skeleton/Skeleton';

export interface HeroWidgetProps {
  studentName: string;
  config: ProgrammeConfiguration;
  studyStreakDays: number;
  studentId?: string;
  learningLevel?: string;
  state?: WidgetState;
  isDiagnosticCompleted?: boolean;
  actionLabel?: string;
  actionSubtitle?: string;
  onPrimaryAction?: () => void;
  onRetry?: () => void;
  onResumeLearning?: () => void;
}

export const HeroWidget: React.FC<HeroWidgetProps> = ({
  studentName,
  config,
  studyStreakDays,
  state = 'SUCCESS',
  isDiagnosticCompleted = false,
  actionLabel,
  actionSubtitle,
  onPrimaryAction,
  onResumeLearning,
}) => {
  const isLoading = state === 'LOADING';
  const firstName = studentName ? studentName.split(' ')[0] : 'STUDENT';

  // Determine dominant next action handler and label
  const handleAction = onPrimaryAction || onResumeLearning;
  const defaultActionLabel = isDiagnosticCompleted ? 'Continue Practice' : 'Take Pre-Assessment';
  const resolvedActionLabel = actionLabel || defaultActionLabel;

  const defaultSubtitle = isDiagnosticCompleted
    ? 'Your baseline is calibrated. Continue focused practice drills to target skill gaps.'
    : 'Complete your initial diagnostic pre-assessment to calibrate your personal preparation plan.';
  const resolvedSubtitle = actionSubtitle || defaultSubtitle;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
      {/* Brand Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#045EAD]" />

      {/* ── Top row: Greeting + Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-4">
          <Avatar name={studentName} size="lg" status="online" />
          <div className="flex flex-col">
            {/* Programme badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD]">
                {config.badge || config.title}
              </span>
              <span className="text-[11px] text-[#475569] font-medium">
                • Official Candidate Session
              </span>
            </div>

            {/* Greeting headline */}
            {isLoading ? (
              <Skeleton width="240px" height="2rem" />
            ) : (
              <h1 className="text-xl sm:text-2xl font-extrabold text-deep-navy tracking-tight m-0">
                WELCOME BACK, {firstName.toUpperCase()}
              </h1>
            )}

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed">
              {resolvedSubtitle}
            </p>
          </div>
        </div>

        {/* Right: Streak (informational) + Dominant Action */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {studyStreakDays > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309]"
              title={`${studyStreakDays} consecutive days active`}
            >
              <Flame size={16} className="text-[#B45309] fill-[#B45309]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">{studyStreakDays} Days</span>
                <span className="text-[9px] uppercase font-bold text-[#B45309] tracking-wider">
                  Streak
                </span>
              </div>
            </div>
          )}

          {handleAction && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAction}
              leftIcon={<Play size={14} fill="white" />}
              className="bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold shadow-sm whitespace-nowrap"
            >
              {resolvedActionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* ── Bottom row: Key metrics strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 relative z-10">
        <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
            Current Baseline
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-deep-navy tabular-nums">
              {config.targetMetric.current}
            </span>
            <span className="text-xs text-[#475569] font-bold">{config.targetMetric.unit}</span>
          </div>
          <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
            Calibrated Diagnostic
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
            Target Goal
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-[#045EAD] tabular-nums">
              {config.targetMetric.target}
            </span>
            <span className="text-xs text-[#045EAD] font-bold">{config.targetMetric.unit}</span>
          </div>
          <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
            {config.targetMetric.description}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569]">
            Diagnostic Status
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold text-[#15803D]">Available</span>
          </div>
          <span className="text-[11px] text-[#64748B] font-medium mt-0.5">
            Automated Rubric Evaluation
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroWidget;
