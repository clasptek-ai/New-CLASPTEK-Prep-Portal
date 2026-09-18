'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, FileText } from 'lucide-react';

export interface ExamCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  sectionsCount: number;
  sectionsLabel: string;
  durationMinutes: number;
  formatBadge?: string;
  ctaText?: string;
  ctaHref?: string;
  highlighted?: boolean;
}

export function ExamCard({
  id,
  name,
  category,
  description,
  sectionsCount,
  sectionsLabel,
  durationMinutes,
  formatBadge = 'Official Format',
  ctaText = 'Explore Track',
  ctaHref = '/register',
  highlighted = false,
}: ExamCardProps) {
  return (
    <div
      className={`rounded-xl p-6 flex flex-col justify-between border transition-all duration-200 ${
        highlighted
          ? 'bg-white border-[#045EAD] shadow-md ring-1 ring-[#045EAD]/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#045EAD] bg-[#EAF4FC] px-2.5 py-0.5 rounded-full border border-[#B9DDF8]">
            {category}
          </span>
          <span className="text-[11px] font-semibold text-[#475569] bg-[#F8FAFC] border border-slate-200 px-2 py-0.5 rounded">
            {formatBadge}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#050310] tracking-tight mb-2">{name}</h3>

        <p className="text-xs text-[#475569] leading-relaxed mb-4">{description}</p>

        <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-lg border border-slate-200 mb-5">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-[#045EAD] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#475569] font-bold">Structure</span>
              <span className="text-xs font-bold text-[#050310]">{sectionsLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#045EAD] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[#475569] font-bold">Duration</span>
              <span className="text-xs font-bold text-[#050310]">{durationMinutes} Mins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-[#475569] font-medium">Diagnostic Available</span>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#045EAD] hover:text-[#034A8A] transition-colors no-underline group"
        >
          <span>{ctaText}</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
