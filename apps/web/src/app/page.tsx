'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogoBadge } from '../shared/ui/logo/LogoBadge';
import {
  BookOpen,
  Award,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  ChevronDown,
  BarChart3,
  BrainCircuit,
  Play,
  FileText,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  // Accordion FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedProgrammeTab, setSelectedProgrammeTab] = useState<
    'ALL' | 'IELTS' | 'TOEFL' | 'SAT' | 'CELPIP'
  >('ALL');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Quick Stats
  const STATS = [
    {
      label: 'Students Enrolled',
      value: '15,000+',
      sub: 'Candidates in 45+ Countries',
      icon: <Users size={22} color="#38bdf8" />,
    },
    {
      label: 'Mock Tests Completed',
      value: '85,000+',
      sub: 'Full-Length Timed Simulations',
      icon: <Award size={22} color="#a78bfa" />,
    },
    {
      label: 'Practice Questions',
      value: '25,000+',
      sub: 'Curated Bank with AI Feedback',
      icon: <FileText size={22} color="#34d399" />,
    },
    {
      label: 'Success Rate',
      value: '98.4%',
      sub: 'Target Band Score Achievement',
      icon: <TrendingUp size={22} color="#fbbf24" />,
    },
  ];

  // Programmes Data
  const PROGRAMMES = [
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

  // Why Choose Clasptek Features
  const FEATURES = [
    {
      title: 'AI Learning Coach',
      desc: '24/7 intelligent tutor evaluating grammar modifiers, vocabulary syntax, and essay coherence with instant actionable feedback.',
      icon: <BrainCircuit size={24} color="#38bdf8" />,
    },
    {
      title: 'Personalized Study Plans',
      desc: 'Dynamic schedules automatically tailored to your baseline diagnostic gaps, target score, and exam deadline.',
      icon: <Target size={24} color="#34d399" />,
    },
    {
      title: 'Diagnostic Assessments',
      desc: 'Adaptive baseline proficiency testing pinpointing your exact skill profile and weakness areas in under 20 minutes.',
      icon: <Zap size={24} color="#fbbf24" />,
    },
    {
      title: 'Practice Question Bank',
      desc: '25,000+ curated items with step-by-step rationale explanations, official scoring rubrics, and difficulty sizing.',
      icon: <BookOpen size={24} color="#a78bfa" />,
    },
    {
      title: 'Mock Examinations',
      desc: 'Full-length timed test simulations replicating official test interface, countdown rules, and proctoring integrity.',
      icon: <Award size={24} color="#f87171" />,
    },
    {
      title: 'Performance Analytics',
      desc: 'Real-time readiness prediction algorithms mapping your score progression with 95% statistical confidence intervals.',
      icon: <BarChart3 size={24} color="#38bdf8" />,
    },
  ];

  // Learning Journey Steps
  const JOURNEY_STEPS = [
    { step: '01', title: 'Register', desc: 'Create account in 30s' },
    { step: '02', title: 'Complete Profile', desc: 'Set target score & date' },
    { step: '03', title: 'Diagnostic Test', desc: 'Take 20-min baseline' },
    { step: '04', title: 'AI Study Plan', desc: 'Get personalized roadmap' },
    { step: '05', title: 'Learn', desc: 'Engage with core modules' },
    { step: '06', title: 'Practice', desc: 'Drill items with AI hints' },
    { step: '07', title: 'Mock Exam', desc: 'Run full timed exam' },
    { step: '08', title: 'Track Progress', desc: 'Audit score analytics' },
    { step: '09', title: 'Achieve Goal', desc: 'Walk in with confidence' },
  ];

  // Testimonials
  const TESTIMONIALS = [
    {
      name: 'Elena Rostova',
      prog: 'IELTS Academic Candidate',
      achieve: 'Achieved Band 8.5',
      text: '"The personalized AI study plan helped me improve from Band 6.0 to Band 8.5 in just 6 weeks. The Task 2 essay feedback was spot on!"',
      rating: 5,
    },
    {
      name: 'David Chen',
      prog: 'TOEFL iBT Candidate',
      achieve: 'Scored 112 / 120',
      text: '"The mock exam timer and integrated audio speaking player gave me authentic exam confidence. Worth every single hour spent."',
      rating: 5,
    },
    {
      name: 'Amira Patel',
      prog: 'SAT Academic Prep',
      achieve: 'Scored 1520 / 1600',
      text: '"The diagnostic assessment accurately pinpointed reading inference gaps I didn’t know I had. Helped me get into my dream university!"',
      rating: 5,
    },
    {
      name: 'Marcus Vance',
      prog: 'CELPIP General Coaching',
      achieve: 'Achieved Level 10',
      text: '"The speaking response prompts and vocabulary templates were identical to the official CELPIP test experience. Highly recommended!"',
      rating: 5,
    },
  ];

  // FAQ Items
  const FAQS = [
    {
      q: 'How do I register for a prep programme on Clasptek?',
      a: 'Registration takes less than 30 seconds. Click "Register Now" or "Start Assessment", select your target examination (IELTS, TOEFL, SAT, CELPIP, or English Core), and create your student account with no pre-filled placeholders.',
    },
    {
      q: 'How are diagnostic assessments scored and evaluated?',
      a: 'Our diagnostic placement engine uses adaptive AI scoring to evaluate your grammar modifiers, vocabulary range, reading speed, and syntax coherence. You receive an instant Band Score prediction breakdown.',
    },
    {
      q: 'Can I study and practice on mobile devices?',
      a: 'Yes! The entire Clasptek Global Academy Portal is fully responsive desktop-first and mobile-optimized. You can complete practice questions, listen to audio prompts, and review AI feedback anywhere.',
    },
    {
      q: 'Are mock examinations strictly timed?',
      a: 'Yes. Official Mock Examinations replicate actual test center conditions with strict auto-submit countdown timers, section locks, and proctoring integrity monitoring to build authentic exam stamina.',
    },
    {
      q: 'Does the AI Coach provide feedback on writing essays and speaking?',
      a: 'Yes. The AI Learning Coach analyzes your written essays against official band scoring rubrics (Task Achievement, Cohesion, Lexical Resource, Grammatical Accuracy) and provides line-by-line syntax improvements.',
    },
    {
      q: 'How long is my enrolment access valid?',
      a: 'Enrolment access is valid for the duration of your selected programme (4 to 16 weeks) with full access to question banks, mock exams, and AI study tools until you achieve your target score.',
    },
  ];

  const filteredProgrammes = PROGRAMMES.filter(
    (p) => selectedProgrammeTab === 'ALL' || p.cat === selectedProgrammeTab
  );

  return (
    <div
      style={{
        backgroundColor: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* 1. STICKY ENTERPRISE NAVIGATION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LogoBadge size="sm" />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                  paddingLeft: '0.75rem',
                  display: 'none',
                }}
              >
                ACADEMY PORTAL
              </span>
            </div>
          </Link>

          <nav
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <a href="#hero" style={{ color: '#f8fafc', textDecoration: 'none' }}>
              Home
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Programmes
            </a>
            <a href="#assessments" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Assessments
            </a>
            <Link href="/practice" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Practice
            </Link>
            <Link href="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              About
            </Link>
            <Link href="/help" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Support
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/login"
            style={{
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>

          <Link href="/register">
            <button
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <span>Start Assessment</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="hero"
        style={{
          position: 'relative',
          padding: '5rem 2rem 4rem',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Trust Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={14} color="#60a5fa" />
          <span>AI-POWERED PREPARATION FOR IELTS, TOEFL, SAT & CELPIP</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            margin: '0 0 1.25rem 0',
            color: '#ffffff',
          }}
        >
          Prepare Smarter. <span style={{ color: '#38bdf8' }}>Achieve Higher Scores.</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '740px',
            lineHeight: 1.6,
            margin: '0 0 2.5rem 0',
          }}
        >
          Master IELTS, TOEFL, SAT, CELPIP, and English Proficiency with AI-powered learning,
          personalized study plans, realistic mock examinations, and expert guidance.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3.5rem',
          }}
        >
          <Link href="/register">
            <button
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>Start Your Assessment</span>
              <ArrowRight size={18} />
            </button>
          </Link>

          <a href="#programmes">
            <button
              style={{
                backgroundColor: '#151d30',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <BookOpen size={18} color="#38bdf8" />
              <span>Explore Programmes</span>
            </button>
          </a>
        </div>

        {/* HERO ILLUSTRATION SHOWCASE / DUAL DEVICE PREVIEW */}
        <div
          style={{
            width: '100%',
            maxWidth: '1080px',
            borderRadius: '20px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden',
            padding: '1.5rem',
            textAlign: 'left',
          }}
        >
          {/* Mock Browser Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                clasptek-academy-portal.com/student/dashboard
              </span>
            </div>
            <Badge variant="info">LIVE DEMO PREVIEW</Badge>
          </div>

          {/* Inner Mockup Workspace Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Widget 1: Readiness Score Meter */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                  }}
                >
                  Readiness Score
                </span>
                <Badge variant="success">BAND 8.0 READY</Badge>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>88%</div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#1e293b',
                  overflow: 'hidden',
                  marginTop: '0.25rem',
                }}
              >
                <div style={{ width: '88%', height: '100%', backgroundColor: '#10b981' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                95% Statistical Confidence Interval
              </div>
            </div>

            {/* Widget 2: Active Module & Study Plan */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                  textTransform: 'uppercase',
                }}
              >
                Personalized Study Plan
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Task 2 Essay Cohesion & Transitions
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Step 4 of 9 Modules Completed
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                  }}
                >
                  IELTS Academic
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(52, 211, 153, 0.15)',
                    color: '#34d399',
                  }}
                >
                  Writing Section
                </span>
              </div>
            </div>

            {/* Widget 3: AI Coach Diagnostic */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BrainCircuit size={16} color="#38bdf8" />
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                  }}
                >
                  AI Coach Feedback
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                "Excellent usage of passive modifier syntax in Task 1. Next: focus on complex
                conditionals to secure Band 8.5+."
              </p>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                ✓ Evaluated 12 mins ago
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK STATISTICS SECTION */}
      <section
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0f172a',
          padding: '3.5rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {stat.icon}
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  VERIFIED
                </span>
              </div>
              <div
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginTop: '0.25rem',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cbd5e1' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PROGRAMMES SECTION */}
      <section
        id="programmes"
        style={{ padding: '6rem 2rem', maxWidth: '1280px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            TAILORED PREPARATION PATHWAYS
          </span>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0.5rem 0 0.75rem',
            }}
          >
            Featured Exam Programmes
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Choose your target global examination to unlock structured curricula, diagnostic
            assessments, and AI practice banks.
          </p>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '2rem',
              padding: '0.35rem',
              backgroundColor: '#151d30',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {(['ALL', 'IELTS', 'TOEFL', 'SAT', 'CELPIP'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedProgrammeTab(tab)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedProgrammeTab === tab ? '#2563eb' : 'transparent',
                  color: selectedProgrammeTab === tab ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tab === 'ALL' ? 'All Programmes' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Programme Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredProgrammes.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                transition: 'transform 200ms ease',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                    }}
                  >
                    {p.duration}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                    Target: {p.target}
                  </span>
                </div>

                <h3
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  {p.title}
                </h3>

                <p
                  style={{
                    margin: '0 0 1.25rem',
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </p>

                {/* Key Skills Pills */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {p.skills.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                      }}
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <Link href="/register">
                <button
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                    color: '#60a5fa',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>Learn More & Enroll</span>
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE CLASPTEK SECTION */}
      <section
        style={{
          backgroundColor: '#0f172a',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              ACADEMIC EXCELLENCE & AI ADVANTAGE
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.5rem 0 0.75rem',
              }}
            >
              Why Choose Clasptek Global
            </h2>
            <p
              style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}
            >
              Setting the international standard for AI-assisted diagnostic evaluation and candidate
              score growth.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#151d30',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {feat.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LEARNING JOURNEY TIMELINE */}
      <section id="journey" style={{ padding: '6rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            METHODICAL PROGRESSION
          </span>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0.5rem 0 0.75rem',
            }}
          >
            Your 9-Step Candidate Journey
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            From baseline registration to target score achievement on official examination day.
          </p>
        </div>

        {/* Horizontal Timeline Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
          }}
        >
          {JOURNEY_STEPS.map((step, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.25rem 0.85rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  border: '1px solid #2563eb',
                  color: '#60a5fa',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.step}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginTop: '0.2rem',
                }}
              >
                {step.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. STUDENT DASHBOARD PREVIEW SECTION */}
      <section
        style={{
          backgroundColor: '#0f172a',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              CANDIDATE WORKSPACE ENVIRONMENT
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.5rem 0 0.75rem',
              }}
            >
              Student Dashboard Experience
            </h2>
            <p
              style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}
            >
              Seamless interface aggregating readiness score predictions, resume learning, and
              diagnostic analytics.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#151d30',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Header Candidate Info */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '1rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                  }}
                >
                  STUDENT PORTAL DEMO
                </div>
                <h3
                  style={{
                    margin: '0.25rem 0 0',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  Welcome back, Student Candidate 👋
                </h3>
              </div>
              <Badge variant="info">Enrolled: IELTS Academic Intensive</Badge>
            </div>

            {/* Dashboard Cards Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  PREDICTED READINESS
                </div>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#34d399',
                    margin: '0.25rem 0',
                  }}
                >
                  Band 8.0
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Overall Readiness Score: 88%
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  WEEKLY PROGRESS
                </div>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    margin: '0.25rem 0',
                  }}
                >
                  24 / 30 Qs
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  80% Target Goal Completed
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                  UPCOMING MOCK EXAM
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0.25rem 0',
                  }}
                >
                  IELTS Full Mock C
                </div>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
                  Scheduled Tomorrow · 180 Mins
                </div>
              </div>
            </div>

            {/* Resume Learning Callout */}
            <div
              style={{
                backgroundColor: '#0f172a',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa' }}>
                  NEXT STUDY MODULE
                </span>
                <div
                  style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}
                >
                  Task 2 Essay Cohesion & Modifier Syntax Rules
                </div>
              </div>
              <Link href="/register">
                <button
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Play size={14} />
                  <span>Resume Learning</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ASSESSMENT TYPES SECTION */}
      <section
        id="assessments"
        style={{ padding: '6rem 2rem', maxWidth: '1280px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            EVALUATION METHODOLOGY
          </span>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0.5rem 0 0.75rem',
            }}
          >
            Three-Tier Assessment System
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Structured evaluation tiers designed to assess baseline proficiency, reinforce skills,
            and simulate test day.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#151d30',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Badge variant="info">BASELINE PLACEMENT</Badge>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Diagnostic Assessment
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              A 20-minute adaptive baseline evaluation measuring your entry band level across
              reading, listening, and grammar syntax. Generates your personalized study plan.
            </p>
            <div
              style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginTop: 'auto' }}
            >
              ✓ Unlimited retakes · Instant score visual map
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#151d30',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Badge variant="warning">SKILL DRILLS</Badge>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Practice Test Arena
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Self-paced question drills with 25,000+ items. Includes AI hint hints, step-by-step
              explanations, and topic-level weakness targeting.
            </p>
            <div
              style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, marginTop: 'auto' }}
            >
              ✓ Adaptive difficulty · Topic-by-topic focus
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#151d30',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Badge variant="success">EXAM SIMULATION</Badge>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Official Mock Exams
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Full-length timed exam simulations strictly replicating official test center
              interface, countdown timers, and proctoring integrity rules.
            </p>
            <div
              style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, marginTop: 'auto' }}
            >
              ✓ Official band scaling · Auto-submit timers
            </div>
          </div>
        </div>
      </section>

      {/* 9. AI LEARNING EXPERIENCE FLOW */}
      <section
        style={{
          backgroundColor: '#0f172a',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              INTELLIGENT ADAPTATION
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.5rem 0 0.75rem',
              }}
            >
              How AI Personalizes Your Learning
            </h2>
            <p
              style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}
            >
              Our proprietary AI engine continuously scans your performance to eliminate weak spots.
            </p>
          </div>

          {/* Flow Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              { step: '1', title: 'Student Input', desc: 'Complete baseline answers' },
              { step: '2', title: 'Assessment', desc: 'AI scans grammar syntax' },
              { step: '3', title: 'Skill Analysis', desc: 'Evaluate band score level' },
              { step: '4', title: 'Weakness Focus', desc: 'Isolate modifier errors' },
              { step: '5', title: 'Custom Roadmap', desc: 'Generate daily lessons' },
              { step: '6', title: 'Progress Tracking', desc: 'Update score predictions' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#151d30',
                  padding: '1.5rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    marginBottom: '0.35rem',
                  }}
                >
                  Step {f.step}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS SECTION */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            PROVEN RESULTS
          </span>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0.5rem 0 0.75rem',
            }}
          >
            What Our Candidates Achieve
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Real candidates sharing their score transformation journeys with Clasptek Global.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#151d30',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </div>
                <p
                  style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.875rem',
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  {t.text}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.prog}</div>
                </div>
                <Badge variant="success">{t.achieve}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section
        id="faq"
        style={{
          backgroundColor: '#0f172a',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              GOT QUESTIONS?
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.5rem 0 0.75rem',
              }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
              Everything you need to know about Clasptek Global Academy prep programmes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#151d30',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 200ms ease',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      color="#94a3b8"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 200ms ease',
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#cbd5e1',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        paddingTop: '0.85rem',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FINAL CALL TO ACTION (CTA) */}
      <section
        style={{ padding: '6rem 2rem', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}
      >
        <div
          style={{
            backgroundColor: '#151d30',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '24px',
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(15, 23, 42, 0.95))',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <LogoBadge size="md" />

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Begin Your Success Journey Today
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#cbd5e1',
              maxWidth: '600px',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Join over 15,000 candidates worldwide preparing with AI-powered study plans, diagnostic
            assessments, and full-length mock examinations.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              marginTop: '1rem',
            }}
          >
            <Link href="/register">
              <button
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
                }}
              >
                <span>Register Now</span>
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link href="/register">
              <button
                style={{
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '0.85rem 2.25rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Zap size={18} color="#38bdf8" />
                <span>Take Diagnostic Assessment</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 13. PROFESSIONAL ENTERPRISE FOOTER */}
      <footer
        style={{
          backgroundColor: '#070a12',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '4rem 2rem 2rem',
          color: '#94a3b8',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <LogoBadge size="sm" />
            <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>
              Clasptek Global Academy Portal is an official international exam preparation platform
              offering AI diagnostic assessments, adaptive practice banks, and timed mock
              examinations.
            </p>
          </div>

          {/* Programmes Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div
              style={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: '0.9rem',
                marginBottom: '0.35rem',
              }}
            >
              PREP PROGRAMMES
            </div>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              IELTS Academic
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              IELTS General Training
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              TOEFL iBT Mastery
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              SAT Academic Prep
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              CELPIP General Coaching
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              English Proficiency Core
            </a>
          </div>

          {/* Support Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div
              style={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: '0.9rem',
                marginBottom: '0.35rem',
              }}
            >
              RESOURCES & SUPPORT
            </div>
            <Link href="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              About Clasptek Global
            </Link>
            <Link href="/practice" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Adaptive Practice Arena
            </Link>
            <Link href="/help" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Help Center & Guides
            </Link>
            <Link href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Contact Admissions
            </Link>
            <Link href="/careers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Academic Careers
            </Link>
          </div>

          {/* Legal Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div
              style={{
                fontWeight: 800,
                color: '#ffffff',
                fontSize: '0.9rem',
                marginBottom: '0.35rem',
              }}
            >
              LEGAL & COMPLIANCE
            </div>
            <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Terms of Service
            </Link>
            <span style={{ color: '#94a3b8' }}>WCAG AA Accessibility</span>
            <span style={{ color: '#94a3b8' }}>SOC2 Security Standards</span>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} Clasptek Global Academy Limited. All rights reserved.
          </div>
          <div>Platform Version 2.4.0 • Enterprise Edition</div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Helper Component for Badges inside mockups
function Badge({
  variant,
  children,
}: {
  variant: 'info' | 'success' | 'warning';
  children: React.ReactNode;
}) {
  const bg =
    variant === 'success'
      ? 'rgba(52, 211, 153, 0.15)'
      : variant === 'warning'
        ? 'rgba(245, 158, 11, 0.15)'
        : 'rgba(56, 189, 248, 0.15)';
  const border =
    variant === 'success'
      ? 'rgba(52, 211, 153, 0.3)'
      : variant === 'warning'
        ? 'rgba(245, 158, 11, 0.3)'
        : 'rgba(56, 189, 248, 0.3)';
  const color = variant === 'success' ? '#34d399' : variant === 'warning' ? '#fbbf24' : '#38bdf8';

  return (
    <span
      style={{
        fontSize: '0.7rem',
        fontWeight: 800,
        padding: '0.2rem 0.6rem',
        borderRadius: '6px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}
