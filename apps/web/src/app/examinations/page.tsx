'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  Filter,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  Globe,
} from 'lucide-react';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { PublicFooter } from '@/components/ui/PublicFooter';

interface TrackItem {
  id: string;
  name: string;
  category: 'english' | 'admissions';
  categoryLabel: string;
  badge: string;
  description: string;
  sections: string[];
  totalQuestions: string;
  durationMinutes: number;
  accreditation: string;
  features: string[];
  recommendedTarget: string;
}

const TRACKS: TrackItem[] = [
  {
    id: 'ielts-academic',
    name: 'IELTS Academic',
    category: 'english',
    categoryLabel: 'English Proficiency',
    badge: 'Popular • University Track',
    description:
      'Rigorous four-domain assessment calibrated for higher education admissions and professional registration. Evaluates advanced contextual synthesis and discourse cohesion under official timed conditions.',
    sections: ['Listening (40m)', 'Reading (60m)', 'Writing (60m)', 'Speaking (14m)'],
    totalQuestions: '80+ Items (4 Skills)',
    durationMinutes: 174,
    accreditation: 'British Council & IDP Compatible',
    features: [
      'Official 9-band rubric automated marking',
      'Dual-rubric acoustic analysis for speaking',
      'CEFR C1/C2 advanced proficiency benchmark',
    ],
    recommendedTarget: 'Band 7.5 – 8.5',
  },
  {
    id: 'ielts-general',
    name: 'IELTS General Training',
    category: 'english',
    categoryLabel: 'English Proficiency',
    badge: 'Work & Immigration',
    description:
      'Engineered for immigration to Australia, Canada, New Zealand and the UK. Focuses on basic language skills in broad social and workplace contexts.',
    sections: ['Listening (40m)', 'General Reading (60m)', 'General Writing (60m)', 'Speaking (14m)'],
    totalQuestions: '80+ Items (4 Skills)',
    durationMinutes: 174,
    accreditation: 'Official General Rubric Aligned',
    features: [
      'Everyday workplace letter and essay tasks',
      'Authentic listening recordings across 4 sections',
      'Standardized Canadian PR points calculation',
    ],
    recommendedTarget: 'CLB 9 / Band 8.0',
  },
  {
    id: 'sat-digital',
    name: 'SAT Digital',
    category: 'admissions',
    categoryLabel: 'University Admissions',
    badge: 'Adaptive • US Undergraduate',
    description:
      'Computer-adaptive assessment for US university undergraduate admissions. Features multistage adaptive routing and embedded Desmos graphing calculator.',
    sections: ['Reading & Writing Module 1 & 2 (64m)', 'Math Module 1 & 2 (70m)'],
    totalQuestions: '98 Questions',
    durationMinutes: 134,
    accreditation: 'College Board Specification Aligned',
    features: [
      'Two-stage adaptive difficulty routing',
      'Integrated graphing calculator environment',
      '1600-point calibrated scaled score output',
    ],
    recommendedTarget: '1450 – 1550',
  },
  {
    id: 'toefl-ibt',
    name: 'TOEFL iBT Standard',
    category: 'english',
    categoryLabel: 'English Proficiency',
    badge: 'Academic Admissions',
    description:
      'Comprehensive 120-point examination preferred by universities worldwide. Measures combined English communication in academic lecture and discussion contexts.',
    sections: ['Reading (35m)', 'Listening (36m)', 'Speaking (16m)', 'Writing (29m)'],
    totalQuestions: 'Integrated Tasks',
    durationMinutes: 116,
    accreditation: 'ETS Criterion Aligned',
    features: [
      'Campus-life & academic lecture tasks',
      'Integrated speaking and writing prompts',
      'Scaled 0–120 score calculation',
    ],
    recommendedTarget: '100 – 110',
  },
  {
    id: 'celpip-general',
    name: 'CELPIP General',
    category: 'english',
    categoryLabel: 'English Proficiency',
    badge: 'Canadian PR & Citizenship',
    description:
      '100% Canadian English test recognized by Immigration, Refugees and Citizenship Canada (IRCC) for permanent residency and citizenship.',
    sections: ['Listening (50m)', 'Reading (60m)', 'Writing (53m)', 'Speaking (20m)'],
    totalQuestions: '4 Skill Modules',
    durationMinutes: 183,
    accreditation: 'IRCC Approved Standard',
    features: [
      'Canadian accent & cultural contexts',
      'Aligned directly to CLB Levels 1 through 12',
      'End-to-end computerized evaluation',
    ],
    recommendedTarget: 'CLB 9 – 10',
  },
];

export default function ExaminationsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'english' | 'admissions'>('all');

  const filteredTracks = TRACKS.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  return (
    <div className="w-full min-h-screen bg-white text-deep-navy font-sans">
      <PublicHeader activePath="/examinations" />

      <main className="max-w-360 mx-auto px-4 sm:px-8 py-10 md:py-14">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#475569] mb-6">
          <Link href="/" className="hover:text-[#045EAD] transition-colors no-underline">
            Home
          </Link>
          <span>/</span>
          <span className="text-deep-navy font-bold">Examinations</span>
        </nav>

        {/* ── Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-xs font-bold w-fit">
              <Shield size={14} />
              Accredited International Examination Pathways
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-deep-navy tracking-tight">
              Standardized Examination Tracks &amp; Curriculum Specifications
            </h1>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Choose an official international standard track. Select between a fast diagnostic Pre-Assessment
              or full-length proctored mock examination.
            </p>
          </div>

          <div className="bg-bg-neutral border border-slate-200 rounded-xl p-4 flex items-center gap-6 shrink-0">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-[#475569] font-bold">
                Curriculum Standard
              </span>
              <span className="text-sm font-bold text-deep-navy">ISO/IEC 23988 Compliant</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-[#475569] font-bold">
                Evaluation Metric
              </span>
              <span className="text-sm font-bold text-[#045EAD]">Official Band Descriptors</span>
            </div>
          </div>
        </div>

        {/* ── Filter Buttons ── */}
        <div className="flex flex-wrap items-center gap-2 py-6">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#045EAD] text-white shadow-sm'
                : 'bg-bg-neutral text-[#475569] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Tracks ({TRACKS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('english')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'english'
                ? 'bg-[#045EAD] text-white shadow-sm'
                : 'bg-bg-neutral text-[#475569] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            English Proficiency (IELTS, TOEFL, CELPIP)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('admissions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'admissions'
                ? 'bg-[#045EAD] text-white shadow-sm'
                : 'bg-bg-neutral text-[#475569] border border-slate-200 hover:bg-slate-100'
            }`}
          >
            University Admissions (SAT Digital)
          </button>
        </div>

        {/* ── Tracks Grid ── */}
        <div className="grid grid-cols-1 gap-6">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow flex flex-col lg:flex-row justify-between gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#045EAD]" />

              {/* Left Column: Track Info */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#045EAD] bg-bg-light-blue border border-[#B9DDF8] px-2.5 py-0.5 rounded-full">
                    {track.categoryLabel}
                  </span>
                  <span className="text-[11px] font-semibold text-[#475569] bg-bg-neutral border border-slate-200 px-2 py-0.5 rounded">
                    {track.badge}
                  </span>
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded">
                    {track.accreditation}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-deep-navy tracking-tight">
                    {track.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mt-1 max-w-2xl">
                    {track.description}
                  </p>
                </div>

                {/* Section pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {track.sections.map((sec) => (
                    <span
                      key={sec}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-bg-neutral border border-slate-200 text-xs text-deep-navy font-semibold"
                    >
                      <FileText size={13} className="text-[#045EAD]" />
                      {sec}
                    </span>
                  ))}
                </div>

                {/* Features checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {track.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-[#475569] font-medium">
                      <CheckCircle2 size={14} className="text-[#045EAD] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Key Specifications & Action Box */}
              <div className="lg:w-80 shrink-0 flex flex-col justify-between p-5 rounded-xl bg-bg-neutral border border-slate-200 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-[#475569] uppercase font-bold">Total Duration</span>
                    <span className="font-bold text-deep-navy">{track.durationMinutes} Minutes</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-[#475569] uppercase font-bold">Questions</span>
                    <span className="font-bold text-deep-navy">{track.totalQuestions}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#475569] uppercase font-bold">Target Benchmark</span>
                    <span className="font-bold text-[#045EAD]">{track.recommendedTarget}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/register"
                    className="w-full h-10 px-4 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all no-underline"
                  >
                    <span>Take Pre-Assessment</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href="/login"
                    className="w-full h-10 px-4 rounded-lg border border-slate-300 hover:bg-white text-deep-navy text-xs font-bold inline-flex items-center justify-center transition-colors no-underline"
                  >
                    View Mock Exams
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
