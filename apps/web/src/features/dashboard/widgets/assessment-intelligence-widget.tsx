'use client';

import React from 'react';
import Link from 'next/link';
import { Target, TrendingUp, Award, ArrowRight, AlertCircle } from 'lucide-react';
import { CandidateIntelligenceProfile } from '../../intelligence/assessment-intelligence';
import { WidgetState } from '../../../shared/ui/academic/dashboard-widget';

export interface AssessmentIntelligenceWidgetProps {
  intelligence: CandidateIntelligenceProfile;
  state?: WidgetState;
}

export const AssessmentIntelligenceWidget: React.FC<AssessmentIntelligenceWidgetProps> = ({
  intelligence,
  state = 'SUCCESS',
}) => {
  const {
    examType,
    hasDiagnostic,
    strongestSkill,
    priorityDevelopmentArea,
    priorityEvidence,
    comparison,
    chronologicalProgression,
  } = intelligence;

  if (state === 'LOADING') {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs animate-pulse">
        <div className="h-5 bg-slate-100 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-slate-50 rounded-xl" />
          <div className="h-24 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  // If candidate has not completed a diagnostic, show encouraging calibration notice
  if (!hasDiagnostic) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#045EAD]">
              Assessment Calibration
            </span>
            <h2 className="text-base font-bold text-deep-navy">
              No Diagnostic Baseline Established
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed max-w-2xl">
              Complete your Diagnostic Pre-Assessment to establish your baseline for {examType}.
              Skill gap analytics and progression tracking activate automatically after calibration.
            </p>
          </div>
          <Link
            href="/student/assessments"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Take Pre-Assessment <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
      {/* ── Widget Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#045EAD]">
              Performance Intelligence
            </span>
            <span className="text-[11px] text-[#94A3B8]">•</span>
            <span className="text-[11px] font-medium text-[#475569]">{examType}</span>
          </div>
          <h2 className="text-lg font-extrabold text-deep-navy mt-0.5">
            Preparation Guidance &amp; Progression
          </h2>
        </div>

        <Link
          href="/student/results"
          className="text-xs font-bold text-[#045EAD] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          View Full Performance Ledger <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Skill Insights Grid (Strongest vs. Priority Development Area) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Priority Development Area */}
        <div className="p-4 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309]">
                Priority Development Area
              </span>
              <h3 className="text-base font-extrabold text-deep-navy">
                {priorityDevelopmentArea
                  ? priorityDevelopmentArea.skillName
                  : 'Balanced Performance'}
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">{priorityEvidence}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FEF3C7] text-[#B45309] shrink-0">
              <Target size={18} />
            </div>
          </div>

          {priorityDevelopmentArea && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#475569]">
                Measured:{' '}
                <strong className="text-deep-navy">
                  {priorityDevelopmentArea.scorePercentage}%
                </strong>
              </span>
              <Link
                href={`/practice?skill=${encodeURIComponent(priorityDevelopmentArea.skillName)}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#045EAD] hover:underline"
              >
                Practice {priorityDevelopmentArea.skillName} →
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: Highest Measured Competency */}
        <div className="p-4 rounded-xl bg-bg-neutral border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D]">
                Current Measured Strength
              </span>
              <h3 className="text-base font-extrabold text-deep-navy">
                {strongestSkill ? strongestSkill.skillName : 'All Skills Balanced'}
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {strongestSkill
                  ? `${strongestSkill.skillName} is currently your highest measured comparable skill.`
                  : 'Your measured assessment skills show even performance across active sections.'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#DCFCE7] text-[#15803D] shrink-0">
              <Award size={18} />
            </div>
          </div>

          {strongestSkill && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#475569]">
                Measured:{' '}
                <strong className="text-deep-navy">{strongestSkill.scorePercentage}%</strong>
              </span>
              <span className="text-[11px] text-[#15803D] font-bold">Strongest Section</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Baseline vs Mock Comparison (Section 7 & 8) ── */}
      {comparison ? (
        <div className="p-4 rounded-xl bg-bg-light-blue border border-[#B9DDF8] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#045EAD]" />
              <span className="text-xs font-extrabold text-[#045EAD] uppercase tracking-wider">
                Baseline vs. Mock Progression
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#475569]">{comparison.mockDate}</span>
          </div>

          <p className="text-xs font-medium text-[#1E293B] leading-relaxed">
            {comparison.summaryStatement}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-[#475569] block">
                Diagnostic Baseline
              </span>
              <span className="text-sm font-extrabold text-deep-navy">
                {comparison.baselineBand || `${comparison.baselineOverallScore}%`}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">
                {comparison.baselineDate}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-[#475569] block">
                Latest Mock
              </span>
              <span className="text-sm font-extrabold text-[#045EAD]">
                {comparison.mockBand || `${comparison.mockOverallScore}%`}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">{comparison.mockDate}</span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-[#475569] block">
                Net Delta
              </span>
              <span
                className={`text-sm font-extrabold ${
                  (comparison.bandDelta ?? comparison.scoreDelta) >= 0
                    ? 'text-[#15803D]'
                    : 'text-[#B45309]'
                }`}
              >
                {(comparison.bandDelta ?? comparison.scoreDelta) > 0 ? '+' : ''}
                {comparison.bandDelta !== undefined
                  ? `${comparison.bandDelta} Bands`
                  : `${comparison.scoreDelta}%`}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">
                Authoritative measurement
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-bg-neutral border border-slate-200 flex items-start gap-3">
          <AlertCircle size={18} className="text-[#64748B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-deep-navy">Progression Tracking Available</h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Complete a comparable Mock Examination to track your score delta against your
              diagnostic baseline.
            </p>
            <div className="pt-1">
              <Link
                href="/student/mock"
                className="text-xs font-bold text-[#045EAD] hover:underline inline-flex items-center gap-1"
              >
                Launch Mock Examination →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Chronological Progression Ledger (Section 19) ── */}
      {chronologicalProgression.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
            Chronological Assessment Ledger ({chronologicalProgression.length} completed)
          </span>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-neutral border-b border-slate-200 text-[#475569]">
                  <th className="p-3 font-bold uppercase text-[10px] tracking-wider">Assessment</th>
                  <th className="p-3 font-bold uppercase text-[10px] tracking-wider">Category</th>
                  <th className="p-3 font-bold uppercase text-[10px] tracking-wider">Date</th>
                  <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-right">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chronologicalProgression.map((item, idx) => (
                  <tr key={item.resultId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-deep-navy flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#045EAD]" />
                      {item.assessmentType}
                    </td>
                    <td className="p-3 text-[#475569] font-medium">{item.category}</td>
                    <td className="p-3 text-[#64748B]">{item.formattedDate}</td>
                    <td className="p-3 text-right font-bold text-deep-navy">
                      {item.predictedBand ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-bg-light-blue text-[#045EAD] font-bold">
                          {item.predictedBand}
                        </span>
                      ) : (
                        `${item.overallScore}%`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentIntelligenceWidget;
