'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  BarChart3,
  Sparkles,
  TrendingUp,
  Headphones,
  Mic,
  PenTool,
  Compass,
} from 'lucide-react';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { ExamCard } from '@/components/ui/ExamCard';

export default function HomePage() {
  // Production Security Guard: Intercept password recovery / error parameters and forward to /reset-password
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if (
        search.includes('error') ||
        search.includes('otp_expired') ||
        search.includes('code=') ||
        search.includes('token_hash') ||
        hash.includes('type=recovery') ||
        hash.includes('access_token=')
      ) {
        window.location.href = `/reset-password${search}${hash}`;
      }
    }
  }, []);

  const EXAM_TRACKS = [
    {
      id: 'ielts',
      name: 'IELTS Academic & General',
      category: 'English Proficiency',
      description:
        'Standardized 4-skill evaluation (Listening, Reading, Writing, Speaking) calibrated to the 9-band CEFR C1/C2 scale.',
      sectionsCount: 4,
      sectionsLabel: '4 Skills (L, R, W, S)',
      durationMinutes: 170,
      formatBadge: 'British Council & IDP Compatible',
      ctaHref: '/register',
      highlighted: true,
    },
    {
      id: 'sat',
      name: 'SAT Digital (Adaptive)',
      category: 'University Admissions',
      description:
        'Multistage adaptive testing covering Reading & Writing and Math with built-in graphing calculator simulation.',
      sectionsCount: 2,
      sectionsLabel: '2 Adaptive Modules',
      durationMinutes: 134,
      formatBadge: 'College Board Aligned',
      ctaHref: '/register',
    },
    {
      id: 'toefl',
      name: 'TOEFL iBT Standard',
      category: 'Academic Entrance',
      description:
        'Comprehensive 120-point academic English assessment measuring integrated communication skills.',
      sectionsCount: 4,
      sectionsLabel: '4 Integrated Sections',
      durationMinutes: 116,
      formatBadge: 'ETS Aligned',
      ctaHref: '/register',
    },
    {
      id: 'celpip',
      name: 'CELPIP General Training',
      category: 'Canadian PR & Visa',
      description:
        '100% Canadian computer-delivered assessment aligned to the Canadian Language Benchmarks (CLB).',
      sectionsCount: 4,
      sectionsLabel: '4 Modules (CLB 1–12)',
      durationMinutes: 180,
      formatBadge: 'IRCC Approved Standard',
      ctaHref: '/register',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white text-deep-navy font-sans overflow-x-hidden">
      {/* ── 1. Public Header ── */}
      <PublicHeader activePath="/" />

      <main>
        {/* ── 2. HERO SECTION ── */}
        <section className="w-full bg-white py-12 md:py-20 px-4 sm:px-8 border-b border-slate-200 relative overflow-hidden">
          <div className="max-w-360 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start gap-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-xs font-bold tracking-wide">
                <Shield size={14} className="text-[#045EAD]" />
                ISO/IEC 23988 Diagnostic Protocol Active
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-deep-navy tracking-tight leading-[1.15]">
                PREPARE WITH PURPOSE.
                <br />
                <span className="text-[#045EAD]">TEST WITH CONFIDENCE.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl">
                Assess your current level, practise strategically and experience realistic mock examinations
                for IELTS, SAT, TOEFL and CELPIP.
              </p>

              {/* Value prop pill strip */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-neutral border border-slate-200 text-deep-navy text-xs font-semibold">
                  <CheckCircle2 size={13} className="text-[#045EAD]" />
                  Official Rubric Scoring
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-neutral border border-slate-200 text-deep-navy text-xs font-semibold">
                  <TrendingUp size={13} className="text-[#045EAD]" />
                  Instant Diagnostic Skill Gap
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-neutral border border-slate-200 text-deep-navy text-xs font-semibold">
                  <Clock size={13} className="text-[#045EAD]" />
                  Proctored Timed Mocks
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 w-full">
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                  <Link
                    href="/register"
                    className="h-11 px-6 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all no-underline"
                  >
                    <span>TAKE A PRE-ASSESSMENT</span>
                    <ArrowRight size={16} />
                  </Link>
                  <span className="text-[11px] text-[#475569] font-medium">
                    Registration required before diagnostic attempt
                  </span>
                </div>

                <Link
                  href="/examinations"
                  className="h-11 px-6 rounded-lg border border-slate-300 hover:bg-bg-neutral text-deep-navy text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors no-underline w-full sm:w-auto"
                >
                  <BookOpen size={16} />
                  <span>EXPLORE MOCK EXAMS</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Illustrative Diagnostic Baseline Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#045EAD]" />

                {/* Card Top Bar */}
                <div className="flex items-center justify-between bg-bg-neutral p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-[#045EAD]" />
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-deep-navy">
                        Diagnostic Baseline
                      </div>
                      <div className="text-[10px] text-[#475569] font-mono font-medium">
                        Illustrative Candidate Demo
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#045EAD] bg-bg-light-blue border border-[#B9DDF8] px-2.5 py-0.5 rounded">
                    IELTS Academic
                  </span>
                </div>

                {/* Score Showcase */}
                <div className="grid grid-cols-3 gap-3 items-center bg-bg-light-blue border border-[#B9DDF8] p-4 rounded-xl">
                  <div className="col-span-1 flex flex-col">
                    <span className="text-[11px] text-[#475569] uppercase font-bold">
                      Overall Band
                    </span>
                    <span className="text-3xl font-extrabold text-[#045EAD] tabular-nums">7.5</span>
                    <span className="text-[10px] text-[#475569] font-medium">Target: 8.0</span>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-deep-navy">
                      <span>Readiness Index</span>
                      <span className="text-[#045EAD]">83% Calibrated</span>
                    </div>
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-[#045EAD] h-full rounded-full" style={{ width: '83%' }} />
                    </div>
                    <span className="text-[10px] text-[#475569] font-medium">
                      Standard Error: ±0.25 confidence interval
                    </span>
                  </div>
                </div>

                {/* Sub-Score Differential Map */}
                <div className="bg-bg-neutral p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-deep-navy">
                    <span>Skill Calibration Matrix</span>
                    <span className="text-[11px] font-semibold text-[#475569]">4 Skills Measured</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-[#475569] font-bold block uppercase">Listening</span>
                      <span className="text-sm font-bold text-deep-navy">7.5</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-[#475569] font-bold block uppercase">Reading</span>
                      <span className="text-sm font-bold text-deep-navy">7.0</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-[#475569] font-bold block uppercase">Writing</span>
                      <span className="text-sm font-bold text-deep-navy">6.5</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-[#475569] font-bold block uppercase">Speaking</span>
                      <span className="text-sm font-bold text-deep-navy">7.0</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-center text-[#475569] font-medium">
                  * Illustrative UI demonstration. Production assessments are verified by server authority.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. CHOOSE YOUR EXAM SECTION ── */}
        <section id="examinations" className="w-full bg-white py-16 px-4 sm:px-8 border-b border-slate-200">
          <div className="max-w-360 mx-auto flex flex-col gap-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#045EAD]">
                  Standardized Testing Tracks
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-deep-navy tracking-tight">
                  CHOOSE YOUR EXAM
                </h2>
                <p className="text-sm text-[#475569] max-w-2xl">
                  Select your targeted standardized test to access certified diagnostics, skill-gap analysis,
                  and authentic proctored mock examinations.
                </p>
              </div>

              <Link
                href="/examinations"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#045EAD] hover:underline no-underline"
              >
                <span>View Full Curriculum Specifications</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EXAM_TRACKS.map((track) => (
                <ExamCard key={track.id} {...track} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. PRE-ASSESSMENT SECTION ── */}
        <section id="pre-assessment" className="w-full bg-white py-16 px-4 sm:px-8 border-b border-slate-200">
          <div className="max-w-360 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-xs font-bold">
                <Compass size={14} />
                Baseline Diagnostic Engine
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-deep-navy tracking-tight">
                KNOW WHERE YOU STAND BEFORE YOU START.
              </h2>

              <p className="text-base text-[#475569] leading-relaxed">
                Do not begin intensive study without calibrating your exact baseline. Our diagnostic
                assessment evaluates candidate competencies across official rubric parameters.
              </p>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#045EAD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-deep-navy">Take the Assessment</h3>
                    <p className="text-xs text-[#475569] mt-0.5">
                      A focused, server-timed diagnostic testing core grammar, comprehension, synthesis, and fluency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#045EAD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-deep-navy">Understand Your Result</h3>
                    <p className="text-xs text-[#475569] mt-0.5">
                      Receive an instant CEFR-benchmarked sub-score breakdown with identified focus areas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#045EAD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-deep-navy">Prepare Strategically</h3>
                    <p className="text-xs text-[#475569] mt-0.5">
                      Target weak sub-skills rather than re-practising mastered topics. Maximize score acceleration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold shadow-sm transition-all no-underline"
                >
                  <span>START PRE-ASSESSMENT</span>
                  <ArrowRight size={15} />
                </Link>
                <span className="text-[11px] text-[#475569] font-medium block mt-2">
                  Follows registration-first protocol. Requires candidate account.
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-bg-neutral border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h3 className="text-base font-bold text-deep-navy mb-4">
                What the Diagnostic Measures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] flex items-center justify-center mb-2">
                    <Headphones size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-deep-navy">Listening &amp; Retention</h4>
                  <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">
                    Multi-speaker discourse comprehension, signpost navigation, and numerical detail capture.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] flex items-center justify-center mb-2">
                    <FileText size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-deep-navy">Reading Synthesis</h4>
                  <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">
                    Skimming for gist, scanning for specific information, inference, and argument identification.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] flex items-center justify-center mb-2">
                    <PenTool size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-deep-navy">Written Cohesion</h4>
                  <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">
                    Task response, grammatical range, lexical resource, and cohesive paragraph structure.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] flex items-center justify-center mb-2">
                    <Mic size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-deep-navy">Spoken Fluency</h4>
                  <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">
                    Pronunciation, discourse markers, hesitation recovery, and topic elaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. MOCK EXAMINATION SECTION ── */}
        <section id="mock-exams" className="w-full bg-white py-16 px-4 sm:px-8 border-b border-slate-200">
          <div className="max-w-360 mx-auto p-8 sm:p-10 rounded-2xl bg-bg-neutral border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl flex flex-col gap-3">
              <span className="text-xs uppercase font-bold tracking-wider text-[#045EAD]">
                Authentic Test Simulation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-deep-navy tracking-tight">
                EXPERIENCE THE TEST BEFORE THE TEST.
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Full-length, proctored mock examinations built with server-authoritative timers,
                strict anti-tamper controls, official band rubrics, and automated scoring to ensure you
                walk into the test center without anxiety.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-deep-navy hover:bg-[#151D2E] text-white text-xs font-bold shadow transition-all no-underline shrink-0"
            >
              <span>VIEW MOCK EXAMS</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* ── 6. HOW IT WORKS ── */}
        <section className="w-full bg-white py-16 px-4 sm:px-8 border-b border-slate-200">
          <div className="max-w-360 mx-auto flex flex-col gap-10">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[#045EAD]">
                Methodology
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-deep-navy">HOW IT WORKS</h2>
              <p className="text-sm text-[#475569]">
                A disciplined four-phase progression engineered for score acceleration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl border border-slate-200 bg-bg-neutral flex flex-col gap-3">
                <span className="text-2xl font-black text-[#045EAD]">01</span>
                <h3 className="text-sm font-bold text-deep-navy uppercase tracking-wide">
                  SELECT YOUR EXAM
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Choose between IELTS, SAT, TOEFL, or CELPIP to initialize your customized target syllabus.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-bg-neutral flex flex-col gap-3">
                <span className="text-2xl font-black text-[#045EAD]">02</span>
                <h3 className="text-sm font-bold text-deep-navy uppercase tracking-wide">
                  ASSESS YOUR LEVEL
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Complete the calibrated baseline diagnostic to pinpoint exact skill competencies and gaps.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-bg-neutral flex flex-col gap-3">
                <span className="text-2xl font-black text-[#045EAD]">03</span>
                <h3 className="text-sm font-bold text-deep-navy uppercase tracking-wide">
                  PRACTISE &amp; TEST
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Execute targeted drills on weak areas and test your endurance with authentic timed mocks.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-bg-neutral flex flex-col gap-3">
                <span className="text-2xl font-black text-[#045EAD]">04</span>
                <h3 className="text-sm font-bold text-deep-navy uppercase tracking-wide">
                  TRACK YOUR PROGRESS
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Monitor projected band scores, completion velocity, and readiness index in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. ILLUSTRATIVE RESULTS VISUALIZATION ── */}
        <section id="results-demo" className="w-full bg-white py-16 px-4 sm:px-8 border-b border-slate-200">
          <div className="max-w-360 mx-auto flex flex-col gap-8">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[#045EAD]">
                Authoritative Analytics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-deep-navy">
                COMPREHENSIVE PERFORMANCE DESCRIPTORS
              </h2>
              <p className="text-sm text-[#475569]">
                Every completed attempt generates granular telemetry calibrated to official score standards.
              </p>
            </div>

            {/* Illustrative UI Container */}
            <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    Illustrative Result UI Showcase
                  </span>
                  <h3 className="text-lg font-bold text-deep-navy">
                    Candidate Evaluation Snapshot
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-bg-light-blue border border-[#B9DDF8] text-[#045EAD] text-xs font-bold">
                  IELTS Academic (Example Only)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Radial gauge & overall */}
                <div className="md:col-span-5 flex flex-col items-center text-center p-6 bg-bg-neutral rounded-xl border border-slate-200">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#045EAD"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset="42"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-deep-navy leading-none">7.5</span>
                      <span className="text-[10px] text-[#475569] font-bold uppercase mt-0.5">
                        Band
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-deep-navy">Overall Band Score</span>
                  <span className="text-[11px] text-[#045EAD] font-bold mt-0.5">
                    CEFR C1 Proficiency Equivalent
                  </span>
                </div>

                {/* Granular 4-Skill Bars */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-deep-navy mb-1">
                      <span>Listening</span>
                      <span>7.5 Band (Raw 34/40)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-[#045EAD] h-full rounded-full" style={{ width: '83%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-deep-navy mb-1">
                      <span>Reading</span>
                      <span>7.0 Band (Raw 31/40)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-[#045EAD] h-full rounded-full" style={{ width: '77%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-deep-navy mb-1">
                      <span>Writing</span>
                      <span>6.5 Band (Cohesion Focus)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-[#045EAD] h-full rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-deep-navy mb-1">
                      <span>Speaking</span>
                      <span>7.0 Band (Fluency Verified)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-[#045EAD] h-full rounded-full" style={{ width: '77%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-[#475569] font-medium text-center">
                * Note: This card is an illustrative design demonstration. Official candidate results are
                calculated exclusively by authoritative backend scoring algorithms.
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CTA BANNER ── */}
        <section className="w-full bg-white py-16 px-4 sm:px-8">
          <div className="max-w-250 mx-auto bg-bg-light-blue border border-[#B9DDF8] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-4 shadow-sm">
            <span className="text-xs uppercase font-bold tracking-wider text-[#045EAD]">
              Start Your Preparation Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-navy tracking-tight">
              READY TO KNOW WHERE YOU STAND?
            </h2>
            <p className="text-sm text-[#475569] max-w-lg leading-relaxed">
              Create your account, take your baseline diagnostic assessment, and begin targeting your required
              band score with precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <Link
                href="/register"
                className="h-11 px-8 rounded-lg bg-[#045EAD] hover:bg-brand-hover text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all no-underline"
              >
                <span>TAKE PRE-ASSESSMENT</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/login"
                className="h-11 px-8 rounded-lg border border-slate-300 hover:bg-white text-deep-navy text-xs font-bold inline-flex items-center justify-center transition-colors no-underline"
              >
                SIGN IN
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── 9. Public Footer ── */}
      <PublicFooter />
    </div>
  );
}
