'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ProgrammeItem {
  id: string;
  cat: 'IELTS' | 'TOEFL' | 'SAT' | 'CELPIP' | 'ALL';
  title: string;
  desc: string;
  duration: string;
  modules: string;
  target: string;
  skills: string[];
}

const PROGRAMMES: ProgrammeItem[] = [
  {
    id: 'ielts-academic',
    cat: 'IELTS',
    title: 'IELTS Academic',
    desc: 'Comprehensive preparation for university admissions, medical licensing, and professional registration worldwide.',
    duration: '5 Weeks',
    modules: '24 Modules',
    target: 'Band 7.5 - 9.0',
    skills: ['Academic Reading', 'Audio Listening', 'Task 1 & 2 Writing', 'Speaking Masterclass'],
  },
  {
    id: 'ielts-general',
    cat: 'IELTS',
    title: 'IELTS General Training',
    desc: 'Tailored coaching for immigration, secondary education, work visas, and citizenship requirements.',
    duration: '5 Weeks',
    modules: '20 Modules',
    target: 'Band 7.0 - 8.5',
    skills: ['General Reading', 'Letter Writing Syntax', 'Audio Listening', 'Fluency Drills'],
  },
  {
    id: 'toefl-ibt',
    cat: 'TOEFL',
    title: 'TOEFL iBT Mastery',
    desc: 'Integrated test prep for US & international higher education institutions with real audio diagnostics.',
    duration: '5 Weeks',
    modules: '22 Modules',
    target: 'Score 100 - 120',
    skills: [
      'Integrated Speaking',
      'Keyboard Essay Eval',
      'Passage Diagnostics',
      'Note-Taking Strategy',
    ],
  },
  {
    id: 'sat-academic',
    cat: 'SAT',
    title: 'SAT Academic Prep',
    desc: 'Evidence-Based Reading, Writing, and Mathematics diagnostics for top global university entrance.',
    duration: '8 Weeks',
    modules: '28 Modules',
    target: 'Score 1400 - 1600',
    skills: ['Text Inferences', 'Advanced Algebra', 'Grammar Modifiers', 'Data Analysis'],
  },
  {
    id: 'celpip-general',
    cat: 'CELPIP',
    title: 'CELPIP General Coaching',
    desc: 'Specialized Canadian English Language Proficiency Index Program training for permanent residency.',
    duration: '5 Weeks',
    modules: '18 Modules',
    target: 'Level 9 - 12',
    skills: ['Canadian Accent Listening', 'Workplace Writing', 'Audio Response', 'Task Timing'],
  },
  {
    id: 'english-core',
    cat: 'ALL',
    title: 'English Proficiency Core',
    desc: 'Foundation & advanced grammar syntax, modifier logic, vocabulary expansion, and discourse cohesion.',
    duration: '8 Weeks',
    modules: '32 Modules',
    target: 'CEFR B2 - C2',
    skills: ['Modifier Syntax', 'Lexical Variety', 'Cohesive Devices', 'Spoken Naturalness'],
  },
];

export function LandingProgrammes() {
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'IELTS' | 'TOEFL' | 'SAT' | 'CELPIP'>('ALL');

  const filtered = PROGRAMMES.filter(
    (p) => selectedTab === 'ALL' || p.cat === selectedTab
  );

  return (
    <section
      id="programmes"
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto border-t border-(--border)"
    >
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-xs font-extrabold tracking-widest text-(--brand-light) uppercase">
          Canonical Test Preparation Pathways
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-(--text-primary) mt-2 mb-3">
          Choose Your Examination Target
        </h2>
        <p className="text-sm sm:text-base text-(--text-secondary) max-w-2xl mx-auto">
          Tailored learning pathways with diagnostic placement testing, adaptive modules, and
          full-length timed mock exams.
        </p>

        {/* Filter Tabs */}
        <div className="inline-flex gap-1.5 mt-8 p-1.5 bg-(--surface-0) rounded-xl border border-(--border) flex-wrap justify-center shadow-inner">
          {(['ALL', 'IELTS', 'TOEFL', 'SAT', 'CELPIP'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              type="button"
              className={`px-4 py-2 rounded-lg border-0 text-sm font-bold cursor-pointer transition-all ${
                selectedTab === tab
                  ? 'bg-(--brand) text-white shadow-sm'
                  : 'bg-transparent text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              {tab === 'ALL' ? 'All Programmes' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Programmes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-(--surface-0) border border-(--border) rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 hover:border-(--brand-border) transition-all shadow-md group"
          >
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {p.cat} · {p.duration}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {p.target}
                </span>
              </div>

              <h3 className="text-xl font-bold text-(--text-primary) group-hover:text-blue-400 transition-colors">
                {p.title}
              </h3>

              <p className="text-sm text-(--text-secondary) leading-relaxed m-0">
                {p.desc}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {p.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-(--surface-1) rounded-md text-(--text-secondary) border border-(--border) flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            <Link href="/register" className="no-underline">
              <button
                type="button"
                className="w-full bg-(--surface-1) hover:bg-(--brand) hover:text-white text-(--text-primary) border border-(--border) group-hover:border-transparent rounded-xl py-3 px-4 text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <span>Enroll in Pathway</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
