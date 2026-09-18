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
          ? 'bg-white border-[#0f52ba] shadow-md ring-1 ring-[#0f52ba]/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#003c90] bg-[#f2f3ff] px-2.5 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {formatBadge}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#131b2e] tracking-tight mb-2">{name}</h3>

        <p className="text-xs text-[#545f73] leading-relaxed mb-4">{description}</p>

        <div className="grid grid-cols-2 gap-2 bg-[#f8fafc] p-3 rounded-lg border border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-[#003c90] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-semibold">Structure</span>
              <span className="text-xs font-bold text-[#131b2e]">{sectionsLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#003c90] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-semibold">Duration</span>
              <span className="text-xs font-bold text-[#131b2e]">{durationMinutes} Mins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">Diagnostic Available</span>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003c90] hover:text-[#002c6b] transition-colors no-underline group"
        >
          <span>{ctaText}</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
